import db from '../services/db.js';
import isEmpty from 'lodash/isEmpty.js';
import { getQueryData } from '../utilities/getQueryData.js';

// Get all CSR reports or specific ones based on query parameters
const getCsrReport = async (req, res, _next) => {
	try {
		const { query_data, pageNum, limitNum, sortBy, sortOrder } = getQueryData(req, res, 'csr_reports');

		const modifyReports = async report => {
			const csr_files = await db('csr_images').where({ report_id: report.id });
			for (let csr_file of csr_files) {
				const file_key = csr_file.file_key
				const file_path = `https://${process.env.AWS_BUCKET_NAME}.${process.env.FILE_HOST}/${file_key}`;
				csr_file['file_path'] = file_path;
			}
			report.csr_files = csr_files;
			return report;
		}

		const dataFound = async (data) => {
			if (data.length > 0) {
				const addFilesToReport = data.map(modifyReports);

				const csrReports = await Promise.all(addFilesToReport);

				return res.status(200).json({
					status: 'success',
					data: csrReports
				});
			} else {
				return res.status(404).json({
					status: 'fail',
					message: 'No data found'
				});
			}
		}
		const reports = await db('csr_reports')
				.where(query_data)
				.limit(limitNum)
				.offset(pageNum * limitNum)
				.orderBy(sortBy, sortOrder);

		await dataFound(reports);
	} catch (error) {
		console.log(error);
		return res.status(400).json({
			status: 'fail',
			message: error.message
		});
	}
}

const createCsrReport = async (req, res, _next) => {
	try {
		const data = req.body;

		const {
			parish_code,
			date_of_activity, 
			week, 
			month, 
			year
		} = data;
		
		const found_report = await db('csr_reports').where({ parish_code, date_of_activity, week, month, year });

		if (found_report.length > 0) {
			const update_report = await db('csr_reports').where({ id: found_report[0].id }).update(data).returning('*');
			if (update_report.length > 0) {
				return res.status(200).json({
					status: 'success',
					message: 'CSR report updated successfully',
					data: update_report[0]
				});
			} else {
				return res.status(500).json({
					status: 'fail',
					message: 'Something went wrong'
				});
			}
		} else {
			const insert_report = await db('csr_reports').insert(data).returning('*');
			if (insert_report.length > 0) {
				return res.status(200).json({
					status: 'success',
					message: 'CSR report created successfully',
					data: insert_report[0]
				});
			} else {
				return res.status(500).json({
					status: 'fail',
					message: 'Something went wrong'
				});
			}
		}
	} catch (error) {
		console.error(error);
		if (error.code == '23502') {
			return res.status(400).send({
				status: 'fail',
				message: `Please provide a value for the '${error.column}' column as it cannot be null.
							Kindly ensure to check all required fields are filled.`
			});
		}

		return res.status(400).send(`Error: ${error.message}`);
	}
}

const computeMonthlyData = async (csrData) => {
	try {
		const defaultCsrReportQuery = {
			parish_code: csrData['parish_code'],
			month: csrData['month'],
			year: csrData['year']
		};

		const csrComputableItemsObj = {
			expenditure: 'expenditure', 
			csr_offering: 'csr_offering',
			beneficiaries: 'beneficiaries',
			souls: 'souls'
		};

		const csrCountableItemsObj = {
			lga: 'lga',
			state: 'state',
			country: 'country'
		}

		const defaultCsrCols = [
			'parish_code', 'area_code', 'zone_code', 'prov_code', 'reg_code', 'month', 'year'
		];

		const monthlyData = {};

		const monthly_averages = await db('csr_reports').avg(csrComputableItemsObj).where(defaultCsrReportQuery);
	
		const avg_expenditure = Math.round(Number(monthly_averages[0]['expenditure']));
		const avg_csr_offering = Math.round(Number(monthly_averages[0]['csr_offering']));
		const avg_beneficiaries = Math.round(Number(monthly_averages[0]['beneficiaries']));
		const avg_souls = Math.round(Number(monthly_averages[0]['souls']));
	
		const monthlySum = await db('csr_reports').sum(csrComputableItemsObj).where(defaultCsrReportQuery);
	
		const expenditure 	= Number(monthlySum[0]['expenditure']);
		const csr_offering 	= Number(monthlySum[0]['csr_offering']);
		const beneficiaries = Number(monthlySum[0]['beneficiaries']);
		const souls			= Number(monthlySum[0]['souls']);

		const monthlyCounts = await db('csr_reports').sum(csrCountableItemsObj).where(defaultCsrReportQuery);
		console.log(monthlyCounts)
		
		for (let col of defaultCsrCols) {
			monthlyData[col] = csrData[col];
		}

		monthlyData['expenditure'] 		= expenditure;
		monthlyData['csr_offering'] 	= csr_offering;
		monthlyData['beneficiaries'] 	= beneficiaries;
		monthlyData['souls'] 			= souls;
	
		return monthlyData;
	} catch (error) {
		console.error(error.message);
		await db('csr_reports').where({ id: csrData.id }).del()
		return {
			error: error.message
		}
	}
}

const deleteCsrReport = async (req, res, _next) => {
	try {
		const {
			id,
			parish_code,
			area_code,
			zone_code,
			province_code,
			region_code,
			week,
			date_of_activity,
			month,
			year,
			category_id,
			sub_category_id
		} = req.query;

		let query = {};

		if (id) query.id = id;
		if (parish_code) query.parish_code = parish_code;
		if (area_code) query.area_code = area_code;
		if (zone_code) query.zone_code = zone_code;
		if (province_code) query.province_code = province_code;
		if (region_code) query.region_code = region_code;
		if (week) query.week = week;
		if (date_of_activity) query.date_of_activity = date_of_activity;
		if (month) query.month = month;
		if (year) query.year = year;
		if (category_id) query.category_id = category_id;
		if (sub_category_id) query.sub_category_id = sub_category_id;

		const result = await db('csr_reports').where(query).first().del();

		if (result) {
			return res.status(200).json({
				status: 'success',
				message: 'CSR report deleted successfully'
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No CSR report found for the query data supplied'
			});
		}
	} catch (error) {
		return error
	}
}

export { 
	getCsrReport, 
	createCsrReport,
	deleteCsrReport
};