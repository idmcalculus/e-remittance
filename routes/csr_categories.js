import { Router } from 'express';
import { getCsrCategories, getCsrCategoryById, createCsrCategory } from '../controllers/csr_categories.js';

let router = Router();

router.post('/', createCsrCategory);
router.get('/', getCsrCategories);
router.get('/:id', getCsrCategoryById);

export default router;