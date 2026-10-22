const { Pool, types } = require('pg');
require('dotenv').config();

// Columnas DATE como texto 'YYYY-MM-DD' para que la zona horaria del servidor no corra el día.
types.setTypeParser(1082, (value) => value);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 3,
});

module.exports = pool;
