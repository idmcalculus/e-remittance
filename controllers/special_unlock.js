import { DateTime, Settings } from "luxon";
import { config } from 'dotenv';
import db from '../services/db.js';
import { getDataFromDb, insertIntoDb, updateDb } from '../utils/dbOps.js';
import { asyncCatchInsert, asyncCatchRegular } from '../utils/helpers.js';

config();

Settings.defaultZone = process.env.TIMEZONE;

const insertSpecialUnlockData = asyncCatchInsert(async (req, res, _next) => {
	const data = req.body;

	const { unlock_type, unlock_type_code, unlock_start_date, unlock_end_date, rem_month, rem_year } = data;

	if (unlock_end_date && (unlock_end_date < unlock_start_date)) {
		return res.status(400).json({
			status: 'Invalid dates',
			message: 'The unlock end date cannot be before the unlock start date'
		});
	}

	const foundSpecialUnlockData = await getDataFromDb(req, db('special_unlock'), { unlock_type, unlock_type_code, rem_month, rem_year });

	let forcedEndDate = DateTime.fromISO(unlock_start_date).plus({ days: 3 }).toFormat('yyyy-MM-dd');

	if (unlock_end_date == null || unlock_end_date == '' || unlock_end_date > forcedEndDate) {
		data['unlock_end_date'] = forcedEndDate;
	}

	if (foundSpecialUnlockData) {
		const updateSpeciallyUnlocked = await updateDb(db('special_unlock'), data, { id: foundSpecialUnlockData[0].id });

		if (updateSpeciallyUnlocked) {
			return res.status(200).json({
				status: 'success',
				message: 'Church unlock date updated successfully.',
				data: updateSpeciallyUnlocked
			});
		} else {
			return res.status(400).json({
				status: 'fail',
				message: 'Error updating church unlock date.'
			});
		}
	} else {
		const insertSpeciallyUnlocked = await insertIntoDb(db('special_unlock'), data);

		if (insertSpeciallyUnlocked) {
			return res.status(200).json({
				status: 'success',
				data: insertSpeciallyUnlocked
			});
		} else {
			return res.status(400).json({
				status: 'fail',
				message: 'Error inserting church unlock date.'
			});
		}
	}
});

const getSpecialUnlockData = asyncCatchRegular(async(req, res, _next) => {
	const specialUnlockData = await getDataFromDb(req, db('special_unlock'));

	if (specialUnlockData) {
		return res.status(200).json({
			status: 'success',
			data: specialUnlockData
		});
	} else {
		return res.status(400).json({
			status: 'fail',
			message: 'No data found'
		});
	}
});

export { insertSpecialUnlockData, getSpecialUnlockData };