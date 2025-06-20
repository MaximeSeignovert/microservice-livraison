const fastify = require('fastify')({ logger: true });
const routes = require('./routes');
const { initDatabase } = require('./config/database');

// Enregistrement des routes
fastify.register(routes);

// Route Hello World
fastify.get('/', async (request, reply) => {
  return { message: 'Bienvenue sur le service de livraison!' };
});

// Démarrage du serveur
const start = async () => {
  try {
    // Initialisation de la base de données
    await initDatabase();
    
    // Démarrage du serveur
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 