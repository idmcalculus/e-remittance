import db from '../services/db.js';

const getProvinceDirectory = async (_req, res, _next) => {
	try {
		const provinceDirectory = await db('directory_province');
		return res.json(provinceDirectory);
	} catch (error) {
		return res.json({ error });
	}
}

const getProvinceDirectoryById = async (req, res, _next) => {
	try {
		const { id } = req.params;
		const singleProvinceDirectory = await db('directory_province').where({ id }).first();

		if (singleProvinceDirectory) {
			return res.status(200).json({
				status: 'success',
				data: singleProvinceDirectory
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No such province directory found'
			});
		}
	} catch (error) {
		return error
	}
}

const createProvinceDirectory = async (req, res, _next) => {
	try {
		const data = req.body;
		if (!data.hasOwnProperty('province') || data.province == '') {
			return res.status(401).json({
				status: 'error',
				message: 'Please provide the required credentials'
			});
		} else {
			const provinceExists = await db('directory_province').where({ province: data.province }).first();
			if (provinceExists) {
				return res.status(401).json({
					status: 'error',
					message: 'Province already exists'
				});
			} else {
				const result = await db('directory_province').insert(data).returning(['id', 'created_at', 'updated_at']);
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

const updateProvinceDirectory = async (req, res, _next) => {
	try {
		const data = req.body;
		const { id } = req.params;
		const provinceExists = await db('directory_province').where({ id }).first();
		if (provinceExists) {
			const result = await db('directory_province').update(data).where({ id }).returning(['id', 'updated_at']);
			return res.status(200).json({
				status: 'success',
				data: result
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No such province found'
			});
		}
	} catch (error) {
		return res.json({ error });
	}
}

export { getProvinceDirectory, getProvinceDirectoryById, createProvinceDirectory, updateProvinceDirectory };