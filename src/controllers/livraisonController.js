const { pool } = require('../config/database');

const livraisonController = {
  // Récupérer toutes les livraisons
  getAllLivraisons: async (request, reply) => {
    try {
      const result = await pool.query('SELECT * FROM livraison');
      return result.rows;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Récupérer une livraison par ID
  getLivraisonById: async (request, reply) => {
    try {
      const { id } = request.params;
      const result = await pool.query('SELECT * FROM livraison WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Livraison non trouvée' });
      }
      
      return result.rows[0];
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Créer une nouvelle livraison
  createLivraison: async (request, reply) => {
    try {
      const { id_commande, id_livreur, date_heure_debut, statut_livraison } = request.body;
      
      const result = await pool.query(
        'INSERT INTO livraison (id_commande, id_livreur, date_heure_debut, statut_livraison) VALUES ($1, $2, $3, $4) RETURNING *',
        [id_commande, id_livreur, date_heure_debut, statut_livraison]
      );

      return { id: result.rows[0].id, message: 'Livraison créée avec succès' };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Mettre à jour le statut d'une livraison
  updateLivraisonStatus: async (request, reply) => {
    try {
      const { id } = request.params;
      const { statut_livraison, date_heure_fin } = request.body;

      const result = await pool.query(
        'UPDATE livraison SET statut_livraison = $1, date_heure_fin = $2 WHERE id = $3 RETURNING *',
        [statut_livraison, date_heure_fin, id]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Livraison non trouvée' });
      }

      return { message: 'Statut de livraison mis à jour avec succès' };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Récupérer les livraisons d'un livreur
  getLivraisonsByLivreur: async (request, reply) => {
    try {
      const { idLivreur } = request.params;
      const result = await pool.query('SELECT * FROM livraison WHERE id_livreur = $1', [idLivreur]);
      return result.rows;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  }
};

module.exports = livraisonController; 