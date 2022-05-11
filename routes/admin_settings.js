import { Router } from "express";
import { createSettings, getSettings } from "../controllers/admin_settings.js";

const router = Router();

router.post('/', createSettings);
router.get('/', getSettings);

export default router;