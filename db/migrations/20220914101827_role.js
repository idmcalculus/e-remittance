import knexConfig from "../../knexfile.js";
const { onUpdateTrigger } = knexConfig;

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = async knex => {
	try {
		return knex.schema.createTable('roles', table => {
			table.increments('id').primary();
			table.string('role_name', 200).nullable();
			table.string('role_name_slug', 200).nullable();
			table.string('role_description').nullable();
			table.timestamps(false, true);
			table.timestamp('deleted_at').nullable();
			table.unique(['role_name', 'role_name_slug']);
		})
		.raw(onUpdateTrigger('roles'));
	} catch (error) {
		console.error(error);
	}
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = knex => knex.schema.raw('DROP TABLE IF EXISTS roles CASCADE');