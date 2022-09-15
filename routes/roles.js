import { Router } from 'express';
import { getRoles, createRoles, deleteRoles } from '../controllers/roles.js';

const router = Router();

router.post('/', createRoles);
router.get('/', getRoles);
router.delete('/', deleteRoles);

export default router;