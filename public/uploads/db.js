import knexConfig from '../knexfile.js';
import knex from 'knex';
import { config } from 'dotenv';

config();

const environment = process.env.DB_ENV || 'development';

export default knex(knexConfig[environment]);