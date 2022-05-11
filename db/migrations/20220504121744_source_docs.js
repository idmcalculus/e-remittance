import knexConfig from "../../knexfile.js";
const { onUpdateTrigger } = knexConfig;
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = knex => {
	return knex.schema.createTable('source_docs', table => {
		table.increments('id').primary();
		table.integer('service_id')
			.notNullable()
			.unsigned()
			.index()
			.references('id')
			.inTable('services')
			.onDelete('CASCADE');
		table.integer('report_att_id')
			.notNullable()
			.unsigned()
			.index()
			.references('id')
			.inTable('reports_att')
			.onDelete('CASCADE');
		table.string('week', 200).notNullable();
		table.enum('month', [
			'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
			'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
		]).notNullable();
		table.integer('year').notNullable();
		table.date('service_date').notNullable();
		table.string('parish_code', 255).notNullable();
		table.string('area_code', 255).notNullable();
		table.string('zone_code', 30).notNullable();
		table.string('prov_code', 255).notNullable();
		table.string('reg_code', 255).notNullable();
		table.string('description').nullable();
		table.string('file_name', 255).nullable();
		table.string('file_path').nullable();
		table.string('file_key').nullable();
		table.string('file_type', 255).nullable();
		table.string('file_size').nullable();
		table.timestamps(false, true);
		table.timestamp('deleted_at').nullable();
	})
	.raw(onUpdateTrigger('source_docs'));
}
  
export const down = knex => knex.schema.dropTable('source_docs');