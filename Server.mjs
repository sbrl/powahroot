import ServerRouter from './Server/Router.mjs';
import NamespacedLog from './Server/NamespacedLog.mjs';
import {
	middleware_log_requests,
	middleware_catch_errors,
	middleware_parse_json
} from './Server/middleware/middleware.mjs';

export default ServerRouter;
export {
	// The main server router class. You want this
	ServerRouter,
	// Helper class for logging, used in the default middleware that comes with powahroot but requires manual registration with any ServerRouter class
	NamespacedLog,
	// A library of default powahroot-provided middleware for common tasks
	middleware_log_requests,	// Logs requests to stdout
	middleware_catch_errors,	// Catches errors and sends/logs an error message depending on NODE_ENV
	middleware_parse_json		// Parses request body as JSON & attaches as context.env.body
};