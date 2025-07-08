const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/delivery'
});

// Création des tables
const initDatabase = async () => {
  try {
    await pool.query(`
      -- Table DeliveryPerson selon le schéma UML
      CREATE TABLE IF NOT EXISTS delivery_person (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        is_available BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Table Delivery selon le schéma UML
      CREATE TABLE IF NOT EXISTS delivery (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id VARCHAR(255) NOT NULL,
        delivery_person_id UUID REFERENCES delivery_person(id),
        delivery_address_id VARCHAR(255) NOT NULL,
        dispatched_at TIMESTAMP,
        delivered_at TIMESTAMP,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Index pour améliorer les performances
      CREATE INDEX IF NOT EXISTS idx_delivery_order_id ON delivery(order_id);
      CREATE INDEX IF NOT EXISTS idx_delivery_person_id ON delivery(delivery_person_id);
      CREATE INDEX IF NOT EXISTS idx_delivery_status ON delivery(status);
    `);
    console.log('Base de données initialisée avec succès');

    // Insertion des données de test
    await insertTestData();
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
};

// Fonction pour insérer des données de test
const insertTestData = async () => {
  try {
    // Vérifier si des données existent déjà
    const deliveryPersonsCount = await pool.query('SELECT COUNT(*) FROM delivery_person');
    if (parseInt(deliveryPersonsCount.rows[0].count) === 0) {
      // Insertion des livreurs
      const deliveryPersons = [
        { name: 'Jean Dupont', phone: '0123456789', is_available: true },
        { name: 'Sophie Martin', phone: '0987654321', is_available: false },
        { name: 'Pierre Bernard', phone: '0612345678', is_available: true }
      ];

      for (const person of deliveryPersons) {
        await pool.query(`
          INSERT INTO delivery_person (name, phone, is_available) 
          VALUES ($1, $2, $3)
        `, [person.name, person.phone, person.is_available]);
      }

      // Récupérer les IDs des livreurs pour les livraisons
      const personsResult = await pool.query('SELECT id FROM delivery_person ORDER BY created_at');
      const personIds = personsResult.rows.map(row => row.id);

      // Insertion des livraisons
      const deliveries = [
        { order_id: 'CMD-001', delivery_person_id: personIds[0], delivery_address_id: 'ADDR-001', status: 'expedie' },
        { order_id: 'CMD-002', delivery_person_id: personIds[1], delivery_address_id: 'ADDR-002', status: 'en_transit' },
        { order_id: 'CMD-003', delivery_person_id: personIds[2], delivery_address_id: 'ADDR-003', status: 'en_attente' },
        { order_id: 'CMD-004', delivery_person_id: personIds[2], delivery_address_id: 'ADDR-004', status: 'disponible' }
      ];

      for (const delivery of deliveries) {
        await pool.query(`
          INSERT INTO delivery (order_id, delivery_person_id, delivery_address_id, dispatched_at, status) 
          VALUES ($1, $2, $3, $4, $5)
        `, [
          delivery.order_id, 
          delivery.delivery_person_id, 
          delivery.delivery_address_id, 
          delivery.status === 'en_attente' ? null : new Date(),
          delivery.status
        ]);
      }

      console.log('Données de test insérées avec succès');
    } else {
      console.log('Des données existent déjà, pas d\'insertion de données de test');
    }
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données de test:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initDatabase
}; 