import db from '../services/db.js';

const getServices = async (req, res, _next) => await getAllData(req, res, 'services');

const createServices = async (req, res, _next) => {
	try {
		const data = req.body;
		const result = await db('services').insert(data).returning('*');
		return res.status(200).json({
			status: 'success',
			data: result
		});
	} catch (error) {
		return res.json({ error });
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