import { Router } from "express";
import { csrImageUpload } from "../middlewares/multer.js";
import { fileUpload, getCsrFiles } from "../controllers/csr_files.js";
import { csrLocked } from '../middlewares/admin_settings.js';

const router = Router();

/**
 * POST method route
 * @example http://localhost:PORT/csr_image/
 * @swagger
 * tags:
 *   - name: CSR Files
 *     description: |
 *       For uploading files of CSR activities by parishes, areas, zones, provinces, regions, sub-continents and continents.
 * paths:
 *  /csr_image:
 *   post:
 *     tags:
 *       - CSR Files
 *     operationId: uploadCSRFiles
 *     summary: uploads files of CSR activities
 *     responses:
 *       '201':
 *         description: Successful upload of csr image
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadCSRFilesResponse'
 *       '400':
 *         description: Error creating/updating source document
 *     requestBody:
 *       $ref: '#/components/requestBodies/CSRFiles'
 * 
 */
router.post('/', csrImageUpload, csrLocked, fileUpload);

/**
 * GET method route
 * @example http://localhost:PORT/csr_image/
 * @swagger
 * paths:
 *  /csr_image:
 *   get:
 *     tags:
 *       - CSR Files
 *     operationId: getCSRFiles
 *     summary: Retrieves some/all CSR Files
 *     description: |
 *       By passing in the appropriate options in the query string, you can search for
 *       available csr files in the system
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
 *         description: array of csr files
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetCSRFilesResponse'
 *       '400':
 *         description: Error retrieving csr files
 */
router.get('/', getCsrFiles);

export default router;