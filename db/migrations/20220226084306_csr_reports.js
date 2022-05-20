import knexConfig from "../../knexfile.js";
const { onUpdateTrigger } = knexConfig;
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

 export const up = knex => {
	try {
		return knex.schema.createTable('csr_reports', table => {
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
			table.string('week').notNullable();
			table.enum('month', [
				'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
				'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
			]).notNullable();
			table.integer('year').notNullable();
			table.date('date_of_activity').notNullable();
			table.string('project', 255).notNullable();
			table.string('description', 255).notNullable();
			table.float('expenditure').notNullable();
			table.float('csr_offering').nullable();
			table.string('quantity', 11).nullable();
			table.string('address', 255).notNullable();
			table.string('postal_code', 255).nullable();
			table.string('lga', 255).notNullable();
			table.string('city', 255).nullable();
			table.string('state', 255).notNullable();
			table.string('country', 255).notNullable();
			table.integer('beneficiaries', 255).nullable();
			table.integer('souls', 255).nullable();
			table.string('testimonies', 255).nullable();
			table.string('challenges', 255).nullable();
			table.string('recommendations', 255).nullable();
			table.string('comment', 255).nullable();
			table.string('others', 255).nullable();
			table.string('posted_by', 255).nullable();
			table.string('posted_by_name', 255).nullable();
			table.timestamps(false, true);
			table.timestamp('deleted_at').nullable();
			table.unique(['parish_code', 'week', 'month', 'year', 'date_of_activity']);
		})
		.raw(onUpdateTrigger('csr_reports'));
	} catch (error) {
		console.error(error);
	}
}
  
export const down = knex => knex.schema.dropTable('csr_reports');