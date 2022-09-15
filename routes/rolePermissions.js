import { Router } from 'express';
import { getRolePermissions, createRolePermissions, deleteRolePermissions } from '../controllers/rolePermissions.js';

const router = Router();

router.post('/', createRolePermissions);
router.get('/', getRolePermissions);
router.delete('/', deleteRolePermissions);

export default router;