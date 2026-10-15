# Code cells exported from Gradient descent.ipynb, unchanged.
# Source: Optimization 240 project, supplied local notebook.
# Requires lastfm_asia_edges.csv in the current directory.
# Saved outputs and figures are documented separately on the portfolio page.

#EDA

import pandas as pd
import numpy as np
import random
from sklearn.model_selection import train_test_split

df = pd.read_csv('lastfm_asia_edges.csv')

# 2. Remapping of IDs

unique_nodes = pd.unique(df[['node_1', 'node_2']].values.ravel('K'))
num_nodes = len(unique_nodes)
id_map = {old_id: new_id for new_id, old_id in enumerate(unique_nodes)}

df['u'] = df['node_1'].map(id_map)
df['v'] = df['node_2'].map(id_map)

# List of all positive link 
pos_edges = df[['u', 'v']].values

# 3. Split Train / Test (Hidding 20% of the link for final exam)
train_pos, test_pos = train_test_split(pos_edges, test_size=0.2, random_state=42)

print(f"Nombre de nœuds : {num_nodes}")
print(f"Liens d'entraînement (Positifs) : {len(train_pos)}")
print(f"Liens de test (à prédire) : {len(test_pos)}")

# 4. Negative link generation 

def generate_negatives(pos_edges, num_nodes):
    neg_edges = []
    pos_set = set(map(tuple, pos_edges)) 
    
    for u, v in pos_edges:
       
        while True:
            k = np.random.randint(0, num_nodes)
            if k != u and (u, k) not in pos_set and (k, u) not in pos_set:
                neg_edges.append([u, k])
                break
    return np.array(neg_edges)

# generative negative for train set
train_neg = generate_negatives(train_pos, num_nodes)

#Batch Gradient Descent 

def batch_gradient_descent(num_nodes, train_pos, train_neg, k=10, lr=0.01, lambda_reg=0.01, epochs=50):
    """
    Implémentation de Batch Gradient Descent pour Matrix Factorization
    """
    # Random initialisation of embedding (Matrix U)
    U = np.random.normal(0, 0.1, (num_nodes, k))
    
    loss_history = []
    
    X = np.vstack([train_pos, train_neg])
    y = np.concatenate([np.ones(len(train_pos)), np.zeros(len(train_neg))])
    
    for epoch in range(epochs):
        
        users = X[:, 0]
        items = X[:, 1]
        
        u_vecs = U[users] # Shape (M, k)
        v_vecs = U[items] # Shape (M, k)
        
        preds = np.sum(u_vecs * v_vecs, axis=1)
        
        # 2. Error calculation
        errors = preds - y 
        
        # Loss calculation
        loss = np.sum(errors ** 2) + lambda_reg * np.sum(U ** 2)
        loss_history.append(loss)
        
        # 3. Backward Pass : Gradient calculus 
        
        grad_U = np.zeros_like(U) 
        
        grad_u_part = 2 * errors[:, np.newaxis] * v_vecs
        grad_v_part = 2 * errors[:, np.newaxis] * u_vecs
        
        np.add.at(grad_U, users, grad_u_part)
        np.add.at(grad_U, items, grad_v_part)
        
        #regularization term
        grad_U += 2 * lambda_reg * U
        
        # 4. Update Step
        U = U - lr * grad_U
        
        if epoch % 5 == 0:
            print(f"Epoch {epoch}/{epochs} - Loss: {loss:.4f}")
            
    return U, loss_history

print("Démarrage de Batch Gradient Descent...")
U_optimized, history = batch_gradient_descent(num_nodes, train_pos, train_neg)

from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score

test_neg = generate_negatives(test_pos, num_nodes) 

y_true_test = np.concatenate([np.ones(len(test_pos)), np.zeros(len(test_neg))])

X_test = np.vstack([test_pos, test_neg])

#Metrics 

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def evaluate_model(U, X_test, y_true):
    """
    Calcule les métriques de performance
    """
    
    users = X_test[:, 0]
    items = X_test[:, 1]
    
    u_vecs = U[users]
    v_vecs = U[items]
    
    # Raw Scores
    raw_scores = np.sum(u_vecs * v_vecs, axis=1)
    
    # Convert to prob (0 to 1)
    probs = sigmoid(raw_scores)
    
    # AUC-ROC
    auc = roc_auc_score(y_true, probs)
    
    # Precision/recall
    predictions = (probs > 0.5).astype(int)
    
    precision = precision_score(y_true, predictions)
    recall = recall_score(y_true, predictions)
    f1 = f1_score(y_true, predictions)
    
    return auc, precision, recall, f1


auc, prec, rec, f1 = evaluate_model(U_optimized, X_test, y_true_test)

print("--- RÉSULTATS SUR LE TEST SET (Les liens cachés) ---")
print(f"AUC-ROC Score : {auc:.4f} (C'est ta note principale)")
print(f"Précision     : {prec:.4f} (Combien de liens prédits sont corrects ?)")
print(f"Rappel (Recall): {rec:.4f} (Combien de vrais liens a-t-on retrouvés ?)")
print(f"F1-Score      : {f1:.4f}")

#Graph Visualization  

import networkx as nx
import matplotlib.pyplot as plt


G = nx.from_pandas_edgelist(df, 'u', 'v')


node_degrees = dict(G.degree())
sorted_nodes = sorted(node_degrees.items(), key=lambda item: item[1], reverse=True)

center_node = sorted_nodes[0][0] 
degree_of_center = sorted_nodes[0][1]

print(f"Le nœud central est {center_node} avec {degree_of_center} amis.")


subgraph = nx.ego_graph(G, center_node, radius=1)


if len(subgraph.nodes()) > 50:
    neighbors = list(subgraph.neighbors(center_node))[:50] 
    neighbors.append(center_node) 
    subgraph = G.subgraph(neighbors)


pos = nx.spring_layout(subgraph, k=0.5, seed=42)


plt.figure(figsize=(10, 8)) 


node_colors = ['red' if node == center_node else 'skyblue' for node in subgraph.nodes()]
node_sizes = [300 if node == center_node else 100 for node in subgraph.nodes()]

nx.draw_networkx_nodes(subgraph, pos, node_color=node_colors, node_size=node_sizes, edgecolors='black')

# Dessiner les arêtes (liens)
nx.draw_networkx_edges(subgraph, pos, alpha=0.3, edge_color='gray')


labels = {node: node if node == center_node else '' for node in subgraph.nodes()}
nx.draw_networkx_labels(subgraph, pos, labels, font_size=12, font_weight='bold')

plt.title(f"Local Vizualization around user {center_node}\n", fontsize=15)
plt.axis('off')

plt.savefig("lastfm_network_viz2.png", dpi=300, bbox_inches='tight')
plt.show()

#Graph of training loss 

import matplotlib.pyplot as plt

plt.figure(figsize=(8, 5))


plt.plot(history, label='Training Loss $J(U)$', color='#1f77b4', linewidth=2)


plt.title('Convergence of Batch Gradient Descent', fontsize=14, fontweight='bold')
plt.xlabel('Epochs', fontsize=12)
plt.ylabel('Objective Function Value (Loss)', fontsize=12)


plt.grid(True, linestyle='--', alpha=0.6)


plt.legend(fontsize=12)


plt.savefig('loss_plot.png', dpi=300, bbox_inches='tight')

plt.show()


