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
			.nullable()
			.references('id')
			.inTable('csr_reports');
		table.string('month').nullable();
		table.integer('year').nullable();
		table.string('parish_code', 255).nullable();
		table.string('area_code', 255).nullable();
		table.string('prov_code', 255).nullable();
		table.string('reg_code', 255).nullable();
		table.string('image', 255).nullable();
		table.binary('image_bin').nullable();
		table.text('img_description').nullable();
		table.string('type', 255).nullable();
		table.text('metadata').nullable();
		table.timestamps(false, true);
		table.timestamp('deleted_at').nullable();
	})
	.raw(onUpdateTrigger('csr_images'));
}
  
export const down = knex => knex.schema.dropTable('csr_images');