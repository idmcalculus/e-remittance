/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = knex => {
	return knex.schema.createTable('directory_region', table => {
		table.increments('id').primary().unsigned();
		table.string('region', 200).notNullable();
		table.string('alias', 200).nullable();
		table.string('region_code', 200).nullable();
		table.string('address', 255).nullable();
		table.string('city', 200).nullable();
		table.string('country', 200).nullable();
		table.string('phone_no', 200).nullable();
		table.string('email', 200).nullable();
		table.string('hq', 200).nullable();
		table.string('order', 200).nullable();
		table.string('lat', 200).nullable();
		table.string('long', 200).nullable();
		table.string('picr', 200).nullable();
		table.string('picr_phone', 200).nullable();
		table.string('picr_email', 200).nullable();
		table.string('region_accountant', 200).nullable();
		table.string('regional_accountant_phone', 200).nullable();
		table.string('regional_accountant_email', 200).nullable();
		table.string('region_admin', 200).nullable();
		table.string('regional_admin_phone', 200).nullable();
		table.string('regional_admin_email', 200).nullable();
		table.string('apicr', 200).nullable();
		table.string('apicr_phone', 200).nullable();
		table.string('apicr_email', 200).nullable();
		table.string('language', 200).nullable();
		table.string('currency', 200).nullable();
		table.string('type', 200).nullable();
		table.string('status', 200).nullable();
		table.string('region_type', 200).nullable();
		table.string('r1', 200).nullable();
		table.string('r2', 200).nullable();
		table.string('r3', 200).nullable();
		table.timestamps(true, true);
		table.timestamp('deleted_at').nullable();
	});
}
  
export const down = knex => knex.schema.dropTable('directory_region');
