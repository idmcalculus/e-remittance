import knexConfig from "../../knexfile.js";
const { onUpdateTrigger } = knexConfig;
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async knex => {
	try {
		return knex.schema.createTable('settings_admin_report', table => {
			table.increments('id').primary();
			table.enum('rem_month', [
				'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
				'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
			]).notNullable();
			table.integer('rem_year').notNullable();
			table.date('date_of_comm').notNullable();
			table.date('date_of_comp').notNullable();
			table.boolean('set_as_default').notNullable();
			table.boolean('report_def').notNullable();
			table.boolean('scan_def').nullable();
			table.date('scan_comm_date').notNullable();
			table.date('scan_comp_date').notNullable();
			table.boolean('csr_def').nullable();
			table.date('csr_comm_date').notNullable();
			table.date('csr_comp_date').notNullable();
			table.string('inputted_by', 200).notNullable();
			table.string('set_by').nullable();
			table.string('notify').nullable();
			table.string('language').nullable();
			table.string('s1').nullable();
			table.string('s2').nullable();
			table.string('s3').nullable();
			table.timestamps(false, true);
			table.timestamp('deleted_at').nullable();
			table.unique(['rem_month', 'rem_year']);
		})
		.raw(onUpdateTrigger('settings_admin_report'));
	} catch (error) {
		console.error(error);
		return error;
	}
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = knex => knex.schema.dropTable('settings_admin_report');