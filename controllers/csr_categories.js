import db from '../services/db.js';
import { getDataFromDb } from '../utils/dbOps.js';
import { asyncCatchInsert, asyncCatchRegular } from '../utils/helpers.js';

const getCsrCategories = asyncCatchRegular(async (req, res, _next) => {
	const categoriesData = await getDataFromDb(req, db('csr_categories'));

	if (categoriesData) {
		return res.status(200).json({
			status: 'success',
			data: categoriesData
		})
	} else {
		return res.status(400).json({
			status: 'fail',
			message: 'No data found'
		})
	}
});

const createCsrCategory = asyncCatchInsert(async (req, res, _next) => {
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
});

const deleteCsrCategory = asyncCatchRegular(async (req, res, _next) => {
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
});


export {
	getCsrCategories,
	createCsrCategory,
	deleteCsrCategory
};