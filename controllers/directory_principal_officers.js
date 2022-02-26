import db from '../services/db.js';

const getPrincipalOfficersDirectory = async (_req, res, _next) => {
	try {
		const principalOfficersDirectory = await db('directory_principal_officers');
		return res.json(principalOfficersDirectory);
	} catch (error) {
		return res.json({ error });
	}
}

const getPrincipalOfficersDirectoryById = async (req, res, _next) => {
	try {
		const { id } = req.params;
		const singlePrincipalOfficersDirectory = await db('directory_principal_officers').where({ id }).first();

		if (singlePrincipalOfficersDirectory) {
			return res.status(200).json({
				status: 'success',
				data: singlePrincipalOfficersDirectory
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

const createPrincipalOfficersDirectory = async (req, res, _next) => {
	try {
		const data = req.body;
		if (!data.hasOwnProperty('directory_code') || data.directory_code == '') {
			return res.status(401).json({
				status: 'error',
				message: 'Please provide the required credentials'
			});
		} else {
			const directoryExists = await db('directory_principal_officers').where({ directory_code: data.directory_code }).first();
			if (directoryExists) {
				return res.status(401).json({
					status: 'error',
					message: 'Directory already exists'
				});
			} else {
				const result = await db('directory_principal_officers').insert(data).returning(['id', 'created_at', 'updated_at']);
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

const updatePrincipalOfficersDirectory = async (req, res, _next) => {
	try {
		const data = req.body;
		const { id } = req.params;
		const directoryExists = await db('directory_principal_officers').where({ id }).first();
		if (directoryExists) {
			const result = await db('directory_principal_officers').update(data).where({ id }).returning(['id', 'created_at', 'updated_at']);
			return res.status(200).json({
				status: 'success',
				data: result
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No such directory found'
			});
		}
	} catch (error) {
		return res.json({ error });
	}
}

export { getPrincipalOfficersDirectory, getPrincipalOfficersDirectoryById, createPrincipalOfficersDirectory, updatePrincipalOfficersDirectory };