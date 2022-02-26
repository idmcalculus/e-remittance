import db from '../services/db.js';

const getCsrReport = async (_req, res, _next) => {
	try {
		const report = await db('csr_reports');
		return res.json(report);
	} catch (error) {
		return res.json({ error });
	}
}

const getCsrReportById = async (req, res, _next) => {
	try {
		const { id } = req.params;
		const csr_report = await db('csr_reports').where({ id }).first();

		if (csr_report) {
			return res.status(200).json({
				status: 'success',
				data: csr_report
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No report found'
			});
		}
	} catch (error) {
		return error
	}
}

const createCsrReport = async (req, res, _next) => {
	try {
		const data = req.body;
		if (data.parish_code == '') {
			return res.status(401).json({
				status: 'error',
				message: 'Please provide the required credentials'
			})
		} else {
			const result = await db('csr_reports').insert(data);
			return res.status(200).json({
				status: 'success',
				data: result
			});
		}
	} catch (error) {
		return res.json({ error });
	}
}

export { getCsrReport, getCsrReportById, createCsrReport };