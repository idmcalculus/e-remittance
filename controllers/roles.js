import isArray from 'lodash/isArray.js';
import db from '../services/db.js';
import { getDataFromDb } from '../utils/dbOps.js';
import { asyncCatchInsert, asyncCatchRegular } from '../utils/helpers.js';

const getRoles = asyncCatchRegular(async (req, res, _next) => {
	const rolesData = await getDataFromDb(req, db('roles'));

	if (rolesData) {
		return res.status(200).json({
			status: 'success',
			data: rolesData
		})
	} else {
		return res.status(400).json({
			status: 'fail',
			message: 'No data found'
		})
	}
});

const createRoles = asyncCatchInsert(async (req, res, _next) => {
	const data = req.body;

	/* if (isArray(data)) {
		for (const elem of data) {
			elem['role_name_slug'] = elem['role_name'].toLowerCase().split(' ').join('_');
		}
	} else {
		data['role_name_slug'] = data['role_name'].toLowerCase().split(' ').join('_');
	} */

	const insertedRolesData = await db('roles')
									.insert(data)
									.onConflict(['role_name', 'role_name_slug'])
									.merge()
									.returning('*');

	if (insertedRolesData) {
		return res.status(200).json({
			status: 'success',
			data: insertedRolesData
		});
	} else {
		return res.status(400).json({
			status: 'fail',
			message: 'Inserting/updating roles data unsuccessful'
		})
	}
});

const deleteRoles = asyncCatchRegular(async (req, res, _next) => {
	const {
		id,
		role_name
	} = req.query;

	let query = {};

	if (id) query.id = id;
	if (role_name) query.role_name = role_name;

	const result = await db('roles').where(query).first().del().returning('*');

	if (result) {
		return res.status(200).json({
			status: 'success',
			message: 'Role deleted successfully'
		});
	} else {
		return res.status(404).json({
			status: 'fail',
			message: 'Role not found'
		});
	}
});

export { getRoles, createRoles, deleteRoles };