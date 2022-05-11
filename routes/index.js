import { Router } from 'express';
const router = Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'E-remittance App',
    url: 'https://app.swaggerhub.com/apis-docs/idmcalculus/RCCG-E-Remittance-API/1.0.0'
  });
});

export default router;
