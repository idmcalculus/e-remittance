import { onUpdateTrigger } from "../../knexfile.js";
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = knex => {
	return knex.schema.createTable('csr_sub_categories', table => {
		table.increments('id').primary();
		table.string('sub_cat_name', 200).notNullable();
		table.string('status', 200).nullable();
		table.integer('category_id')
			.references('id')
			.inTable('csr_categories');
		table.string('c1', 200).nullable();
		table.string('c2', 200).nullable();
		table.string('c3', 200).nullable();
		table.timestamps(false, true);
		table.timestamp('deleted_at').nullable();
	})
	.raw(onUpdateTrigger('csr_sub_categories'));
}
  
export const down = knex => knex.schema.dropTable('csr_sub_categories');