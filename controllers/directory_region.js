import db from '../services/db.js';

const getRegionDirectory = async (_req, res, _next) => {
	try {
		const regionDirectory = await db('directory_region');
		return res.json(regionDirectory);
	} catch (error) {
		return res.json({ error });
	}
}

const getRegionDirectoryById = async (req, res, _next) => {
	try {
		const { id } = req.params;
		const singleRegionDirectory = await db('directory_region').where({ id }).first();

		if (singleRegionDirectory) {
			return res.status(200).json({
				status: 'success',
				data: singleRegionDirectory
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No such region directory found'
			});
		}
	} catch (error) {
		return error
	}
}

const createRegionDirectory = async (req, res, _next) => {
	try {
		const data = req.body;
		if (!data.hasOwnProperty('region') && data.region == '') {
			return res.status(401).json({
				status: 'error',
				message: 'Please provide the required credentials'
			});
		} else {
			const regionExists = await db('directory_region').where({ region: data.region }).first();
			if (regionExists) {
				return res.status(401).json({
					status: 'error',
					message: 'Region already exists'
				});
			} else {
				const result = await db('directory_region').insert(data).returning(['id', 'created_at', 'updated_at']);
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

const updateRegionDirectory = async (req, res, _next) => {
	try {
		const data = req.body;
		const { id } = req.params;
		const regionExists = await db('directory_region').where({ id }).first();
		if (regionExists) {
			const result = await db('directory_region').update(data).where({ id }).returning(['id', 'updated_at']);
			return res.status(200).json({
				status: 'success',
				data: result
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No such region found'
			});
		}
	} catch (error) {
		return res.json({ error });
	}
}

export { getRegionDirectory, getRegionDirectoryById, createRegionDirectory, updateRegionDirectory };