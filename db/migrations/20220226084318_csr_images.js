import knexConfig from "../../knexfile.js";
const { onUpdateTrigger } = knexConfig;
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = knex => {
	return knex.schema.createTable('csr_images', table => {
		table.increments('id').primary();
		table.integer('report_id')
			.notNullable()
			.unsigned()
			.index()
			.references('id')
			.inTable('csr_reports')
			.onDelete('CASCADE');
		table.enum('month', [
			'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
			'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
		]).notNullable();
		table.integer('year').notNullable();
		table.date('date_of_activity').notNullable();
		table.string('parish_code', 255).notNullable();
		table.string('area_code', 255).notNullable();
		table.string('zone_code', 255).notNullable();
		table.string('prov_code', 255).notNullable();
		table.string('reg_code', 255).notNullable();
		table.string('sub_cont_code', 255).notNullable();
		table.string('cont_code', 255).notNullable();
		table.string('description').nullable();
		table.string('file_name', 255).nullable();
		table.string('file_key').nullable();
		table.string('file_type', 255).nullable();
		table.string('file_size').nullable();
		table.string('aws_bucket_url').nullable();
		table.timestamps(false, true);
		table.timestamp('deleted_at').nullable();
	})
	.raw(onUpdateTrigger('csr_images'));
}
  
export const down = knex => knex.schema.dropTable('csr_images');