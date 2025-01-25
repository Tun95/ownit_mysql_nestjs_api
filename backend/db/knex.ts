import knex from 'knex';
import knexConfig from './knexfile';

// Select the environment (default to 'development')
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// Initialize Knex instance
const db = knex(config);

// Optional: Test the database connection
db.raw('SELECT 1')
  .then(() => {
    console.log('Database connection successful!');
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    //process.exit(1); // Optional: Stop the process if the DB connection fails
  });

export default db;
