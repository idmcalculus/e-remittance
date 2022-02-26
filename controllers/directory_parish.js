import db from '../services/db.js';

const getParishDirectory = async (_req, res, _next) => {
	try {
		const parishDirectory = await db('directory_parish');
		return res.json(parishDirectory);
	} catch (error) {
		return res.json({ error });
	}
}

const getParishDirectoryById = async (req, res, _next) => {
	try {
		const { id } = req.params;
		const singleParishDirectory = await db('directory_parish').where({ id }).first();

		if (singleParishDirectory) {
			return res.status(200).json({
				status: 'success',
				data: singleParishDirectory
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

const createParishDirectory = async (req, res, _next) => {
	try {
		const data = req.body;
		if (!data.hasOwnProperty('parish_name') || data.parish_name == '') {
			return res.status(401).json({
				status: 'error',
				message: 'Please provide the required credentials'
			});
		} else {
			const parishExists = await db('directory_parish').where({ parish_name: data.parish_name }).first();
			if (parishExists) {
				return res.status(401).json({
					status: 'error',
					message: 'Parish already exists'
				});
			} else {
				const result = await db('directory_parish').insert(data).returning(['id', 'created_at', 'updated_at']);
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

const updateParishDirectory = async (req, res, _next) => {
	try {
		const data = req.body;
		const { id } = req.params;
		const parishExists = await db('directory_parish').where({ id }).first();
		if (parishExists) {
			const result = await db('directory_parish').update(data).where({ id }).returning(['id', 'updated_at']);
			return res.status(200).json({
				status: 'success',
				data: result
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No such parish found'
			});
		}
	} catch (error) {
		return res.json({ error });
	}
}

export { getParishDirectory, getParishDirectoryById, createParishDirectory, updateParishDirectory };