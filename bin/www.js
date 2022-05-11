#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from '../app.js';
import debug from 'debug';
import { createServer } from 'http';
import { config } from 'dotenv';

config();

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3100');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

process.on('uncaughtException', (error) => {
  console.error(error);
  // attempt a gracefully shutdown
  server.close(() => {
    process.exit(1);
  });

  // If a graceful shutdown is not achieved after 1 second,
  // shut down the process completely
  setTimeout(() => {
    process.abort();
  }, 1000).unref()
});

process.on('unhandledRejection', (reason, promise) => {
  console.error({
    message: 'Unhandled promise rejection',
    params: {
      promise,
      reason,
    },
  });
  server.close(() => {
    process.exit(1);
  });

  setTimeout(() => {
    process.abort();
  }, 1000).unref()
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('e-remittance-app:server')('Listening on ' + bind);
}
