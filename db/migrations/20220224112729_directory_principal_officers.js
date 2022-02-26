/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 export const up = knex => {
	return knex.schema.createTable('directory_principal_officers', table => {
		table.increments('id').primary().unsigned();
		table.string('directory_code', 200).notNullable();
		table.string('province_code', 200).nullable();
		table.string('type', 200).nullable();
		table.string('pic_parish', 255).nullable();
		table.string('parish_admin', 200).nullable();
		table.string('parish_accountant', 200).nullable();
		table.string('picp', 200).nullable();
		table.string('apicp_admin', 200).nullable();
		table.string('apicp_csr', 200).nullable();
		table.string('prov_admin', 200).nullable();
		table.string('prov_asst_admin', 200).nullable();
		table.string('prov_accountant', 200).nullable();
		table.string('prov_asst_accountant', 200).nullable();
		table.string('picr', 200).nullable();
		table.string('apicr', 200).nullable();
		table.string('reg_admin', 200).nullable();
		table.string('reg_asst_admin', 200).nullable();
		table.string('reg_accountant', 200).nullable();
		table.string('reg_asst_accountant', 200).nullable();
		table.string('status', 200).nullable();
		table.string('d1', 200).nullable();
		table.string('d2', 200).nullable();
		table.string('d3', 200).nullable();
		table.timestamps(true, true);
		table.timestamp('deleted_at').nullable();
	});
}
  
export const down = knex => knex.schema.dropTable('directory_principal_officers');
