const getQueryData = (req) => {
	try {
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
			month,
			year,
			week,
			service_date,
			date_of_activity,
			category_id,
			sub_category_id,
			description,
			rem_month,
			rem_year,
			page,
			limit,
			sort,
			order
		} = req.query;

		let query_data = {};
		let pageNum;
		let limitNum;
		let sortBy;
		let sortOrder;


		if (id) query_data.id = id;
		if (service_id) query_data.service_id = service_id;
		if (parish_code) query_data.parish_code = parish_code;
		if (area_code) query_data.area_code = area_code;
		if (zone_code) query_data.zone_code = zone_code;
		if (prov_code) query_data.prov_code = prov_code;
		if (reg_code) query_data.reg_code = reg_code;
		if (sub_cont_code) query_data.sub_cont_code = sub_cont_code;
		if (cont_code) query_data.cont_code = cont_code;
		if (month) query_data.month = month;
		if (year) query_data.year = year;
		if (week) query_data.week = week;
		if (service_date) query_data.service_date = service_date;
		if (date_of_activity) query_data.date_of_activity = date_of_activity;
		if (category_id) query_data.category_id = category_id;
		if (sub_category_id) query_data.sub_category_id = sub_category_id;
		if (description) query_data.description = description;
		if (rem_month) query_data.rem_month = rem_month;
		if (rem_year) query_data.rem_year = rem_year;
		
		if (page) { pageNum = parseInt(page); } else { pageNum = 0; }
		if (limit) { limitNum = parseInt(limit); } else { limitNum = 100; }
		if (sort) { sortBy = sort; } else { sortBy = 'id'; }
		if (order) { sortOrder = order; } else { sortOrder = 'asc'; }

		return {
			query_data,
			pageNum,
			limitNum,
			sortBy,
			sortOrder
		}
	} catch (error) {
		console.error(error);
	}
}

export { getQueryData };