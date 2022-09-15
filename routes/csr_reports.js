import { Router } from 'express';
import { 
	getCsrReport,
	createCsrReport,
	updateCsrReport,
	deleteCsrReport,
	getMonthlyReport,
	getMonthlyReportByCategory,
	getParishCsrReport
} from '../controllers/csr_reports.js';
import { csrLocked } from '../middlewares/admin_settings.js';

const router = Router();

/**
 * POST method route
 * @example http://localhost:PORT/csr_reports/
 * @swagger
 * tags:
 *   - name: CSR Reports
 *     description: |
 *       For reports of CSR activities by parishes, areas, zones, provinces, regions, sub-continents and continents.
 * paths:
 *  /csr_reports:
 *   post:
 *     tags:
 *       - CSR Reports
 *     operationId: insertCSRReport
 *     summary: Creates a new report of CSR activities
 *     requestBody:
 *       $ref: '#/components/requestBodies/CSR'
 *     responses:
 *       '201':
 *         description: Successful insertion of csr report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/modifyCSRResponse'
 *       '400':
 *          description: Error creating/updating csr report
 *
 */
router.post('/', csrLocked, createCsrReport);

/**
 * GET method route
 * @example http://localhost:PORT/attendance/
 * @swagger
 * paths:
 *  /csr_reports:
 *   get:
 *     tags:
 *       - CSR Reports
 *     operationId: getCSRReports
 *     summary: Retrieves some/all CSR Reports
 *     description: |
 *       By passing in the appropriate options in the query string, you can search for
 *       available csr reports in the system
 *     parameters:
 *       - $ref: '#/components/parameters/id_query'
 *       - $ref: '#/components/parameters/category_id_query'
 *       - $ref: '#/components/parameters/sub_category_id_query'
 *       - $ref: '#/components/parameters/parish_code_query'
 *       - $ref: '#/components/parameters/area_code_query'
 *       - $ref: '#/components/parameters/zone_code_query'
 *       - $ref: '#/components/parameters/prov_code_query'
 *       - $ref: '#/components/parameters/reg_code_query'
 *       - $ref: '#/components/parameters/sub_cont_code_query'
 *       - $ref: '#/components/parameters/cont_code_query'
 *       - $ref: '#/components/parameters/date_of_activity_query'
 *       - $ref: '#/components/parameters/week_query'
 *       - $ref: '#/components/parameters/month_query'
 *       - $ref: '#/components/parameters/year_query'
 *       - $ref: '#/components/parameters/page_query'
 *       - $ref: '#/components/parameters/limit_query'
 *       - $ref: '#/components/parameters/sort_query'
 *       - $ref: '#/components/parameters/order_query'
 *     responses:
 *       '200':
 *         description: CSR reports object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/getCSRResponse'
 *       '400':
 *         description: Error retrieving csr reports
 */
router.get('/', getCsrReport);

/**
 * GET method route
 * @example http://localhost:PORT/attendance/
 * @swagger
 * paths:
 *  /csr_reports/monthly_report:
 *   get:
 *     tags:
 *       - CSR Reports
 *     operationId: getMonthlyCSRReports
 *     summary: Retrieves some/all Monthly CSR Reports
 *     description: |
 *       By passing in the appropriate options in the query string, you can search for
 *       available monthly csr reports in the system
 *     parameters:
 *       - $ref: '#/components/parameters/id_query'
 *       - $ref: '#/components/parameters/category_id_query'
 *       - $ref: '#/components/parameters/sub_category_id_query'
 *       - $ref: '#/components/parameters/parish_code_query'
 *       - $ref: '#/components/parameters/area_code_query'
 *       - $ref: '#/components/parameters/zone_code_query'
 *       - $ref: '#/components/parameters/prov_code_query'
 *       - $ref: '#/components/parameters/reg_code_query'
 *       - $ref: '#/components/parameters/sub_cont_code_query'
 *       - $ref: '#/components/parameters/cont_code_query'
 *       - $ref: '#/components/parameters/date_of_activity_query'
 *       - $ref: '#/components/parameters/week_query'
 *       - $ref: '#/components/parameters/month_query'
 *       - $ref: '#/components/parameters/year_query'
 *       - $ref: '#/components/parameters/page_query'
 *       - $ref: '#/components/parameters/limit_query'
 *       - $ref: '#/components/parameters/sort_query'
 *       - $ref: '#/components/parameters/order_query'
 *     responses:
 *       '200':
 *         description: Monthly CSR reports object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/getMonthlyCSRResponse'
 *                 
 *       '400':
 *         description: Error retrieving csr reports
 */
router.get('/monthly_report', getMonthlyReport);


router.get('/monthly_cat_report', getMonthlyReportByCategory);
router.get('/parish_report', getParishCsrReport);
router.put('/:id', csrLocked, updateCsrReport);
router.delete('/', deleteCsrReport);

export default router;