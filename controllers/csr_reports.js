import db from '../services/db.js';
import isEmpty from 'lodash/isEmpty.js';
import isArray from 'lodash/isArray.js';
import _ from 'lodash';
import { insertIntoDb, getDataFromDb, updateDb, deleteFromDb } from '../utils/dbOps.js';
import { asyncCatchRegular, insertOpsHelper, updateOpsHelper } from '../utils/helpers.js';

const getCsrReport = asyncCatchRegular(async (req, res, _next) => {
	const modifyReports = async report => {
		const csr_files = await getDataFromDb(req, db('csr_images'), { report_id: report.id });
		
		if (csr_files) {
			for (let csr_file of csr_files) {
				const file_key = csr_file.file_key
				const file_path = `${process.env.AWS_BUCKET_URL}/${file_key}`;
				csr_file['file_path'] = file_path;
			}

			report['csr_files'] = csr_files;
		}

		return report;
	}

	const reports = await getDataFromDb(req, db('csr_reports'));

	if (reports) {
		const addFilesToReport = reports.map(modifyReports);

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
});

const createCsrReport = async (req, res, _next) => {
	const data = req.body;

	const { parish_code, date_of_activity, week, month, year } = data;
	
	const foundCsrReport = await getDataFromDb(req, db('csr_reports'), { parish_code, date_of_activity, week, month, year });

	const foundMonthlyReport = await getDataFromDb(req, db('monthly_csr_reports'), {
		parish_code: parish_code,
		month: month,
		year: year
	});

	if (foundCsrReport) {
		const csrMonthlyData = await computeMonthlyData(req, data, 'update');

		if (isEmpty(csrMonthlyData) || csrMonthlyData.error) {
			return res.status(400).json({
				status: 'error',
				message: 'Error updating monthly data.'
			});
		}

		if (foundMonthlyReport) {
			// if report for this month exists, update
			const updateMonthlyReportData = await updateDb(db('monthly_csr_reports'), csrMonthlyData, { id: foundMonthlyReport[0].id });
			await updateOpsHelper(updateDb, updateMonthlyReportData, db('csr_reports'), data, { id: foundCsrReport[0].id }, res);
		} else {
			// if report for this month does not exist, create
			const insertMonthlyReportData = insertIntoDb(db('monthly_csr_reports'), csrMonthlyData);
			await updateOpsHelper(updateDb, insertMonthlyReportData, db('csr_reports'), data, { id: foundCsrReport[0].id }, res);
		}
	} else {
		const csrMonthlyData = await computeMonthlyData(req, data, 'insert');

		if (isEmpty(csrMonthlyData) || csrMonthlyData.error) {
			return res.status(400).json({
				status: 'error',
				message: 'Error inserting monthly data.'
			});
		}

		if (foundMonthlyReport) {
			// if report data for this month exists, update
			const updateMonthlyReportData = await updateDb(db('monthly_csr_reports'), csrMonthlyData, { id: foundMonthlyReport[0].id });
			await insertOpsHelper(insertIntoDb, updateMonthlyReportData, db('csr_reports'), data, res);
		} else {
			// if csr Report for this month does not exist, create
			const insertMonthlyReportData = await insertIntoDb(db('monthly_csr_reports'), csrMonthlyData);
			await insertOpsHelper(insertIntoDb, insertMonthlyReportData, db('csr_reports'), data, res);
		}
	}
}

const computeMonthlyData = async (req, csrData, ops) => {
	try {
		const defaultCsrReportQuery = {
			sub_category_id: csrData['sub_category_id'],
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
			country: 'country',
			date_of_activity: 'date_of_activity'
		}

		const defaultCsrCols = [
			'parish_code', 'area_code', 'zone_code', 'prov_code', 'reg_code', 'sub_cont_code', 'cont_code', 'month', 'year', 'category_id', 'sub_category_id'
		];

		const monthlyData = {};

		let monthlySum, monthlyCounts, monthlyReportData;
	
		if (ops === 'insert') {
			monthlySum = await db('csr_reports').sum(csrComputableItemsObj).where(defaultCsrReportQuery);
			monthlyCounts = await db('csr_reports').countDistinct(csrCountableItemsObj).where(defaultCsrReportQuery);
			monthlyReportData = await getDataFromDb(req, db('csr_reports'), defaultCsrReportQuery);
		}

		if (ops === 'update') {
			const dbData = await getDataFromDb(req, db('csr_reports'), {
				parish_code: csrData['parish_code'],
				week: csrData['week'],
				month: csrData['month'],
				year: csrData['year'],
				date_of_activity: csrData['date_of_activity']
			});

			monthlySum = await db('csr_reports')
								.sum(csrComputableItemsObj)
								.where(defaultCsrReportQuery)
								.andWhereNot({id: dbData[0].id});

			monthlyCounts = await db('csr_reports')
								.countDistinct(csrCountableItemsObj)
								.where(defaultCsrReportQuery)
								.andWhereNot({id: dbData[0].id});

			monthlyReportData = await db('csr_reports').where(defaultCsrReportQuery).andWhereNot({id: dbData[0].id});
		}

		monthlyReportData = isArray(monthlyReportData) ? monthlyReportData : [];
	
		const expenditure 	= (monthlySum.length > 0 ? Number(monthlySum[0]['expenditure']) : 0) + (csrData['expenditure'] ? csrData['expenditure'] : 0);
		const csr_offering 	= (monthlySum.length > 0 ? Number(monthlySum[0]['csr_offering']) : 0) + (csrData['csr_offering'] ? csrData['csr_offering'] : 0);
		const beneficiaries = (monthlySum.length > 0 ? Number(monthlySum[0]['beneficiaries']) : 0) + (csrData['beneficiaries'] ? csrData['beneficiaries'] : 0);
		const souls			= (monthlySum.length > 0 ? Number(monthlySum[0]['souls']) : 0) + (csrData['souls'] ? csrData['souls'] : 0);

		let num_lga 		= monthlyCounts.length > 0 ? Number(monthlyCounts[0]['lga']) : 0;
		let num_state 		= monthlyCounts.length > 0 ? Number(monthlyCounts[0]['state']) : 0;
		let num_country 	= monthlyCounts.length > 0 ? Number(monthlyCounts[0]['country']) : 0;
		const num_activity 	= Number(monthlyReportData.length) + 1

		let lgaArr = [], stateArr = [], countryArr = [];

		for (let report of monthlyReportData) {
			lgaArr.push(report['lga']);
			stateArr.push(report['state']);
			countryArr.push(report['country']);
		}

		if (_.indexOf(lgaArr, csrData['lga']) == -1) {
			num_lga += 1;
		}

		if (_.indexOf(stateArr, csrData['state']) == -1) {
			num_state += 1;
		}

		if (_.indexOf(countryArr, csrData['country']) == -1) {
			num_country += 1;
		}

		for (let col of defaultCsrCols) {
			monthlyData[col] = csrData[col];
		}

		monthlyData['expenditure'] 		= expenditure;
		monthlyData['csr_offering'] 	= csr_offering;
		monthlyData['beneficiaries'] 	= beneficiaries;
		monthlyData['souls'] 			= souls;
		monthlyData['num_lga']			= num_lga;
		monthlyData['num_state']		= num_state;
		monthlyData['num_country']		= num_country;
		monthlyData['num_activity']		= num_activity;

		return monthlyData;
	} catch (error) {
		console.error(error);

		return {
			error: error.message
		}
	}
}

const deleteCsrReport = asyncCatchRegular(async (req, res, _next) => {
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
});

const getMonthlyReport = asyncCatchRegular(async (req, res, _next) => {
	const monthlyReport = await getDataFromDb(req, db('monthly_csr_reports'));

	if (monthlyReport) {
		const modifyReports = async report => {
			const { month, year } = report;
			let csrFiles = await getDataFromDb(req, db('csr_images'), { month, year});
			if (csrFiles) {
				report['num_files'] = csrFiles.length;
			} else {
				report['num_files'] = 0
			}
			
			return report
		};

		const addFilesToReport = monthlyReport.map(modifyReports);

		const monthlyCsrReports = await Promise.all(addFilesToReport);

		return res.status(200).json({
			status: 'success',
			data: monthlyCsrReports
		});
	} else {
		return res.status(404).json({
			status: 'fail',
			message: 'No data found'
		});
	}
});

export { 
	getCsrReport, 
	createCsrReport,
	deleteCsrReport,
	getMonthlyReport
};