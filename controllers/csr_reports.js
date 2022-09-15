import db from '../services/db.js';
import isEmpty from 'lodash/isEmpty.js';
import isArray from 'lodash/isArray.js';
import _ from 'lodash';
import { insertIntoDb, getDataFromDb, updateDb, deleteFromDb } from '../utils/dbOps.js';
import { asyncCatchInsert, asyncCatchRegular, insertOpsHelper, updateOpsHelper } from '../utils/helpers.js';
import { getQueryData } from '../utils/getQueryData.js';

const getCsrReport = asyncCatchRegular(async (req, res, _next) => {
	const { query_data, limitNum, pageNum, sortBy, sortOrder } = getQueryData(req);

	const modifyReports = async report => {
		const csrFiles = await getDataFromDb(req, db('csr_files'), { report_id: report.id });
		
		if (csrFiles) {
			for (let csrFile of csrFiles) {
				const file_key = csrFile.file_key
				const file_path = `${process.env.AWS_BUCKET_URL}/${file_key}`;
				csrFile['file_path'] = file_path;
			}

			report['csr_files'] = csrFiles;
			report['num_files'] = csrFiles.length;
		} else {
			report['csr_files'] = [];
			report['num_files'] = 0
		}

		return report;
	}

	const reports = await db('csr_reports')
						.select('csr_reports.*', 'csr_categories.cat_name', 'csr_sub_categories.sub_cat_name')
						.join('csr_categories', 'csr_reports.category_id', 'csr_categories.id')
						.join('csr_sub_categories', 'csr_reports.sub_category_id', 'csr_sub_categories.id')
						.where(query_data)
						.orderBy(sortBy, sortOrder)
						.limit(limitNum)
						.offset(pageNum * limitNum);

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

const createCsrReport = asyncCatchInsert(async (req, res, _next) => {
	const data = req.body;

	const { parish_code, month, year, sub_category_id } = data;

	const foundMonthlyReport = await getDataFromDb(req, db('monthly_csr_reports'), {
		sub_category_id: sub_category_id,
		parish_code: parish_code,
		month: month,
		year: year
	});

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

		if (updateMonthlyReportData) {
			await insertOpsHelper(insertIntoDb, db('csr_reports'), data, res);
		} else {
			return res.status(400).json({
				status: 'error',
				message: 'Error updating monthly data.'
			});
		}
	} else {
		// if csr Report for this month does not exist, create
		const insertMonthlyReportData = await insertIntoDb(db('monthly_csr_reports'), csrMonthlyData);

		if (insertMonthlyReportData) {
			await insertOpsHelper(insertIntoDb, db('csr_reports'), data, res);
		} else {
			return res.status(400).json({
				status: 'error',
				message: 'Error inserting monthly data.'
			});
		}
	}
})

const updateCsrReport = async (req, res, _next) => {
	const data = req.body;

	const { id } = req.params;

	const foundCsrReport = await getDataFromDb(req, db('csr_reports'), { id });

	const foundMonthlyReport = await getDataFromDb(req, db('monthly_csr_reports'), { id });

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

			if (updateMonthlyReportData) {
				await updateOpsHelper(updateDb, db('csr_reports'), data, { id: foundCsrReport[0].id }, res);
			} else {
				return res.status(400).json({
					status: 'error',
					message: 'Error updating monthly data.'
				});
			}
		} else {
			// if report for this month does not exist, create
			const insertMonthlyReportData = insertIntoDb(db('monthly_csr_reports'), csrMonthlyData);

			if (insertMonthlyReportData) {
				await updateOpsHelper(updateDb, db('csr_reports'), data, { id: foundCsrReport[0].id }, res);
			} else {
				return res.status(400).json({
					status: 'error',
					message: 'Error inserting monthly data.'
				});
			}
		}
	} else {
		return res.status(404).json({
			status: 'fail',
			message: 'No data found'
		});
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
		monthlyData['income_utilization']	= csr_offering - expenditure;

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
	const { query_data, limitNum, pageNum, sortBy, sortOrder } = getQueryData(req);
	const monthlyReport = await db('monthly_csr_reports')
							.select('monthly_csr_reports.*', 'csr_categories.cat_name as category_name', 'csr_sub_categories.sub_cat_name as sub_category_name')
							.join('csr_categories', 'csr_categories.id', 'monthly_csr_reports.category_id')
							.join('csr_sub_categories', 'csr_sub_categories.id', 'monthly_csr_reports.sub_category_id')
							.where(query_data)
							.orderBy(sortBy, sortOrder)
							.limit(limitNum)
							.offset(pageNum * limitNum);

	if (monthlyReport) {
		const modifyReports = async report => {
			const { category_id, sub_category_id, parish_code, month, year } = report;
			let csrFiles = await getDataFromDb(req, db('csr_files'), { category_id, sub_category_id, parish_code, month, year});
			if (csrFiles) {
			    for (let csrFile of csrFiles) {
    				const file_key = csrFile.file_key
    				const file_path = `${process.env.AWS_BUCKET_URL}/${file_key}`;
    				csrFile['file_path'] = file_path;
    			}
    			
				report['csr_files'] = csrFiles;
				report['num_files'] = csrFiles.length;
			} else {
				report['csr_files'] = [];
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

const getMonthlyReportByCategory = asyncCatchRegular(async (req, res, _next) => {
	const { category_id, parish_code, month, year } = req.query;

	const queryData = { category_id, parish_code, month, year };

	const csrComputableItemsObj = {
		expenditure: 'expenditure', 
		csr_offering: 'csr_offering',
		beneficiaries: 'beneficiaries',
		souls: 'souls',
		num_lga: 'num_lga',
		num_state: 'num_state',
		num_country: 'num_country',
		num_activity: 'num_activity'
	};

	const defaultCsrCols = [
		'category_id', 'parish_code', 'area_code', 'zone_code', 'prov_code', 'reg_code', 'sub_cont_code', 'cont_code', 'month', 'year'
	];

	const monthlyCatSum = await db('monthly_csr_reports')
							.select('monthly_csr_reports.category_id', 'csr_categories.cat_name')
							.join('csr_categories', 'csr_categories.id', 'monthly_csr_reports.category_id')
							.sum(csrComputableItemsObj)
							.where(queryData)
							.groupBy('monthly_csr_reports.category_id', 'csr_categories.cat_name');
	
	let csrFiles = await getDataFromDb(req, db('csr_files'), queryData);

	const monthlyCatData = {};

	for (let col of defaultCsrCols) {
		const data = await db('monthly_csr_reports').where(queryData).select(col).first();
		monthlyCatData[col] = data[col];
	}

	for (let col in csrComputableItemsObj) {
		monthlyCatData[col] = monthlyCatSum[0][col];
	}
	
	if (csrFiles) {
	    for (let csrFile of csrFiles) {
			const file_key = csrFile.file_key
			const file_path = `${process.env.AWS_BUCKET_URL}/${file_key}`;
			csrFile['file_path'] = file_path;
		}
		
		monthlyCatData['csr_files'] = csrFiles;
		monthlyCatData['num_files'] = csrFiles.length;
	} else {
		monthlyCatData['csr_files'] = [];
		monthlyCatData['num_files'] = 0
	}

	return res.status(200).json({
		status: 'success',
		data: monthlyCatData
	});
});

const getParishCsrReport = asyncCatchRegular (async (req, res, _next) => {

	const { parish_code, month, year } = req.query;

    const modifyWeeklyReports = async report => {
		const csrFiles = await getDataFromDb(req, db('csr_files'), { report_id: report.id });
		
		if (csrFiles) {
			for (let csrFile of csrFiles) {
				const file_key = csrFile.file_key
				const file_path = `${process.env.AWS_BUCKET_URL}/${file_key}`;
				csrFile['file_path'] = file_path;
			}

			report['csr_files'] = csrFiles;
		    report['num_files'] = csrFiles.length;
		} else {
			report['csr_files'] = [];
			report['num_files'] = 0
		}

		return report;
	}
	
	const modifyMonthlyReports = async report => {
		const { category_id, sub_category_id, parish_code, month, year } = report;
		let csrFiles = await getDataFromDb(req, db('csr_files'), { category_id, sub_category_id, parish_code, month, year});
		if (csrFiles) {
		    for (let csrFile of csrFiles) {
				const file_key = csrFile.file_key
				const file_path = `${process.env.AWS_BUCKET_URL}/${file_key}`;
				csrFile['file_path'] = file_path;
			}
			
			report['csr_files'] = csrFiles;
			report['num_files'] = csrFiles.length;
		} else {
			report['csr_files'] = [];
			report['num_files'] = 0
		}
		
		return report
	};

	const csrComputableItemsObj = {
		expenditure: 'expenditure', 
		csr_offering: 'csr_offering',
		beneficiaries: 'beneficiaries',
		souls: 'souls',
		num_lga: 'num_lga',
		num_state: 'num_state',
		num_country: 'num_country',
		num_activity: 'num_activity'
	};

	const defaultCsrCols = [
		'parish_code', 'area_code', 'zone_code', 'prov_code', 'reg_code', 'sub_cont_code', 'cont_code', 'month', 'year'
	];

	const weeklyReports = await db('csr_reports')
							.select('csr_reports.*', 'csr_categories.cat_name as category_name', 'csr_sub_categories.sub_cat_name as sub_category_name')
							.join('csr_categories', 'csr_categories.id', 'csr_reports.category_id')
							.join('csr_sub_categories', 'csr_sub_categories.id', 'csr_reports.sub_category_id')
							.where({ parish_code, month, year });


	const monthlyReport = await db('monthly_csr_reports')
							.select('monthly_csr_reports.*', 'csr_categories.cat_name as category_name', 'csr_sub_categories.sub_cat_name as sub_category_name')
							.join('csr_categories', 'csr_categories.id', 'monthly_csr_reports.category_id')
							.join('csr_sub_categories', 'csr_sub_categories.id', 'monthly_csr_reports.sub_category_id')
							.where({ parish_code, month, year });

	const monthlyCatSum = await db('monthly_csr_reports')
							.select('monthly_csr_reports.category_id', 'csr_categories.cat_name')
							.join('csr_categories', 'csr_categories.id', 'monthly_csr_reports.category_id')
							.sum(csrComputableItemsObj)
							.where({ parish_code, month, year })
							.groupBy('monthly_csr_reports.category_id', 'csr_categories.cat_name');

	const monthlyReportByCategories = [];

	for (let monthlyCat of monthlyCatSum) {
		const { category_id, cat_name } = monthlyCat;

		let csrFiles = await getDataFromDb(req, db('csr_files'), { category_id, parish_code, month, year });

		const monthlyCatData = {};

		monthlyCatData['category_name'] = cat_name;
		monthlyCatData['category_id'] = category_id;

		for (let col of defaultCsrCols) {
			const data = await db('monthly_csr_reports').where({ category_id, parish_code, month, year }).select(col).first();
			monthlyCatData[col] = data[col];
		}

		for (let col in csrComputableItemsObj) {
			monthlyCatData[col] = monthlyCatSum[0][col];
		}
		
		if (csrFiles) {
			for (let csrFile of csrFiles) {
				const file_key = csrFile.file_key
				const file_path = `${process.env.AWS_BUCKET_URL}/${file_key}`;
				csrFile['file_path'] = file_path;
			}
			
			monthlyCatData['csr_files'] = csrFiles;
			monthlyCatData['num_files'] = csrFiles.length;
		} else {
			monthlyCatData['csr_files'] = [];
			monthlyCatData['num_files'] = 0
		}

		monthlyReportByCategories.push(monthlyCatData);
	}

	if (weeklyReports && monthlyReport) {
	    const addFilesToWeeklyReport = weeklyReports.map(modifyWeeklyReports);
		const addFilesToMonthlyReport = monthlyReport.map(modifyMonthlyReports);

		const weeklyCsrReports = await Promise.all(addFilesToWeeklyReport);
		const monthlyCsrReports = await Promise.all(addFilesToMonthlyReport);
		
		return res.status(200).json({
			status: 'success', weeklyCsrReports, monthlyCsrReports, monthlyReportByCategories
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
	updateCsrReport,
	deleteCsrReport,
	getMonthlyReport,
	getMonthlyReportByCategory,
	getParishCsrReport
};