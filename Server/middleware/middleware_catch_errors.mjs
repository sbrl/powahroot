"use strict";

import log from '../NamespacedLog.mjs';

const l = log("middleware:handle_errors");

/**
 * Handles errors thrown by handlers further down the chain. 
 * @param	{RequestContext}	context	The RequestContext object.
 * @param	{Function}			next	The function to call to invoke the next middleware item
 * @example
 * import { ServerRouter, middleware_catch_errors } from 'powahroot/Server.mjs';
 * 
 * // ...
 * 
 * const router = new ServerRouter((typeof process.env.DEBUG_ROUTES) === "string");
 * 
 * // Note that ordering matters here! If they were called the other way around then the `.get()` call would be called first before the error handler has been registered!
 * router.on_all(middleware_catch_errors);
 * router.get(`/some_other_route`, another_handler);
 */
async function middleware_catch_errors(context, next) {
	try {
		await next();
	} catch(error) {
		await handle_error(error, context);
	}
}

/**
 * Stringifies an error.
 * @private
 * @param	{Error}		error	The error to stringify.
 * @return	{string}	The stringified error.
 */
function stringify_error(error) {
	if(typeof error.stack !== "undefined") return error.stack.toString();
	return error.toString();
}

/**
 * Handles a given error thrown by a given RequestContext.
 * @protected
 * @param  {Error} error   The error that was thrown.
 * @param  {RequestContext} context The RequestContext from which the error was thrown.
 */
async function handle_error(error, context) {
	l.log(`[${new Date().toLocaleString()}] [${context.request.method} 503] ${context.request.connection.remoteAddress} -> ${context.request.url}`);
	l.error(stringify_error(error)); // TODO: colourise this?
	// TODO: Send a better error page - perhaps with an error id that's uploaded somewhere?
	
	try {
		const production = (process.env["NODE_ENV"] ?? "production") === "production";
		const msg_nice = "An error occurred, and the application server could not complete your request. If this error persists, please get in touch with your system administrator - noting the exact time this happened and the IP address of the requesting client.\n";
		const msg_full = `*** Server Error ***\n${stringify_error(error)}\n`;
		
		// NOTE: If this ends up being a websocket or a server-sent events stream, you may have a problem. You may want to implement your own handler in that case that inspects e.g. context.env.* to see what to do then to send an error back
		// TODO return to this in the future if we add native ServerSentEvents / Websockets support somehow
		
		context.send.plain(503, production ? msg_nice : msg_full);
	}
	catch(error) {
		l.error(`Error: Caught error while sending response to client: ${format_error(error, settings.verbose)}`);
	}
}

export default middleware_catch_errors;
