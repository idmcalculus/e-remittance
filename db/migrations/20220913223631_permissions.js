import knexConfig from "../../knexfile.js";
const { onUpdateTrigger } = knexConfig;

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = async knex => {
	try {
		return knex.schema.createTable('permissions', table => {
			table.increments('id').primary();
			table.string('permission_name', 200).notNullable();
			table.string('permission_name_slug', 200).notNullable();
			table.string('permission_description').nullable();
			table.timestamps(false, true);
			table.timestamp('deleted_at').nullable();
			table.unique(['permission_name', 'permission_name_slug']);
		})
		.raw(onUpdateTrigger('permissions'));
	} catch (error) {
		console.error(error)
	}
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = knex => knex.schema.raw('DROP TABLE IF EXISTS permissions CASCADE');