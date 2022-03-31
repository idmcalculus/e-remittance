import db from '../services/db.js';

const getCsrCategories = async (_req, res, _next) => {
	try {
		const categories = await db('csr_categories');
		return res.json(categories);
	} catch (error) {
		return res.json({ error });
	}
}

const getCsrCategoryById = async (req, res, _next) => {
	try {
		const { id } = req.params;
		const csr_category = await db('csr_categories').where({ id }).first();

		if (csr_category) {
			return res.status(200).json({
				status: 'success',
				data: csr_category
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

export { getCsrCategories, getCsrCategoryById, createCsrCategory };