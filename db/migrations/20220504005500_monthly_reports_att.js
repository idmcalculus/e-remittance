import knexConfig from "../../knexfile.js";
const { onUpdateTrigger } = knexConfig;
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = async knex => {
	try {
		return knex.schema.createTable('reports_att_monthly', table => {
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
			table.enum('month', [
				'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
				'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
			]).notNullable();
			table.integer('year').notNullable();
			table.integer('men').notNullable();
			table.integer('women').notNullable();
			table.integer('children').notNullable();
			table.integer('total_mwc').notNullable();
			table.integer('avg_men').notNullable();
			table.integer('avg_women').notNullable();
			table.integer('avg_children').notNullable();
			table.integer('avg_total').notNullable();
			table.integer('marriages').notNullable();
			table.integer('births').notNullable();
			table.integer('demises').notNullable();
			table.integer('converts').notNullable();
			table.integer('first_timers').notNullable();
			table.integer('hf_centres').notNullable();
			table.integer('unord_ministers').notNullable();
			table.integer('bapt_workers').notNullable();
			table.integer('bapt_members').notNullable();
			table.integer('att_s_prog').notNullable();
			table.integer('att_vigil').notNullable();
			table.integer('new_workers').notNullable();
			table.integer('asst_pastors').notNullable();
			table.integer('full_pastors').notNullable();
			table.integer('dcns').notNullable();
			table.integer('comp').nullable();
			table.integer('status').nullable();
			table.string('rem_by', 30).nullable();
			table.string('submitted_by', 30).nullable();
			table.integer('r1').nullable();
			table.integer('r2').nullable();
			table.integer('r3').nullable();
			table.timestamps(false, true);
			table.timestamp('deleted_at').nullable();
			table.unique(['service_id', 'parish_code', 'month', 'year']);
		}).raw(onUpdateTrigger('reports_att_monthly'));
	} catch (error) {
		console.error(error);
	}
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = knex => knex.schema.dropTable('reports_att_monthly');