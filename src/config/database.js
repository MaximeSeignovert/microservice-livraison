const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/delivery'
});

// Création des tables
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS livreur (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        telephone VARCHAR(20) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        statut VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS livraison (
        id SERIAL PRIMARY KEY,
        id_commande INTEGER NOT NULL,
        id_livreur INTEGER REFERENCES livreur(id),
        date_heure_debut TIMESTAMP,
        date_heure_fin TIMESTAMP,
        statut_livraison VARCHAR(50) NOT NULL
      );
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
    const livreursCount = await pool.query('SELECT COUNT(*) FROM livreur');
    if (parseInt(livreursCount.rows[0].count) === 0) {
      // Insertion des livreurs
      await pool.query(`
        INSERT INTO livreur (nom, prenom, telephone, email, statut) VALUES
        ('Dupont', 'Jean', '0123456789', 'jean.dupont@email.com', 'disponible'),
        ('Martin', 'Sophie', '0987654321', 'sophie.martin@email.com', 'en_livraison'),
        ('Bernard', 'Pierre', '0612345678', 'pierre.bernard@email.com', 'disponible')
      `);

      // Insertion des livraisons
      await pool.query(`
        INSERT INTO livraison (id_commande, id_livreur, date_heure_debut, statut_livraison) VALUES
        (1, 1, NOW(), 'en_cours'),
        (2, 2, NOW(), 'en_cours'),
        (3, 3, NOW(), 'en_attente')
      `);

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