# ARCHITECTURE MICROSERVICES

## Projet : Système de gestion de commandes pour un restaurant

### Objectif du projet
Créer une application de gestion de commandes pour un restaurant qui permette de prendre des commandes de clients, de les traiter en cuisine, et de suivre leur statut jusqu'à la livraison.

### Architecture à respecter
- **Service de Gestion des Clients** : Gère les informations des clients, les authentifications et les sessions.
- **Service de Commandes** : Permet aux clients de passer des commandes, les enregistre et les transmet aux services appropriés.
- **Service de Cuisine** : Reçoit les commandes, permet aux chefs de mettre à jour le statut des plats (en préparation, prêt à servir).
- **Service de Livraison** : Gère les informations des livreurs, les affectations des livraisons et le suivi en temps réel des livraisons.

### Fonctionnalités clés
- Interface pour que les clients puissent parcourir un menu, sélectionner des plats, et passer des commandes.
- Tableau de bord pour la cuisine pour voir les commandes entrantes et mettre à jour le statut des plats.
- Système pour les livreurs pour voir les commandes à livrer et mettre à jour le statut de livraison.
- Authentification des utilisateurs pour différents rôles (client, chef, livreur).

### Défis à relever
- Assurer que les commandes sont correctement transmises entre les services sans perdre d'informations.
- Gérer les erreurs et les défaillances potentielles dans la communication entre services.
- Assurer une interface utilisateur réactive et facile à utiliser.

### Détails Techniques

#### Service de Livraison
- **Technologie** : Node.js avec Fastify
- **Port** : 3000
- **Endpoints** :
  - `GET /` : Page d'accueil du service
  - `GET /deliveries` : Liste des livraisons en cours
- **Fonctionnalités à implémenter** :
  - Gestion des livreurs (CRUD)
  - Attribution des commandes aux livreurs
  - Suivi en temps réel des livraisons
  - Système de notification pour les mises à jour de statut
  - Intégration avec le service de commandes 