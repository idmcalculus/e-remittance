import db from '../services/db.js';

const getServices = async (_req, res, _next) => {
	try {
		const service_list = await db('services');
		return res.json(service_list);
	} catch (error) {
		return res.json({ error });
	}
}

const getServiceById = async (req, res, _next) => {
	try {
		const { id } = req.params;
		const service = await db('services').where({ id }).first();

		if (service) {
			return res.status(200).json({
				status: 'success',
				data: service
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No service found'
			});
		}
	} catch (error) {
		return error
	}
}

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

export { getServices, getServiceById, createServices };