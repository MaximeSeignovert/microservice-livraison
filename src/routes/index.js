const livreurController = require('../controllers/livreurController');
const livraisonController = require('../controllers/livraisonController');

async function routes(fastify, options) {
  // Routes pour les livreurs
  fastify.get('/livreurs', livreurController.getAllLivreurs);
  fastify.get('/livreurs/:id', livreurController.getLivreurById);
  fastify.post('/livreurs', livreurController.createLivreur);
  fastify.put('/livreurs/:id', livreurController.updateLivreur);
  fastify.delete('/livreurs/:id', livreurController.deleteLivreur);

  // Routes pour les livraisons
  fastify.get('/livraisons', livraisonController.getAllLivraisons);
  fastify.get('/livraisons/:id', livraisonController.getLivraisonById);
  fastify.post('/livraisons', livraisonController.createLivraison);
  fastify.put('/livraisons/:id/status', livraisonController.updateLivraisonStatus);
  fastify.get('/livreurs/:idLivreur/livraisons', livraisonController.getLivraisonsByLivreur);
}

module.exports = routes; 