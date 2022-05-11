import isArray from 'lodash/isArray.js';
import db from '../services/db.js';
import { getDataFromDb, insertIntoDb, updateDb } from '../utilities/dbOps.js';
import { getQueryData } from '../utilities/getQueryData.js';

const getServices = async (req, res, _next) => {
	getQueryData(req, res, 'services');
}

const createServices = async (req, res, _next) => {
	try {
		const data = req.body;
		/* console.log(data[0].service_name)
		const service_name = data[0].service_name;

		const foundServiceData = await getDataFromDb(db('services'), { service_name });

		if (foundServiceData) {
			const updateServicesData = await updateDb(db('services'), data, { service_name });

			if (updateServicesData) {
				return res.status(200).json({
					status: 'success',
					data: updateServicesData
				});
			} else {
				return res.status(400).json({
					status: 'fail',
					message: 'Services update unsuccessful'
				})
			}
		} else { */
			const createServiceData = await insertIntoDb(db('services'), data)
			if (createServiceData) {
				return res.status(200).json({
					status: 'success',
					data: createServiceData
				});
			} else {
				return res.status(400).json({
					status: 'fail',
					message: 'Insert data into services unsuccessful'
				})
			}
	//	}
	} catch (error) {
		console.error(error);
		return res.status(400).send(`ERROR: ${error.message}`);
	}
}

const updateServices = async (req, res, _next) => {
	try {
		const data = req.body;

		const {
			id,
			service_name
		} = req.query;

		let query = {};

		if (id) query.id = id;
		if (service_name) query.service_name = service_name;

		const result = await db('services').where(query).first().update(data).returning('*');

		if (result) {
			return res.status(200).json({
				status: 'success',
				message: 'Service updated successfully',
				data: result
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'Service not found'
			});
		}
	} catch (error) {
		return res.json({ error });
	}
}

const deleteServices = async (req, res, _next) => {
	try {
		const {
			id,
			service_name
		} = req.query;

		let query = {};

		if (id) query.id = id;
		if (service_name) query.service_name = service_name;

		const result = await db('services').where(query).first().del().returning('*');

		if (result) {
			return res.status(200).json({
				status: 'success',
				message: 'Service deleted successfully'
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'Service not found'
			});
		}
	} catch (error) {
		return res.json({ error });
	}
}

export { getServices, createServices, updateServices, deleteServices };