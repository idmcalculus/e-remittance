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
			table.integer('service_id').unsigned().references('id').inTable('services').onDelete('CASCADE');
			table.string('parish_code', 200).notNullable();
			table.string('area_code', 30).notNullable();
			table.string('zone_code', 30).notNullable();
			table.string('province_code', 30).notNullable();
			table.string('region_code', 30).notNullable();
			table.date('service_date').notNullable();
			table.string('week').notNullable();
			table.string('month').notNullable();
			table.integer('year').notNullable();
			table.integer('men').nullable();
			table.integer('women').nullable();
			table.integer('children').nullable();
			table.integer('total_mwc').nullable();
			table.integer('marriages').nullable();
			table.integer('births').nullable();
			table.integer('demises').nullable();
			table.integer('converts').nullable();
			table.integer('first_timers').nullable();
			table.integer('hf_centres').nullable();
			table.integer('unord_ministers').nullable();
			table.integer('bapt_workers').nullable();
			table.integer('bapt_members').nullable();
			table.integer('att_s_prog').nullable();
			table.integer('att_vigil').nullable();
			table.integer('new_workers').nullable();
			table.integer('asst_pastors').nullable();
			table.integer('full_pastors').nullable();
			table.integer('dcns').nullable();
			table.integer('avg_men').nullable();
			table.integer('avg_women').nullable();
			table.integer('avg_children').nullable();
			table.integer('avg_total').nullable();
			table.integer('total_marriages').nullable();
			table.integer('total_births').nullable();
			table.integer('total_demises').nullable();
			table.integer('total_converts').nullable();
			table.integer('total_first_timers').nullable();
			table.integer('total_hf_centres').nullable();
			table.integer('total_unord_ministers').nullable();
			table.integer('total_bapt_workers').nullable();
			table.integer('total_bapt_members').nullable();
			table.integer('total_att_s_prog').nullable();
			table.integer('total_att_vigil').nullable();
			table.integer('total_new_workers').nullable();
			table.integer('total_asst_pastors').nullable();
			table.integer('total_full_pastors').nullable();
			table.integer('total_dcns').nullable();
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
export const down = knex => knex.schema.dropTable('reports_att');