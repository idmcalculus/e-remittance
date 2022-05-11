import { Router } from 'express';
import { getCsrSubCategories, createCsrSubCategory } from '../controllers/csr_sub_categories.js';

const router = Router();

router.post('/', createCsrSubCategory);
router.get('/', getCsrSubCategories);

export default router;