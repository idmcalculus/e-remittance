import db from '../services/db.js';
import { getDataFromDb, insertIntoDb, updateDb } from '../utils/dbOps.js';
import { asyncCatchInsert, asyncCatchRegular } from '../utils/helpers.js';

const createHGSReport = asyncCatchInsert(async (req, res, _next) => {
	const data = req.body;

	const { parish_code, month, year } = data;

	const foundHGSData = await getDataFromDb(req, db('hgs_att'), { parish_code, month, year });

	if (foundHGSData) {
		const updateHGSData = await updateDb(db('hgs_att'), data, { id: foundHGSData[0].id });

		if (updateHGSData) {
			return res.status(201).json({
				status: 'success',
				message: 'HGS Data updated successfully',
				data: updateHGSData
			});
		} else {
			return res.status(400).json({
				status: 'error',
				message: 'Error updating HGS Data'
			});
		}
	} else {
		const insertHGSData = await insertIntoDb(db('hgs_att'), data);

		if (insertHGSData) {
			return res.status(201).json({
				status: 'success',
				message: 'HGS Data inserted successfully',
				data: insertHGSData
			});
		} else {
			return res.status(400).json({
				status: 'error',
				message: 'Error inserting HGS Data'
			});
		}
	}
});

const getHGSData = asyncCatchRegular(async (req, res, _next) => {
	const hgsData = await getDataFromDb(req, db('hgs_att'));

	if (hgsData) {
		return res.status(200).json({
			status: 'success',
			data: hgsData
		});
	} else {
		return res.status(404).json({
			status: 'fail',
			message: 'No data found'
		});
	}
});

export { createHGSReport, getHGSData };