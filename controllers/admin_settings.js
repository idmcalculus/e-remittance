import isEmpty from 'lodash/isEmpty.js';
import db from '../services/db.js';

const createSettings = async (req, res, next) => {
	try {
		const data = req.body;

		const { rem_month, rem_year } = data;

		const foundSettingsData = await db('settings_admin_report').where({ rem_month, rem_year });

		if (foundSettingsData.length > 0) {
			const updateSettingsData = await db('settings_admin_report').where({ id: foundSettingsData[0].id }).update(data).returning('*');

			if (updateSettingsData.length > 0) {
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
			const createSettingsData = await db('settings_admin_report').insert(data).returning('*');

			if (createSettingsData.length > 0) {
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
	} catch (error) {
		console.log(error);
		return res.status(400).json({
			code: error.code,
			error: error.message
		});
	}
}

const getSettings = async (req, res, next) => {
	try {
		const dataFound = (data) => {
			if (data.length > 0) {
				return res.status(200).json({
					status: 'success',
					data: data
				});
			} else {
				return res.status(404).json({
					status: 'fail',
					message: 'No data found'
				});
			}
		}

		const { rem_month, rem_year } = req.query;

		const query_data = {};

		if (rem_month) query_data.rem_month = rem_month;
		if (rem_year) query_data.rem_year = rem_year;

		const settingsData = await db('settings_admin_report').where(query_data);

		dataFound(settingsData);
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			error: error.message
		});
	}
}

export { createSettings, getSettings };