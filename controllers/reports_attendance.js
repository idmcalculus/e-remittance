import { config } from 'dotenv';
import db from '../services/db.js';
import isEmpty from 'lodash/isEmpty.js';
import { getQueryData } from '../utilities/getQueryData.js';
import { insertIntoDb, getDataFromDb, updateDb, deleteFromDb } from '../utilities/dbOps.js';

config();

// Get all attendance reports or specific ones based on query parameters
const getAttendance = async (req, res, _next) => {
	try {
		const { query_data, pageNum, limitNum, sortBy, sortOrder } = getQueryData(req);

		const modifyReports = async report => {
			const source_doc = await getDataFromDb(db('source_docs'), { report_att_id: report.id });
			const file_key = source_doc[0].file_key
			const file_path = `https://${process.env.AWS_BUCKET_NAME}.${process.env.FILE_HOST}/${file_key}`;
			source_doc[0]['file_path'] = file_path;
			report.source_doc = source_doc;
			return report;
		}

		const dataFound = async (data) => {
			if (data.length > 0) {
				const addFilesToReport = data.map(modifyReports);

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
		}

		const att_reports = await db('reports_att')
				.where(query_data)
				.limit(limitNum)
				.offset(pageNum * limitNum)
				.orderBy(sortBy, sortOrder);

		await dataFound(att_reports);
	} catch (error) {
		console.error(error);
		return res.send(400).json({
			error: error.message
		});
	}
}

const createAttendance = async (req, res, _next) => {
	try {
		const data = req.body;
		const { service_id, parish_code, week, month, year } = data;

		const foundAttendanceData = await getDataFromDb(db('reports_att'), { service_id, parish_code, week, month, year });

		// if attendance exists, update
		if (foundAttendanceData) {
			const updateAttendanceData = await updateDb(db('reports_att'), data, { id: foundAttendanceData[0].id });

			if (updateAttendanceData) {
				const updateMonthlyData = await computeMonthlyData(updateAttendanceData[0]);

				if (isEmpty(updateMonthlyData) || updateMonthlyData.error) {
					// if updateMonthlyData is empty or returns an error, delete updateAttendanceData in reports_att and return error message (i.e perform a rollback)
					await deleteFromDb(db('reports_att'), { id: updateAttendanceData[0].id });

					return res.status(400).json({
						status: 'error',
						message: 'Error updating monthly data.'
					});
				} else {
					const updateMonthlyAtt = await db('reports_att_monthly').where({
						service_id: updateMonthlyData['service_id'],
						parish_code: updateMonthlyData['parish_code'],
						month: updateMonthlyData['month'],
						year: updateMonthlyData['year']
					});

					if (updateMonthlyAtt.length > 0) {
						// if attendance for this month exists, update
						const updateMonthlyAttData = await updateDb(db('reports_att_monthly'), updateMonthlyData, { id: updateMonthlyAtt[0].id });

						// if updateMonthlyAttData is empty, delete updateAttendanceData in reports_att and return error message (i.e perform a rollback)
						if (updateMonthlyAttData.length == 0) {
							await deleteFromDb(db('reports_att'), { id: updateAttendanceData[0].id });
		
							return res.status(400).json({
								status: 'error',
								message: 'Error updating attendance data.'
							});
						} else {
							return res.status(201).json({
								status: 'success',
								message: 'Attendance updated successfully',
								data: updateAttendanceData
							});
						}
					} else {
						// if attendance for this month does not exist, create
						const createMonthlyAttData = insertIntoDb(db('reports_att_monthly'), updateMonthlyData);

						// if createMonthlyAttData is empty, delete updateAttendanceData in reports_att and return error message (i.e perform a rollback)
						if (createMonthlyAttData.length == 0) {
							deleteFromDb(db('reports_att'), { id: updateAttendanceData[0].id });
		
							return res.status(400).json({
								status: 'error',
								message: 'Error updating attendance data.'
							});
						} else {
							return res.status(201).json({
								status: 'success',
								message: 'Attendance updated successfully',
								data: updateAttendanceData
							});
						}
					}
				}
			} else {
				return res.status(400).json({
					status: 'error',
					message: 'Error updating attendance data.'
				});
			}
		} else {
			// if attendance does not exist, create
			const insertAttendanceData = await insertIntoDb(db('reports_att'), data);

			if (insertAttendanceData) {
				const createMonthlyAttData = await computeMonthlyData(insertAttendanceData[0]);

				if (isEmpty(createMonthlyAttData) || createMonthlyAttData.error) {
					// if createMonthlyAttData is empty or returns an error, delete insertAttendanceData in reports_att and return error message (i.e perform a rollback)
					await db('reports_att').where({ id: insertAttendanceData[0].id }).del()

					return res.status(400).json({
						status: 'error',
						message: 'Error creating monthly data.'
					});
				} else {
					const createMonthlyAtt = await db('reports_att_monthly').where({
						service_id: insertAttendanceData[0].service_id,
						parish_code: insertAttendanceData[0].parish_code,
						month: insertAttendanceData[0].month,
						year: insertAttendanceData[0].year
					});

					if (createMonthlyAtt.length > 0) {
						// if attendance for this month exists, update
						const updateMonthlyAttData = updateDb(db('reports_att_monthly'), createMonthlyAttData, { id: createMonthlyAtt[0].id });

						// if updateMonthlyAttData is empty, delete insertAttendanceData in reports_att and return error message (i.e perform a rollback)
						if (updateMonthlyAttData.length == 0) {
							await db('reports_att').where({ id: insertAttendanceData[0].id }).del()
		
							return res.status(400).json({
								status: 'error',
								message: 'Error creating attendance data.'
							});
						} else {
							return res.status(201).json({
								status: 'success',
								message: 'Attendance created successfully',
								data: insertAttendanceData
							});
						}
					} else {
						// if attendance for this month does not exist, create
						const createMonthlyAtt = await insertIntoDb(db('reports_att_monthly'), createMonthlyAttData);

						// if createMonthlyAtt is empty, delete insertAttendanceData in reports_att and return error message (i.e perform a rollback)
						if (createMonthlyAtt.length == 0) {
							await db('reports_att').where({ id: insertAttendanceData[0].id }).del()
		
							return res.status(400).json({
								status: 'error',
								message: 'Error creating attendance data.'
							});
						} else {
							return res.status(201).json({
								status: 'success',
								message: 'Attendance created successfully',
								data: insertAttendanceData
							});
						}
					}
				}
			} else {
				return res.status(400).json({
					status: 'error',
					message: 'Error creating attendance data.'
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

const computeMonthlyData = async (attendanceData) => {
	try {
		const default_report_query = {
			service_id: attendanceData['service_id'],
			parish_code: attendanceData['parish_code'],
			month: attendanceData['month'],
			year: attendanceData['year']
		};

		const further_report_query = {
			parish_code: attendanceData['parish_code'],
			month: attendanceData['month'],
			year: attendanceData['year']
		};

		const people_obj = {
			men: 'men', 
			women: 'women',
			children: 'children'
		};

		const further_report_obj = {
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
			dcns: 'dcns'
		};

		const default_report_cols = [
			'service_id', 'parish_code', 'area_code', 'zone_code', 'prov_code', 'reg_code', 'month', 'year'
		];

		const monthlyData = {};

		const monthly_averages = await db('reports_att').avg(people_obj).where(default_report_query);
	
		const avg_men = Math.round(Number(monthly_averages[0]['men']));
		const avg_women = Math.round(Number(monthly_averages[0]['women']));
		const avg_children = Math.round(Number(monthly_averages[0]['children']));
		const avg_total = avg_men + avg_women + avg_children
	
		const monthly_sum = await db('reports_att').sum(people_obj).where(default_report_query);
	
		const men 		= Number(monthly_sum[0]['men']);
		const women 	= Number(monthly_sum[0]['women']);
		const children 	= Number(monthly_sum[0]['children']);
		const total_mwc = men + women + children
	
		const further_reports_monthly_sum = await db('reports_att').sum(further_report_obj).where(further_report_query);

		for (let col of default_report_cols) {
			monthlyData[col] = attendanceData[col];
		}

		for (let value of Object.values(further_report_obj)) {
			monthlyData[value] = Number(further_reports_monthly_sum[0][value]);
		}

		monthlyData['men'] 			= men;
		monthlyData['women'] 		= women;
		monthlyData['children'] 	= children;
		monthlyData['total_mwc'] 	= total_mwc;
		monthlyData['avg_men'] 		= avg_men;
		monthlyData['avg_women'] 	= avg_women;
		monthlyData['avg_children'] = avg_children;
		monthlyData['avg_total'] 	= avg_total;
	
		return monthlyData;
	} catch (error) {
		console.error(error.message);
		await db('reports_att').where({ id: attendanceData.id }).del()
		return {
			error: error.message
		}
	}
}

const deleteAttendance = async (req, res, _next) => {
	try {
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

		const attendance = await db('reports_att').where(query).first().del();

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
	} catch (error) {
		console.error(error)
		return error
	}
}

const getMonthlyAttendance = async (req, res, _next) => {
	try {
		const { query_data, pageNum, limitNum, sortBy, sortOrder } = getQueryData(req);

		const monthlyReport = await db('reports_att_monthly')
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
	} catch (error) {
		console.error(error);
		return error;
	}
}

export { 
	getAttendance,
	createAttendance,
	deleteAttendance,
	getMonthlyAttendance
};