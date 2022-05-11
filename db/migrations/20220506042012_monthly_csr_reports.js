import knexConfig from "../../knexfile.js";
const { onUpdateTrigger } = knexConfig;
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

 export const up = knex => {
	try {
		return knex.schema.createTable('monthly_csr_reports', table => {
			table.increments('id').primary();
			table.string('parish_code', 255).notNullable();
			table.string('area_code', 255).notNullable();
			table.string('zone_code', 30).notNullable();
			table.string('prov_code', 255).notNullable();
			table.string('reg_code', 255).notNullable();
			table.enum('month', [
				'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
				'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
			]).notNullable();
			table.integer('year').notNullable();
			table.integer('num_activity').notNullable();
			table.float('expenditure').notNullable();
			table.float('csr_offering').nullable();
			table.json('cat_sub_cat_ids').notNullable();
			table.integer('beneficiaries', 255).notNullable();
			table.integer('souls', 255).notNullable();
			table.integer('num_lga', 255).notNullable();
			table.integer('num_state', 255).notNullable();
			table.integer('num_country', 255).notNullable();
			table.integer('num_files').notNullable();
			table.timestamps(false, true);
			table.timestamp('deleted_at').nullable();
		})
		.raw(onUpdateTrigger('monthly_csr_reports'));
	} catch (error) {
		console.error(error)
	}
}
  
export const down = knex => knex.schema.dropTable('monthly_csr_reports');