const livreurController = require('../controllers/livreurController');
const livraisonController = require('../controllers/livraisonController');

async function routes(fastify, options) {
  // Routes pour les livreurs
  fastify.get('/livreurs', livreurController.getAllLivreurs);
  fastify.get('/livreurs/disponibles', livreurController.getLivreursDisponibles);
  fastify.get('/livreurs/:id', livreurController.getLivreurById);
  fastify.post('/livreurs', livreurController.createLivreur);
  fastify.put('/livreurs/:id', livreurController.updateLivreur);
  fastify.patch('/livreurs/:id/disponibilite', livreurController.updateDisponibilite);
  fastify.delete('/livreurs/:id', livreurController.deleteLivreur);

  // Routes pour les livraisons
  fastify.get('/livraisons/disponibles', livraisonController.getLivraisonsDisponibles);
  fastify.get('/livraisons', livraisonController.getAllLivraisons);
  fastify.get('/livraisons/:id', livraisonController.getLivraisonById);
  fastify.post('/livraisons', livraisonController.createLivraison);
  fastify.patch('/livraisons/:id/assigner', livraisonController.assignerLivreur);
  fastify.patch('/livraisons/:id/expedier', livraisonController.expedierLivraison);
  fastify.patch('/livraisons/:id/livrer', livraisonController.marquerCommeLivree);
  fastify.put('/livraisons/:id/statut', livraisonController.updateStatutLivraison);
  
  // Routes de recherche/filtrage
  fastify.get('/livreurs/:livreurId/livraisons', livraisonController.getLivraisonsByLivreur);
  fastify.get('/commandes/:idCommande/livraisons', livraisonController.getLivraisonsByCommande);
  fastify.get('/livraisons/statut/:statut', livraisonController.getLivraisonsByStatut);
}

module.exports = routes; 