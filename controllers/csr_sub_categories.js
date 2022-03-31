import db from '../services/db.js';

const getCsrSubCategories = async (_req, res, _next) => {
	try {
		const sub_categories = await db('csr_sub_categories');
		return res.json(sub_categories);
	} catch (error) {
		return res.json({ error });
	}
}

const getCsrSubCategoryById = async (req, res, _next) => {
	try {
		const { id } = req.params;
		const csr_sub_category = await db('csr_sub_categories').where({ id }).first();

		if (csr_sub_category) {
			return res.status(200).json({
				status: 'success',
				data: csr_sub_category
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No category found'
			});
		}
	} catch (error) {
		return error
	}
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

export { getCsrSubCategories, getCsrSubCategoryById, createCsrSubCategory };