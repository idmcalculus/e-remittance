// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
import { config } from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

config();

pg.types.setTypeParser(1082, str => str);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const development = {
  client: 'postgresql',
  connection: {
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD
  },
  ssl: false,
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
  ssl: { rejectUnauthorized: false },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: `${__dirname}/db/migrations`
  }
};

const onUpdateTrigger = (table) => `
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();
  `
const knexConfig = { development, staging, production, onUpdateTrigger };
export default knexConfig;
