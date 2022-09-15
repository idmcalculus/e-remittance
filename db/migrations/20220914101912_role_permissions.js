import knexConfig from "../../knexfile.js";
const { onUpdateTrigger } = knexConfig;

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = async knex => {
	try {
		return knex.schema.createTable('role_permissions', table => {
			table.increments('id').primary();
			table.integer('role_id')
				.notNullable()
				.unsigned()
				.index()
				.references('id')
				.inTable('roles')
				.onDelete('CASCADE');
			table.integer('permission_id')
				.notNullable()
				.unsigned()
				.index()
				.references('id')
				.inTable('permissions')
				.onDelete('CASCADE');
			table.timestamps(false, true);
			table.timestamp('deleted_at').nullable();
		})
		.raw(onUpdateTrigger('role_permissions'));
	} catch (error) {
		console.error(error)
	}
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = knex => knex.schema.raw('DROP TABLE IF EXISTS role_permissions CASCADE');