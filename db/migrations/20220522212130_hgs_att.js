import knexConfig from "../../knexfile.js";
const { onUpdateTrigger } = knexConfig;
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = async knex => {
	try {
		return knex.schema.createTable('hgs_att', table => {
			table.increments('id').primary();
			table.string('parish_code', 200).notNullable();
			table.string('area_code', 30).notNullable();
			table.string('zone_code', 30).notNullable();
			table.string('prov_code', 30).notNullable();
			table.string('reg_code', 30).notNullable();
			table.string('sub_cont_code', 255).notNullable();
			table.string('cont_code', 255).notNullable();
			table.date('service_date').notNullable();
			table.enum('month', [
				'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
				'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
			]).notNullable();
			table.integer('year').notNullable();
			table.integer('attendance').defaultTo(0);
			table.integer('converts').defaultTo(0);
			table.float('offering').defaultTo(0.00);
			table.integer('num_centres').defaultTo(0);
			table.timestamps(false, true);
			table.timestamp('deleted_at').nullable();
			table.unique(['parish_code', 'month', 'year']);
		})
		.raw(onUpdateTrigger('hgs_att'));
	} catch (error) {
		console.error(error);

		return Promise.reject(error);
	}
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = knex => knex.schema.dropTable('hgs_att');