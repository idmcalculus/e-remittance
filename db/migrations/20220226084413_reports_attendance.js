import knexConfig from "../../knexfile.js";
const { onUpdateTrigger } = knexConfig;
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = async knex => {
	try {
		return knex.schema.createTable('reports_att', table => {
			table.increments('id').primary();
			table.integer('service_id')
				.notNullable()
				.unsigned()
				.index()
				.references('id')
				.inTable('services')
				.onDelete('CASCADE');
			table.string('parish_code', 200).notNullable();
			table.string('area_code', 30).notNullable();
			table.string('zone_code', 30).notNullable();
			table.string('prov_code', 30).notNullable();
			table.string('reg_code', 30).notNullable();
			table.string('sub_cont_code', 255).notNullable();
			table.string('cont_code', 255).notNullable();
			table.date('service_date').notNullable();
			table.string('week').notNullable();
			table.enum('month', [
				'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
				'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
			]).notNullable();
			table.integer('year').notNullable();
			table.integer('men').defaultTo(0);
			table.integer('women').defaultTo(0);
			table.integer('children').defaultTo(0);
			table.integer('adult_men').defaultTo(0);
			table.integer('adult_women').defaultTo(0);
			table.integer('youth_men').defaultTo(0);
			table.integer('youth_women').defaultTo(0);
			table.integer('teenagers').defaultTo(0);
			table.integer('youngstars').defaultTo(0);
			table.integer('total_adults').defaultTo(0);
			table.integer('total_youths').defaultTo(0);
			table.integer('total_att').defaultTo(0);
			table.integer('marriages').defaultTo(0);
			table.integer('births').defaultTo(0);
			table.integer('demises').defaultTo(0);
			table.integer('converts').defaultTo(0);
			table.integer('first_timers').defaultTo(0);
			table.integer('hf_centres').defaultTo(0);
			table.integer('unord_ministers').defaultTo(0);
			table.integer('bapt_workers').defaultTo(0);
			table.integer('bapt_members').defaultTo(0);
			table.integer('att_s_prog').defaultTo(0);
			table.integer('att_vigil').defaultTo(0);
			table.integer('new_workers').defaultTo(0);
			table.integer('asst_pastors').defaultTo(0);
			table.integer('full_pastors').defaultTo(0);
			table.integer('dcns').defaultTo(0);
			table.integer('workers_at_lgaf').defaultTo(0);
			table.integer('souls_at_lgaf').defaultTo(0);
			table.integer('comp').nullable();
			table.integer('status').nullable();
			table.string('rem_by', 30).nullable();
			table.string('submitted_by', 30).nullable();
			table.integer('r1').nullable();
			table.integer('r2').nullable();
			table.integer('r3').nullable();
			table.timestamps(false, true);
			table.timestamp('deleted_at').nullable();
			table.unique(['service_id', 'parish_code', 'week', 'month', 'year']);
		})
		.raw(onUpdateTrigger('reports_att'));
	} catch (error) {
		console.error(error);
	}
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = knex => knex.schema.raw('DROP TABLE IF EXISTS reports_att CASCADE');