import db from '../services/db.js';
import { getQueryData } from '../utilities/getQueryData.js';

const getCsrCategories = async (req, res, _next) => {
	getQueryData(req, res, 'csr_categories');
}

const createCsrCategory = async (req, res, _next) => {
	try {
		const data = req.body;
		/* if (Array.isArray(data)){
			data.forEach(async ({ cat_name }) => {
				const csr_category = await db('csr_categories').where({ cat_name }).first();
				if (csr_category) {
					return res.status(409).json({
						status: 'fail',
						message: 'Category already exists'
					});
				}
			})
		} else {
			const { cat_name } = data;
			const csr_category = await db('csr_categories').where({ cat_name }).first();
			if (csr_category) {
				return res.status(409).json({
					status: 'fail',
					message: 'Category already exists'
				});
			}
		} */

		const result = await db('csr_categories').insert(data).returning('*');
		return res.status(200).json({
			status: 'success',
			data: result
		});
	} catch (error) {
		return res.json({ error });
	}
}

const updateCsrCategory = async (req, res, _next) => {
	try {
		const data = req.body;

		const {
			id,
			cat_name
		} = req.query;

		let query = {};

		if (id) query.id = id;
		if (cat_name) query.cat_name = cat_name;

		const result = await db('csr_categories').where(query).first().update(data).returning('*');

		if (result) {
			return res.status(200).json({
				status: 'success',
				message: 'CSR category updated successfully',
				data: result
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'CSR category not found'
			});
		}
	} catch (error) {
		return res.json({ error });
	}
}

const deleteCsrCategory = async (req, res, _next) => {
	try {
		const {
			id,
			cat_name
		} = req.query;

		let query = {};

		if (id) query.id = id;
		if (cat_name) query.cat_name = cat_name;

		const result = await db('csr_categories').where(query).first().del().returning('*');

		if (result) {
			return res.status(200).json({
				status: 'success',
				message: 'CSR category deleted successfully'
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'CSR category not found'
			});
		}
	} catch (error) {
		return res.json({ error });
	}
}


export {
	getCsrCategories,
	createCsrCategory,
	updateCsrCategory,
	deleteCsrCategory
};