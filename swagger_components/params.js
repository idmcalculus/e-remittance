/**
 * Parameters for the components
 * @swagger
 *   components:
 *     parameters:
 *       id_query:
 *         in: query
 *         name: id
 *         description: pass an optional id to retrieve the data with that id
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 * 
 *       category_id_query:
 *         in: query
 *         name: category_id
 *         description: pass an optional category_id to retrieve the CSR data with that category_id
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 * 
 *       category_id_query_required:
 *         in: query
 *         name: category_id
 *         description: pass the category_id to retrieve the CSR data with that category_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 * 
 *       sub_category_id_query:
 *         in: query
 *         name: sub_category_id
 *         description: pass an optional sub_category_id to retrieve the CSR data with that sub_category_id
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 * 
 *       sub_category_id_query_required:
 *         in: query
 *         name: sub_category_id
 *         description: pass the sub_category_id to retrieve the CSR data with that sub_category_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *
 *       service_id_query:
 *         in: query
 *         name: service_id
 *         description: id of the service
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 * 
 *       service_id_query_required:
 *         in: query
 *         name: service_id
 *         description: id of the service
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *
 *       parish_code_query:
 *         in: query
 *         name: parish_code
 *         description: code peculiar to a parish
 *         required: false
 *         schema:
 *           type: string
 *           example: 715701
 * 
 *       parish_code_query_required:
 *         in: query
 *         name: parish_code
 *         description: code peculiar to a parish
 *         required: true
 *         schema:
 *           type: string
 *           example: 715701
 *
 *       area_code_query:
 *         in: query
 *         name: area_code
 *         description: code peculiar to an area
 *         required: false
 *         schema:
 *           type: string
 *           example: AR300000000
 * 
 *       area_code_query_required:
 *         in: query
 *         name: area_code
 *         description: code peculiar to an area
 *         required: true
 *         schema:
 *           type: string
 *           example: AR300000000
 *
 *       zone_code_query:
 *         in: query
 *         name: zone_code
 *         description: code peculiar to a zone
 *         required: false
 *         schema:
 *           type: string
 *           example: ZN300000000
 * 
 *       zone_code_query_required:
 *         in: query
 *         name: zone_code
 *         description: code peculiar to a zone
 *         required: true
 *         schema:
 *           type: string
 *           example: ZN300000000
 *
 *       prov_code_query:
 *         in: query
 *         name: prov_code
 *         description: code peculiar to a province
 *         required: false
 *         schema:
 *           type: string
 *           example: AB34
 * 
 *       prov_code_query_required:
 *         in: query
 *         name: prov_code
 *         description: code peculiar to a province
 *         required: true
 *         schema:
 *           type: string
 *           example: AB34
 *
 *       reg_code_query:
 *         in: query
 *         name: reg_code
 *         description: code peculiar to a region
 *         required: false
 *         schema:
 *           type: string
 *           example: R01
 * 
 *       reg_code_query_required:
 *         in: query
 *         name: reg_code
 *         description: code peculiar to a region
 *         required: true
 *         schema:
 *           type: string
 *           example: R01
 *
 *       sub_cont_code_query:
 *         in: query
 *         name: sub_cont_code
 *         description: code peculiar to a sub-continent
 *         required: false
 *         schema:
 *           type: string
 *           example: SC01
 * 
 *       sub_cont_code_query_required:
 *         in: query
 *         name: sub_cont_code
 *         description: code peculiar to a sub-continent
 *         required: true
 *         schema:
 *           type: string
 *           example: SC01
 *
 *       cont_code_query:
 *         in: query
 *         name: cont_code
 *         description: code peculiar to a continent
 *         required: false
 *         schema:
 *           type: string
 *           example: C01
 * 
 *       cont_code_query_required:
 *         in: query
 *         name: cont_code
 *         description: code peculiar to a continent
 *         required: true
 *         schema:
 *           type: string
 *           example: C01
 *
 *       service_date_query:
 *         in: query
 *         name: service_date
 *         description: date of the service
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: '2022-06-01'
 * 
 *       service_date_query_required:
 *         in: query
 *         name: service_date
 *         description: date of the service
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: '2022-06-01'
 * 
 *       date_of_activity_query:
 *         in: query
 *         name: date_of_activity
 *         description: date of the CSR activity
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: '2022-06-01'
 * 
 *       date_of_activity_query_required:
 *         in: query
 *         name: date_of_activity
 *         description: date of the CSR activity
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: '2022-06-01'
 *
 *       week_query:
 *         in: query
 *         name: week
 *         description: week of the service/activity
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/week'
 * 
 *       week_query_required:
 *         in: query
 *         name: week
 *         description: week of the service/activity
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/week'
 *
 *       month_query:
 *         in: query
 *         name: month
 *         description: month of the service/activity
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/month'
 * 
 *       month_query_required:
 *         in: query
 *         name: month
 *         description: month of the service/activity
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/month'
 *
 *       year_query:
 *         in: query
 *         name: year
 *         description: year of the service/activity
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/year'
 * 
 *       year_query_required:
 *         in: query
 *         name: year
 *         description: year of the service/activity
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/year'
 *
 *       page_query:
 *         in: query
 *         name: page
 *         description: supply a page to calculate offset of records to skip
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *
 *       limit_query:
 *         in: query
 *         name: limit
 *         description: maximum number of records to return
 *         required: false
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           maximum: 100
 *           example: 1
 *
 *       sort_query:
 *         in: query
 *         name: sort
 *         description: sort records by a field
 *         required: false
 *         schema:
 *           type: string
 *           example: id
 *
 *       order_query:
 *         in: query
 *         name: order
 *         description: the order by which the records will be sorted
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *           default: asc
 *
 */