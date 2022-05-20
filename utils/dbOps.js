import isEmpty from 'lodash/isEmpty.js';
import isArray from 'lodash/isArray.js';
import { getQueryData } from './getQueryData.js';

const insertIntoDb = async (db, data) => {
	const insertedData = await db.insert(data).returning('*');
	
	if (isArray(insertedData) && insertedData.length > 0) {
		return insertedData;
	} else {
		return false;
	}
}

const getDataFromDb = async(req, db, queryData = {}, useRaw = false, rawQuery = '') => {
	let retrievedData;

	if (isEmpty(queryData)) {
		queryData = getQueryData(req)['query_data'];
	}

	const { pageNum, limitNum, sortBy, sortOrder } = getQueryData(req);
	
	if (useRaw) {
		retrievedData = await db.raw(rawQuery);
	} else {
		retrievedData = await db.where(queryData)
								.limit(limitNum)
								.offset(pageNum * limitNum)
								.orderBy(sortBy, sortOrder);
	}

	if (isArray(retrievedData) && retrievedData.length > 0) {
		return retrievedData;
	} else {
		return false;
	}
}

const updateDb = async (db, data, queryData) => {
	const updatedData = await db.where(queryData).update(data).returning('*');
	
	if (isArray(updatedData) && updatedData.length > 0) {
		return updatedData;
	} else {
		return false;
	}
}

const deleteFromDb = async (db, queryData) => await db.where(queryData).del();

export {
	insertIntoDb,
	getDataFromDb,
	updateDb,
	deleteFromDb
}