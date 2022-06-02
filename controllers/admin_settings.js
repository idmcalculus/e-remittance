import { config } from "dotenv";
import { DateTime, Settings } from "luxon";
import isEmpty from "lodash/isEmpty.js";
import db from '../services/db.js';
import { getDataFromDb, insertIntoDb, updateDb } from '../utils/dbOps.js';
import { asyncCatchInsert, asyncCatchRegular } from '../utils/helpers.js';

config();

Settings.defaultZone = process.env.TIMEZONE;

const createSettings = asyncCatchInsert(async (req, res, _next) => {
	const data = req.body;

	const {
		admin_type,
		admin_type_code,
		rem_month,
		rem_year,
		set_as_default,
		report_def,
		csr_def,
		scan_def,
		date_of_comm,
		date_of_comp,
		scan_comm_date,
		scan_comp_date,
		csr_comm_date,
		csr_comp_date
	} = data;

	if (date_of_comp < date_of_comm) {
		return res.status(400).json({
			status: 'Invalid dates',
			message: 'The date of completion of remittance cannot be before its date of commencement'
		});
	}

	if (scan_comp_date < scan_comm_date) {
		return res.status(400).json({
			status: 'Invalid dates',
			message: 'The date of completion of scanning source documents cannot be before its date of commencement'
		});
	}

	if (csr_comp_date < csr_comm_date) {
		return res.status(400).json({
			status: 'Invalid dates',
			message: 'The date of completion of CSR reports cannot be before its date of commencement'
		});
	}

	const foundSettingsData = await getDataFromDb(req, db('admin_settings_report'), { admin_type, admin_type_code, rem_month, rem_year });

	if (foundSettingsData) {
		const updateSettingsData = await updateDb(db('admin_settings_report'), data, { id: foundSettingsData[0].id });

		if (updateSettingsData) {
			await adjustDefaults(db('admin_settings_report'), rem_month, rem_year, set_as_default, report_def, csr_def, scan_def);

			return res.status(201).json({
				status: 'success',
				message: 'Basic settings updated successfully',
				data: updateSettingsData
			});
		} else {
			return res.status(400).json({
				status: 'error',
				message: 'Error updating settings'
			});
		}
	} else {
		const createSettingsData = await insertIntoDb(db('admin_settings_report'), data);

		if (createSettingsData) {
			await adjustDefaults(db('admin_settings_report'), rem_month, rem_year, set_as_default, report_def, csr_def, scan_def);

			return res.status(201).json({
				status: 'success',
				message: 'Basic settings created successfully',
				data: createSettingsData
			});
		} else {
			return res.status(400).json({
				status: 'error',
				message: 'Error creating settings'
			});
		}
	}
});

const adjustDefaults = async (db, rem_month, rem_year, set_as_default, report_def, csr_def, scan_def) => {
	if (set_as_default) await db.update({ set_as_default: 0 }).whereNot({ rem_month, rem_year });
	if (report_def) await db.update({ report_def: 0 }).whereNot({ rem_month, rem_year });
	if (scan_def) await db.update({ scan_def: 0 }).whereNot({ rem_month, rem_year });
	if (csr_def) await db.update({ csr_def: 0 }).whereNot({ rem_month, rem_year });
}

const getSettings = asyncCatchRegular(async (req, res, next) => {
	const settingsData = await getDataFromDb(req, db('admin_settings_report'));

	if (settingsData) {
		return res.status(200).json({
			status: 'success',
			data: settingsData
		});
	} else {
		return res.status(404).json({
			status: 'fail',
			message: 'No data found'
		});
	}
});

const locked = async (req, res, _next, comm_date, comp_date, ops) => {
	const { parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code, rem_month, rem_year } = req.query;

	const currDate = DateTime.now().toFormat('yyyy-MM-dd');

	let unlockTypeCodes = [ parish_code, area_code, zone_code, prov_code ];

	unlockTypeCodes = unlockTypeCodes.filter(code => code !== undefined);

	const specialUnlock = await db('special_unlock')
							.select('*')
							.where('unlock_end_date', '>=', currDate)
							.andWhere('unlock_start_date', '<=', currDate)
							.whereIn('unlock_type_code', unlockTypeCodes);

	const regionSettings = reg_code && await db('admin_settings_report')
							.select('*')
							.where({
								admin_type: 'region',
								admin_type_code: reg_code,
								rem_month, rem_year
							}).first();

	const subContSettings = sub_cont_code && await db('admin_settings_report')
							.select('*')
							.where({
								admin_type: 'sub_continent',
								admin_type_code: sub_cont_code,
								rem_month, rem_year
							}).first();

	const contSettings = cont_code && await db('admin_settings_report')
							.select('*')
							.where({
								admin_type: 'continent',
								admin_type_code: cont_code,
								rem_month, rem_year
							}).first();

	if (isEmpty(regionSettings)) {
		if (isEmpty(subContSettings)) {
			if (!isEmpty(contSettings)) {
				const contCommDate = contSettings[comm_date];
				const contCompDate = contSettings[comp_date];
				const contAdminType = contSettings['admin_type'] || 'continent';

				if (contCompDate >= currDate && contCommDate <= currDate) {
					return res.status(200).json({
						status: 'opened',
						message: ops + ' is opened during this period',
						start_date: contCommDate,
						end_date: contCompDate,
						settings_level: contAdminType,
						parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code
					});
				} else {
					if (!isEmpty(specialUnlock)) {
						return res.status(200).json({
							status: 'exempted',
							message: ops + ' is opened during this period, on the basis of special exemption',
							start_date: specialUnlock[0]['unlock_start_date'],
							end_date: specialUnlock[0]['unlock_end_date'],
							parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code
						});
					} else {
						return res.status(403).json({
							status: 'closed',
							message: ops + ' is closed during this period',
							start_date: contCommDate,
							end_date: contCompDate,
							settings_level: contAdminType,
							parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code
						});
					}
				}
			} else {
				return res.status(403).json({
					status: 'inactive',
					message: ops + ' is not yet active',
					parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code
				});
			}
		} else {
			const subContCommDate = subContSettings[comm_date];
			const subContCompDate = subContSettings[comp_date];
			const subContAdminType = subContSettings['admin_type'] || 'sub_continent';

			if (subContCompDate >= currDate && subContCommDate <= currDate) {
				return res.status(200).json({
					status: 'opened',
					message: ops + ' is opened during this period',
					start_date: subContCommDate,
					end_date: subContCompDate,
					settings_level: subContAdminType,
					parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code
				});
			} else {
				if (!isEmpty(specialUnlock)) {
					return res.status(200).json({
						status: 'exempted',
						message: ops + ' is opened during this period, on the basis of special exemption',
						start_date: specialUnlock[0]['unlock_start_date'],
						end_date: specialUnlock[0]['unlock_end_date'],
						parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code
					});
				} else {
					return res.status(403).json({
						status: 'closed',
						message: ops + ' is closed during this period',
						start_date: subContCommDate,
						end_date: subContCompDate,
						settings_level: subContAdminType,
						parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code
					});
				}
			}
		}
	} else {
		const regionCommDate = regionSettings[comm_date];
		const regionCompDate = regionSettings[comp_date];
		const regionAdminType = regionSettings['admin_type'] || 'region';

		if (regionCompDate >= currDate && regionCommDate <= currDate) {
			return res.status(200).json({
				status: 'opened',
				message: ops + ' is opened during this period',
				start_date: regionCommDate,
				end_date: regionCompDate,
				settings_level: regionAdminType,
				parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code
			});
		} else {
			if (!isEmpty(specialUnlock)) {
				return res.status(200).json({
					status: 'exempted',
					message: ops + ' is opened during this period, on the basis of special exemption',
					start_date: specialUnlock[0]['unlock_start_date'],
					end_date: specialUnlock[0]['unlock_end_date'],
					parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code
				});
			} else {
				return res.status(403).json({
					status: 'closed',
					message: ops + ' is closed during this period',
					start_date: regionCommDate,
					end_date: regionCompDate,
					settings_level: regionAdminType,
					parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code
				});
			}
		}
	}
}

const remittanceStatus = asyncCatchRegular(async (req, res, next) => {
	await locked(req, res, next, 'date_of_comm', 'date_of_comp', 'Remittance');
});

const csrStatus = asyncCatchRegular(async (req, res, next) => {
	await locked(req, res, next, 'csr_comm_date', 'csr_comp_date', 'CSR Reporting');
});

const scanStatus = asyncCatchRegular(async (req, res, next) => {
	await locked(req, res, next, 'scan_comm_date', 'scan_comp_date', 'Source Document Upload');
});

export { createSettings, getSettings, remittanceStatus, csrStatus, scanStatus };