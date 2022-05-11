import db from '../services/db.js';
import { getQueryData } from '../utilities/getQueryData.js';

const getCsrSubCategories = async (req, res, _next) => {
	getQueryData(req, res, 'csr_sub_categories');
}

const createCsrSubCategory = async (req, res, _next) => {
	try {
		const data = req.body;
		const result = await db('csr_sub_categories').insert(data).returning('*');
		return res.status(200).json({
			status: 'success',
			data: result
		});
	} catch (error) {
		return res.json({ error });
	}
}

export { getCsrSubCategories, createCsrSubCategory };