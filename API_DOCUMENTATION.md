# API de Livraison - Documentation

Cette API a été adaptée pour correspondre au schéma UML fourni avec les classes `Delivery` et `DeliveryPerson`, tout en gardant une interface entièrement en français.

## Schéma UML Implémenté

```
class Delivery {
    +string id
    +string orderId
    +string deliveryPersonId
    +string deliveryAddressId
    +Date dispatchedAt
    +Date deliveredAt
    +string status
}

class DeliveryPerson {
    +string id
    +string name
    +string phone
    +boolean isAvailable
}
```

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Configuration des ports
API_PORT=3000
DB_PORT=5432

# Configuration de la base de données
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=delivery

# URL de connexion à la base de données
DATABASE_URL=postgres://postgres:postgres@db:5432/delivery

# Configuration de l'environnement
NODE_ENV=development
```

### Démarrage

```bash
# Construire et démarrer tous les services
docker-compose up --build

# En arrière-plan
docker-compose up --build -d

# Arrêter les services
docker-compose down
```

## Endpoints API

### Livreurs

#### `GET /livreurs`
Récupère tous les livreurs
```json
[
  {
    "id": "uuid",
    "name": "Jean Dupont",
    "phone": "0123456789",
    "is_available": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### `GET /livreurs/disponibles`
Récupère les livreurs disponibles

#### `GET /livreurs/:id`
Récupère un livreur par ID

#### `POST /livreurs`
Crée un nouveau livreur
```json
{
  "nom": "Sophie Martin",
  "telephone": "0987654321",
  "disponible": true
}
```

#### `PUT /livreurs/:id`
Met à jour un livreur
```json
{
  "nom": "Sophie Martin",
  "telephone": "0987654321",
  "disponible": false
}
```

#### `PATCH /livreurs/:id/disponibilite`
Met à jour seulement la disponibilité
```json
{
  "disponible": false
}
```

#### `DELETE /livreurs/:id`
Supprime un livreur

### Livraisons

#### `GET /livraisons`
Récupère toutes les livraisons avec les informations du livreur
```json
[
  {
    "id": "uuid",
    "order_id": "CMD-001",
    "delivery_person_id": "uuid",
    "delivery_address_id": "ADDR-001",
    "dispatched_at": "2024-01-01T10:00:00.000Z",
    "delivered_at": null,
    "status": "expedie",
    "created_at": "2024-01-01T09:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z",
    "livreur_nom": "Jean Dupont",
    "livreur_telephone": "0123456789",
    "livreur_disponible": false
  }
]
```

#### `GET /livraisons/:id`
Récupère une livraison par ID

#### `POST /livraisons`
Crée une nouvelle livraison
```json
{
  "idCommande": "CMD-004",
  "idLivreur": "uuid",
  "idAdresseLivraison": "ADDR-004",
  "statut": "en_attente"
}
```

#### `PATCH /livraisons/:id/assigner`
Assigne un livreur à une livraison
```json
{
  "idLivreur": "uuid"
}
```

#### `PATCH /livraisons/:id/expedier`
Marque une livraison comme expédiée
- Met `status` à "expedie"
- Met `dispatched_at` à l'heure actuelle
- Marque le livreur comme non disponible

#### `PATCH /livraisons/:id/livrer`
Marque une livraison comme livrée
- Met `status` à "livre"
- Met `delivered_at` à l'heure actuelle
- Marque le livreur comme disponible

#### `PUT /livraisons/:id/statut`
Met à jour le statut d'une livraison
```json
{
  "statut": "en_transit"
}
```

### Routes de filtrage

#### `GET /livreurs/:livreurId/livraisons`
Récupère les livraisons d'un livreur spécifique

#### `GET /commandes/:idCommande/livraisons`
Récupère les livraisons d'une commande spécifique

#### `GET /livraisons/statut/:statut`
Récupère les livraisons par statut
- Statuts possibles : `en_attente`, `expedie`, `en_transit`, `livre`

## Statuts de livraison (en français)

- `en_attente` : En attente d'assignation
- `expedie` : Expédiée (livreur assigné et en route)
- `en_transit` : En transit
- `livre` : Livrée

## Base de données

### Tables créées

#### `delivery_person`
- `id` (UUID, PK)
- `name` (VARCHAR) - Nom complet du livreur
- `phone` (VARCHAR) - Numéro de téléphone
- `is_available` (BOOLEAN) - Disponibilité
- `created_at`, `updated_at` (TIMESTAMP)

#### `delivery`
- `id` (UUID, PK)
- `order_id` (VARCHAR) - ID de la commande
- `delivery_person_id` (UUID, FK) - ID du livreur
- `delivery_address_id` (VARCHAR) - ID de l'adresse de livraison
- `dispatched_at` (TIMESTAMP) - Date/heure d'expédition
- `delivered_at` (TIMESTAMP) - Date/heure de livraison
- `status` (VARCHAR) - Statut actuel
- `created_at`, `updated_at` (TIMESTAMP)

### Index créés
- `idx_delivery_order_id` sur `delivery(order_id)`
- `idx_delivery_person_id` sur `delivery(delivery_person_id)`
- `idx_delivery_status` sur `delivery(status)`

## Exemples d'utilisation

### Créer un livreur
```bash
curl -X POST http://localhost:3000/livreurs \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Marie Dubois",
    "telephone": "0612345678",
    "disponible": true
  }'
```

### Créer une livraison
```bash
curl -X POST http://localhost:3000/livraisons \
  -H "Content-Type: application/json" \
  -d '{
    "idCommande": "CMD-005",
    "idLivreur": "uuid-du-livreur",
    "idAdresseLivraison": "ADDR-005",
    "statut": "en_attente"
  }'
```

### Expédier une livraison
```bash
curl -X PATCH http://localhost:3000/livraisons/uuid-livraison/expedier
```

### Marquer comme livrée
```bash
curl -X PATCH http://localhost:3000/livraisons/uuid-livraison/livrer
```

## Changements par rapport à l'ancienne API

1. **Structure UML** : Adaptation complète selon le schéma fourni
2. **IDs UUID** : Passage de `SERIAL` à `UUID` pour tous les identifiants
3. **Noms français** : Toutes les routes et paramètres en français
4. **Logique métier** : Gestion automatique de la disponibilité des livreurs
5. **Statuts français** : `en_attente`, `expedie`, `en_transit`, `livre`
6. **Configuration flexible** : Support complet des variables d'environnement

L'API garde la même logique métier tout en respectant parfaitement le schéma UML et en utilisant une interface entièrement en français. 