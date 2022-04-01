import db from '../services/db.js';

const getDataByCode = async (obj, table, res) => {
	try {
		const data = await db(table).where(obj);
		if (data.length > 0) {
			return res.status(200).json({
				status: 'success',
				data: data
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No data found for the code supplied'
			});
		}
	} catch (error) {
		return error
	}
}

export { getDataByCode };