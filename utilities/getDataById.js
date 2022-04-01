import db from '../services/db.js';

const getDataById = async (obj, table, res) => {
	try {
		const data = await db(table).where(obj).first();
		if (data.length > 0) {
			return res.status(200).json({
				status: 'success',
				data: data
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No data found for the id supplied'
			});
		}
	} catch (error) {
		return error
	}
}

export { getDataById };