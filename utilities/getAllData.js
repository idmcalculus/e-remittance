import db from '../services/db.js';
import isEmpty from 'lodash/isEmpty.js';

const getAllData = async (req, table, res) => {
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
			year,
			page,
			limit,
			sort,
			order
		} = req.query;

		let query = {};
		let pageNum;
		let limitNum;
		let sortBy;
		let sortOrder;


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
		if (page) { pageNum = parseInt(page); } else { pageNum = 0; }
		if (limit) { limitNum = parseInt(limit); } else { limitNum = 10; }
		if (sort) { sortBy = sort; } else { sortBy = 'id'; }
		if (order) { sortOrder = order; } else { sortOrder = 'asc'; }

		if (isEmpty(query)) {
			const data = await db(table).limit(limitNum).offset(pageNum * limitNum).orderBy(sortBy, sortOrder);
			if (data.length > 0) {
				return res.status(200).json({
					status: 'success',
					data: data
				});
			} else {
				return res.status(404).json({
					status: 'fail',
					message: 'No data found'
				});
			}
		} else {
			const result = await db(table).where(query).limit(limitNum).offset(pageNum * limitNum).orderBy(sortBy, sortOrder);
			if (result.length > 0) {
				return res.status(200).json({
					status: 'success',
					data: result
				});
			} else {
				return res.status(404).json({
					status: 'fail',
					message: 'No data found for the query string(s) supplied'
				});
			}
		}
	} catch (error) {
		return error
	}
}

export { getAllData };