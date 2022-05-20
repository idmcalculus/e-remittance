import { config } from "dotenv";
import isEmpty from "lodash/isEmpty.js";
import { DateTime, Settings } from "luxon";
import db from "../services/db.js";
import { asyncCatchInsert } from "../utils/helpers.js";
import { getDataFromDb } from "../utils/dbOps.js";

config();

Settings.defaultZone = process.env.TIMEZONE;

const locked = async (req, res, next, comm_date, comp_date, opsMsg) => {
	const { parish_code, month, year } = req.body;

	const queryData = {
		rem_month: month,
		rem_year: year
	}

	const unlocked = await db('specially_unlocked_churches').select('unlock_start_date', 'unlock_end_date').where({ parish_code, ...queryData }).first();

	const lock = await db('settings_admin_report').select(comm_date, comp_date).where(queryData).first();

	let commDate, compDate, specialUnlockStartDate, specialUnlockEndDate;

	if (isEmpty(lock) || lock === undefined) {
		return res.status(403).json({
			status: 'fail',
			message: 'You have no access to this resource at this time.'
		})
	} else {
		commDate = lock[comm_date];
		compDate = lock[comp_date];
	}

	const currDate = DateTime.now().toFormat('yyyy-MM-dd');

	if (currDate < commDate || currDate > compDate) {
		let message;

		if (currDate < commDate) {
			message = `${opsMsg} commences on ${commDate}.`;
		}

		if (currDate > compDate) {
			message = `${opsMsg} closed on ${compDate}.`;
		}

		if (isEmpty(unlocked) || unlocked === undefined) {
			return res.status(403).json({
				status: 'fail',
				message: 'You have no access to this resource at this time.  ' + message
			});
		} else {
			specialUnlockStartDate = unlocked['unlock_start_date'];
			specialUnlockEndDate = unlocked['unlock_end_date'];

			if (currDate < specialUnlockStartDate || currDate > specialUnlockEndDate) {
				return res.status(403).json({
					status: 'fail',
					message: 'You have no access to this resource at this time.  ' + message
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