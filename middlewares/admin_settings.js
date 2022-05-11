import isEmpty from "lodash/isEmpty.js";
import db from "../services/db.js";

const remittanceLocked = async (req, res, next) => {
	try {
		const { month, year } = req.body;

		const queryData = {
			rem_month: month,
			rem_year: year
		}

		const lockRemit = await db('settings_admin_report').select('lock_remittance').where(queryData).first();
		console.log(lockRemit);

		if (!isEmpty(lockRemit) && lockRemit.lock_remittance === true) {
			return res.status(403).json({
				status: 'fail',
				message: 'The remittance is locked for this period'
			})
		}

		next()
	} catch (error) {
		console.error(error)
		return res.status(400).json({
			error: error.message
		}) 
	}
}

const csrLocked = async (req, res, next) => {
	try {
		const { month, year } = req.body;

		const queryData = {
			rem_month: month,
			rem_year: year
		}

		const lockCsr = await db('settings_admin_report').select('csr_lock').where(queryData).first();
		console.log(lockCsr);

		if (!isEmpty(lockCsr) && lockCsr.lock_remittance === true) {
			return res.status(403).json({
				status: 'fail',
				message: 'CSR Report is locked for this period'
			})
		}

		next()
	} catch (error) {
		console.error(error)
		return res.status(400).json({
			error: error.message
		}) 
	}
}

const scanLocked = async (req, res, next) => {
	try {
		const { month, year } = req.body;

		const queryData = {
			rem_month: month,
			rem_year: year
		}

		const { lockScan } = await db('settings_admin_report').select('scan_lock').where(queryData).first();

		if (lockScan === true) {
			return res.status(403).json({
				status: 'fail',
				message: 'Scanning Report is locked for this period'
			})
		}

		next()
	} catch (error) {
		console.error(error)
		return res.status(400).json({
			error: error.message
		}) 
	}
}

export { remittanceLocked, csrLocked, scanLocked }