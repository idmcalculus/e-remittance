import { config } from "dotenv";
import isEmpty from "lodash/isEmpty.js";
import { DateTime, Settings } from "luxon";
import db from "../services/db.js";
import { asyncCatchInsert } from "../utils/helpers.js";

config();

Settings.defaultZone = process.env.TIMEZONE;

const locked = async (req, res, next, comm_date, comp_date, ops) => {
	const { parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code, month, year } = req.body;

	const queryData = {
		rem_month: month, 
		rem_year: year
	}
	const currDate = DateTime.now().toFormat('yyyy-MM-dd');

	let unlockTypeCodes = [ parish_code, area_code, zone_code, prov_code ];

	unlockTypeCodes = unlockTypeCodes.filter(code => code !== undefined);

	const specialUnlock = await db('special_unlock')
							.select('*')
							.where('unlock_end_date', '>=', currDate)
							.andWhere('unlock_start_date', '<=', currDate)
							.whereIn('unlock_type_code', unlockTypeCodes);

	const regionSettings = await db('admin_settings_report')
							.select('*')
							.where({
								admin_type: 'region',
								admin_type_code: reg_code,
								...queryData
							}).first();

	const subContSettings = await db('admin_settings_report')
							.select('*')
							.where({
								admin_type: 'sub_continent',
								admin_type_code: sub_cont_code,
								...queryData
							}).first();

	const contSettings = await db('admin_settings_report')
							.select('*')
							.where({
								admin_type: 'continent',
								admin_type_code: cont_code,
								...queryData
							}).first();

	let message = 'You have no access to this resource at this time.';

	if (isEmpty(regionSettings)) {
		if (isEmpty(subContSettings)) {
			if (!isEmpty(contSettings)) {
				const contCommDate = contSettings[comm_date];
				const contCompDate = contSettings[comp_date];

				if (contCompDate < currDate || contCommDate > currDate) {
					if (contCommDate > currDate) {
						message += ` ${ops} will start on ${contCommDate}`;
					}

					if (contCompDate < currDate) {
						message += ` ${ops} closed on ${contCompDate}`;
					}

					if (isEmpty(specialUnlock)) {
						return res.status(403).json({
							status: 'closed',
							message: message
						});
					}
				}
			} else {
				return res.status(403).json({
					status: 'inactive',
					message: ops + ' is not yet active'
				});
			}
		} else {
			const subContCommDate = subContSettings[comm_date];
			const subContCompDate = subContSettings[comp_date];

			if (subContCompDate < currDate || subContCommDate > currDate) {
				if (subContCommDate > currDate) {
					message += ` ${ops} will start on ${subContCommDate}`;
				}

				if (subContCompDate < currDate) {
					message += ` ${ops} closed on ${subContCompDate}`;
				}

				if (isEmpty(specialUnlock)) {
					return res.status(403).json({
						status: 'closed',
						message: message
					});
				}
			}
		}
	} else {
		const regionCommDate = regionSettings[comm_date];
		const regionCompDate = regionSettings[comp_date];

		if (regionCompDate < currDate || regionCommDate > currDate) {
			if (regionCommDate > currDate) {
				message += ` ${ops} will start on ${regionCommDate}`;
			}

			if (regionCompDate < currDate) {
				message += ` ${ops} closed on ${regionCompDate}`;
			}

			if (isEmpty(specialUnlock)) {
				return res.status(403).json({
					status: 'closed',
					message: message
				});
			}
		}
	}

	next();
}

const remittanceLocked = asyncCatchInsert(async (req, res, next) => {
	await locked(req, res, next, 'date_of_comm', 'date_of_comp', 'Remittance');
});

const csrLocked = asyncCatchInsert(async (req, res, next) => {
	await locked(req, res, next, 'csr_comm_date', 'csr_comp_date', 'CSR Reporting');
});

const scanLocked = asyncCatchInsert(async (req, res, next) => {
	await locked(req, res, next, 'scan_comm_date', 'scan_comp_date', 'Source Document Upload');
});

export { remittanceLocked, csrLocked, scanLocked }