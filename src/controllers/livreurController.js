const { pool } = require('../config/database');

const livreurController = {
  // Récupérer tous les livreurs
  getAllLivreurs: async (request, reply) => {
    try {
      const result = await pool.query('SELECT * FROM livreur');
      return result.rows;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Récupérer un livreur par ID
  getLivreurById: async (request, reply) => {
    try {
      const { id } = request.params;
      const result = await pool.query('SELECT * FROM livreur WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Livreur non trouvé' });
      }
      
      return result.rows[0];
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Créer un nouveau livreur
  createLivreur: async (request, reply) => {
    try {
      const { nom, prenom, telephone, email, statut } = request.body;
      
      const result = await pool.query(
        'INSERT INTO livreur (nom, prenom, telephone, email, statut) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [nom, prenom, telephone, email, statut]
      );

      return { id: result.rows[0].id, message: 'Livreur créé avec succès' };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Mettre à jour un livreur
  updateLivreur: async (request, reply) => {
    try {
      const { id } = request.params;
      const { nom, prenom, telephone, email, statut } = request.body;

      const result = await pool.query(
        'UPDATE livreur SET nom = $1, prenom = $2, telephone = $3, email = $4, statut = $5 WHERE id = $6 RETURNING *',
        [nom, prenom, telephone, email, statut, id]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Livreur non trouvé' });
      }

      return { message: 'Livreur mis à jour avec succès' };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Supprimer un livreur
  deleteLivreur: async (request, reply) => {
    try {
      const { id } = request.params;
      
      const result = await pool.query('DELETE FROM livreur WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Livreur non trouvé' });
      }

      return { message: 'Livreur supprimé avec succès' };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  }
};

module.exports = livreurController; 