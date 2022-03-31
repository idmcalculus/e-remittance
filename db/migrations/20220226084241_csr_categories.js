import knexConfig from "../../knexfile.js";
const { onUpdateTrigger } = knexConfig;
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = knex => {
	return knex.schema.createTable('csr_categories', table => {
		table.increments('id').primary();
		table.string('cat_name', 200).notNullable();
		table.string('status', 200).nullable();
		table.string('c1', 200).nullable();
		table.string('c2', 200).nullable();
		table.string('c3', 200).nullable();
		table.timestamps(false, true);
		table.timestamp('deleted_at').nullable();
		table.unique(['cat_name']);
	})
	.raw(onUpdateTrigger('csr_categories'));
}
  
export const down = knex => knex.schema.dropTable('csr_categories');