import createError from 'http-errors';
import express, { json, urlencoded } from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { config } from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cors from 'cors';

import { options } from './swagger_options.js';
import indexRouter from './routes/index.js';
import attendanceRouter  from './routes/reports_attendance.js';
import csrRouter from './routes/csr_reports.js';
import serviceRouter from './routes/services.js';
import permissionRouter from './routes/permissions.js';
import roleRouter from './routes/roles.js';
import rolePermissionRouter from './routes/rolePermissions.js';
import csrCategoryRouter from './routes/csr_categories.js';
import csrSubCategoryRouter from './routes/csr_sub_categories.js';
import csrImagesRouter from './routes/csr_files.js';
import adminSettingsRouter from './routes/admin_settings.js';
import speciallyUnlockedRouter from './routes/special_unlock.js';
import hgsAttRouter from './routes/hgs_att.js';

config();
let app = express();

let whitelist = ['http://localhost:12721', 'http://svr4242ww2.rccgportal.org:12721'];
let corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

// app.use(cors(corsOptions));
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// view engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');

const specs = swaggerJsdoc(options);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/attendance', attendanceRouter);
app.use('/csr_reports', csrRouter);
app.use('/csr_image', csrImagesRouter);
app.use('/services', serviceRouter);
app.use('/permissions', permissionRouter);
app.use('/roles', roleRouter);
app.use('/rolePermissions', rolePermissionRouter);
app.use('/csr_categories', csrCategoryRouter);
app.use('/csr_sub_categories', csrSubCategoryRouter);
app.use('/admin_settings', adminSettingsRouter);
app.use('/special_unlock', speciallyUnlockedRouter);
app.use('/hgs_att', hgsAttRouter);

// catch 404 and forward to error handler
app.use(function(_req, _res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, _next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
