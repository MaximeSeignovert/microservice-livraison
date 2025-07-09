const { pool } = require('../config/database');

const livraisonController = {
  // Création d'une livraison au moment de la commande
  // POST livraisons/$livraisonId
  createLivraison: async (request, reply) => {
    try {
      const { livraisonId } = request.params;
      const { idCommande, adresseLivraison, statut = "PREPARING" } = request.body;
      
      // Vérifier si la livraison existe déjà
      const existingLivraison = await pool.query('SELECT id FROM delivery WHERE id = $1', [livraisonId]);
      if (existingLivraison.rows.length > 0) {
        return reply.code(409).send({ error: 'Livraison avec cet ID existe déjà' });
      }
      
      const result = await pool.query(
        'INSERT INTO delivery (id, order_id, delivery_address_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [livraisonId, idCommande, adresseLivraison, statut]
      );

      return reply.code(201).send({ 
        id: result.rows[0].id, 
        message: 'Livraison créée avec succès',
        livraison: result.rows[0]
      });
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Obtenir les infos de la livraison (status de commande et infos livreurs)
  // GET livraisons/$livraisonId
  getLivraisonById: async (request, reply) => {
    try {
      const { livraisonId } = request.params;
      const result = await pool.query(`
        SELECT 
          d.*,
          dp.name as livreur_nom,
          dp.phone as livreur_telephone,
          dp.is_available as livreur_disponible
        FROM delivery d
        LEFT JOIN delivery_person dp ON d.delivery_person_id = dp.id
        WHERE d.id = $1
      `, [livraisonId]);
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Livraison non trouvée' });
      }
      
      return result.rows[0];
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Affichage des livraisons dès la confirmation de la commande
  // GET livraisons/available
  getAvailableLivraisons: async (request, reply) => {
    try {
      const result = await pool.query(`
        SELECT 
          d.*,
          dp.name as livreur_nom,
          dp.phone as livreur_telephone
        FROM delivery d
        LEFT JOIN delivery_person dp ON d.delivery_person_id = dp.id
        WHERE d.status IN ('PREPARING', 'READY', 'ON_THE_WAY', 'DELIVERED')
        ORDER BY d.created_at DESC
      `);
      return result.rows;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Dashboard livreur - Obtenir les livraisons d'un livreur
  // GET livreur/$livreurId/livraisons
  getLivraisonsByLivreur: async (request, reply) => {
    try {
      const { livreurId } = request.params;
      const result = await pool.query(`
        SELECT 
          d.*,
          dp.name as livreur_nom,
          dp.phone as livreur_telephone,
        FROM delivery d
        JOIN delivery_person dp ON d.delivery_person_id = dp.id
        WHERE d.delivery_person_id = $1
        AND d.status IN ('PREPARING', 'READY', 'ON_THE_WAY', 'DELIVERED')
        ORDER BY d.created_at DESC
      `, [livreurId]);
      return result.rows;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  // Prendre en charge une commande
  // PATCH livraison/$livraisonId
  takeLivraison: async (request, reply) => {
    try {
      const { livraisonId } = request.params;
      const { livreurId, statut } = request.body;

      // Vérifier que la livraison existe
      const existingLivraison = await pool.query('SELECT * FROM delivery WHERE id = $1', [livraisonId]);
      if (existingLivraison.rows.length === 0) {
        return reply.code(404).send({ error: 'Livraison non trouvée' });
      }

      // Vérifier que le livreur existe et est disponible
      if (livreurId) {
        const livreur = await pool.query('SELECT * FROM delivery_person WHERE id = $1', [livreurId]);
        if (livreur.rows.length === 0) {
          return reply.code(404).send({ error: 'Livreur non trouvé' });
        }
        if (!livreur.rows[0].is_available) {
          return reply.code(400).send({ error: 'Livreur non disponible' });
        }
      }

      let updateQuery = 'UPDATE delivery SET updated_at = NOW()';
      let params = [livraisonId];
      let paramIndex = 2;

      // Mise à jour du livreur si fourni
      if (livreurId) {
        updateQuery += `, delivery_person_id = $${paramIndex}`;
        params.splice(1, 0, livreurId);
        paramIndex++;
      }

      // Mise à jour du statut si fourni
      if (statut) {
        updateQuery += `, status = $${paramIndex}`;
        params.splice(-1, 0, statut);
        paramIndex++;

        // Mettre à jour les timestamps selon le statut
        if (statut === 'ON_THE_WAY') {
          updateQuery += ', dispatched_at = NOW()';
        } else if (statut === 'DELIVERED') {
          updateQuery += ', delivered_at = NOW()';
        }
      }

      updateQuery += ` WHERE id = $${params.length} RETURNING *`;

      const result = await pool.query(updateQuery, params);

      return { 
        message: 'Livraison mise à jour avec succès',
        livraison: result.rows[0]
      };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  }
};

module.exports = livraisonController; 