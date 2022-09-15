import isEmpty from 'lodash/isEmpty.js';
import isArray from 'lodash/isArray.js';
import db from '../services/db.js';
import { getDataFromDb } from '../utils/dbOps.js';
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

	if (isArray(data)) {
		for (const elem of data) {
			elem['service_name_slug'] = elem['service_name'].toLowerCase().split(' ').join('_');
		}
	} else {
		data['service_name_slug'] = data['service_name'].toLowerCase().split(' ').join('_');
	}

	const insertedServicesData = await db('services')
									.insert(data)
									.onConflict(['service_name', 'service_name_slug'])
									.merge()
									.returning('*');

	if (insertedServicesData) {
		return res.status(200).json({
			status: 'success',
			data: insertedServicesData
		});
	} else {
		return res.status(400).json({
			status: 'fail',
			message: 'Inserting/updating services data unsuccessful'
		})
	}
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

const getParishServices = asyncCatchRegular (async (req, res, _next) => {
	const { parish_code } = req.query;

	const parishServices = await db('reports_att')
								.where('parish_code', parish_code)
								.join('services', 'reports_att.service_id', 'services.id')
								.select('reports_att.service_id', 'services.service_name', 'services.service_name_slug');

	if (!isEmpty(parishServices)) {
		return res.status(200).json({
			status: 'success',
			data: parishServices
		});
	} else {
		return res.status(400).json({
			status: 'fail',
			message: 'No data found'
		});
	}
});

export { getServices, createServices, deleteServices, getParishServices };