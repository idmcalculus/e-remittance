/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = knex => {
	return knex.schema.createTable('directory_parish', table => {
		table.increments('id').primary().unsigned();
		table.string('parish_code', 200).nullable();
		table.string('parish_name', 200).notNullable();
		table.string('alias', 200).nullable();
		table.string('is_parish', 200).nullable();
		table.string('youth_province', 200).nullable();
		table.string('mega', 200).nullable();
		table.string('rhq', 200).nullable();
		table.string('phq', 200).nullable();
		table.string('zhq', 200).nullable();
		table.string('ahq', 200).nullable();
		table.string('area', 200).nullable();
		table.string('area_code', 200).nullable();
		table.string('zone', 200).nullable();
		table.string('zone_code', 200).nullable();
		table.string('province', 200).nullable();
		table.string('province_code', 200).nullable();
		table.string('region', 200).nullable();
		table.string('region_code', 200).nullable();
		table.string('address', 255).nullable();
		table.string('postal', 255).nullable();
		table.string('city', 200).nullable();
		table.string('country', 200).nullable();
		table.string('phone_no', 200).nullable();
		table.string('email', 200).nullable();
		table.string('hq', 200).nullable();
		table.string('order', 200).nullable();
		table.string('lat', 200).nullable();
		table.string('long', 200).nullable();
		table.string('pic_parish', 200).nullable();
		table.string('pic_parish_phone', 200).nullable();
		table.string('pic_parish_email', 200).nullable();
		table.string('parish_accountant', 200).nullable();
		table.string('parish_accountant_phone', 200).nullable();
		table.string('parish_accountant_email', 200).nullable();
		table.string('parish_admin', 200).nullable();
		table.string('parish_admin_phone', 200).nullable();
		table.string('parish_admin_email', 200).nullable();
		table.string('apic_parish', 200).nullable();
		table.string('apic_parish_phone', 200).nullable();
		table.string('apic_parish_email', 200).nullable();
		table.string('language', 200).nullable();
		table.string('currency', 200).nullable();
		table.string('type', 200).nullable();
		table.string('status', 200).nullable();
		table.string('property_status', 200).nullable();
		table.string('date_established', 200).nullable();
		table.string('parish_type', 200).nullable();
		table.string('finance_view', 200).nullable();
		table.string('a1', 200).nullable();
		table.string('a2', 200).nullable();
		table.string('a3', 200).nullable();
		table.timestamps(true, true);
		table.timestamp('deleted_at').nullable();
	});
}
  
export const down = knex => knex.schema.dropTable('directory_parish');
