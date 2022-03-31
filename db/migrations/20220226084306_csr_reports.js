import { onUpdateTrigger } from "../../knexfile.js";
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

 export const up = knex => {
	try {
		return knex.schema.createTable('csr_reports', table => {
			table.increments('id').primary();
			table.string('parish_code', 255).nullable();
			table.string('area_code', 255).nullable();
			table.string('zone_code', 30).nullable();
			table.string('prov_code', 255).nullable();
			table.string('reg_code', 255).nullable();
			table.string('week').nullable();
			table.string('month').nullable();
			table.integer('year').nullable();
			table.string('project', 255).nullable();
			table.string('description', 255).nullable();
			table.string('quantity', 11).nullable();
			table.string('address', 255).nullable();
			table.string('postal_code', 255).nullable();
			table.string('lga', 255).nullable();
			table.string('city', 255).nullable();
			table.string('state', 255).nullable();
			table.string('country', 255).nullable();
			table.float('csr_offering').nullable();
			table.integer('category_id', 11)
				.nullable()
				.unsigned()
				.index()
				.references('id')
				.inTable('csr_categories');
			table.integer('sub_category_id', 11)
				.nullable()
				.unsigned()
				.index()
				.references('id')
				.inTable('csr_sub_categories');
			table.date('date_of_activity').nullable();
			table.string('beneficiary', 255).nullable();
			table.integer('souls', 255).nullable();
			table.string('testimonies', 255).nullable();
			table.string('challenges', 255).nullable();
			table.string('recommendations', 255).nullable();
			table.string('comment', 255).nullable();
			table.string('others', 255).nullable();
			table.float('expenditure').nullable();
			table.string('posted_by', 255).nullable();
			table.string('posted_by_name', 255).nullable();
			table.timestamps(false, true);
			table.timestamp('deleted_at').nullable();
		})
		.raw(onUpdateTrigger('csr_reports'));
	} catch (error) {
		console.error(error)
	}
}
  
export const down = knex => knex.schema.dropTable('csr_reports');