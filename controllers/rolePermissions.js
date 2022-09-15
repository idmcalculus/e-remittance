import isArray from 'lodash/isArray.js';
import db from '../services/db.js';
import { deleteFromDb, getDataFromDb, insertIntoDb } from '../utils/dbOps.js';
import { asyncCatchInsert, asyncCatchRegular, insertOpsHelper } from '../utils/helpers.js';

const getRolePermissions = asyncCatchRegular(async (req, res, _next) => {
	const rolesData = await getDataFromDb(req, db('role_permissions'));

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

const createRolePermissions = asyncCatchInsert(async (req, res, _next) => {
	const data = req.body;

	let { role_id, permission_id } = data;
	
	await deleteFromDb(db('role_permissions'), { role_id });
	
	let permIdArr = permission_id.split(',');

	let rolePermissionArr = [];

	for (const permId of permIdArr) {
		let rolePermission = {
			role_id: role_id,
			permission_id: permId
		}

		rolePermissionArr.push(rolePermission);
	}

	await insertOpsHelper(insertIntoDb, db('role_permissions'), rolePermissionArr, res)
});

const deleteRolePermissions = asyncCatchRegular(async (req, res, _next) => {
	const {
		id,
		role_name
	} = req.query;

	let query = {};

	if (id) query.id = id;
	if (role_name) query.role_name = role_name;

	const result = await db('role_permissions').where(query).first().del().returning('*');

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

export { getRolePermissions, createRolePermissions, deleteRolePermissions };