import db from '../services/db.js';
import { getDataFromDb, insertIntoDb, updateDb } from '../utils/dbOps.js';
import { asyncCatchInsert, asyncCatchRegular } from '../utils/helpers.js';

const createSettings = asyncCatchInsert(async (req, res, _next) => {
	const data = req.body;

	const { rem_month, rem_year, set_as_default, report_def, csr_def, scan_def } = data;

	const foundSettingsData = await getDataFromDb(req, db('settings_admin_report'), { rem_month, rem_year });

	if (foundSettingsData) {
		const updateSettingsData = await updateDb(db('settings_admin_report'), data, { id: foundSettingsData[0].id });

		if (updateSettingsData) {
			await adjustDefaults(db('settings_admin_report'), updateSettingsData[0].id, set_as_default, report_def, csr_def, scan_def);

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
		const createSettingsData = await insertIntoDb(db('settings_admin_report'), data);

		if (createSettingsData) {
			await adjustDefaults(db('settings_admin_report'), createSettingsData[0].id, set_as_default, report_def, csr_def, scan_def);

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

const adjustDefaults = async (db, id, set_as_default, report_def, csr_def, scan_def) => {
	if (set_as_default) await db.update({ set_as_default: 0 }).whereNot({ id });
	if (report_def) await db.update({ report_def: 0 }).whereNot({ id });
	if (scan_def) await db.update({ scan_def: 0 }).whereNot({ id });
	if (csr_def) await db.update({ csr_def: 0 }).whereNot({ id });
}

const getSettings = asyncCatchRegular(async (req, res, next) => {
	const settingsData = await getDataFromDb(req, db('settings_admin_report'));

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

export { createSettings, getSettings };