import isArray from 'lodash/isArray.js';
import db from '../services/db.js';
import { getDataFromDb } from '../utils/dbOps.js';
import { asyncCatchInsert, asyncCatchRegular } from '../utils/helpers.js';

const getPermissions = asyncCatchRegular(async (req, res, _next) => {
	const permissionsData = await getDataFromDb(req, db('permissions'));

	if (permissionsData) {
		return res.status(200).json({
			status: 'success',
			data: permissionsData
		})
	} else {
		return res.status(400).json({
			status: 'fail',
			message: 'No data found'
		})
	}
});

const createPermissions = asyncCatchInsert(async (req, res, _next) => {
	const data = req.body;

	if (isArray(data)) {
		for (const elem of data) {
			elem['permission_name_slug'] = elem['permission_name'].toLowerCase().split(' ').join('_');
		}
	} else {
		data['permission_name_slug'] = data['permission_name'].toLowerCase().split(' ').join('_');
	}

	const insertedPermissionsData = await db('permissions')
									.insert(data)
									.onConflict(['permission_name', 'permission_name_slug'])
									.merge()
									.returning('*');

	if (insertedPermissionsData) {
		return res.status(200).json({
			status: 'success',
			data: insertedPermissionsData
		});
	} else {
		return res.status(400).json({
			status: 'fail',
			message: 'Inserting/updating permissions data unsuccessful'
		})
	}
});

const deletePermissions = asyncCatchRegular(async (req, res, _next) => {
	const {
		id,
		permission_name
	} = req.query;

	let query = {};

	if (id) query.id = id;
	if (permission_name) query.permission_name = permission_name;

	const result = await db('permissions').where(query).first().del().returning('*');

	if (result) {
		return res.status(200).json({
			status: 'success',
			message: 'Permission deleted successfully'
		});
	} else {
		return res.status(404).json({
			status: 'fail',
			message: 'Permission not found'
		});
	}
});

export { getPermissions, createPermissions, deletePermissions };