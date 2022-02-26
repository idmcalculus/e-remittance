import { Router } from 'express';
import { getRegionDirectory, getRegionDirectoryById, createRegionDirectory } from '../controllers/directory_region.js';
import { getProvinceDirectory, getProvinceDirectoryById, createProvinceDirectory } from '../controllers/directory_province.js';
import { getZoneDirectory, getZoneDirectoryById, createZoneDirectory, updateZoneDirectory } from '../controllers/directory_zone.js';
import { getAreaDirectory, getAreaDirectoryById, createAreaDirectory, updateAreaDirectory } from '../controllers/directory_area.js';
import { getParishDirectory, getParishDirectoryById, createParishDirectory, updateParishDirectory } from '../controllers/directory_parish.js';
import { getPrincipalOfficersDirectory, getPrincipalOfficersDirectoryById, createPrincipalOfficersDirectory, updatePrincipalOfficersDirectory } from '../controllers/directory_principal_officers.js';

let router = Router();

router.post('/regions', createRegionDirectory);
router.get('/regions', getRegionDirectory);
router.get('/regions/:id', getRegionDirectoryById);

router.post('/provinces', createProvinceDirectory);
router.get('/provinces', getProvinceDirectory);
router.get('/provinces/:id', getProvinceDirectoryById);

router.post('/zones', createZoneDirectory);
router.get('/zones', getZoneDirectory);
router.get('/zones/:id', getZoneDirectoryById);
router.put('/zones/:id', updateZoneDirectory);

router.post('/areas', createAreaDirectory);
router.get('/areas', getAreaDirectory);
router.get('/areas/:id', getAreaDirectoryById);
router.put('/areas/:id', updateAreaDirectory);

router.post('/parishes', createParishDirectory);
router.get('/parishes', getParishDirectory);
router.get('/parishes/:id', getParishDirectoryById);
router.put('/parishes/:id', updateParishDirectory);

router.post('/principal-officers', createPrincipalOfficersDirectory);
router.get('/principal-officers', getPrincipalOfficersDirectory);
router.get('/principal-officers/:id', getPrincipalOfficersDirectoryById);
router.put('/principal-officers/:id', updatePrincipalOfficersDirectory);

export default router;