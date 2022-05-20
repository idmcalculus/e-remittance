const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const officeTypes = {
	"msword": "doc",
	"msword": "dot",
	"vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
	"vnd.openxmlformats-officedocument.wordprocessingml.template": "dotx",
	"vnd.ms-word.document.macroEnabled.12": "docm",
	"vnd.ms-word.template.macroEnabled.12": "dotm",
	"vnd.ms-excel": "xls",
	"vnd.ms-excel": "xlt",
	"vnd.ms-excel": "xla",
	"vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
	"vnd.openxmlformats-officedocument.spreadsheetml.template": "xltx",
	"vnd.ms-excel.sheet.macroEnabled.12": "xlsm",
	"vnd.ms-excel.template.macroEnabled.12": "xltm",
	"vnd.ms-excel.addin.macroEnabled.12": "xlam",
	"vnd.ms-excel.sheet.binary.macroEnabled.12": "xlsb",
	"vnd.ms-powerpoint": "ppt",
	"vnd.ms-powerpoint": "pot",
	"vnd.ms-powerpoint": "pps",
	"vnd.ms-powerpoint": "ppa",
	"vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
	"vnd.openxmlformats-officedocument.presentationml.template": "potx",
	"vnd.openxmlformats-officedocument.presentationml.slideshow": "ppsx",
	"vnd.ms-powerpoint.addin.macroEnabled.12": "ppam",
	"vnd.ms-powerpoint.presentation.macroEnabled.12": "pptm",
	"vnd.ms-powerpoint.template.macroEnabled.12": "potm",
	"vnd.ms-powerpoint.slideshow.macroEnabled.12": "ppsm",
	"vnd.ms-access": "mdb"
}

/**
 * Function that helps insert operations in report attendance and csr reports controllers
 * @param {*} dbInsertFn 
 * @param {*} monthlyData 
 * @param {*} db 
 * @param {*} data 
 * @param {*} res 
 * @returns 
 */
const insertOpsHelper = async (dbInsertFn, monthlyData, db, data, res) => {
	if (monthlyData) {
		const insertData = await dbInsertFn(db, data);

		if (insertData) {
			return res.status(201).json({
				status: 'success',
				message: 'data inserted successfully',
				data: insertData
			});
		} else {
			return res.status(400).json({
				status: 'error',
				message: 'Error inserting data.'
			});
		}
	} else {
		return res.status(400).json({
			status: 'error',
			message: 'Error inserting monthly data.'
		});
	}
}

/**
 * Function that helps update operations in report attendance and csr reports controllers
 * @param {*} dbUpdateFn 
 * @param {*} monthlyData 
 * @param {*} db 
 * @param {*} data 
 * @param {*} queryData 
 * @param {*} res 
 * @returns json response
 */
const updateOpsHelper = async (dbUpdateFn, monthlyData, db, data, queryData, res) => {
	if (monthlyData) {
		const updateData = await dbUpdateFn(db, data, queryData);

		if (updateData) {
			return res.status(201).json({
				status: 'success',
				message: 'data updated successfully',
				data: updateData
			});
		} else {
			return res.status(400).json({
				status: 'error',
				message: 'Error updating data.'
			});
		}
	} else {
		return res.status(400).json({
			status: 'error',
			message: 'Error updating monthly data.'
		});
	}
}

const asyncCatchRegular = (fn) => async (req, res, next) => {
	try {
		await fn(req, res, next);
	} catch (error) {
		console.error(error);

		res.status(400).send(`Error: ${error.message}`)
	}
}

const asyncCatchInsert = (fn) => async (req, res, next) => {
	try {
		await fn(req, res, next);
	} catch (error) {
		console.error(error);

		if (error.code == '23502') {
			return res.status(400).send({
				status: 'fail',
				message: `Please provide a value for the '${error.column}' column as it cannot be null.
							Kindly ensure to check all required fields are filled.`
			});
		}

		res.status(400).send(`Error: ${error.message}`)
	}
}

export { 
	formatBytes,
	officeTypes,
	insertOpsHelper,
	updateOpsHelper,
	asyncCatchRegular,
	asyncCatchInsert
};