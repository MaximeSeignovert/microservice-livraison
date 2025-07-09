const livreurController = require('../controllers/livreurController');
const livraisonController = require('../controllers/livraisonController');

async function routes(fastify, options) {
  // Routes pour les livreurs
  // Créer un livreur lors du register d'un compte livreur
  fastify.post('/livreur/:livreurId', livreurController.createLivreur);
  fastify.get('/livreurs/:id', livreurController.getLivreurById);

  // Routes pour les livraisons
  // Création d'une livraison au moment de la commande
  fastify.post('/livraisons/:livraisonId', livraisonController.createLivraison);
  
  // Dashboard livreur - Affichage des livraisons dès la confirmation de la commande
  // Cette route doit être AVANT la route avec paramètre pour éviter les conflits
  fastify.get('/livraisons/available', livraisonController.getAvailableLivraisons);
  
  // Order Tracker - Obtenir les infos de la livraison (status de commande et infos livreurs)
  fastify.get('/livraisons/:livraisonId', livraisonController.getLivraisonById);
  
  // Dashboard livreur - Obtenir les livraisons d'un livreur spécifique
  fastify.get('/livreur/:livreurId/livraisons', livraisonController.getLivraisonsByLivreur);
  
  // Prendre en charge une commande
  fastify.patch('/livraison/:livraisonId', livraisonController.takeLivraison);
}

module.exports = routes; 