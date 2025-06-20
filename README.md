# Service de Livraison

## Démarrage Rapide

### Prérequis
- Node.js (v18+)
- Docker Desktop (optionnel)
- npm

### Méthode 1 : Sans Docker

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# OU démarrage en mode production
npm start
```

### Méthode 2 : Avec Docker

1. Renommez `.env.example` en  `.env`

2. Executez la commande suivante
```bash
# Lancer en arrière-plan
docker-compose up --build -d
```

Le service sera accessible sur : http://localhost:3000

### Test rapide
```bash
# Vérifier que le service fonctionne
curl http://localhost:3000
```

## Structure du Projet

```
./
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── livreurController.js
│   │   └── livraisonController.js
│   ├── routes/
│   │   └── index.js
│   └── index.js
├── database/
│   └── delivery.db
├── package.json
└── Dockerfile
```

## Endpoints API

### Livreurs
- `GET /livreurs` : Liste tous les livreurs
- `GET /livreurs/:id` : Obtient les détails d'un livreur
- `POST /livreurs` : Crée un nouveau livreur
- `PUT /livreurs/:id` : Met à jour un livreur
- `DELETE /livreurs/:id` : Supprime un livreur

### Livraisons
- `GET /livraisons` : Liste toutes les livraisons
- `GET /livraisons/:id` : Obtient les détails d'une livraison
- `POST /livraisons` : Crée une nouvelle livraison
- `PUT /livraisons/:id/status` : Met à jour le statut d'une livraison
- `GET /livreurs/:idLivreur/livraisons` : Liste les livraisons d'un livreur

## Exemple d'Utilisation

### Créer un livreur
```bash
curl -X POST http://localhost:3000/livreurs \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "0123456789",
    "email": "jean.dupont@email.com",
    "statut": "disponible"
  }'
```

### Créer une livraison
```bash
curl -X POST http://localhost:3000/livraisons \
  -H "Content-Type: application/json" \
  -d '{
    "idCommande": 1,
    "idLivreur": 1,
    "dateHeureDebut": "2024-03-20T10:00:00",
    "statutLivraison": "en_cours"
  }'
```

## Dépannage

### Problèmes courants

1. **Erreur de connexion à la base de données**
   - Vérifier que le dossier `database` existe
   - Vérifier les permissions du dossier

2. **Erreur Docker**
   - S'assurer que Docker Desktop est en cours d'exécution
   - Vérifier que le port 3000 n'est pas déjà utilisé

3. **Erreur de compilation better-sqlite3**
   - Supprimer le dossier `node_modules`
   - Relancer `npm install`

## Base de données

Le service utilise SQLite comme base de données. Le fichier de base de données est stocké dans le dossier `database/`.

### Schéma de la base de données

#### Table Livreur
- IDLivreur (PK)
- Nom
- Prénom
- Téléphone
- Email
- Statut 