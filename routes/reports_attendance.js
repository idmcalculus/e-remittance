import { Router } from 'express';
import { 
	getAttendance,
	createAttendance,
	deleteAttendance,
	getMonthlyAttendance,
	getParishAttendance,
	getMonthlyAttByChurchHierarchy,
	getMonthlyProgressReport
} from '../controllers/reports_attendance.js';
import { sourceDocUpload } from '../middlewares/multer.js';
import { fileUpload, getSourceDocs } from '../controllers/source_doc.js';
import { remittanceLocked, scanLocked } from '../middlewares/admin_settings.js';

const router = Router();

/**
 * POST method route
 * @example http://localhost:PORT/attendance/
 * @swagger
 * tags:
 *   - name: Reports Attendance
 *     description: |
 *       For attendance in Church services in parishes, areas, zones, provinces or regions
 * paths:
 *  /attendance:
 *   post:
 *     tags:
 *       - Reports Attendance
 *     operationId: insertAttendance
 *     summary: Creates a new attendance or updates existing attendance
 *     requestBody:
 *       $ref: '#/components/requestBodies/Attendance'
 *     responses:
 *       '201':
 *         description: Successful creation of attendance report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttResponse'
 *       '400':
 *          description: Error creating/updating attendance report
 *
 */
router.post('/', remittanceLocked, createAttendance);

/**
 * POST method route
 * @example http://localhost:PORT/attendance/
 * @swagger
 * paths:
 *  /attendance/source_doc:
 *   post:
 *     tags:
 *       - Reports Attendance
 *     operationId: uploadSourceDocument
 *     summary: uploads source document image for a report attendance
 *     responses:
 *       '201':
 *         description: Successful creation of attendance report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadSourceDocResponse'
 *       '400':
 *         description: Error creating/updating source document
 *     requestBody:
 *       $ref: '#/components/requestBodies/SourceDoc'
 * 
 */
router.post('/source_doc', sourceDocUpload, scanLocked, fileUpload);

/**
 * GET method route
 * @example http://localhost:PORT/attendance/
 * @swagger
 * paths:
 *  /attendance:
 *   get:
 *     tags:
 *       - Reports Attendance
 *     operationId: getAttendance
 *     summary: Retrieves some/all Attendance Reports
 *     description: |
 *       By passing in the appropriate options in the query string, you can search for
 *       available attendance reports in the system
 *     parameters:
 *       - $ref: '#/components/parameters/id_query'
 *       - $ref: '#/components/parameters/service_id_query'
 *       - $ref: '#/components/parameters/parish_code_query'
 *       - $ref: '#/components/parameters/area_code_query'
 *       - $ref: '#/components/parameters/zone_code_query'
 *       - $ref: '#/components/parameters/prov_code_query'
 *       - $ref: '#/components/parameters/reg_code_query'
 *       - $ref: '#/components/parameters/sub_cont_code_query'
 *       - $ref: '#/components/parameters/cont_code_query'
 *       - $ref: '#/components/parameters/week_query'
 *       - $ref: '#/components/parameters/service_date_query'
 *       - $ref: '#/components/parameters/month_query'
 *       - $ref: '#/components/parameters/year_query'
 *       - $ref: '#/components/parameters/page_query'
 *       - $ref: '#/components/parameters/limit_query'
 *       - $ref: '#/components/parameters/sort_query'
 *       - $ref: '#/components/parameters/order_query'
 *     responses:
 *       '200':
 *         description: array of all reports attendance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttResponse'
 *       '400':
 *         description: Error retrieving attendance
 */
router.get('/', getAttendance);

/**
 * GET method route
 * @example http://localhost:PORT/attendance/
 * @swagger
 * paths:
 *  /attendance/parish_att:
 *   get:
 *     tags:
 *       - Reports Attendance
 *     operationId: getParishAttendance
 *     summary: Retrieves some/all Attendance Reports for a particular Parish
 *     description: |
 *       By passing in the appropriate options in the query string, you can search for
 *       available attendance reports in the system
 *     parameters:
 *       - $ref: '#/components/parameters/parish_code_query_required'
 *       - $ref: '#/components/parameters/month_query_required'
 *       - $ref: '#/components/parameters/year_query_required'
 *       - $ref: '#/components/parameters/page_query'
 *       - $ref: '#/components/parameters/limit_query'
 *       - $ref: '#/components/parameters/sort_query'
 *       - $ref: '#/components/parameters/order_query'
 *     responses:
 *       '200':
 *         description: array of all reports attendance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParishAttResponse'
 *       '400':
 *         description: Error retrieving attendance
 */
router.get('/parish_att', getParishAttendance);

/**
 * GET method route
 * @example http://localhost:PORT/attendance/
 * @swagger
 * paths:
 *  /attendance/monthly_report:
 *   get:
 *     tags:
 *       - Reports Attendance
 *     operationId: getMonthlyAttendance
 *     summary: Retrieves some/all Attendance Reports for a particular Month
 *     description: |
 *       By passing in the appropriate options in the query string, you can search for
 *       available attendance reports in the system
 *     parameters:
 *       - $ref: '#/components/parameters/id_query'
 *       - $ref: '#/components/parameters/service_id_query'
 *       - $ref: '#/components/parameters/parish_code_query'
 *       - $ref: '#/components/parameters/area_code_query'
 *       - $ref: '#/components/parameters/zone_code_query'
 *       - $ref: '#/components/parameters/prov_code_query'
 *       - $ref: '#/components/parameters/reg_code_query'
 *       - $ref: '#/components/parameters/sub_cont_code_query'
 *       - $ref: '#/components/parameters/cont_code_query'
 *       - $ref: '#/components/parameters/month_query'
 *       - $ref: '#/components/parameters/year_query'
 *       - $ref: '#/components/parameters/page_query'
 *       - $ref: '#/components/parameters/limit_query'
 *       - $ref: '#/components/parameters/sort_query'
 *       - $ref: '#/components/parameters/order_query'
 *     responses:
 *       '200':
 *         description: array of all reports attendance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MonthlyAttResponse'
 *       '400':
 *         description: Error retrieving attendance
 */
router.get('/monthly_report', getMonthlyAttendance);

/**
 * GET method route
 * @example http://localhost:PORT/attendance/
 * @swagger
 * paths:
 *  /attendance/monthly_report/hierarchy:
 *   get:
 *     tags:
 *       - Reports Attendance
 *     operationId: getMonthlyAttByChurchHierarchy
 *     summary: Retrieves some/all Attendance Reports for an area, zone, province, region, sub-continent, or continent
 *     description: |
 *       By passing in the appropriate options in the query string, you can retrieve the attendance reports for an area, zone, province, region, sub-continent, or continent.
 *       Please note that you must provide only one of area_code, zone_code, prov_code, reg_code, sub_cont_code, or cont_code. Thanks
 *     parameters:
 *       - $ref: '#/components/parameters/service_id_query_required'
 *       - $ref: '#/components/parameters/area_code_query'
 *       - $ref: '#/components/parameters/zone_code_query'
 *       - $ref: '#/components/parameters/prov_code_query'
 *       - $ref: '#/components/parameters/reg_code_query'
 *       - $ref: '#/components/parameters/sub_cont_code_query'
 *       - $ref: '#/components/parameters/cont_code_query'
 *       - $ref: '#/components/parameters/month_query_required'
 *       - $ref: '#/components/parameters/year_query_required'
 *       - $ref: '#/components/parameters/page_query'
 *       - $ref: '#/components/parameters/limit_query'
 *       - $ref: '#/components/parameters/sort_query'
 *       - $ref: '#/components/parameters/order_query'
 *     responses:
 *       '200':
 *         description: array of all reports attendance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MonthlyAttResponse'
 *       '400':
 *         description: Error retrieving attendance
 */
router.get('/monthly_report/hierarchy', getMonthlyAttByChurchHierarchy);

/**
 * GET method route
 * @example http://localhost:PORT/attendance/
 * @swagger
 * paths:
 *  /attendance/monthly_report/progress:
 *   get:
 *     tags:
 *       - Reports Attendance
 *     operationId: getMonthlyProgressReport
 *     summary: Retrieves the progress Attendance Reports for a parish, area, zone, province, region, sub-continent, or continent
 *     description: |
 *       By passing in the appropriate options in the query string, you can retrieve the attendance progress reports for a parish, area, zone, province, region, sub-continent, or continent.
 *       Please note that you must provide only one of parish_code, area_code, zone_code, prov_code, reg_code, sub_cont_code, or cont_code. Thanks
 *     
 *     parameters:
 *       - $ref: '#/components/parameters/id_query'
 *       - $ref: '#/components/parameters/parish_code_query'
 *       - $ref: '#/components/parameters/area_code_query'
 *       - $ref: '#/components/parameters/zone_code_query'
 *       - $ref: '#/components/parameters/prov_code_query'
 *       - $ref: '#/components/parameters/reg_code_query'
 *       - $ref: '#/components/parameters/sub_cont_code_query'
 *       - $ref: '#/components/parameters/cont_code_query'
 *       - $ref: '#/components/parameters/month_query_required'
 *       - $ref: '#/components/parameters/year_query_required'
 *       - $ref: '#/components/parameters/page_query'
 *       - $ref: '#/components/parameters/limit_query'
 *       - $ref: '#/components/parameters/sort_query'
 *       - $ref: '#/components/parameters/order_query'
 *     responses:
 *       '200':
 *         description: Monthly Progress report data object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgressReportResponse'
 *       '400':
 *         description: Error retrieving attendance
 */
router.get('/monthly_report/progress', getMonthlyProgressReport);

/**
 * GET method route
 * @example http://localhost:PORT/attendance/source_doc
 * @swagger
 * paths:
 *  /attendance/source_doc:
 *   get:
 *     tags:
 *       - Reports Attendance
 *     operationId: getSourceDoc
 *     summary: Retrieves some/all source documents
 *     description: |
 *       By passing in the appropriate options in the query string, you can search for
 *       available source documents in the system
 *     parameters:
 *       - $ref: '#/components/parameters/id_query'
 *       - $ref: '#/components/parameters/service_id_query'
 *       - $ref: '#/components/parameters/parish_code_query'
 *       - $ref: '#/components/parameters/area_code_query'
 *       - $ref: '#/components/parameters/zone_code_query'
 *       - $ref: '#/components/parameters/prov_code_query'
 *       - $ref: '#/components/parameters/reg_code_query'
 *       - $ref: '#/components/parameters/sub_cont_code_query'
 *       - $ref: '#/components/parameters/cont_code_query'
 *       - $ref: '#/components/parameters/week_query'
 *       - $ref: '#/components/parameters/service_date_query'
 *       - $ref: '#/components/parameters/month_query'
 *       - $ref: '#/components/parameters/year_query'
 *       - $ref: '#/components/parameters/page_query'
 *       - $ref: '#/components/parameters/limit_query'
 *       - $ref: '#/components/parameters/sort_query'
 *       - $ref: '#/components/parameters/order_query'
 *     responses:
 *       '200':
 *         description: array of source document data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetSourceDocResponse'
 *       '400':
 *         description: Error retrieving source documents
 */
router.get('/source_doc', getSourceDocs);

/**
 * DELETE method route
 * @example http://localhost:PORT/attendance/
 * @swagger
 * paths:
 *  /attendance:
 *   delete:
 *     tags:
 *       - Reports Attendance
 *     operationId: deleteAttendance
 *     summary: Deletes specific attendance based on given query(s)
 *     description: |
 *       By passing in the appropriate options in the query string, you can delete specific attendance
 *     parameters:
 *       - $ref: '#/components/parameters/id_query'
 *       - $ref: '#/components/parameters/service_id_query'
 *       - $ref: '#/components/parameters/parish_code_query'
 *       - $ref: '#/components/parameters/area_code_query'
 *       - $ref: '#/components/parameters/zone_code_query'
 *       - $ref: '#/components/parameters/prov_code_query'
 *       - $ref: '#/components/parameters/reg_code_query'
 *       - $ref: '#/components/parameters/sub_cont_code_query'
 *       - $ref: '#/components/parameters/cont_code_query'
 *       - $ref: '#/components/parameters/week_query'
 *       - $ref: '#/components/parameters/service_date_query'
 *       - $ref: '#/components/parameters/month_query'
 *       - $ref: '#/components/parameters/year_query'
 *     responses:
 *       '200':
 *         description: Successfully deleted attendance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Attendance deleted successfully
 *       '404':
 *         description: Error retrieving attendance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: No attendance found for the query data supplied
 */
router.delete('/', deleteAttendance);

export default router;