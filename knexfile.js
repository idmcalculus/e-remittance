// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
import { config } from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pass = process.env.DB_PASSWORD;

const development = {
  client: 'postgresql',
  connection: {
    host: 'localhost',
    database: 'e-remittance',
    user: 'idmcalculus',
    password: pass,
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: `${__dirname}/db/migrations`
  },
  seeds: {
    directory: `${__dirname}/db/seeds`
  }
};

const staging = {
  client: 'postgresql',
  connection: {
    database: 'my_db',
    user: 'username',
    password: 'password'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};

const production = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: `${__dirname}/db/migrations`
  }
};
console.log(production.connection);

const onUpdateTrigger = (table) => `
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE PROCEDURE on_update_timestamp();
  `
const knexConfig = { development, staging, production, onUpdateTrigger };
export default knexConfig;
