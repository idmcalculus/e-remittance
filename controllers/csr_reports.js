import db from '../services/db.js';
import { getAllData } from '../utilities/getAllData.js';

// Get all CSR reports or specific ones based on query parameters
const getCsrReport = async (req, res, _next) => await getAllData(req, 'csr_reports', res);

const createCsrReport = async (req, res, _next) => {
	try {
		const data = req.body;
		const result = await db('csr_reports').insert(data).returning(['id', 'parish_code', 'month', 'created_at', 'updated_at']);
		return res.status(200).json({
			status: 'success',
			data: result
		});
	} catch (error) {
		return res.json({ error });
	}
}

export { 
	getCsrReport,
	createCsrReport 
};