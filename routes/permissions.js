import { Router } from 'express';
import { getPermissions, createPermissions, deletePermissions } from '../controllers/permissions.js';

const router = Router();

router.post('/', createPermissions);
router.get('/', getPermissions);
router.delete('/', deletePermissions);

export default router;