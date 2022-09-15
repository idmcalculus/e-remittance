import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import db from '../services/db.js';
import isEmpty from 'lodash/isEmpty.js';
import isEqual from 'lodash/isEqual.js';
import isArray from 'lodash/isArray.js';
import { getQueryData } from '../utils/getQueryData.js';
import { getDataFromDb, deleteFromDb } from '../utils/dbOps.js';
import { asyncCatchInsert, asyncCatchRegular } from '../utils/helpers.js';

config();

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

	let token = process.env.TOKEN;
	console.log(jwt.decode(token));

	if (isArray(data)) {
		for (const elem of data) {
			const {men, women, children, adult_men, adult_women, youth_men, youth_women, teenagers, youngstars } = elem;

			if (men == undefined && women == undefined && children == undefined) {
				elem['men'] = adult_men + youth_men;
				elem['women'] = adult_women + youth_women;
				elem['children'] = teenagers + youngstars;

				const totalAdults = adult_men + adult_women;
				const totalYouths = youth_men + youth_women;
				const totalAtt = totalAdults + totalYouths + teenagers + youngstars;

				elem['total_adults'] = totalAdults;
				elem['total_youths'] = totalYouths;
				elem['total_att'] = totalAtt;
			} else {
				elem['total_att'] = men + women + children;
			}
		}
	}

	let monthlyAttData = await computeMonthlyData(data);

	if (isEmpty(monthlyAttData) || monthlyAttData.error) {
		return res.status(400).json({
			status: 'error',
			message: monthlyAttData.error || 'No monthly data returned'
		});
	} else {
		let insertedMonthlyData = await db('reports_att_monthly')
									.insert(monthlyAttData)
									.onConflict(['service_id', 'parish_code', 'month', 'year'])
									.merge()
									.returning('*');

		if (insertedMonthlyData.length > 0) {
			let insertedData = await db('reports_att')
								.insert(data)
								.onConflict(['service_id', 'parish_code', 'week', 'month', 'year'])
								.merge()
								.returning('*');

			if (insertedData.length > 0) {
				return res.status(201).json({
					status: 'success',
					message: 'data inserted/updated successfully',
					data: insertedData
				});
			} else {
				return res.status(400).json({
					status: 'error',
					message: 'Error inserting/updating data.'
				});
			}
		} else {
			return res.status(400).json({
				status: 'error',
				message: 'Error inserting/updating monthly data.'
			});
		}
	}
});

const computeMonthlyData = async (data) => {
	try	{
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

		let men = 0,
			women = 0,
			children = 0,
			adultMen = 0, 
			adultWomen = 0,
			youthMen = 0, 
			youthWomen = 0,
			teenagers = 0,
			youngstars = 0,
			numWeeks = data.length;

		for (const elem of data) {
			men += elem['men'] !== undefined ? Number(elem['men']) : 0;
			women += elem['women'] !== undefined ? Number(elem['women']) : 0;
			children += elem['children'] !== undefined ? Number(elem['children']) : 0;
			adultMen += elem['adult_men'] !== undefined ? Number(elem['adult_men']) : 0;
			adultWomen += elem['adult_women'] !== undefined ? Number(elem['adult_women']) : 0;
			youthMen += elem['youth_men'] !== undefined ? Number(elem['youth_men']) : 0;
			youthWomen += elem['youth_women'] !== undefined ? Number(elem['youth_women']) : 0;
			teenagers += elem['teenagers'] !== undefined ? Number(elem['teenagers']) : 0;
			youngstars += elem['youngstars'] !== undefined ? Number(elem['youngstars']) : 0;
		}

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

		for (let col of defaultAttColumns) {
			monthlyData[col] = data[numWeeks - 1][col];
		}

		for (let value of Object.values(furtherReportObj)) {
			monthlyData[value] = data[0][value] !== undefined ? data[0][value] : 0;
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
		prov_code,
		reg_code,
		sub_cont_code,
		cont_code,
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
	if (prov_code) query.prov_code = prov_code;
	if (reg_code) query.reg_code = reg_code;
	if (sub_cont_code) query.sub_cont_code = sub_cont_code;
	if (cont_code) query.cont_code = cont_code;
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
	// query_data = { parish_code, month, year }

	const { query_data, pageNum, limitNum, sortBy, sortOrder } = getQueryData(req);

	const { parish_code, month, year } = query_data;

	const expectedQuery = {};

	if (parish_code) expectedQuery.parish_code = parish_code;
	if (month) expectedQuery.month = month;
	if (year) expectedQuery.year = year;

	if (!isEqual(expectedQuery, query_data)) {
		return res.status(400).json({
			status: 'fail',
			message: 'Please provide valid query parameters'
		});
	}

	if (!parish_code) {
		return res.status(400).json({
			status: 'fail',
			message: 'Please provide a parish code in the query parameters'
		});
	}

	if (!month) {
		return res.status(400).json({
			status: 'fail',
			message: 'Please provide a month in the query parameters'
		});
	}

	if (!year) {
		return res.status(400).json({
			status: 'fail',
			message: 'Please provide a year in the query parameters'
		});
	}

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

	const { service_id, month, year, area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code } = query_data;

	const expectedQuery = {};

	if (service_id) expectedQuery.service_id = service_id;
	if (month) expectedQuery.month = month;
	if (year) expectedQuery.year = year;
	if (area_code) expectedQuery.area_code = area_code;
	if (zone_code) expectedQuery.zone_code = zone_code;
	if (prov_code) expectedQuery.prov_code = prov_code;
	if (reg_code) expectedQuery.reg_code = reg_code;
	if (sub_cont_code) expectedQuery.sub_cont_code = sub_cont_code;
	if (cont_code) expectedQuery.cont_code = cont_code;

	console.log({ expectedQuery, query_data });
	
	if (!isEqual(expectedQuery, query_data)) {
		return res.status(400).json({
			status: 'fail',
			message: 'Please provide valid query parameters'
		});
	}

	if (!month) {
		return res.status(400).json({
			status: 'fail',
			message: 'Please provide a month in the query parameters'
		});
	}

	if (!year) {
		return res.status(400).json({
			status: 'fail',
			message: 'Please provide a year in the query parameters'
		});
	}

	if (!area_code && !zone_code && !prov_code && !reg_code && !sub_cont_code && !cont_code) {
		return res.status(400).json({
			status: 'fail',
			message: 'One of area_code, zone_code, prov_code, reg_code, sub_cont_code or cont_code is required in the query parameters'
		});
	}

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

	const { parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code, cont_code, month, year } = query_data;

	const expectedQuery = {};

	if (parish_code) expectedQuery.parish_code = parish_code;
	if (area_code) expectedQuery.area_code = area_code;
	if (zone_code) expectedQuery.zone_code = zone_code;
	if (prov_code) expectedQuery.prov_code = prov_code;
	if (reg_code) expectedQuery.reg_code = reg_code;
	if (sub_cont_code) expectedQuery.sub_cont_code = sub_cont_code;
	if (cont_code) expectedQuery.cont_code = cont_code;
	if (month) expectedQuery.month = month;
	if (year) expectedQuery.year = year;

	if (!isEqual(expectedQuery, query_data)) {
		return res.status(400).json({
			status: 'fail',
			message: 'Please provide valid query parameters'
		});
	}

	if (!month) {
		return res.status(400).json({
			status: 'fail',
			message: 'Please provide a month in the query parameters'
		});
	}

	if (!year) {
		return res.status(400).json({
			status: 'fail',
			message: 'Please provide a year in the query parameters'
		});
	}

	if (!parish_code && !area_code && !zone_code && !prov_code && !reg_code && !sub_cont_code && !cont_code) {
		return res.status(400).json({
			status: 'fail',
			message: 'One of parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code or cont_code is required in the query parameters'
		});
	}

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
	
	let monthlyData = monthlySum.map(item => {
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

	let prevMonthlyData = prevMonthlySum.map(item => {
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

	const roundToTwo = num => +(Math.round(num + "e+2")  + "e-2");
	const calculatePercentageDiff = (prev, current) => prev === 0 ? 0 : roundToTwo(((current - prev) / prev) * 100);

	const thisMonthConverts = monthlyData.reduce((acc, item) => acc + Number(item.converts), 0);
	const prevMonthConverts = prevMonthlyData.reduce((acc, item) => acc + Number(item.converts), 0);

	const thisMonthBirths = monthlyData.reduce((acc, item) => acc + Number(item.births), 0);
	const prevMonthBirths = prevMonthlyData.reduce((acc, item) => acc + Number(item.births), 0);

	const thisMonthDemises = monthlyData.reduce((acc, item) => acc + Number(item.demises), 0);
	const prevMonthDemises = prevMonthlyData.reduce((acc, item) => acc + Number(item.demises), 0);

	const thisMonthMarriages = monthlyData.reduce((acc, item) => acc + Number(item.marriages), 0);
	const prevMonthMarriages = prevMonthlyData.reduce((acc, item) => acc + Number(item.marriages), 0);

	const data = [];

	if (isEmpty(monthlyData) && isEmpty(prevMonthlyData)) {
		data.push({
			service_name: '',
			service_id: '',
			service_name_slug: '',
			men: {
				this_month_total: 0,
				prev_month_total: 0,
				difference_total: 0,
				percent_diff_total: 0,
				this_month_avg: 0,
				prev_month_avg: 0,
				difference_avg: 0,
				percent_diff_avg: 0
			},
			women: {
				this_month_total: 0,
				prev_month_total: 0,
				difference_total: 0,
				percent_diff_total: 0,
				this_month_avg: 0,
				prev_month_avg: 0,
				difference_avg: 0,
				percent_diff_avg: 0
			},
			children: {
				this_month_total: 0,
				prev_month_total: 0,
				difference_total: 0,
				percent_diff_total: 0,
				this_month_avg: 0,
				prev_month_avg: 0,
				difference_avg: 0,
				percent_diff_avg: 0
			},
			total_avg: {
				this_month_value: 0,
				prev_month_value: 0,
				difference: 0,
				percent_diff: 0
			},
			total_att: {
				this_month_value: 0,
				prev_month_value: 0,
				difference: 0,
				percent_diff: 0
			}
		});
	}

	monthlyData.forEach(item => {
		prevMonthlyData.forEach(prevItem => {
			if (item.service_id === prevItem.service_id) {
				let serviceName = item.service_name.toLowerCase().split(' ').join('_');
				data.push({
					service_name: item.service_name,
					service_id: item.service_id,
					service_name_slug: serviceName,
					men: {
						this_month_total: item.men,
						prev_month_total: prevItem.men,
						difference_total: item.men - prevItem.men,
						percent_diff_total: calculatePercentageDiff(prevItem.men, item.men),
						this_month_avg: item.avg_men,
						prev_month_avg: prevItem.avg_men,
						difference_avg: item.avg_men - prevItem.avg_men,
						percent_diff_avg: calculatePercentageDiff(prevItem.avg_men, item.avg_men)
					},
					women: {
						this_month_total: item.women,
						prev_month_total: prevItem.women,
						difference_total: item.women - prevItem.women,
						percent_diff_total: calculatePercentageDiff(prevItem.women, item.women),
						this_month_avg: item.avg_women,
						prev_month_avg: prevItem.avg_women,
						difference_avg: item.avg_women - prevItem.avg_women,
						percent_diff_avg: calculatePercentageDiff(prevItem.avg_women, item.avg_women)
					},
					children: {
						this_month_total: item.children,
						prev_month_total: prevItem.children,
						difference_total: item.children - prevItem.children,
						percent_diff_total: calculatePercentageDiff(prevItem.children, item.children),
						this_month_avg: item.avg_children,
						prev_month_avg: prevItem.avg_children,
						difference_avg: item.avg_children - prevItem.avg_children,
						percent_diff_avg: calculatePercentageDiff(prevItem.avg_children, item.avg_children)
					},
					total_avg: {
						this_month_value: item.avg_total,
						prev_month_value: prevItem.avg_total,
						difference: item.avg_total - prevItem.avg_total,
						percent_diff: calculatePercentageDiff(prevItem.avg_total, item.avg_total)
					},
					total_att: {
						this_month_value: item.total_att,
						prev_month_value: prevItem.total_att,
						difference: item.total_att - prevItem.total_att,
						percent_diff: calculatePercentageDiff(prevItem.total_att, item.total_att)
					}
				});

				item.delete = true
				prevItem.delete = true
			}
		});
	})

	monthlyData = monthlyData.filter(item => item.delete !== true)
	prevMonthlyData = prevMonthlyData.filter(item => item.delete !== true)

	monthlyData.forEach(item => {
		let serviceName = item.service_name.toLowerCase().split(' ').join('_');
		data.push({
			service_name: item.service_name,
			service_id: item.service_id,
			service_name_slug: serviceName,
			men: {
				this_month_total: item.men,
				prev_month_total: 0,
				difference_total: item.men,
				percent_diff_total: calculatePercentageDiff(0, item.men),
				this_month_avg: item.avg_men,
				prev_month_avg: 0,
				difference_avg: item.avg_men,
				percent_diff_avg: calculatePercentageDiff(0, item.avg_men)
			},
			women: {
				this_month_total: item.women,
				prev_month_total: 0,
				difference_total: item.women,
				percent_diff_total: calculatePercentageDiff(0, item.women),
				this_month_avg: item.avg_women,
				prev_month_avg: 0,
				difference_avg: item.avg_women,
				percent_diff_avg: calculatePercentageDiff(0, item.avg_women)
			},
			children: {
				this_month_total: item.children,
				prev_month_total: 0,
				difference_total: item.children,
				percent_diff_total: calculatePercentageDiff(0, item.children),
				this_month_avg: item.avg_children,
				prev_month_avg: 0,
				difference_avg: item.avg_children,
				percent_diff_avg: calculatePercentageDiff(0, item.avg_children)
			},
			total_avg: {
				this_month_value: item.avg_total,
				prev_month_value: 0,
				difference: item.avg_total,
				percent_diff: calculatePercentageDiff(0, item.avg_total)
			},
			total_att: {
				this_month_value: item.total_att,
				prev_month_value: 0,
				difference: item.total_att,
				percent_diff: calculatePercentageDiff(0, item.total_att)
			}
		});
	});

	prevMonthlyData.forEach(item => {
		let serviceName = item.service_name.toLowerCase().split(' ').join('_');
		data.push({
			service_name: item.service_name,
			service_id: item.service_id,
			service_name_slug: serviceName,
			men: {
				this_month_total: 0,
				prev_month_total: item.men,
				difference_total: 0 - item.men,
				percent_diff_total: calculatePercentageDiff(item.men, 0),
				this_month_avg: 0,
				prev_month_avg: item.avg_men,
				difference_avg: 0 - item.avg_men,
				percent_diff_avg: calculatePercentageDiff(item.avg_men, 0)
			},
			women: {
				this_month_total: 0,
				prev_month_total: item.women,
				difference_total: 0 - item.women,
				percent_diff_total: calculatePercentageDiff(item.women, 0),
				this_month_avg: 0,
				prev_month_avg: item.avg_women,
				difference_avg: 0 - item.avg_women,
				percent_diff_avg: calculatePercentageDiff(item.avg_women, 0)
			},
			children: {
				this_month_total: 0,
				prev_month_total: item.children,
				difference_total: 0 - item.children,
				percent_diff_total: calculatePercentageDiff(item.children, 0),
				this_month_avg: 0,
				prev_month_avg: item.avg_children,
				difference_avg: 0 - item.avg_children,
				percent_diff_avg: calculatePercentageDiff(item.avg_children, 0)
			},
			total_avg: {
				this_month_value: 0,
				prev_month_value: item.avg_total,
				difference: 0 - item.avg_total,
				percent_diff: calculatePercentageDiff(item.avg_total, 0)
			},
			total_att: {
				this_month_value: 0,
				prev_month_value: item.total_att,
				difference: 0 - item.total_att,
				percent_diff: calculatePercentageDiff(item.total_att, 0)
			}
		});
	});

	const combinedData = {
		this_month: month + ' ' + year, 
		prev_month: prevMonth + ' ' + year,
		year,
		servicesData: data,
		converts: {
			this_month_value: thisMonthConverts,
			prev_month_value: prevMonthConverts,
			difference: thisMonthConverts - prevMonthConverts,
			percent_diff: calculatePercentageDiff(prevMonthConverts, thisMonthConverts)
		},
		births: {
			this_month_value: thisMonthBirths,
			prev_month_value: prevMonthBirths,
			difference: thisMonthBirths - prevMonthBirths,
			percent_diff: calculatePercentageDiff(prevMonthBirths, thisMonthBirths)
		},
		demises: {
			this_month_value: thisMonthDemises,
			prev_month_value: prevMonthDemises,
			difference: thisMonthDemises - prevMonthDemises,
			percent_diff: calculatePercentageDiff(prevMonthDemises, thisMonthDemises)
		},
		marriages: {
			this_month_value: thisMonthMarriages,
			prev_month_value: prevMonthMarriages,
			difference: thisMonthMarriages - prevMonthMarriages,
			percent_diff: calculatePercentageDiff(prevMonthMarriages, thisMonthMarriages)
		}
	}

	return res.status(200).json({
		status: 'success',
		progressData: combinedData
	});
});

const getQuarterlyReport = asyncCatchRegular(async (req, res, _next) => {
	let months = [
		'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 
		'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'
	]

	let start_month = req.query.start_month;
	let end_month = req.query.end_month;
	let start_year = req.query.start_year;
	let end_year = req.query.end_year;

	let quarters = {};

	for(let i = 0; i < (end_year - start_year); i++) {
		quarters[startDateYear + i] = {
			q1: [],
			q2: [],
			q3: [],
			q4: []
		}
	}

	

	let Q1 = ['Sep', 'Oct', 'Nov'];
	let Q2 = ['Dec', 'Jan', 'Feb'];
	let Q3 = ['Mar', 'Apr', 'May'];
	let Q4 = ['Jun', 'Jul', 'Aug'];

	function findQuarter(month) {
		if (Q1.find(month) >= 0) return 'Q1';
		if (Q2.find(month) >= 0) return 'Q2';
		if (Q3.find(month) >= 0) return 'Q3';
		if (Q4.find(month) >= 0) return 'Q4';
	}

	for(let i = 0; i < (endDateMonth - startDateMonth); i++) {
		let monthKey = months.find(startDateMonth + i);
		let month = months[monthKey];

		monthQuarter = findQuarter(month);
	}
})

export { 
	getAttendance,
	createAttendance,
	deleteAttendance,
	getMonthlyAttendance,
	getParishAttendance,
	getMonthlyAttByChurchHierarchy,
	getMonthlyProgressReport
};