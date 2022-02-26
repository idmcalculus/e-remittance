/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = knex => {
	try {
		return knex.schema.table('reports_attendance', table => {
			table.dropColumn('sun_tot_wk1');
		});
	} catch (error) {
		console.error(error)
	}
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = knex => {
	try {
		return knex.schema.table('reports_attendance', table => {
			table.integer('sun_tot_wk1').nullable();
		});
	} catch (error) {
		console.error(error)
	}
}