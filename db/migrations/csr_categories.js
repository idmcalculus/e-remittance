/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = knex => {
	return knex.schema.createTable('csr_categories', table => {
		table.increments('id').primary();
		table.string('cat_name', 200).nullable();
		table.string('status', 200).nullable();
		table.string('c1', 200).nullable();
		table.string('c2', 200).nullable();
		table.string('c3', 200).nullable();
		table.timestamps(true, true);
		table.timestamp('deleted_at').nullable();
	});
}
  
export const down = knex => knex.schema.dropTable('csr_categories');