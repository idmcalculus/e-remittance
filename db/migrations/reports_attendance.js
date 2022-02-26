/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async knex => {
	try {
		return knex.schema.createTable('reports_attendance', table => {
			table.increments('id').primary();
			table.string('parish_code', 200).nullable();
			table.string('area_code', 30).nullable();
			table.string('month').nullable();
			table.integer('year').nullable();
			table.integer('sun_m_wk1').nullable();
			table.integer('sun_w_wk1').nullable();
			table.integer('sun_c_wk1').nullable();
			table.integer('sun_tot_wk1').nullable();
			table.integer('sun_ss_wk1').nullable();
			table.integer('sun_hf_wk1').nullable();
			table.integer('tue_m_wk1').nullable();
			table.integer('tue_w_wk1').nullable();
			table.integer('tue_c_wk1').nullable();
			table.integer('tue_tot_wk1').nullable();
			table.integer('thur_m_wk1').nullable();
			table.integer('thur_w_wk1').nullable();
			table.integer('thur_c_wk1').nullable();
			table.integer('thur_tot_wk1').nullable();
			table.integer('sun_m_wk2').nullable();
			table.integer('sun_w_wk2').nullable();
			table.integer('sun_c_wk2').nullable();
			table.integer('sun_tot_wk2').nullable();
			table.integer('sun_ss_wk2').nullable();
			table.integer('sun_hf_wk2').nullable();
			table.integer('tue_m_wk2').nullable();
			table.integer('tue_w_wk2').nullable();
			table.integer('tue_c_wk2').nullable();
			table.integer('tue_tot_wk2').nullable();
			table.integer('thur_m_wk2').nullable();
			table.integer('thur_w_wk2').nullable();
			table.integer('thur_c_wk2').nullable();
			table.integer('thur_tot_wk2').nullable();
			table.integer('sun_m_wk3').nullable();
			table.integer('sun_w_wk3').nullable();
			table.integer('sun_c_wk3').nullable();
			table.integer('sun_tot_wk3').nullable();
			table.integer('sun_ss_wk3').nullable();
			table.integer('sun_hf_wk3').nullable();
			table.integer('tue_m_wk3').nullable();
			table.integer('tue_w_wk3').nullable();
			table.integer('tue_c_wk3').nullable();
			table.integer('tue_tot_wk3').nullable();
			table.integer('thur_m_wk3').nullable();
			table.integer('thur_w_wk3').nullable();
			table.integer('thur_c_wk3').nullable();
			table.integer('thur_tot_wk3').nullable();
			table.integer('sun_m_wk4').nullable();
			table.integer('sun_w_wk4').nullable();
			table.integer('sun_c_wk4').nullable();
			table.integer('sun_tot_wk4').nullable();
			table.integer('sun_ss_wk4').nullable();
			table.integer('sun_hf_wk4').nullable();
			table.integer('tue_m_wk4').nullable();
			table.integer('tue_w_wk4').nullable();
			table.integer('tue_c_wk4').nullable();
			table.integer('tue_tot_wk4').nullable();
			table.integer('thur_m_wk4').nullable();
			table.integer('thur_w_wk4').nullable();
			table.integer('thur_c_wk4').nullable();
			table.integer('thur_tot_wk4').nullable();
			table.integer('sun_m_wk5').nullable();
			table.integer('sun_w_wk5').nullable();
			table.integer('sun_c_wk5').nullable();
			table.integer('sun_tot_wk5').nullable();
			table.integer('sun_ss_wk5').nullable();
			table.integer('sun_hf_wk5').nullable();
			table.integer('tue_m_wk5').nullable();
			table.integer('tue_w_wk5').nullable();
			table.integer('tue_c_wk5').nullable();
			table.integer('tue_tot_wk5').nullable();
			table.integer('thur_m_wk5').nullable();
			table.integer('thur_w_wk5').nullable();
			table.integer('thur_c_wk5').nullable();
			table.integer('thur_tot_wk5').nullable();
			table.integer('ft_wk1').nullable();
			table.integer('ft_wk2').nullable();
			table.integer('ft_wk3').nullable();
			table.integer('ft_wk4').nullable();
			table.integer('ft_wk5').nullable();
			table.integer('convert_wk1').nullable();
			table.integer('convert_wk2').nullable();
			table.integer('convert_wk3').nullable();
			table.integer('convert_wk4').nullable();
			table.integer('convert_wk5').nullable();
			table.integer('avg_men', 15).nullable();
			table.integer('avg_women', 15).nullable();
			table.integer('avg_children', 15).nullable();
			table.integer('avg_total', 15).nullable();
			table.integer('avg_ss', 15).nullable();
			table.integer('avg_hf', 15).nullable();
			table.integer('avg_tue', 15).nullable();
			table.integer('avg_thur', 15).nullable();
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
			table.integer('comp').nullable();
			table.integer('status').nullable();
			table.string('rem_by', 30).nullable();
			table.string('submitted_by', 30).nullable();
			table.string('province_code', 30).nullable();
			table.string('region_code', 30).nullable();
			table.integer('r1').nullable();
			table.integer('r2').nullable();
			table.integer('r3').nullable();
			table.timestamps(true, true);
			table.timestamp('deleted_at').nullable();
		});
	} catch (error) {
		console.error(error)
	}
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = knex => knex.schema.dropTable('reports_attendance');