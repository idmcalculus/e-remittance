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
			table.integer('category_id', 11)
				.notNullable()
				.unsigned()
				.index()
				.references('id')
				.inTable('csr_categories')
				.onDelete('CASCADE');
			table.integer('sub_category_id', 11)
				.notNullable()
				.unsigned()
				.index()
				.references('id')
				.inTable('csr_sub_categories')
				.onDelete('CASCADE');
			table.string('parish_code', 255).notNullable();
			table.string('area_code', 255).notNullable();
			table.string('zone_code', 30).notNullable();
			table.string('prov_code', 255).notNullable();
			table.string('reg_code', 255).notNullable();
			table.string('sub_cont_code', 255).notNullable();
			table.string('cont_code', 255).notNullable();
			table.enum('month', [
				'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
				'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
			]).notNullable();
			table.integer('year').notNullable();
			table.integer('num_activity').notNullable();
			table.float('expenditure').notNullable();
			table.float('csr_offering').nullable();
			table.integer('beneficiaries').notNullable();
			table.integer('souls').notNullable();
			table.float('income_utilization').notNullable();
			table.integer('num_lga').notNullable();
			table.integer('num_state').notNullable();
			table.integer('num_country').notNullable();
			table.timestamps(false, true);
			table.timestamp('deleted_at').nullable();
		})
		.raw(onUpdateTrigger('monthly_csr_reports'));
	} catch (error) {
		console.error(error);
	}
}
  
export const down = knex => knex.schema.dropTable('monthly_csr_reports');