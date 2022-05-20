import db from '../services/db.js';
import { getDataFromDb, insertIntoDb } from '../utils/dbOps.js';
import { asyncCatchInsert, asyncCatchRegular } from '../utils/helpers.js';

const getCsrSubCategories = asyncCatchRegular(async (req, res, _next) => {
	const subCategoriesData = await getDataFromDb(req, db('csr_sub_categories'));

	if (subCategoriesData) {
		return res.status(200).json({
			status: 'success',
			data: subCategoriesData
		})
	} else {
		return res.status(400).json({
			status: 'fail',
			message: 'No data found'
		})
	}
});

const createCsrSubCategory = asyncCatchInsert(async (req, res, _next) => {
	const data = req.body;
	
	const result = await insertIntoDb(db('csr_sub_categories'), data);

	if (result) {
		return res.status(200).json({
			status: 'success',
			data: result
		});
	} else {
		return res.status(400).json({
			status: 'fail',
			message: 'Insert sub categories unsuccessful'
		})
	}
});

export { getCsrSubCategories, createCsrSubCategory };