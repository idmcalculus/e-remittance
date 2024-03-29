import knexConfig from "../../knexfile.js";
const { onUpdateTrigger } = knexConfig;

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = async knex => {
	try {
		return knex.schema.createTable('services', table => {
			table.increments('id').primary();
			table.string('service_name', 200).notNullable();
			table.string('service_name_slug', 200).notNullable();
			table.timestamps(false, true);
			table.timestamp('deleted_at').nullable();
			table.unique(['service_name', 'service_name_slug']);
		})
		.raw(onUpdateTrigger('services'));
	} catch (error) {
		console.error(error)
	}
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = knex => knex.schema.raw('DROP TABLE IF EXISTS services CASCADE');