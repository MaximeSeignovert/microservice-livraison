const { pool } = require('../config/database');

const livreurController = {
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

  // Créer un nouveau livreur lors du register d'un compte livreur
  // POST livreur/$livreurId
  createLivreur: async (request, reply) => {
    try {
      const { livreurId } = request.params;
      const { nom, telephone, disponible = true } = request.body;
      
      // Vérifier si le livreur existe déjà
      const existingLivreur = await pool.query('SELECT id FROM delivery_person WHERE id = $1', [livreurId]);
      if (existingLivreur.rows.length > 0) {
        return reply.code(409).send({ error: 'Livreur avec cet ID existe déjà' });
      }
      
      // Si l'ID est fourni, on l'utilise, sinon on laisse PostgreSQL générer un ID auto-incrémenté
      let result;
      if (livreurId && !isNaN(livreurId)) {
        // Forcer un ID spécifique
        result = await pool.query(
          'INSERT INTO delivery_person (id, name, phone, is_available) VALUES ($1, $2, $3, $4) RETURNING *',
          [parseInt(livreurId), nom, telephone, disponible]
        );
      } else {
        // Laisser PostgreSQL générer l'ID
        result = await pool.query(
          'INSERT INTO delivery_person (name, phone, is_available) VALUES ($1, $2, $3) RETURNING *',
          [nom, telephone, disponible]
        );
      }

      return reply.code(201).send({ 
        id: result.rows[0].id, 
        message: 'Livreur créé avec succès',
        livreur: result.rows[0]
      });
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  }
};

module.exports = livreurController; 