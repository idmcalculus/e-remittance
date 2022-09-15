/**
 * Parameters for the components
 * @swagger
 *   components:
 *     requestBodies:
 *       Attendance:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ServiceID'
 *                 - $ref: '#/components/schemas/Hierarchies'
 *                 - $ref: '#/components/schemas/Month'
 *                 - $ref: '#/components/schemas/Year'
 *                 - $ref: '#/components/schemas/Week'
 *                 - $ref: '#/components/schemas/ServiceDate'
 *                 - $ref: '#/components/schemas/Attendance'
 *         description: Attendance Report
 *         required: true
 * 
 *       CSR:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/CategoryID'
 *                 - $ref: '#/components/schemas/SubCategoryID'
 *                 - $ref: '#/components/schemas/Hierarchies'
 *                 - $ref: '#/components/schemas/Month'
 *                 - $ref: '#/components/schemas/Year'
 *                 - $ref: '#/components/schemas/Week'
 *                 - $ref: '#/components/schemas/DateOfActivity'
 *                 - $ref: '#/components/schemas/CommonCSR'
 *                 - $ref: '#/components/schemas/CSR'
 *         description: Attendance Report
 *         required: true
 * 
 *       SourceDoc:
 *         content:
 *           multipart/form-data:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Hierarchies'
 *                 - $ref: '#/components/schemas/Month'
 *                 - $ref: '#/components/schemas/Year'
 *                 - $ref: '#/components/schemas/Week'
 *                 - $ref: '#/components/schemas/ServiceDate'
 *                 - $ref: '#/components/schemas/SourceDoc'
 *                 - $ref: '#/components/schemas/Files'
 *                 - $ref: '#/components/schemas/Timestamps'
 *         description: Attendance Report
 *         required: true
 * 
 *       CSRFiles:
 *         content:
 *           multipart/form-data:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/CategoryID'
 *                 - $ref: '#/components/schemas/SubCategoryID'
 *                 - $ref: '#/components/schemas/Hierarchies'
 *                 - $ref: '#/components/schemas/Month'
 *                 - $ref: '#/components/schemas/Year'
 *                 - $ref: '#/components/schemas/Week'
 *                 - $ref: '#/components/schemas/DateOfActivity'
 *                 - $ref: '#/components/schemas/CSRFiles'
 *                 - $ref: '#/components/schemas/Files'
 *                 - $ref: '#/components/schemas/Timestamps'
 *         description: Attendance Report
 *         required: true
 * 
 */