import { Router } from 'express';
import { getCsrSubCategories, getCsrSubCategoryById, createCsrSubCategory } from '../controllers/csr_sub_categories.js';

let router = Router();

router.post('/', createCsrSubCategory);
router.get('/', getCsrSubCategories);
router.get('/:id', getCsrSubCategoryById);

export default router;