import { config } from 'dotenv';
import db from '../services/db.js';
import isEmpty from 'lodash/isEmpty.js';
import { getQueryData } from '../utils/getQueryData.js';
import { insertIntoDb, getDataFromDb, updateDb, deleteFromDb } from '../utils/dbOps.js';
import { asyncCatchInsert, asyncCatchRegular, insertOpsHelper, updateOpsHelper } from '../utils/helpers.js';

config();

// Get all attendance reports or specific ones based on query parameters
const getAttendance = asyncCatchRegular(async (req, res, _next) => {
	const modifyReports = async report => {
		const source_doc = await getDataFromDb(req, db('source_docs'), { report_att_id: report.id });

		if (source_doc) {
			const file_key = source_doc[0]['file_key']
			const file_path = `${process.env.AWS_BUCKET_URL}/${file_key}`;
			source_doc[0]['file_path'] = file_path;
			report['source_doc'] = source_doc;
		}

		return report;
	}

	const { query_data, pageNum, limitNum, sortBy, sortOrder } = getQueryData(req);

	const reports = await db('reports_att')
						.select('reports_att.*', 'services.service_name')
						.join('services', 'reports_att.service_id', 'services.id')
						.where(query_data)
						.limit(limitNum)
						.offset(pageNum * limitNum)
						.orderBy(sortBy, sortOrder);
	
	if (reports) {
		const addFilesToReport = reports.map(modifyReports);

		const attReports = await Promise.all(addFilesToReport);

		return res.status(200).json({
			status: 'success',
			data: attReports
		});
	} else {
		return res.status(404).json({
			status: 'fail',
			message: 'No data found'
		});
	}
});

const createAttendance = asyncCatchInsert(async (req, res, _next) => {
	const data = req.body;

	const { service_id, parish_code, week, month, year, men, women, children, adult_men, adult_women, youth_men, youth_women, teenagers, youngstars } = data;

	if (men == undefined && women == undefined && children == undefined) {
		data['men'] = adult_men + youth_men;
		data['women'] = adult_women + youth_women;
		data['children'] = teenagers + youngstars;

		const totalAdults = adult_men + adult_women;
		const totalYouths = youth_men + youth_women;
		const totalAtt = totalAdults + totalYouths + teenagers + youngstars;

		data['total_adults'] = totalAdults;
		data['total_youths'] = totalYouths;
		data['total_att'] = totalAtt;
	} else {
		data['total_att'] = men + women + children;
	}

	const foundAttendanceData = await getDataFromDb(req, db('reports_att'), { service_id, parish_code, week, month, year });

	const foundMonthlyAtt = await getDataFromDb(req, db('reports_att_monthly'), {
		service_id: service_id,
		parish_code: parish_code,
		month: month,
		year: year
	});

	// if attendance exists, update
	if (foundAttendanceData) {
		const monthlyAttData = await computeMonthlyData(req, data, 'update');

		if (isEmpty(monthlyAttData) || monthlyAttData.error) {
			return res.status(400).json({
				status: 'error',
				message: 'Error updating monthly data.'
			});
		}
		
		if (foundMonthlyAtt) {
			// if attendance for this month exists, update
			const updateMonthlyAttData = await updateDb(db('reports_att_monthly'), monthlyAttData, { id: foundMonthlyAtt[0].id });
			await updateOpsHelper(updateDb, updateMonthlyAttData, db('reports_att'), data, { id: foundAttendanceData[0].id }, res);
		} else {
			// if attendance for this month does not exist, create
			const createMonthlyAttData = insertIntoDb(db('reports_att_monthly'), monthlyAttData);
			await updateOpsHelper(updateDb, createMonthlyAttData, db('reports_att'), data, { id: foundAttendanceData[0].id }, res);
		}
	} else {
		const monthlyAttData = await computeMonthlyData(req, data, 'insert');

		if (isEmpty(monthlyAttData) || monthlyAttData.error) {
			return res.status(400).json({
				status: 'error',
				message: 'Error inserting monthly data.'
			});
		}

		if (foundMonthlyAtt) {
			// if attendance for this month exists, update
			const updateMonthlyAttData = await updateDb(db('reports_att_monthly'), monthlyAttData, { id: foundMonthlyAtt[0].id });
			await insertOpsHelper(insertIntoDb, updateMonthlyAttData, db('reports_att'), data, res);
		} else {
			// if attendance for this month does not exist, create
			const insertMonthlyAttData = await insertIntoDb(db('reports_att_monthly'), monthlyAttData);
			await insertOpsHelper(insertIntoDb, insertMonthlyAttData, db('reports_att'), data, res);
		}
	}
});

const computeMonthlyData = async (req, attendanceData, ops) => {
	try {
		const defaultAttQuery = {
			service_id: attendanceData['service_id'],
			parish_code: attendanceData['parish_code'],
			month: attendanceData['month'],
			year: attendanceData['year']
		};

		const furtherReportQuery = {
			parish_code: attendanceData['parish_code'],
			month: attendanceData['month'],
			year: attendanceData['year']
		};

		const peopleObj = {
			men: 'men',
			women: 'women',
			children: 'children',
			adult_men: 'adult_men', 
			adult_women: 'adult_women',
			youth_men: 'youth_men', 
			youth_women: 'youth_women',
			teenagers: 'teenagers',
			youngstars: 'youngstars'
		};

		const furtherReportObj = {
			marriages: 'marriages', 
			births: 'births',
			demises: 'demises',
			converts: 'converts',
			first_timers: 'first_timers',
			hf_centres: 'hf_centres',
			unord_ministers: 'unord_ministers',
			bapt_workers: 'bapt_workers',
			bapt_members: 'bapt_members',
			att_s_prog: 'att_s_prog',
			att_vigil: 'att_vigil',
			new_workers: 'new_workers',
			asst_pastors: 'asst_pastors',
			full_pastors: 'full_pastors',
			dcns: 'dcns',
			workers_at_lgaf: 'workers_at_lgaf',
			souls_at_lgaf: 'souls_at_lgaf'
		};

		const defaultAttColumns = [
			'service_id', 'parish_code', 'area_code', 'zone_code', 'prov_code', 'reg_code', 'sub_cont_code', 'cont_code', 'month', 'year'
		];

		const monthlyData = {};
	
		const weeksCount = await db('reports_att').count('week').where(defaultAttQuery);

		let monthlySum, numWeeks;
	
		if (ops === 'insert') {
			monthlySum = await db('reports_att').sum(peopleObj).where(defaultAttQuery);
			numWeeks = Number(weeksCount[0].count) + 1;
		}

		if (ops === 'update') {
			const dbData = await getDataFromDb(req, db('reports_att'), {
				service_id: attendanceData['service_id'],
				parish_code: attendanceData['parish_code'],
				week: attendanceData['week'],
				month: attendanceData['month'],
				year: attendanceData['year'],
				service_date: attendanceData['service_date']
			});

			monthlySum = await db('reports_att')
								.sum(peopleObj)
								.where(defaultAttQuery)
								.andWhereNot({id: dbData[0].id});
			numWeeks = Number(weeksCount[0].count);
		}

		const men 			= (monthlySum.length > 0 ? Number(monthlySum[0]['men']) : 0) + (attendanceData['men'] ? attendanceData['men'] : 0);
		const women 		= (monthlySum.length > 0 ? Number(monthlySum[0]['women']) : 0) + (attendanceData['women'] ? attendanceData['women'] : 0);
		const children 		= (monthlySum.length > 0 ? Number(monthlySum[0]['children']) : 0) + (attendanceData['children'] ? attendanceData['children'] : 0);
		const adultMen 		= (monthlySum.length > 0 ? Number(monthlySum[0]['adult_men']) : 0) + (attendanceData['adult_men'] ? attendanceData['adult_men'] : 0);
		const adultWomen 	= (monthlySum.length > 0 ? Number(monthlySum[0]['adult_women']) : 0) + (attendanceData['adult_women'] ? attendanceData['adult_women'] : 0);
		const youthMen 		= (monthlySum.length > 0 ? Number(monthlySum[0]['youth_men']) : 0) + (attendanceData['youth_men'] ? attendanceData['youth_men'] : 0);
		const youthWomen 	= (monthlySum.length > 0 ? Number(monthlySum[0]['youth_women']) : 0) + (attendanceData['youth_women'] ? attendanceData['youth_women'] : 0);
		const teenagers 	= (monthlySum.length > 0 ? Number(monthlySum[0]['teenagers']) : 0) + (attendanceData['teenagers'] ? attendanceData['teenagers'] : 0);
		const youngstars 	= (monthlySum.length > 0 ? Number(monthlySum[0]['youngstars']) : 0) + (attendanceData['youngstars'] ? attendanceData['youngstars'] : 0);

		const totalAdults = adultMen + adultWomen;
		const totalYouths = youthMen + youthWomen;
		const totalAtt = men + women + children;

		const avgMen = Math.round(men / numWeeks);
		const avgWomen = Math.round(women / numWeeks);
		const avgChildren = Math.round(children / numWeeks);
		const avgAdultMen = Math.round(adultMen / numWeeks);
		const avgAdultWomen = Math.round(adultWomen / numWeeks);
		const avgYouthMen = Math.round(youthMen / numWeeks);
		const avgYouthWomen = Math.round(youthWomen / numWeeks);
		const avgTeenagers = Math.round(teenagers / numWeeks);
		const avgYoungstars = Math.round(youngstars / numWeeks);

		const avgAdults = avgAdultMen + avgAdultWomen;
		const avgYouths = avgYouthMen + avgYouthWomen;
		const avgTotalAtt = avgMen + avgWomen + avgChildren;
	
		const furtherReportsMonthlySum = await db('reports_att').sum(furtherReportObj).where(furtherReportQuery);

		for (let col of defaultAttColumns) {
			monthlyData[col] = attendanceData[col];
		}

		for (let value of Object.values(furtherReportObj)) {
			monthlyData[value] = (furtherReportsMonthlySum.length > 0 ? Number(furtherReportsMonthlySum[0][value]) : 0) + (attendanceData[value] ? attendanceData[value] : 0);
		}

		monthlyData['men'] 			= men;
		monthlyData['women'] 		= women;
		monthlyData['children'] 	= children;
		monthlyData['adult_men'] 	= adultMen;
		monthlyData['adult_women'] 	= adultWomen;
		monthlyData['youth_men'] 	= youthMen;
		monthlyData['youth_women'] 	= youthWomen;
		monthlyData['teenagers'] 	= teenagers;
		monthlyData['youngstars'] 	= youngstars;
		monthlyData['total_adults'] = totalAdults;
		monthlyData['total_youths'] = totalYouths;
		monthlyData['total_att'] 	= totalAtt;
		monthlyData['avg_men'] 		= avgMen;
		monthlyData['avg_women'] 	= avgWomen;
		monthlyData['avg_children'] 	= avgChildren;
		monthlyData['avg_adult_men'] 	= avgAdultMen;
		monthlyData['avg_adult_women'] 	= avgAdultWomen;
		monthlyData['avg_adults'] 		= avgAdults;
		monthlyData['avg_youth_men'] 	= avgYouthMen;
		monthlyData['avg_youth_women'] 	= avgYouthWomen;
		monthlyData['avg_youths'] 		= avgYouths;
		monthlyData['avg_teenagers'] 	= avgTeenagers;
		monthlyData['avg_youngstars'] 	= avgYoungstars;
		monthlyData['avg_total'] 		= avgTotalAtt;
	
		return monthlyData;
	} catch (error) {
		console.error(error);

		return {
			error: error.message
		}
	}
}

const deleteAttendance = asyncCatchRegular (async (req, res, _next) => {
	const {
		id,
		service_id,
		parish_code,
		area_code,
		zone_code,
		province_code,
		region_code,
		week,
		service_date,
		month,
		year
	} = req.query;

	let query = {};

	if (id) query.id = id;
	if (service_id) query.service_id = service_id;
	if (parish_code) query.parish_code = parish_code;
	if (area_code) query.area_code = area_code;
	if (zone_code) query.zone_code = zone_code;
	if (province_code) query.province_code = province_code;
	if (region_code) query.region_code = region_code;
	if (week) query.week = week;
	if (service_date) query.service_date = service_date;
	if (month) query.month = month;
	if (year) query.year = year;

	const attendance = await deleteFromDb(db('reports_att'), query);

	if (attendance) {
		return res.status(200).json({
			status: 'success',
			message: 'Attendance deleted successfully'
		});
	} else {
		return res.status(404).json({
			status: 'fail',
			message: 'No attendance found for the query data supplied'
		});
	}
});

const getMonthlyAttendance = asyncCatchRegular (async (req, res, _next) => {
	const { query_data, pageNum, limitNum, sortBy, sortOrder } = getQueryData(req);

	const monthlyReport = await db('reports_att_monthly')
						.select('reports_att_monthly.*', 'services.service_name')
						.join('services', 'reports_att_monthly.service_id', 'services.id')
						.where(query_data)
						.limit(limitNum)
						.offset(pageNum * limitNum)
						.orderBy(sortBy, sortOrder);

	if (monthlyReport.length > 0) {
		return res.status(200).json({
			status: 'success',
			data: monthlyReport
		});
	} else {
		return res.status(404).json({
			status: 'fail',
			message: 'No data found'
		});
	}
});

const getParishAttendance = asyncCatchRegular (async (req, res, _next) => {

	const { query_data, pageNum, limitNum, sortBy, sortOrder } = getQueryData(req);

	const weeklyReports = await db('reports_att')
							.select('reports_att.*', 'services.service_name')
							.join('services', 'reports_att.service_id', 'services.id')
							.where(query_data)
							.limit(limitNum)
							.offset(pageNum * limitNum)
							.orderBy(sortBy, sortOrder);

	const monthlyReport = await db('reports_att_monthly')
							.select('reports_att_monthly.*', 'services.service_name')
							.join('services', 'reports_att_monthly.service_id', 'services.id')
							.where(query_data)
							.limit(limitNum)
							.offset(pageNum * limitNum)
							.orderBy(sortBy, sortOrder);

	if (weeklyReports && monthlyReport) {
		return res.status(200).json({
			status: 'success', weeklyReports, monthlyReport
		});
	} else {
		return res.status(404).json({
			status: 'fail',
			message: 'No data found'
		});
	}
});

const getMonthlyAttByChurchHierarchy = asyncCatchRegular (async (req, res, _next) => {
	// query_data = { service_id, area_code/zone_code/prov_code/reg_code/sub_cont_code/cont_code, month, year }

	const { query_data, pageNum, limitNum, sortBy, sortOrder } = getQueryData(req);

	const { area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code } = query_data;

	const peopleObj = {
		men: 'men',
		women: 'women',
		children: 'children',
		adult_men: 'adult_men', 
		adult_women: 'adult_women',
		youth_men: 'youth_men', 
		youth_women: 'youth_women',
		teenagers: 'teenagers',
		youngstars: 'youngstars',
		total_att: 'total_att',
		avg_men: 'avg_men',
		avg_women: 'avg_women',
		avg_children: 'avg_children',
		avg_adult_men: 'avg_adult_men',
		avg_adult_women: 'avg_adult_women',
		avg_adults: 'avg_adults',
		avg_youth_men: 'avg_youth_men',
		avg_youth_women: 'avg_youth_women',
		avg_youths: 'avg_youths',
		avg_teenagers: 'avg_teenagers',
		avg_youngstars: 'avg_youngstars',
		avg_total: 'avg_total',
		marriages: 'marriages', 
		births: 'births',
		demises: 'demises',
		converts: 'converts',
		first_timers: 'first_timers',
		hf_centres: 'hf_centres',
		unord_ministers: 'unord_ministers',
		bapt_workers: 'bapt_workers',
		bapt_members: 'bapt_members',
		att_s_prog: 'att_s_prog',
		att_vigil: 'att_vigil',
		new_workers: 'new_workers',
		asst_pastors: 'asst_pastors',
		full_pastors: 'full_pastors',
		dcns: 'dcns',
		workers_at_lgaf: 'workers_at_lgaf',
		souls_at_lgaf: 'souls_at_lgaf'
	};

	const defaultAttColumns = area_code && {
		service_id: 'service_id',
		service_name: 'service_name',
		area_code: 'area_code',
		zone_code: 'zone_code',
		prov_code: 'prov_code',
		reg_code: 'reg_code',
		sub_cont_code: 'sub_cont_code',
		cont_code: 'cont_code',
		month: 'month',
		year: 'year'
	} || zone_code && { 
		service_id: 'service_id',
		service_name: 'service_name',
		zone_code: 'zone_code',
		prov_code: 'prov_code',
		reg_code: 'reg_code',
		sub_cont_code: 'sub_cont_code',
		cont_code: 'cont_code',
		month: 'month',
		year: 'year'
	} || prov_code && {
		service_id: 'service_id',
		service_name: 'service_name',
		prov_code: 'prov_code',
		reg_code: 'reg_code',
		sub_cont_code: 'sub_cont_code',
		cont_code: 'cont_code',
		month: 'month',
		year: 'year'
	} || reg_code && {
		service_id: 'service_id',
		service_name: 'service_name',
		reg_code: 'reg_code',
		sub_cont_code: 'sub_cont_code',
		cont_code: 'cont_code',
		month: 'month',
		year: 'year'
	} || sub_cont_code && {
		service_id: 'service_id',
		service_name: 'service_name',
		sub_cont_code: 'sub_cont_code',
		cont_code: 'cont_code',
		month: 'month',
		year: 'year'
	} || cont_code && {
		service_id: 'service_id',
		service_name: 'service_name',
		cont_code: 'cont_code',
		month: 'month',
		year: 'year'
	} || {
		service_id: 'service_id',
		service_name: 'service_name',
		parish_code: 'parish_code',
		area_code: 'area_code',
		zone_code: 'zone_code',
		prov_code: 'prov_code',
		reg_code: 'reg_code',
		sub_cont_code: 'sub_cont_code',
		cont_code: 'cont_code',
		month: 'month',
		year: 'year'
	};

	const monthlyAttReport = await db('reports_att_monthly')
								.select('reports_att_monthly.*', 'services.service_name')
								.join('services', 'reports_att_monthly.service_id', 'services.id')
								.where(query_data)
								.limit(limitNum)
								.offset(pageNum * limitNum)
								.orderBy(sortBy, sortOrder);

	const monthlySum = await db('reports_att_monthly')
								.select('reports_att_monthly.service_id', 'services.service_name')
								.join('services', 'reports_att_monthly.service_id', 'services.id')
								.sum(peopleObj)
								.where(query_data)
								.groupBy('reports_att_monthly.service_id', 'services.service_name');
	
	const monthlyData = monthlySum.map(item => {
		const newItem = {};
		for (const report of monthlyAttReport) {
			for (const report_key in report) {
				if (report_key in defaultAttColumns) {
					newItem[report_key] = report[report_key];
				}
			}
		}

		for (const key in item) {
			if (key in peopleObj) {
				newItem[peopleObj[key]] = item[key];
			} else {
				newItem[key] = item[key];
			}
		}

		return newItem;
	});

	if (monthlyData.length > 0) {
		return res.status(200).json({
			status: 'success',
			data: monthlyData
		});
	} else {
		return res.status(404).json({
			status: 'fail',
			message: 'No data found'
		});
	}
});

const getMonthlyProgressReport = asyncCatchRegular (async (req, res, _next) => {
	// query_data = { parish_code/area_code/zone_code/prov_code/reg_code/sub_cont_code/cont_code, month, year }

	const { query_data, pageNum, limitNum, sortBy, sortOrder } = getQueryData(req);

	const { parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code, month } = query_data;

	const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const monthIndex = months.indexOf(month);
	const prevMonth = months[monthIndex - 1];

	const prevMonthQuery = { ...query_data };
	prevMonthQuery.month = prevMonth;

	const peopleObj = {
		men: 'men',
		women: 'women',
		children: 'children',
		adult_men: 'adult_men', 
		adult_women: 'adult_women',
		youth_men: 'youth_men', 
		youth_women: 'youth_women',
		teenagers: 'teenagers',
		youngstars: 'youngstars',
		total_att: 'total_att',
		avg_men: 'avg_men',
		avg_women: 'avg_women',
		avg_children: 'avg_children',
		avg_adult_men: 'avg_adult_men',
		avg_adult_women: 'avg_adult_women',
		avg_adults: 'avg_adults',
		avg_youth_men: 'avg_youth_men',
		avg_youth_women: 'avg_youth_women',
		avg_youths: 'avg_youths',
		avg_teenagers: 'avg_teenagers',
		avg_youngstars: 'avg_youngstars',
		avg_total: 'avg_total',
		marriages: 'marriages', 
		births: 'births',
		demises: 'demises',
		converts: 'converts',
		first_timers: 'first_timers',
		hf_centres: 'hf_centres',
		unord_ministers: 'unord_ministers',
		bapt_workers: 'bapt_workers',
		bapt_members: 'bapt_members',
		att_s_prog: 'att_s_prog',
		att_vigil: 'att_vigil',
		new_workers: 'new_workers',
		asst_pastors: 'asst_pastors',
		full_pastors: 'full_pastors',
		dcns: 'dcns',
		workers_at_lgaf: 'workers_at_lgaf',
		souls_at_lgaf: 'souls_at_lgaf'
	};

	const defaultAttColumns = parish_code && {
		service_id: 'service_id',
		service_name: 'service_name',
		parish_code: 'parish_code',
		area_code: 'area_code',
		zone_code: 'zone_code',
		prov_code: 'prov_code',
		reg_code: 'reg_code',
		sub_cont_code: 'sub_cont_code',
		cont_code: 'cont_code',
		month: 'month',
		year: 'year'
	} || area_code && {
		service_id: 'service_id',
		service_name: 'service_name',
		area_code: 'area_code',
		zone_code: 'zone_code',
		prov_code: 'prov_code',
		reg_code: 'reg_code',
		sub_cont_code: 'sub_cont_code',
		cont_code: 'cont_code',
		month: 'month',
		year: 'year'
	} || zone_code && { 
		service_id: 'service_id',
		service_name: 'service_name',
		zone_code: 'zone_code',
		prov_code: 'prov_code',
		reg_code: 'reg_code',
		sub_cont_code: 'sub_cont_code',
		cont_code: 'cont_code',
		month: 'month',
		year: 'year'
	} || prov_code && {
		service_id: 'service_id',
		service_name: 'service_name',
		prov_code: 'prov_code',
		reg_code: 'reg_code',
		sub_cont_code: 'sub_cont_code',
		cont_code: 'cont_code',
		month: 'month',
		year: 'year'
	} || reg_code && {
		service_id: 'service_id',
		service_name: 'service_name',
		reg_code: 'reg_code',
		sub_cont_code: 'sub_cont_code',
		cont_code: 'cont_code',
		month: 'month',
		year: 'year'
	} || sub_cont_code && {
		service_id: 'service_id',
		service_name: 'service_name',
		sub_cont_code: 'sub_cont_code',
		cont_code: 'cont_code',
		month: 'month',
		year: 'year'
	} || cont_code && {
		service_id: 'service_id',
		service_name: 'service_name',
		cont_code: 'cont_code',
		month: 'month',
		year: 'year'
	} || {
		service_id: 'service_id',
		service_name: 'service_name',
		parish_code: 'parish_code',
		area_code: 'area_code',
		zone_code: 'zone_code',
		prov_code: 'prov_code',
		reg_code: 'reg_code',
		sub_cont_code: 'sub_cont_code',
		cont_code: 'cont_code',
		month: 'month',
		year: 'year'
	};

	const monthlyAttReport = await db('reports_att_monthly')
								.select('reports_att_monthly.*', 'services.service_name')
								.join('services', 'reports_att_monthly.service_id', 'services.id')
								.where(query_data)
								.limit(limitNum)
								.offset(pageNum * limitNum)
								.orderBy(sortBy, sortOrder);

	const prevMonthlyAttReport = await db('reports_att_monthly')
								.select('reports_att_monthly.*', 'services.service_name')
								.join('services', 'reports_att_monthly.service_id', 'services.id')
								.where(prevMonthQuery)
								.limit(limitNum)
								.offset(pageNum * limitNum)
								.orderBy(sortBy, sortOrder);

	const monthlySum = await db('reports_att_monthly')
								.select('reports_att_monthly.service_id', 'services.service_name')
								.join('services', 'reports_att_monthly.service_id', 'services.id')
								.sum(peopleObj)
								.where(query_data)
								.groupBy('reports_att_monthly.service_id', 'services.service_name');

	const prevMonthlySum = await db('reports_att_monthly')
								.select('reports_att_monthly.service_id', 'services.service_name')
								.join('services', 'reports_att_monthly.service_id', 'services.id')
								.sum(peopleObj)
								.where(prevMonthQuery)
								.groupBy('reports_att_monthly.service_id', 'services.service_name');
	
	const monthlyData = monthlySum.map(item => {
		const newItem = {};
		for (const report of monthlyAttReport) {
			for (const report_key in report) {
				if (report_key in defaultAttColumns) {
					newItem[report_key] = report[report_key];
				}
			}
		}

		for (const key in item) {
			if (key in peopleObj) {
				newItem[peopleObj[key]] = item[key];
			} else {
				newItem[key] = item[key];
			}
		}

		return newItem;
	});

	const prevMonthlyData = prevMonthlySum.map(item => {
		const newItem = {};
		for (const report of prevMonthlyAttReport) {
			for (const report_key in report) {
				if (report_key in defaultAttColumns) {
					newItem[report_key] = report[report_key];
				}
			}
		}

		for (const key in item) {
			if (key in peopleObj) {
				newItem[peopleObj[key]] = item[key];
			} else {
				newItem[key] = item[key];
			}
		}

		return newItem;
	});

	const thisMonthAvg = monthlyData.find(item => (item.service_id === 1)) ? Number(monthlyData.find(item => (item.service_id === 1)).avg_total) : 0;
	const prevMonthAvg = prevMonthlyData.find(item => (item.service_id === 1)) ? Number(prevMonthlyData.find(item => (item.service_id === 1)).avg_total) : 0;

	const thisMonthMen = monthlyData.find(item => (item.service_id === 1)) ? Number(monthlyData.find(item => (item.service_id === 1)).avg_men) : 0;
	const prevMonthMen = prevMonthlyData.find(item => (item.service_id === 1)) ? Number(prevMonthlyData.find(item => (item.service_id === 1)).avg_men) : 0;

	const thisMonthWomen = monthlyData.find(item => (item.service_id === 1)) ? Number(monthlyData.find(item => (item.service_id === 1)).avg_women) : 0;
	const prevMonthWomen = prevMonthlyData.find(item => (item.service_id === 1)) ? Number(prevMonthlyData.find(item => (item.service_id === 1)).avg_women) : 0;

	const thisMonthChildren = monthlyData.find(item => (item.service_id === 1)) ? Number(monthlyData.find(item => (item.service_id === 1)).avg_children) : 0;
	const prevMonthChildren = prevMonthlyData.find(item => (item.service_id === 1)) ? Number(prevMonthlyData.find(item => (item.service_id === 1)).avg_children) : 0;

	const thisMonthConverts = monthlyData.reduce((acc, item) => acc + Number(item.converts), 0);
	const prevMonthConverts = prevMonthlyData.reduce((acc, item) => acc + Number(item.converts), 0);

	const thisMonthBirths = monthlyData.reduce((acc, item) => acc + Number(item.births), 0);
	const prevMonthBirths = prevMonthlyData.reduce((acc, item) => acc + Number(item.births), 0);

	const thisMonthDemises = monthlyData.reduce((acc, item) => acc + Number(item.demises), 0);
	const prevMonthDemises = prevMonthlyData.reduce((acc, item) => acc + Number(item.demises), 0);

	const thisMonthMarriages = monthlyData.reduce((acc, item) => acc + Number(item.marriages), 0);
	const prevMonthMarriages = prevMonthlyData.reduce((acc, item) => acc + Number(item.marriages), 0);

	const thisMonthSundaySchool = monthlyData.find(item => (item.service_id === 2)) ? Number(monthlyData.find(item => (item.service_id === 2)).total_att) : 0;
	const prevMonthSundaySchool = prevMonthlyData.find(item => (item.service_id === 2)) ? Number(prevMonthlyData.find(item => (item.service_id === 2)).total_att) : 0;

	const thisMonthHouseFellowship = monthlyData.find(item => (item.service_id === 3)) ? Number(monthlyData.find(item => (item.service_id === 3)).total_att) : 0;
	const prevMonthHouseFellowship = prevMonthlyData.find(item => (item.service_id === 3)) ? Number(prevMonthlyData.find(item => (item.service_id === 3)).total_att) : 0;

	const thisMonthDiggingDeep = monthlyData.find(item => (item.service_id === 4)) ? Number(monthlyData.find(item => (item.service_id === 4)).total_att) : 0;
	const prevMonthDiggingDeep = prevMonthlyData.find(item => (item.service_id === 4)) ? Number(prevMonthlyData.find(item => (item.service_id === 4)).total_att) : 0;

	const thisMonthFaithClinic = monthlyData.find(item => (item.service_id === 5)) ? Number(monthlyData.find(item => (item.service_id === 5)).total_att) : 0;
	const prevMonthFaithClinic = prevMonthlyData.find(item => (item.service_id === 5)) ? Number(prevMonthlyData.find(item => (item.service_id === 5)).total_att) : 0;

	const combinedData = {
		average_attendance: {
			this_month: thisMonthAvg,
			prev_month: prevMonthAvg,
			difference: thisMonthAvg - prevMonthAvg,
			percent_diff: ((thisMonthAvg - prevMonthAvg) / prevMonthAvg) * 100
		},
		men: {
			this_month: thisMonthMen,
			prev_month: prevMonthMen,
			difference: thisMonthMen - prevMonthMen,
			percent_diff: ((thisMonthMen - prevMonthMen) / prevMonthMen) * 100
		},
		women: {
			this_month: thisMonthWomen,
			prev_month: prevMonthWomen,
			difference: thisMonthWomen - prevMonthWomen,
			percent_diff: ((thisMonthWomen - prevMonthWomen) / prevMonthWomen) * 100
		},
		children: {
			this_month: thisMonthChildren,
			prev_month: prevMonthChildren,
			difference: thisMonthChildren - prevMonthChildren,
			percent_diff: ((thisMonthChildren - prevMonthChildren) / prevMonthChildren) * 100
		},
		converts: {
			this_month: thisMonthConverts,
			prev_month: prevMonthConverts,
			difference: thisMonthConverts - prevMonthConverts,
			percent_diff: ((thisMonthConverts - prevMonthConverts) / prevMonthConverts) * 100
		},
		births: {
			this_month: thisMonthBirths,
			prev_month: prevMonthBirths,
			difference: thisMonthBirths - prevMonthBirths,
			percent_diff: ((thisMonthBirths - prevMonthBirths) / prevMonthBirths) * 100
		},
		demises: {
			this_month: thisMonthDemises,
			prev_month: prevMonthDemises,
			difference: thisMonthDemises - prevMonthDemises,
			percent_diff: ((thisMonthDemises - prevMonthDemises) / prevMonthDemises) * 100
		},
		marriages: {
			this_month: thisMonthMarriages,
			prev_month: prevMonthMarriages,
			difference: thisMonthMarriages - prevMonthMarriages,
			percent_diff: ((thisMonthMarriages - prevMonthMarriages) / prevMonthMarriages) * 100
		},
		sunday_school: {
			this_month: thisMonthSundaySchool,
			prev_month: prevMonthSundaySchool,
			difference: thisMonthSundaySchool - prevMonthSundaySchool,
			percent_diff: ((thisMonthSundaySchool - prevMonthSundaySchool) / prevMonthSundaySchool) * 100
		},
		house_fellowship: {
			this_month: thisMonthHouseFellowship,
			prev_month: prevMonthHouseFellowship,
			difference: thisMonthHouseFellowship - prevMonthHouseFellowship,
			percent_diff: ((thisMonthHouseFellowship - prevMonthHouseFellowship) / prevMonthHouseFellowship) * 100
		},
		digging_deep: {
			this_month: thisMonthDiggingDeep,
			prev_month: prevMonthDiggingDeep,
			difference: thisMonthDiggingDeep - prevMonthDiggingDeep,
			percent_diff: ((thisMonthDiggingDeep - prevMonthDiggingDeep) / prevMonthDiggingDeep) * 100
		},
		faith_clinic: {
			this_month: thisMonthFaithClinic,
			prev_month: prevMonthFaithClinic,
			difference: thisMonthFaithClinic - prevMonthFaithClinic,
			percent_diff: ((thisMonthFaithClinic - prevMonthFaithClinic) / prevMonthFaithClinic) * 100
		}
	}

	return res.status(200).json({
		status: 'success',
		progressData: combinedData
	});
});

export { 
	getAttendance,
	createAttendance,
	deleteAttendance,
	getMonthlyAttendance,
	getParishAttendance,
	getMonthlyAttByChurchHierarchy,
	getMonthlyProgressReport
};