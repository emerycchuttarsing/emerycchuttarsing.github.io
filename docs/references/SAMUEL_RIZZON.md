# Samuel Rizzon — référence complémentaire

- Site : https://www.samuelrizzon.dev/
- Article de l'auteur : https://www.samuelrizzon.dev/log/how-this-site-was-built
- Statut : inspiration proposée par l'utilisateur. Les adaptations ci-dessous
  sont des pistes à sélectionner, pas des fonctionnalités déjà validées.
- Méthode : consultation du site dans le navigateur à largeur étroite et lecture
  de l'article. Aucun audit du code ni essai REA n'a été effectué.

## Ce que montre la référence

Le site utilise un univers pixel art cohérent : les éléments se construisent en
blocs avec des personnages animés. Les projets ont des aperçus vidéo, les
réalisations figurent dans une carte personnelle, et l'activité GitHub devient
une grille. Une carte représente les visiteurs. La page propose aussi un
terminal de contact et des interactions cachées.

Dans son article, l'auteur décrit les variantes explorées et précise que sa
cible est sa communauté. Il relate aussi des problèmes découverts sur téléphone.
Ces points éclairent ses choix et renforcent l'intérêt de tester nos propres
interactions dans des conditions réelles.

## Adaptations possibles au portfolio

| Idée | Application proposée | Priorité proposée |
| --- | --- | --- |
| Construction progressive | Dans l'accueil, des observations deviennent une courbe ou un nuage de points, puis une représentation de modèle. Explorer un vocabulaire commun finance/ML. | Haute |
| Aperçus animés de projets | Courte capture de la recommandation Spotify, évolution d'une courbe de backtest, ou exemple de génération de texte. Associer chaque aperçu à une explication et un résultat vérifié. | Haute |
| Informations compactes | Pour chaque projet, afficher le problème traité, la contribution personnelle, les méthodes et un résultat contextualisé. | Haute |
| Visualisation interactive | Permettre de sélectionner un modèle, de parcourir une courbe ou de comparer deux variantes à partir de résultats sauvegardés. | Haute |
| Réactions au pointeur et à la sélection | Souligner une carte active, révéler une légende ou animer une transition entre étapes d'un pipeline. | Moyenne |
| Terminal ou interactions cachées | Éventuel supplément ludique, avec des liens CV, projets et contact directement accessibles. | Optionnelle |

La combinaison artistique principale reste Ing Tian, Alexander Rom et Emmanuel
Sabuni. Samuel Rizzon apporte une référence pour les interactions et la façon
de rendre le contenu vivant. La palette et la typographie restent à définir
dans notre propre maquette.

## Points à vérifier pendant les futurs essais

- Durée des animations et accès immédiat aux informations pendant leur déroulement.
- Possibilité de passer l'introduction et respect du mouvement réduit.
- Lisibilité des graphiques et du texte, y compris sur téléphone.
- Disponibilité des interactions au clavier et au toucher.
- Poids des aperçus et comportement sur un appareil moins puissant.
- Présentation explicite des données réelles, des résultats d'expériences et des
  animations purement illustratives.

Premier essai candidat : une carte Spotify avec aperçu animé et deux indicateurs
vérifiés, puis une carte finance reprenant la même structure. Cela permettrait
de juger la cohérence des présentations avant de généraliser à tous les projets.
