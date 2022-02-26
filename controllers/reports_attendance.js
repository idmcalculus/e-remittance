import db from '../services/db.js';

// list all users
const getAttendance = async (_req, res, _next) => {
	try {
		const attendance = await db('reports_attendance')
		return res.status(200).json({
			status: 'success',
			data: attendance
		});
	} catch (error) {
		return res.json({ error })
	}
}

const getAttendanceById = async (req, res, _next) => {
	try {
		const { id } = req.params;
		const attendance = await db('reports_attendance').where({ id }).first();

		if (attendance) {
			return res.status(200).json({
				status: 'success',
				data: attendance
			});
		} else {
			return res.status(404).json({
				status: 'fail',
				message: 'No attendance found'
			});
		}
	} catch (error) {
		return error
	}
}

const createAttendance = async (req, res, _next) => {
	try {
		const data = req.body;

		if (data.parish_code != '') {

			const check_key_exists = key => {
				return data.hasOwnProperty(key);
			}

			const compute_totals = (m, w, c) => {
				if (check_key_exists(m) && check_key_exists(w) && check_key_exists(c)) {
					if (data[m] != '' && data[w] != '' && data[c] != '') {
						return parseInt(data[m]) + parseInt(data[w]) + parseInt(data[c]);
					} else {
						return 0;
					}
				} else {
					return 0;
				}
			}

			const compute_average = (...args) => {
				let total = 0;
				let length = 0;

				for (let arg of args) {
					if (check_key_exists(arg)) {
						if (data[arg] != '') {
							total += parseInt(data[arg]);
							length += 1;
						} else {
							total += 0;
							length += 0;
						}
					} else {
						total += 0;
						length += 0;
					}
				};

				return Math.round(total / length);
			}

			data.sun_tot_wk1 = compute_totals('sun_m_wk1', 'sun_w_wk1', 'sun_c_wk1');
			data.sun_tot_wk2 = compute_totals('sun_m_wk2', 'sun_w_wk2', 'sun_c_wk2');
			data.sun_tot_wk3 = compute_totals('sun_m_wk3', 'sun_w_wk3', 'sun_c_wk3');
			data.sun_tot_wk4 = compute_totals('sun_m_wk4', 'sun_w_wk4', 'sun_c_wk4');
			data.sun_tot_wk5 = compute_totals('sun_m_wk5', 'sun_w_wk5', 'sun_c_wk5');
			data.tue_tot_wk1 = compute_totals('tue_m_wk1', 'tue_w_wk1', 'tue_c_wk1');
			data.tue_tot_wk2 = compute_totals('tue_m_wk2', 'tue_w_wk2', 'tue_c_wk2');
			data.tue_tot_wk3 = compute_totals('tue_m_wk3', 'tue_w_wk3', 'tue_c_wk3');
			data.tue_tot_wk4 = compute_totals('tue_m_wk4', 'tue_w_wk4', 'tue_c_wk4');
			data.tue_tot_wk5 = compute_totals('tue_m_wk5', 'tue_w_wk5', 'tue_c_wk5');
			data.thur_tot_wk1 = compute_totals('thur_m_wk1', 'thur_w_wk1', 'thur_c_wk1');
			data.thur_tot_wk2 = compute_totals('thur_m_wk2', 'thur_w_wk2', 'thur_c_wk2');
			data.thur_tot_wk3 = compute_totals('thur_m_wk3', 'thur_w_wk3', 'thur_c_wk3');
			data.thur_tot_wk4 = compute_totals('thur_m_wk4', 'thur_w_wk4', 'thur_c_wk4');
			data.thur_tot_wk5 = compute_totals('thur_m_wk5', 'thur_w_wk5', 'thur_c_wk5');

			data.avg_men = compute_average('sun_m_wk1', 'sun_m_wk2', 'sun_m_wk3', 'sun_m_wk4', 'sun_m_wk5');
			data.avg_women = compute_average('sun_w_wk1', 'sun_w_wk2', 'sun_w_wk3', 'sun_w_wk4', 'sun_w_wk5');
			data.avg_children = compute_average('sun_c_wk1', 'sun_c_wk2', 'sun_c_wk3', 'sun_c_wk4', 'sun_c_wk5');
			data.avg_total = compute_average('sun_tot_wk1', 'sun_tot_wk2', 'sun_tot_wk3', 'sun_tot_wk4', 'sun_tot_wk5');
			data.avg_ss = compute_average('sun_ss_wk1', 'sun_ss_wk2', 'sun_ss_wk3', 'sun_ss_wk4', 'sun_ss_wk5');
			data.avg_hf = compute_average('sun_hf_wk1', 'sun_hf_wk2', 'sun_hf_wk3', 'sun_hf_wk4', 'sun_hf_wk5');
			data.avg_tue = compute_average('tue_tot_wk1', 'tue_tot_wk2', 'tue_tot_wk3', 'tue_tot_wk4', 'tue_tot_wk5');
			data.avg_thur = compute_average('thur_tot_wk1', 'thur_tot_wk2', 'thur_tot_wk3', 'thur_tot_wk4', 'thur_tot_wk5');

			const result = await db('reports_attendance').insert(data).returning(['id', 'created_at', 'updated_at']);
			
			return res.status(200).json({
				status: 'success',
				data: result[0]
			});
		} else {
			return res.status(401).json({
				status: 'error',
				message: 'Please provide the required credentials'
			});
		}
	} catch (error) {
		return res.json({ error });
	}
}

export { getAttendance, getAttendanceById, createAttendance };