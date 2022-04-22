import { Router } from 'express';
import { getCsrCategories, createCsrCategory, updateCsrCategory, deleteCsrCategory } from '../controllers/csr_categories.js';

let router = Router();

router.post('/', createCsrCategory);
router.get('/', getCsrCategories);
router.put('/', updateCsrCategory);
router.delete('/', deleteCsrCategory);

export default router;