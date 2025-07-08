const { pool } = require('../config/database');

const livraisonController = {
  // Récupérer toutes les livraisons
  getAllLivraisons: async (request, reply) => {
    try {
      const result = await pool.query(`
        SELECT 
          d.*,
          dp.name as livreur_nom,
          dp.phone as livreur_telephone,
          dp.is_available as livreur_disponible
        FROM delivery d
        LEFT JOIN delivery_person dp ON d.delivery_person_id = dp.id
        ORDER BY d.created_at DESC
      `);
      return result.rows;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Récupérer une livraison par ID
  getLivraisonById: async (request, reply) => {
    try {
      const { id } = request.params;
      const result = await pool.query(`
        SELECT 
          d.*,
          dp.name as livreur_nom,
          dp.phone as livreur_telephone,
          dp.is_available as livreur_disponible
        FROM delivery d
        LEFT JOIN delivery_person dp ON d.delivery_person_id = dp.id
        WHERE d.id = $1
      `, [id]);
      
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
      const { idCommande, idLivreur, idAdresseLivraison, statut = 'en_attente' } = request.body;
      
      const result = await pool.query(
        'INSERT INTO delivery (order_id, delivery_person_id, delivery_address_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [idCommande, idLivreur, idAdresseLivraison, statut]
      );

      return { 
        id: result.rows[0].id, 
        message: 'Livraison créée avec succès',
        livraison: result.rows[0]
      };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Assigner un livreur à une livraison
  assignerLivreur: async (request, reply) => {
    try {
      const { id } = request.params;
      const { idLivreur } = request.body;

      // Vérifier que le livreur existe et est disponible
      const livreurCheck = await pool.query(
        'SELECT * FROM delivery_person WHERE id = $1 AND is_available = true',
        [idLivreur]
      );

      if (livreurCheck.rows.length === 0) {
        return reply.code(400).send({ error: 'Livreur non disponible ou inexistant' });
      }

      const result = await pool.query(
        'UPDATE delivery SET delivery_person_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [idLivreur, id]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Livraison non trouvée' });
      }

      return { 
        message: 'Livreur assigné avec succès',
        livraison: result.rows[0]
      };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Expédier une livraison (marquer comme expédiée)
  expedierLivraison: async (request, reply) => {
    try {
      const { id } = request.params;

      const result = await pool.query(
        'UPDATE delivery SET status = $1, dispatched_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *',
        ['expedie', id]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Livraison non trouvée' });
      }

      // Marquer le livreur comme non disponible
      if (result.rows[0].delivery_person_id) {
        await pool.query(
          'UPDATE delivery_person SET is_available = false WHERE id = $1',
          [result.rows[0].delivery_person_id]
        );
      }

      return { 
        message: 'Livraison expédiée avec succès',
        livraison: result.rows[0]
      };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Marquer une livraison comme livrée
  marquerCommeLivree: async (request, reply) => {
    try {
      const { id } = request.params;

      const result = await pool.query(
        'UPDATE delivery SET status = $1, delivered_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *',
        ['livre', id]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Livraison non trouvée' });
      }

      // Marquer le livreur comme disponible
      if (result.rows[0].delivery_person_id) {
        await pool.query(
          'UPDATE delivery_person SET is_available = true WHERE id = $1',
          [result.rows[0].delivery_person_id]
        );
      }

      return { 
        message: 'Livraison marquée comme livrée avec succès',
        livraison: result.rows[0]
      };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Mettre à jour le statut d'une livraison
  updateStatutLivraison: async (request, reply) => {
    try {
      const { id } = request.params;
      const { statut } = request.body;

      let updateQuery = 'UPDATE delivery SET status = $1, updated_at = NOW()';
      let params = [statut, id];

      // Mettre à jour les timestamps selon le statut
      if (statut === 'expedie' && !request.body.expedieA) {
        updateQuery += ', dispatched_at = NOW()';
      } else if (statut === 'livre' && !request.body.livreA) {
        updateQuery += ', delivered_at = NOW()';
      }

      updateQuery += ' WHERE id = $2 RETURNING *';

      const result = await pool.query(updateQuery, params);

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Livraison non trouvée' });
      }

      return { 
        message: 'Statut de livraison mis à jour avec succès',
        livraison: result.rows[0]
      };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Récupérer les livraisons d'un livreur
  getLivraisonsByLivreur: async (request, reply) => {
    try {
      const { livreurId } = request.params;
      const result = await pool.query(`
        SELECT 
          d.*,
          dp.name as livreur_nom,
          dp.phone as livreur_telephone
        FROM delivery d
        JOIN delivery_person dp ON d.delivery_person_id = dp.id
        WHERE d.delivery_person_id = $1
        ORDER BY d.created_at DESC
      `, [livreurId]);
      return result.rows;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Récupérer les livraisons par commande
  getLivraisonsByCommande: async (request, reply) => {
    try {
      const { idCommande } = request.params;
      const result = await pool.query(`
        SELECT 
          d.*,
          dp.name as livreur_nom,
          dp.phone as livreur_telephone
        FROM delivery d
        LEFT JOIN delivery_person dp ON d.delivery_person_id = dp.id
        WHERE d.order_id = $1
        ORDER BY d.created_at DESC
      `, [idCommande]);
      return result.rows;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Récupérer les livraisons par statut
  getLivraisonsByStatut: async (request, reply) => {
    try {
      const { statut } = request.params;
      const result = await pool.query(`
        SELECT 
          d.*,
          dp.name as livreur_nom,
          dp.phone as livreur_telephone
        FROM delivery d
        LEFT JOIN delivery_person dp ON d.delivery_person_id = dp.id
        WHERE d.status = $1
        ORDER BY d.created_at DESC
      `, [statut]);
      return result.rows;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Récupérer les livraisons disponibles
  getLivraisonsDisponibles: async (request, reply) => {
    try {
      const result = await pool.query('SELECT * FROM livraison WHERE statut_livraison = $1', ['disponible']);
      return result.rows;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },


};








module.exports = livraisonController; 