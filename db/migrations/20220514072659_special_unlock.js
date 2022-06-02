import knexConfig from "../../knexfile.js";
const { onUpdateTrigger } = knexConfig;
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = async knex => {
	try {
		return knex.schema.createTable('special_unlock', table => {
			table.increments('id').primary();
			table.enum('unlock_type', ['parish', 'area', 'zone', 'province']).notNullable();
			table.string('unlock_type_code').notNullable();
			table.enum('rem_month', [
				'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
				'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
			]).notNullable();
			table.integer('rem_year').notNullable();
			table.date('unlock_start_date').notNullable();
			table.date('unlock_end_date').nullable();
			table.string('unlocked_by', 30).nullable();
			table.integer('r1').nullable();
			table.integer('r2').nullable();
			table.integer('r3').nullable();
			table.timestamps(false, true);
			table.timestamp('deleted_at').nullable();
			table.unique(['unlock_type', 'unlock_type_code', 'rem_month', 'rem_year']);
		})
		.raw(onUpdateTrigger('special_unlock'));
	} catch (error) {
		console.error(error);
	}
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = knex => knex.schema.dropTable('special_unlock');