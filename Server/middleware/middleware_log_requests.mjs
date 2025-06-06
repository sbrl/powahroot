"use strict";

import pretty_ms from 'pretty-ms';

import log from '../NamespacedLog.mjs';import RouterContext from '../RouterContext.mjs';
 const l = log("route");

/**
 * Middleware for logging requests to stdout.
 * @param	{RouterContext}	ctx		The router context to operate on.
 * @param	{Function}		next	The next() function that is provided by powahroot.
 * @return	{void}
 * @example
 * import { ServerRouter, middleware_log_requests } from 'powahroot/Server.mjs';
 * 
 * // ...
 * 
 * const router = new ServerRouter((typeof process.env.DEBUG_ROUTES) === "string");
 * 
 * // Note that ordering matters here! If they were called the other way around then the `.get()` call would be called first before the logger has been registered!
 * // Note also that you would want to register the error handler BEFORE the logger.... because in the unlikely event the logger crashes it would otherwise bring down the entire server!
 * router.on_all(middleware_log_requests);
 * router.get(`/some_other_route`, another_handler);
 */
async function middleware_log_requests(ctx, next) {
	let start = new Date();
	
	await next();
	
	l.log(`[${pretty_ms(new Date() - start)}] [${ctx.request.method} ${ctx.response.statusCode}] ${ctx.request.connection.remoteAddress} -> ${ctx.request.url}`);
}

export default middleware_log_requests;
