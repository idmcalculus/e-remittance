import db from '../services/db.js';
import { getDataByCode } from '../utilities/getDataByCode.js';
import { getAllData } from '../utilities/getAllData.js';
import { getDataById } from '../utilities/getDataById.js';

const getCsrReport = async (_req, res, _next) => await getAllData('csr_reports', res);
const getCsrReportById = async (req, res, _next) => await getDataById({ id: req.params.id }, 'csr_reports', res);
const getCsrReportByParishCode = async (req, res, _next) => await getDataByCode({ parish_code: req.params.parish_code }, 'csr_reports', res);
const getCsrReportByAreaCode = async (req, res, _next) => await getDataByCode({ area_code: req.params.area_code }, 'csr_reports', res);
const getCsrReportByZoneCode = async (req, res, _next) => await getDataByCode({ zone_code: req.params.zone_code }, 'csr_reports', res);
const getCsrReportByProvinceCode = async (req, res, _next) => await getDataByCode({ province_code: req.params.province_code }, 'csr_reports', res);
const getCsrReportByRegionCode = async (req, res, _next) => await getDataByCode({ region_code: req.params.region_code }, 'csr_reports', res);

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
	getCsrReportById,
	getCsrReportByParishCode,
	getCsrReportByAreaCode,
	getCsrReportByZoneCode,
	getCsrReportByProvinceCode,
	getCsrReportByRegionCode,
	createCsrReport 
};