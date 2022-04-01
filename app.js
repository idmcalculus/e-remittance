import createError from 'http-errors';
import express, { json, urlencoded } from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index.js';
import attendanceRouter  from './routes/reports_attendance.js';
import csrRouter from './routes/csr_reports.js';
import directoryRouter from './routes/directories.js';
import serviceRouter from './routes/services.js';
import csrCategoryRouter from './routes/csr_categories.js';
import csrSubCategoryRouter from './routes/csr_sub_categories.js';

var app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// view engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/attendance', attendanceRouter);
app.use('/csr_reports', csrRouter);
app.use('/directories', directoryRouter);
app.use('/services', serviceRouter);
app.use('/csr_categories', csrCategoryRouter);
app.use('/csr_sub_categories', csrSubCategoryRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err // req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
