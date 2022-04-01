import db from '../services/db.js';

const getAllData = async (table, res) => {
	try {
		const data = await db(table);
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
	} catch (error) {
		return error
	}
}

export { getAllData };