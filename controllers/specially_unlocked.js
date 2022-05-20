import { DateTime, Settings } from "luxon";
import { config } from 'dotenv';
import db from '../services/db.js';
import { getDataFromDb, insertIntoDb, updateDb } from '../utils/dbOps.js';
import { asyncCatchInsert, asyncCatchRegular } from '../utils/helpers.js';

config();

Settings.defaultZone = process.env.TIMEZONE;

const unlockChurch = asyncCatchInsert(async (req, res, _next) => {
	const data = req.body;

	let { parish_code, unlock_start_date, unlock_end_date, rem_month, rem_year } = data;

	const foundSettingsData = await getDataFromDb(req, db('specially_unlocked_churches'), { parish_code, rem_month, rem_year });

	let forcedEndDate = DateTime.fromISO(unlock_start_date).plus({ days: 3 }).toFormat('yyyy-MM-dd');
	const daysInMonth = DateTime.fromISO(unlock_start_date).daysInMonth;
	const lastMonthDay = DateTime.fromFormat(`${rem_month} ${daysInMonth}, ${rem_year}`, 'LLL dd, yyyy').toFormat('yyyy-MM-dd');

	if (forcedEndDate > lastMonthDay) {
		forcedEndDate = lastMonthDay
	}

	if (unlock_end_date == null || unlock_end_date == '' || unlock_end_date > forcedEndDate) {
		unlock_end_date = forcedEndDate;
	}

	data['unlock_end_date'] = unlock_end_date;

	if (foundSettingsData) {
		const updateSpeciallyUnlocked = await updateDb(db('specially_unlocked_churches'), data, { parish_code, rem_month, rem_year });

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
		const insertSpeciallyUnlocked = await insertIntoDb(db('specially_unlocked_churches'), data);

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

const getUnlockedChurches = asyncCatchRegular(async(req, res, _next) => {
	const unlockChurchesData = await getDataFromDb(req, db('specially_unlocked_churches'));

	if (unlockChurchesData) {
		return res.status(200).json({
			status: 'success',
			data: unlockChurchesData
		});
	} else {
		return res.status(400).json({
			status: 'fail',
			message: 'No data found'
		});
	}
});

export { unlockChurch, getUnlockedChurches };