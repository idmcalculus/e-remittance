/**
 * Schemas for the components
 * @swagger
 *   components:
 *     schemas:
 *       week:
 *         type: string
 *         example: Week 1
 * 
 *       month:
 *         type: string
 *         enum:
 *           - Jan
 *           - Feb
 *           - Mar
 *           - Apr
 *           - May
 *           - Jun
 *           - Jul
 *           - Aug
 *           - Sep
 *           - Oct
 *           - Nov
 *           - Dec
 *         default: Jan
 * 
 *       year:
 *         type: integer
 *         example: 2022
 * 
 *       ID:
 *         type: object
 *         properties:
 *           id:
 *             type: integer
 *             example: 1
 * 
 *       ServiceID:
 *         type: object
 *         properties:
 *           service_id:
 *             type: integer
 *             example: 1
 * 
 *       ServiceDate:
 *         type: object
 *         properties:
 *           service_date:
 *             type: string
 *             format: date
 *             example: '2022-06-01'
 * 
 *       DateOfActivity:
 *         type: object
 *         properties:
 *           date_of_activity:
 *             type: string
 *             format: date
 *             example: '2022-06-01'
 * 
 *       Week:
 *         type: object
 *         properties:
 *           week:
 *             $ref: '#/components/schemas/week'
 * 
 *       Month:
 *         type: object
 *         properties:
 *           month:
 *             $ref: '#/components/schemas/month'
 * 
 *       Year:
 *         type: object
 *         properties:
 *           year:
 *             $ref: '#/components/schemas/year'
 * 
 *       CategoryID:
 *         type: object
 *         properties:
 *           category_id:
 *             type: integer
 *             example: 1
 * 
 *       SubCategoryID:
 *         type: object
 *         properties:
 *           sub_category_id:
 *             type: integer
 *             example: 1
 * 
 *       CategoryName:
 *         type: object
 *         properties:
 *           cat_name:
 *             type: string
 *             example: Education
 * 
 *       SubCategoryName:
 *         type: object
 *         properties:
 *           sub_cat_name:
 *             type: string
 *             example: School building
 * 
 *       FilePath:
 *         type: object
 *         properties:
 *           file_path:
 *             type: string
 * 
 *       Hierarchies:
 *         type: object
 *         properties:
 *           parish_code:
 *             type: string
 *             example: 715701
 *           area_code:
 *             type: string
 *             example: AR300000000
 *           zone_code:
 *             type: string
 *             example: ZN300000000
 *           prov_code:
 *             type: string
 *             example: AB34
 *           reg_code:
 *             type: string
 *             example: R01
 *           sub_cont_code:
 *             type: string
 *             example: SC01
 *           cont_code:
 *             type: string
 *             example: C01
 * 
 *       Timestamps:
 *         type: object
 *         properties:
 *           created_at:
 *             type: string
 *             format: date-time
 *             example: '2020-01-01T00:00:00.000Z'
 *           updated_at:
 *             type: string
 *             format: date-time
 *             example: '2020-01-01T00:00:00.000Z'
 * 
 *       Attendance:
 *         type: object
 *         properties:
 *           men:
 *             type: integer
 *             example: 100
 *           women:
 *             type: integer
 *             example: 100
 *           children:
 *             type: integer
 *             example: 100
 *           adult_men:
 *             type: integer
 *             example: 100
 *           adult_women:
 *             type: integer
 *             example: 100
 *           youth_men:
 *             type: integer
 *             example: 100
 *           youth_women:
 *             type: integer
 *             example: 100
 *           teenagers:
 *             type: integer
 *             example: 100
 *           youngstars:
 *             type: integer
 *             example: 100
 *           total_adults:
 *             type: integer
 *             example: 100
 *           total_youths:
 *             type: integer
 *             example: 100
 *           total_att:
 *             type: integer
 *             example: 100
 *           marriages:
 *             type: integer
 *           births:
 *             type: integer
 *           demises:
 *             type: integer
 *           converts:
 *             type: integer
 *           first_timers:
 *             type: integer
 *           hf_centres:
 *             type: integer
 *           unord_ministers:
 *             type: integer
 *           bapt_workers:
 *             type: integer
 *           bapt_members:
 *             type: integer
 *           att_s_prog:
 *             type: integer
 *           att_vigil:
 *             type: integer
 *           new_workers:
 *             type: integer
 *           asst_pastors:
 *             type: integer
 *           full_pastors:
 *             type: integer
 *           dcns:
 *             type: integer
 *           workers_at_lgaf:
 *             type: integer
 *           souls_at_lgaf:
 *             type: integer
 * 
 *       MonthlyAttendance:
 *         type: object
 *         properties:
 *           avg_men:
 *             type: integer
 *             example: 100
 *           avg_women:
 *             type: integer
 *             example: 100
 *           avg_children:
 *             type: integer
 *             example: 100
 *           avg_adult_men:
 *             type: integer
 *             example: 100
 *           avg_adult_women:
 *             type: integer
 *             example: 100
 *           avg_adults:
 *             type: integer
 *             example: 100
 *           avg_youth_men:
 *             type: integer
 *             example: 100
 *           avg_youth_women:
 *             type: integer
 *             example: 100
 *           avg_youths:
 *             type: integer
 *             example: 100
 *           avg_teenagers:
 *             type: integer
 *             example: 100
 *           avg_youngstars:
 *             type: integer
 *             example: 100
 *           avg_total:
 *             type: integer
 *             example: 100
 * 
 *       SourceDoc:
 *         type: object
 *         properties:
 *           report_att_id:
 *             type: integer
 * 
 *       Files:
 *         type: object
 *         properties:
 *           description:
 *             type: string
 *           file_key:
 *             type: string
 *           file_name:
 *             type: string
 *           file_type:
 *             type: string
 *           file_size:
 *             type: string
 *           aws_bucket_url:
 *             type: string
 * 
 *       ProgressReportMWC:
 *         type: object
 *         properties:
 *           this_month_total:
 *             type: integer
 *           prev_month_total:
 *             type: integer
 *           difference_total:
 *             type: integer
 *           percent_diff_total:
 *             type: number
 *             format: double
 *             example: 10.00
 *           this_month_avg:
 *             type: integer
 *           prev_month_avg:
 *             type: integer
 *           difference_avg:
 *             type: integer
 *           percent_diff_avg:
 *             type: number
 *             format: double
 *             example: 10.00
 * 
 *       ProgressReportOthers:
 *         type: object
 *         properties:
 *           this_month_value:
 *             type: integer
 *           prev_month_value:
 *             type: integer
 *           difference:
 *             type: integer
 *           percent_diff:
 *             type: number
 *             format: double
 *             example: 10.00
 * 
 *       ProgressReportServicesData:
 *         type: object
 *         properties:
 *           service_name:
 *             type: string
 *             example: 'Sunday Service'
 *           service_id:
 *             type: integer
 *             example: 1
 *           service_name_slug:
 *             type: string
 *             example: 'sunday_service'
 *           men:
 *             $ref: '#/components/schemas/ProgressReportMWC'
 *           women:
 *             $ref: '#/components/schemas/ProgressReportMWC'
 *           children:
 *             $ref: '#/components/schemas/ProgressReportMWC'
 *           total_avg:
 *             $ref: '#/components/schemas/ProgressReportOthers'
 *           total_att:
 *             $ref: '#/components/schemas/ProgressReportOthers'
 * 
 *       CSR:
 *         type: object
 *         properties:
 *           project:
 *             type: string
 *             example: School Feeding
 *           description:
 *             type: string
 *           quantity:
 *             type: integer
 *             example: 10
 *           address:
 *             type: string
 *           postal_code:
 *             type: string
 *           lga:
 *             type: string
 *           city:
 *             type: string
 *           state:
 *             type: string
 *           country:
 *             type: string
 *           testimonies:
 *             type: string
 *           challenges:
 *             type: string
 *           recommendations:
 *             type: string
 *           comment:
 *             type: string
 *           others:
 *             type: string
 * 
 *       CommonCSR:
 *         type: object
 *         properties:
 *           expenditure:
 *             type: number
 *             format: float
 *             example: 10000.00
 *           csr_offering:
 *             type: number
 *             format: float
 *             example: 10000.00
 *           beneficiaries:
 *             type: integer
 *             example: 100
 *           souls:
 *             type: integer
 *             example: 100
 * 
 *       MonthlyCSR:
 *         type: object
 *         properties:
 *           num_activity:
 *             type: integer
 *             example: 1
 *           income_utilization:
 *             type: number
 *           num_lga:
 *             type: integer
 *             example: 1
 *           num_state:
 *             type: integer
 *             example: 1
 *           num_country:
 *             type: integer
 *             example: 1
 * 
 *       CSRFiles:
 *         type: object
 *         properties:
 *           report_id:
 *             type: integer
 * 
 *       CSRFilesData:
 *         allOf:
 *           - $ref: '#/components/schemas/ID'
 *           - $ref: '#/components/schemas/CategoryID'
 *           - $ref: '#/components/schemas/SubCategoryID'
 *           - $ref: '#/components/schemas/Hierarchies'
 *           - $ref: '#/components/schemas/Month'
 *           - $ref: '#/components/schemas/Year'
 *           - $ref: '#/components/schemas/Week'
 *           - $ref: '#/components/schemas/DateOfActivity'
 *           - $ref: '#/components/schemas/CSRFiles'
 *           - $ref: '#/components/schemas/Files'
 *           - $ref: '#/components/schemas/Timestamps'
 * 
 *       AttResponse:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *             example: success
 *           message:
 *             type: string
 *             example: Attendance created/updated/retrieved successfully
 *           data:
 *             type: array
 *             items:
 *               allOf:
 *                 - $ref: '#/components/schemas/ID'
 *                 - $ref: '#/components/schemas/ServiceID'
 *                 - $ref: '#/components/schemas/Hierarchies'
 *                 - $ref: '#/components/schemas/Month'
 *                 - $ref: '#/components/schemas/Year'
 *                 - $ref: '#/components/schemas/Week'
 *                 - $ref: '#/components/schemas/ServiceDate'
 *                 - $ref: '#/components/schemas/Attendance'
 *                 - $ref: '#/components/schemas/Timestamps'
 * 
 *       UploadSourceDocResponse:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *             example: success
 *           data:
 *             allOf:
 *               - $ref: '#/components/schemas/ID'
 *               - $ref: '#/components/schemas/Hierarchies'
 *               - $ref: '#/components/schemas/Month'
 *               - $ref: '#/components/schemas/Year'
 *               - $ref: '#/components/schemas/Week'
 *               - $ref: '#/components/schemas/ServiceDate'
 *               - $ref: '#/components/schemas/SourceDoc'
 *               - $ref: '#/components/schemas/Files'
 *               - $ref: '#/components/schemas/Timestamps'
 * 
 *       GetSourceDocResponse:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *             example: success
 *           data:
 *             allOf:
 *               - $ref: '#/components/schemas/ID'
 *               - $ref: '#/components/schemas/Hierarchies'
 *               - $ref: '#/components/schemas/Month'
 *               - $ref: '#/components/schemas/Year'
 *               - $ref: '#/components/schemas/Week'
 *               - $ref: '#/components/schemas/ServiceDate'
 *               - $ref: '#/components/schemas/SourceDoc'
 *               - $ref: '#/components/schemas/Files'
 *               - $ref: '#/components/schemas/FilePath'
 *               - $ref: '#/components/schemas/Timestamps'
 * 
 *       MonthlyAttResponse:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *             example: success
 *           message:
 *             type: string
 *             example: Attendance created/updated/retrieved successfully
 *           data:
 *             type: array
 *             items:
 *               allOf:
 *                 - $ref: '#/components/schemas/ID'
 *                 - $ref: '#/components/schemas/ServiceID'
 *                 - $ref: '#/components/schemas/Hierarchies'
 *                 - $ref: '#/components/schemas/Month'
 *                 - $ref: '#/components/schemas/Year'
 *                 - $ref: '#/components/schemas/Attendance'
 *                 - $ref: '#/components/schemas/MonthlyAttendance'
 *                 - $ref: '#/components/schemas/Timestamps'
 * 
 *       ParishAttResponse:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *             example: success
 *           weeklyReports:
 *             type: array
 *             items:
 *               allOf:
 *                 - $ref: '#/components/schemas/ID'
 *                 - $ref: '#/components/schemas/ServiceID'
 *                 - $ref: '#/components/schemas/Hierarchies'
 *                 - $ref: '#/components/schemas/Month'
 *                 - $ref: '#/components/schemas/Year'
 *                 - $ref: '#/components/schemas/Week'
 *                 - $ref: '#/components/schemas/ServiceDate'
 *                 - $ref: '#/components/schemas/Attendance'
 *                 - $ref: '#/components/schemas/Timestamps'
 *           monthlyReport:
 *             type: array
 *             items:
 *               allOf:
 *                 - $ref: '#/components/schemas/ID'
 *                 - $ref: '#/components/schemas/ServiceID'
 *                 - $ref: '#/components/schemas/Hierarchies'
 *                 - $ref: '#/components/schemas/Month'
 *                 - $ref: '#/components/schemas/Year'
 *                 - $ref: '#/components/schemas/Attendance'
 *                 - $ref: '#/components/schemas/MonthlyAttendance'
 *                 - $ref: '#/components/schemas/Timestamps'
 * 
 *       ProgressReportResponse:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *             example: success
 *           progressData:
 *             allOf:
 *               - type: object
 *                 properties:
 *                   this_month:
 *                     type: string
 *                     example: Jan 2022
 *                   prev_month:
 *                     type: string
 *                     example: Jan 2022
 *               - $ref: '#/components/schemas/Year'
 *               - type: object
 *                 properties:
 *                   servicesData:
 *                     $ref: '#/components/schemas/ProgressReportServicesData'
 *                   converts:
 *                     $ref: '#/components/schemas/ProgressReportOthers'
 *                   births:
 *                     $ref: '#/components/schemas/ProgressReportOthers'
 *                   demises:
 *                     $ref: '#/components/schemas/ProgressReportOthers'
 *                   marriages:
 *                     $ref: '#/components/schemas/ProgressReportOthers'
 * 
 *       modifyCSRResponse:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *             example: success
 *           message:
 *             type: string
 *             example: Data inserted/updated successfully
 *           data:
 *             type: array
 *             items:
 *               allOf:
 *                 - $ref: '#/components/schemas/ID'
 *                 - $ref: '#/components/schemas/CategoryID'
 *                 - $ref: '#/components/schemas/SubCategoryID'
 *                 - $ref: '#/components/schemas/Hierarchies'
 *                 - $ref: '#/components/schemas/Month'
 *                 - $ref: '#/components/schemas/Year'
 *                 - $ref: '#/components/schemas/Week'
 *                 - $ref: '#/components/schemas/DateOfActivity'
 *                 - $ref: '#/components/schemas/CommonCSR'
 *                 - $ref: '#/components/schemas/CSR'
 *                 - $ref: '#/components/schemas/Timestamps'
 * 
 *       getCSRResponse:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *             example: success
 *           data:
 *             type: array
 *             items:
 *               allOf:
 *                 - $ref: '#/components/schemas/ID'
 *                 - $ref: '#/components/schemas/CategoryID'
 *                 - $ref: '#/components/schemas/SubCategoryID'
 *                 - $ref: '#/components/schemas/Hierarchies'
 *                 - $ref: '#/components/schemas/Month'
 *                 - $ref: '#/components/schemas/Year'
 *                 - $ref: '#/components/schemas/Week'
 *                 - $ref: '#/components/schemas/DateOfActivity'
 *                 - $ref: '#/components/schemas/CommonCSR'
 *                 - $ref: '#/components/schemas/CSR'
 *                 - $ref: '#/components/schemas/CategoryName'
 *                 - $ref: '#/components/schemas/SubCategoryName'
 *                 - type: object
 *                   properties:
 *                     csr_files:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/CSRFilesData'
 *                           - $ref: '#/components/schemas/FilePath'
 *                     num_files:
 *                       type: integer
 *                       example: 1
 *                 - $ref: '#/components/schemas/Timestamps'
 * 
 *       getMonthlyCSRResponse:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *             example: success
 *           data:
 *             type: array
 *             items:
 *               allOf:
 *                 - $ref: '#/components/schemas/ID'
 *                 - $ref: '#/components/schemas/CategoryID'
 *                 - $ref: '#/components/schemas/SubCategoryID'
 *                 - $ref: '#/components/schemas/Hierarchies'
 *                 - $ref: '#/components/schemas/Month'
 *                 - $ref: '#/components/schemas/Year'
 *                 - $ref: '#/components/schemas/Week'
 *                 - $ref: '#/components/schemas/CommonCSR'
 *                 - $ref: '#/components/schemas/MonthlyCSR'
 *                 - $ref: '#/components/schemas/CategoryName'
 *                 - $ref: '#/components/schemas/SubCategoryName'
 *                 - type: object
 *                   properties:
 *                     csr_files:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/CSRFilesData'
 *                           - $ref: '#/components/schemas/FilePath'
 *                     num_files:
 *                       type: integer
 *                       example: 1
 *                 - $ref: '#/components/schemas/Timestamps'
 * 
 *       UploadCSRFilesResponse:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *             example: success
 *           data:
 *             $ref: '#/components/schemas/CSRFilesData'
 * 
 *       GetCSRFilesResponse:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *             example: success
 *           data:
 *             allOf:
 *               - $ref: '#/components/schemas/CSRFilesData'
 *               - $ref: '#/components/schemas/FilePath'
 *    
 */