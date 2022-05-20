import isArray from 'lodash/isArray.js';
import db from '../services/db.js';
import { getDataFromDb, insertIntoDb, updateDb } from '../utils/dbOps.js';
import { asyncCatchInsert, asyncCatchRegular } from '../utils/helpers.js';

const getServices = asyncCatchRegular(async (req, res, _next) => {
	const servicesData = await getDataFromDb(req, db('services'));

	if (servicesData) {
		return res.status(200).json({
			status: 'success',
			data: servicesData
		})
	} else {
		return res.status(400).json({
			status: 'fail',
			message: 'No data found'
		})
	}
});

const createServices = asyncCatchInsert(async (req, res, _next) => {
	const data = req.body;
	/* console.log(data[0].service_name)
	const service_name = data[0].service_name;

	const foundServiceData = await getDataFromDb(req, db('services'), { service_name });

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
	//}
});

const deleteServices = asyncCatchRegular(async (req, res, _next) => {
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
});

export { getServices, createServices, deleteServices };