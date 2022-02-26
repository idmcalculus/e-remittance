import db from '../services/db.js';

const getZoneDirectory = async (_req, res, _next) => {
	try {
		const zoneDirectory = await db('directory_zone');
		return res.json(zoneDirectory);
	} catch (error) {
		return res.json({ error });
	}
}

const getZoneDirectoryById = async (req, res, _next) => {
	try {
		const { id } = req.params;
		const singleZoneDirectory = await db('directory_zone').where({ id }).first();

		if (singleZoneDirectory) {
			return res.status(200).json({
				status: 'success',
				data: singleZoneDirectory
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No such zone directory found'
			});
		}
	} catch (error) {
		return error
	}
}

const createZoneDirectory = async (req, res, _next) => {
	try {
		const data = req.body;
		if (!data.hasOwnProperty('zone') || data.zone == '') {
			return res.status(401).json({
				status: 'error',
				message: 'Please provide the required credentials'
			});
		} else {
			const zoneExists = await db('directory_zone').where({ zone: data.zone }).first();
			if (zoneExists) {
				return res.status(401).json({
					status: 'error',
					message: 'Zone already exists'
				});
			} else {
				const result = await db('directory_zone').insert(data).returning(['id', 'created_at', 'updated_at']);
				return res.status(200).json({
					status: 'success',
					data: result
				});
			}
		}
	} catch (error) {
		return res.json({ error });
	}
}

const updateZoneDirectory = async (req, res, _next) => {
	try {
		const data = req.body;
		const { id } = req.params;
		const zoneExists = await db('directory_zone').where({ id }).first();
		if (zoneExists) {
			const result = await db('directory_zone').update(data).where({ id }).returning(['id', 'updated_at']);
			return res.status(200).json({
				status: 'success',
				data: result
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No such zone found'
			});
		}
	} catch (error) {
		return res.json({ error });
	}
}

export { getZoneDirectory, getZoneDirectoryById, createZoneDirectory, updateZoneDirectory };