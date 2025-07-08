const { pool } = require('../config/database');

const livreurController = {
  // Récupérer tous les livreurs
  getAllLivreurs: async (request, reply) => {
    try {
      const result = await pool.query('SELECT * FROM delivery_person ORDER BY created_at');
      return result.rows;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Récupérer un livreur par ID
  getLivreurById: async (request, reply) => {
    try {
      const { id } = request.params;
      const result = await pool.query('SELECT * FROM delivery_person WHERE id = $1', [id]);
      
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
      const { nom, telephone, disponible = true } = request.body;
      
      const result = await pool.query(
        'INSERT INTO delivery_person (name, phone, is_available) VALUES ($1, $2, $3) RETURNING *',
        [nom, telephone, disponible]
      );

      return { 
        id: result.rows[0].id, 
        message: 'Livreur créé avec succès',
        livreur: result.rows[0]
      };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Mettre à jour un livreur
  updateLivreur: async (request, reply) => {
    try {
      const { id } = request.params;
      const { nom, telephone, disponible } = request.body;

      const result = await pool.query(
        'UPDATE delivery_person SET name = $1, phone = $2, is_available = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
        [nom, telephone, disponible, id]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Livreur non trouvé' });
      }

      return { 
        message: 'Livreur mis à jour avec succès',
        livreur: result.rows[0]
      };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Mettre à jour la disponibilité d'un livreur
  updateDisponibilite: async (request, reply) => {
    try {
      const { id } = request.params;
      const { disponible } = request.body;

      const result = await pool.query(
        'UPDATE delivery_person SET is_available = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [disponible, id]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Livreur non trouvé' });
      }

      return { 
        message: 'Disponibilité mise à jour avec succès',
        livreur: result.rows[0]
      };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Récupérer les livreurs disponibles
  getLivreursDisponibles: async (request, reply) => {
    try {
      const result = await pool.query(
        'SELECT * FROM delivery_person WHERE is_available = true ORDER BY created_at'
      );
      return result.rows;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Supprimer un livreur
  deleteLivreur: async (request, reply) => {
    try {
      const { id } = request.params;
      
      const result = await pool.query('DELETE FROM delivery_person WHERE id = $1 RETURNING *', [id]);

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