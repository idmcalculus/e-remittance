import db from '../services/db.js';

const getAreaDirectory = async (_req, res, _next) => {
	try {
		const areaDirectory = await db('directory_area');
		return res.json(areaDirectory);
	} catch (error) {
		return res.json({ error });
	}
}

const getAreaDirectoryById = async (req, res, _next) => {
	try {
		const { id } = req.params;
		const singleAreaDirectory = await db('directory_area').where({ id }).first();

		if (singleAreaDirectory) {
			return res.status(200).json({
				status: 'success',
				data: singleAreaDirectory
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

const createAreaDirectory = async (req, res, _next) => {
	try {
		const data = req.body;
		if (!data.hasOwnProperty('area') || data.area == '') {
			return res.status(401).json({
				status: 'error',
				message: 'Please provide the required credentials'
			});
		} else {
			const areaExists = await db('directory_area').where({ area: data.area }).first();
			if (areaExists) {
				return res.status(401).json({
					status: 'error',
					message: 'Area already exists'
				});
			} else {
				const result = await db('directory_area').insert(data).returning(['id', 'created_at', 'updated_at']);
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

const updateAreaDirectory = async (req, res, _next) => {
	try {
		const data = req.body;
		const { id } = req.params;
		const areaExists = await db('directory_area').where({ id }).first();
		if (areaExists) {
			const result = await db('directory_area').update(data).where({ id }).returning(['id', 'updated_at']);
			return res.status(200).json({
				status: 'success',
				data: result
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No such area found'
			});
		}
	} catch (error) {
		return res.json({ error });
	}
}

export { getAreaDirectory, getAreaDirectoryById, createAreaDirectory, updateAreaDirectory };