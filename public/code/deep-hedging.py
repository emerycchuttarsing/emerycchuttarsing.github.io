"""
Deep hedging benchmark for a discretely monitored Asian call option.

Benchmarks two feed-forward policies under proportional transaction costs:
1. Raw-FFNN: observes zero-padded raw price histories plus previous position.
2. Sig-FFNN: observes depth-3 rough path signatures plus previous position.

Time convention:
    - The GBM simulator creates N + 1 prices: S_0, ..., S_N.
    - The policy rebalances at S_0, ..., S_{N-1}, so it has N decisions.
    - The raw network input therefore has exactly N=60 price slots.
    - The Asian payoff is monitored over S_1, ..., S_N.

Run:
    python projet.py

Optional examples:
    python projet.py --epochs 100 --batch-size 2048
    python projet.py --device cuda --signature-backend signatory
"""

from __future__ import annotations

import argparse
import math
import os
import tempfile
import warnings
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

# Keep Matplotlib from trying to write into a non-writable user cache directory.
_mpl_config_dir = Path(tempfile.gettempdir()) / "deep_hedging_matplotlib_cache"
_mpl_config_dir.mkdir(exist_ok=True)
os.environ.setdefault("MPLCONFIGDIR", str(_mpl_config_dir))

import matplotlib.pyplot as plt
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset


try:
    import signatory  # type: ignore
except ImportError:  # pragma: no cover - depends on local environment
    signatory = None


SignatureBackend = Literal["auto", "signatory", "torch"]
ModelKind = Literal["raw", "signature"]


@dataclass(frozen=True)
class MarketConfig:
    s0: float = 100.0
    strike: float = 100.0
    mu: float = 0.0
    sigma: float = 0.20
    maturity: float = 60.0 / 252.0
    n_steps: int = 60
    transaction_cost: float = 0.001


@dataclass(frozen=True)
class TrainConfig:
    train_paths: int = 20_000
    test_paths: int = 5_000
    epochs: int = 75
    batch_size: int = 1024
    eval_batch_size: int = 4096
    learning_rate: float = 1e-3
    cvar_alpha: float = 0.99
    hidden_dim: int = 64
    hidden_layers: int = 3
    signature_depth: int = 3
    seed: int = 7
    device: str = "cpu"
    signature_backend: SignatureBackend = "auto"
    output_dir: str = "outputs"
    show_plots: bool = False


def set_seed(seed: int) -> None:
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def simulate_gbm_paths(
    n_paths: int,
    market: MarketConfig,
    device: torch.device,
) -> torch.Tensor:
    """Generate GBM paths with shape [n_paths, n_steps + 1]."""
    dt = market.maturity / market.n_steps
    z = torch.randn(n_paths, market.n_steps, device=device)
    log_returns = (
        (market.mu - 0.5 * market.sigma**2) * dt
        + market.sigma * math.sqrt(dt) * z
    )
    log_paths = torch.cat(
        [
            torch.full((n_paths, 1), math.log(market.s0), device=device),
            math.log(market.s0) + torch.cumsum(log_returns, dim=1),
        ],
        dim=1,
    )
    return torch.exp(log_paths)


def asian_call_payoff(paths: torch.Tensor, market: MarketConfig) -> torch.Tensor:
    """Payoff monitored over S_1, ..., S_N."""
    average_price = paths[:, 1 : market.n_steps + 1].mean(dim=1)
    return torch.clamp(average_price - market.strike, min=0.0)


class FeedForwardHedgeNet(nn.Module):
    """Shared FFNN policy used at every rebalance date."""

    def __init__(
        self,
        input_dim: int,
        hidden_dim: int = 64,
        hidden_layers: int = 3,
    ) -> None:
        super().__init__()
        layers: list[nn.Module] = []
        in_dim = input_dim
        for _ in range(hidden_layers):
            layers.append(nn.Linear(in_dim, hidden_dim))
            layers.append(nn.ReLU())
            in_dim = hidden_dim
        layers.append(nn.Linear(in_dim, 1))
        layers.append(nn.Sigmoid())
        self.net = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


def empirical_cvar(shortfall: torch.Tensor, alpha: float = 0.99) -> torch.Tensor:
    """Empirical upper-tail CVaR of terminal shortfall."""
    if not 0.0 < alpha < 1.0:
        raise ValueError("alpha must lie in (0, 1).")
    tail_count = max(1, math.ceil((1.0 - alpha) * shortfall.numel() - 1e-12))
    return torch.topk(shortfall.flatten(), tail_count, largest=True).values.mean()


def count_trainable_parameters(model: nn.Module) -> int:
    return sum(param.numel() for param in model.parameters() if param.requires_grad)


def build_time_augmented_paths(
    paths: torch.Tensor,
    market: MarketConfig,
) -> torch.Tensor:
    """Return [batch, n_steps, 2] streams (calendar time, spot)."""
    hedge_prices = paths[:, : market.n_steps]
    times = torch.linspace(
        0.0,
        market.maturity,
        market.n_steps + 1,
        device=paths.device,
    )[: market.n_steps]
    time_channel = times.view(1, market.n_steps, 1).expand(paths.shape[0], -1, -1)
    price_channel = hedge_prices.unsqueeze(-1)
    return torch.cat([time_channel, price_channel], dim=-1)


def torch_depth3_signature_prefixes(streams: torch.Tensor) -> torch.Tensor:
    """
    Compute depth-3 signatures for all prefixes of 2D piecewise-linear streams.

    This is a small fallback for environments where signatory is unavailable.
    The output ordering is level-major lexicographic, matching signatory's
    channel convention for two input channels:
        level 1: 2 features
        level 2: 4 features
        level 3: 8 features
    """
    batch_size, length, channels = streams.shape
    if channels != 2:
        raise ValueError("The fallback signature implementation expects 2D streams.")

    s1 = streams.new_zeros(batch_size, 2)
    s2 = streams.new_zeros(batch_size, 2, 2)
    s3 = streams.new_zeros(batch_size, 2, 2, 2)
    prefixes = streams.new_zeros(batch_size, length, 14)

    for t in range(1, length):
        dx = streams[:, t] - streams[:, t - 1]
        e1 = dx
        e2 = 0.5 * torch.einsum("bi,bj->bij", dx, dx)
        e3 = (1.0 / 6.0) * torch.einsum("bi,bj,bk->bijk", dx, dx, dx)

        old_s1 = s1
        old_s2 = s2
        old_s3 = s3
        s1 = old_s1 + e1
        s2 = old_s2 + torch.einsum("bi,bj->bij", old_s1, e1) + e2
        s3 = (
            old_s3
            + torch.einsum("bij,bk->bijk", old_s2, e1)
            + torch.einsum("bi,bjk->bijk", old_s1, e2)
            + e3
        )
        prefixes[:, t, :] = torch.cat(
            [s1, s2.reshape(batch_size, -1), s3.reshape(batch_size, -1)],
            dim=1,
        )

    return prefixes


def signatory_signature_prefixes(
    streams: torch.Tensor,
    depth: int,
    batch_size: int = 4096,
) -> torch.Tensor:
    """Compute signatory.signature for every prefix t=0,...,N-1."""
    if signatory is None:
        raise ImportError("signatory is not installed.")
    if depth != 3:
        raise ValueError("This benchmark expects signature depth 3.")

    n_paths, n_steps, _ = streams.shape
    channels = signatory.signature_channels(2, depth)
    signatures = streams.new_zeros(n_paths, n_steps, channels)

    # Prefix length 1 has zero increments, hence the zero signature already set.
    for t in range(1, n_steps):
        for start in range(0, n_paths, batch_size):
            stop = min(start + batch_size, n_paths)
            signatures[start:stop, t, :] = signatory.signature(
                streams[start:stop, : t + 1, :],
                depth=depth,
            )
    return signatures


def compute_signature_features(
    paths: torch.Tensor,
    market: MarketConfig,
    depth: int,
    backend: SignatureBackend,
) -> torch.Tensor:
    """Build [batch, n_steps, 14] signature features."""
    streams = build_time_augmented_paths(paths, market)

    if backend in ("auto", "signatory") and signatory is not None:
        return signatory_signature_prefixes(streams, depth=depth)

    if backend == "signatory":
        raise ImportError(
            "signature_backend='signatory' was requested, but signatory is not installed."
        )

    if depth != 3:
        raise ValueError("The torch fallback only implements depth=3 signatures.")
    warnings.warn(
        "signatory is not installed; using a local PyTorch depth-3 signature fallback.",
        RuntimeWarning,
        stacklevel=2,
    )
    return torch_depth3_signature_prefixes(streams)


def terminal_wealth(
    model: nn.Module,
    paths: torch.Tensor,
    market: MarketConfig,
    kind: ModelKind,
    signature_features: torch.Tensor | None = None,
) -> torch.Tensor:
    """Self-financing stock/cash wealth with proportional transaction costs."""
    batch_size = paths.shape[0]
    device = paths.device
    hedge_prices = paths[:, : market.n_steps]

    cash = torch.zeros(batch_size, device=device)
    previous_delta = torch.zeros(batch_size, 1, device=device)

    for t in range(market.n_steps):
        if kind == "raw":
            observed = torch.zeros_like(hedge_prices)
            observed[:, : t + 1] = hedge_prices[:, : t + 1]
            model_input = torch.cat([observed, previous_delta], dim=1)
        elif kind == "signature":
            if signature_features is None:
                raise ValueError("signature_features are required for Sig-FFNN.")
            model_input = torch.cat([signature_features[:, t, :], previous_delta], dim=1)
        else:
            raise ValueError(f"Unknown model kind: {kind}")

        delta = model(model_input).squeeze(1)
        trade = delta - previous_delta.squeeze(1)
        traded_notional = hedge_prices[:, t] * torch.abs(trade)

        cash = cash - trade * hedge_prices[:, t] - market.transaction_cost * traded_notional
        previous_delta = delta.unsqueeze(1)

    return cash + previous_delta.squeeze(1) * paths[:, market.n_steps]


def terminal_shortfall(
    model: nn.Module,
    paths: torch.Tensor,
    market: MarketConfig,
    kind: ModelKind,
    signature_features: torch.Tensor | None = None,
) -> torch.Tensor:
    payoff = asian_call_payoff(paths, market)
    wealth = terminal_wealth(model, paths, market, kind, signature_features)
    return payoff - wealth


def train_model(
    model: nn.Module,
    kind: ModelKind,
    train_paths: torch.Tensor,
    market: MarketConfig,
    config: TrainConfig,
    signature_features: torch.Tensor | None = None,
) -> list[float]:
    if config.epochs <= 0:
        raise ValueError("epochs must be positive. Use 50-100 epochs for the full benchmark.")

    optimizer = torch.optim.Adam(model.parameters(), lr=config.learning_rate)

    if signature_features is None:
        dataset = TensorDataset(train_paths)
    else:
        dataset = TensorDataset(train_paths, signature_features)

    loader = DataLoader(
        dataset,
        batch_size=config.batch_size,
        shuffle=True,
        drop_last=False,
    )

    history: list[float] = []
    model.train()
    for epoch in range(1, config.epochs + 1):
        batch_loss_sum = 0.0
        seen = 0

        for batch in loader:
            batch_paths = batch[0]
            batch_signatures = batch[1] if len(batch) > 1 else None

            optimizer.zero_grad(set_to_none=True)
            shortfall = terminal_shortfall(
                model,
                batch_paths,
                market,
                kind,
                signature_features=batch_signatures,
            )
            loss = empirical_cvar(shortfall, alpha=config.cvar_alpha)
            loss.backward()
            optimizer.step()

            batch_n = batch_paths.shape[0]
            batch_loss_sum += loss.detach().item() * batch_n
            seen += batch_n

        mean_batch_loss = batch_loss_sum / seen
        full_train_shortfall = collect_terminal_shortfall(
            model=model,
            paths=train_paths,
            market=market,
            kind=kind,
            batch_size=config.eval_batch_size,
            signature_features=signature_features,
        )
        full_train_cvar = empirical_cvar(
            full_train_shortfall,
            alpha=config.cvar_alpha,
        ).item()
        history.append(full_train_cvar)
        model.train()
        print(
            f"{kind:>9s} | epoch {epoch:03d}/{config.epochs} | "
            f"avg batch CVaR {mean_batch_loss:10.6f} | "
            f"full train CVaR {full_train_cvar:10.6f}"
        )

    return history


@torch.no_grad()
def collect_terminal_shortfall(
    model: nn.Module,
    paths: torch.Tensor,
    market: MarketConfig,
    kind: ModelKind,
    batch_size: int,
    signature_features: torch.Tensor | None = None,
) -> torch.Tensor:
    """Collect terminal shortfalls for every supplied path without gradients."""
    was_training = model.training
    model.eval()
    shortfalls: list[torch.Tensor] = []
    for start in range(0, paths.shape[0], batch_size):
        stop = min(start + batch_size, paths.shape[0])
        batch_signatures = (
            signature_features[start:stop] if signature_features is not None else None
        )
        batch_shortfall = terminal_shortfall(
            model,
            paths[start:stop],
            market,
            kind,
            signature_features=batch_signatures,
        )
        shortfalls.append(batch_shortfall.detach())
    if was_training:
        model.train()
    return torch.cat(shortfalls, dim=0)


@torch.no_grad()
def evaluate_pnl(
    model: nn.Module,
    paths: torch.Tensor,
    market: MarketConfig,
    kind: ModelKind,
    signature_features: torch.Tensor | None = None,
) -> torch.Tensor:
    model.eval()
    payoff = asian_call_payoff(paths, market)
    wealth = terminal_wealth(model, paths, market, kind, signature_features)
    return wealth - payoff


def plot_training_losses(
    raw_history: list[float],
    sig_history: list[float],
    output_path: Path,
    show: bool,
) -> None:
    epochs = list(range(1, len(raw_history) + 1))
    plt.figure(figsize=(9, 5))
    plt.plot(epochs, raw_history, label="Raw-FFNN", linewidth=2)
    plt.plot(epochs, sig_history, label="Sig-FFNN", linewidth=2)
    plt.xlabel("Epoch")
    plt.ylabel("Training loss: 99% CVaR(shortfall)")
    plt.title("Deep Hedging Training Convergence")
    plt.xlim(1, max(1, len(raw_history)))
    plt.grid(alpha=0.3)
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_path, dpi=160)
    if show:
        plt.show()
    plt.close()


def plot_pnl_histogram(
    raw_pnl: torch.Tensor,
    sig_pnl: torch.Tensor,
    output_path: Path,
    show: bool,
) -> None:
    raw_np = raw_pnl.detach().cpu().numpy()
    sig_np = sig_pnl.detach().cpu().numpy()

    plt.figure(figsize=(9, 5))
    plt.hist(raw_np, bins=70, alpha=0.55, density=True, label="Raw-FFNN")
    plt.hist(sig_np, bins=70, alpha=0.55, density=True, label="Sig-FFNN")
    plt.axvline(0.0, color="black", linestyle="--", linewidth=1)
    plt.xlabel("Out-of-sample terminal PnL = wealth - payoff")
    plt.ylabel("Density")
    plt.title("Terminal PnL Distribution on Test Paths")
    plt.grid(alpha=0.3)
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_path, dpi=160)
    if show:
        plt.show()
    plt.close()


def parse_args() -> TrainConfig:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--epochs", type=int, default=TrainConfig.epochs)
    parser.add_argument("--batch-size", type=int, default=TrainConfig.batch_size)
    parser.add_argument("--eval-batch-size", type=int, default=TrainConfig.eval_batch_size)
    parser.add_argument("--learning-rate", type=float, default=TrainConfig.learning_rate)
    parser.add_argument("--train-paths", type=int, default=TrainConfig.train_paths)
    parser.add_argument("--test-paths", type=int, default=TrainConfig.test_paths)
    parser.add_argument("--seed", type=int, default=TrainConfig.seed)
    parser.add_argument("--device", type=str, default=TrainConfig.device)
    parser.add_argument(
        "--signature-backend",
        choices=["auto", "signatory", "torch"],
        default=TrainConfig.signature_backend,
    )
    parser.add_argument("--output-dir", type=str, default=TrainConfig.output_dir)
    parser.add_argument("--show-plots", action="store_true")
    args = parser.parse_args()

    return TrainConfig(
        train_paths=args.train_paths,
        test_paths=args.test_paths,
        epochs=args.epochs,
        batch_size=args.batch_size,
        eval_batch_size=args.eval_batch_size,
        learning_rate=args.learning_rate,
        seed=args.seed,
        device=args.device,
        signature_backend=args.signature_backend,
        output_dir=args.output_dir,
        show_plots=args.show_plots,
    )


def main() -> None:
    config = parse_args()
    market = MarketConfig()
    set_seed(config.seed)

    device = torch.device(config.device)
    output_dir = Path(config.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Using device: {device}")
    print(
        "Benchmark configuration: "
        f"train_paths={config.train_paths}, test_paths={config.test_paths}, "
        f"epochs={config.epochs}, batch_size={config.batch_size}"
    )
    print("Generating GBM paths...")
    train_paths = simulate_gbm_paths(config.train_paths, market, device=device)
    test_paths = simulate_gbm_paths(config.test_paths, market, device=device)

    print("Computing signature features...")
    train_signatures = compute_signature_features(
        train_paths,
        market,
        depth=config.signature_depth,
        backend=config.signature_backend,
    )
    test_signatures = compute_signature_features(
        test_paths,
        market,
        depth=config.signature_depth,
        backend=config.signature_backend,
    )

    raw_model = FeedForwardHedgeNet(
        input_dim=market.n_steps + 1,
        hidden_dim=config.hidden_dim,
        hidden_layers=config.hidden_layers,
    ).to(device)
    sig_model = FeedForwardHedgeNet(
        input_dim=14 + 1,
        hidden_dim=config.hidden_dim,
        hidden_layers=config.hidden_layers,
    ).to(device)
    raw_parameter_count = count_trainable_parameters(raw_model)
    sig_parameter_count = count_trainable_parameters(sig_model)

    print("\nTraining Raw-FFNN...")
    raw_history = train_model(
        raw_model,
        "raw",
        train_paths,
        market,
        config,
    )

    print("\nTraining Sig-FFNN...")
    sig_history = train_model(
        sig_model,
        "signature",
        train_paths,
        market,
        config,
        signature_features=train_signatures,
    )

    print("\nEvaluating on test paths...")
    raw_model.eval()
    sig_model.eval()
    raw_pnl = evaluate_pnl(raw_model, test_paths, market, "raw")
    sig_pnl = evaluate_pnl(
        sig_model,
        test_paths,
        market,
        "signature",
        signature_features=test_signatures,
    )

    raw_test_cvar = empirical_cvar(-raw_pnl, alpha=config.cvar_alpha).item()
    sig_test_cvar = empirical_cvar(-sig_pnl, alpha=config.cvar_alpha).item()
    raw_mean_pnl = raw_pnl.mean().item()
    sig_mean_pnl = sig_pnl.mean().item()

    loss_plot = output_dir / "training_cvar_loss.png"
    pnl_plot = output_dir / "terminal_pnl_histogram.png"
    plot_training_losses(raw_history, sig_history, loss_plot, config.show_plots)
    plot_pnl_histogram(raw_pnl, sig_pnl, pnl_plot, config.show_plots)

    print("\nAcademic table metrics")
    print("----------------------")
    print(f"Raw-FFNN trainable parameters: {raw_parameter_count}")
    print(f"Sig-FFNN trainable parameters: {sig_parameter_count}")
    print(f"Raw-FFNN epochs run: {len(raw_history)}")
    print(f"Sig-FFNN epochs run: {len(sig_history)}")
    print(f"Raw-FFNN test paths evaluated: {raw_pnl.numel()}")
    print(f"Sig-FFNN test paths evaluated: {sig_pnl.numel()}")
    print(f"Raw-FFNN mean terminal PnL: {raw_mean_pnl:.10f}")
    print(f"Sig-FFNN mean terminal PnL: {sig_mean_pnl:.10f}")
    print(f"Raw-FFNN test 99% CVaR(shortfall): {raw_test_cvar:.10f}")
    print(f"Sig-FFNN test 99% CVaR(shortfall): {sig_test_cvar:.10f}")
    print(f"\nSaved plots to:\n  {loss_plot}\n  {pnl_plot}")


if __name__ == "__main__":
    main()
