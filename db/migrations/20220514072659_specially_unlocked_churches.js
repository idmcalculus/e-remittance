import knexConfig from "../../knexfile.js";
const { onUpdateTrigger } = knexConfig;
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = async knex => {
	try {
		return knex.schema.createTable('specially_unlocked_churches', table => {
			table.increments('id').primary();
			table.string('parish_code', 200).notNullable();
			table.string('area_code', 30).notNullable();
			table.string('zone_code', 30).notNullable();
			table.string('prov_code', 30).notNullable();
			table.string('reg_code', 30).notNullable();
			table.string('sub_cont_code', 255).notNullable();
			table.string('cont_code', 255).notNullable();
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
			table.unique(['parish_code', 'rem_month', 'rem_year']);
		})
		.raw(onUpdateTrigger('specially_unlocked_churches'));
	} catch (error) {
		console.error(error);
	}
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = knex => knex.schema.dropTable('specially_unlocked_churches');