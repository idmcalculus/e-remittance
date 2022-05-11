import isArray from 'lodash/isArray.js';

const insertIntoDb = async (db, data) => {
	const insertedData = await db.insert(data).returning('*');
	
	if (isArray(insertedData) && insertedData.length > 0) {
		return insertedData;
	} else {
		return false;
	}
}

const getDataFromDb = async(db, queryData) => {
	const retrievedData = await db.where(queryData);

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