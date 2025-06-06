"use strict";

// TODO test this, and all the other bits of middleware we've written

/**
 * Middleware that reads the request body from the client, parses it as JSON, and attaches it to `context.env.body`.
 * Does nothing if the client doesn't set the correct content-type of application/json.
 * 
 * **IMPORTANT:** Unlike the other builtin middlewares, this is a function that returns the REAL middleware function! This is because we need some way to pass options to it elegantly without requiring function binding etc which looks bad.
 * 
 * @param	{number}	[max_length_body=2*1024*1024]		The maximum length of the client body to accept before returning a HTTP error 413 content too large. Defaults to 2MB,
 * @return  {function}	The real middleware function.
 * @example
 * import { ServerRouter, middleware_parse_json } from 'powahroot/Server.mjs';
 * 
 * // ...
 * 
 * const router = new ServerRouter((typeof process.env.DEBUG_ROUTES) === "string");
 * 
 * // Note that ordering matters here! If they were called the other way around then the `.post()` call would be called first before the JSON parser middleware has been registered!
 * // Note also that you would want to register the error handler BEFORE the JSON parser.... because in the event the JSON parser crashes it would otherwise bring down the entire server!
 * router.on_all(middleware_parse_json(100)); // Allow a max of 100 BYTES of JSON
 * router.post(`/some_other_route`, another_handler);
 */
export default function (max_length_body=2*1024*1024) {
	return function middleware_parse_json(ctx, next) {
		return new Promise((resolve, reject) => {
			if(typeof ctx.request.headers["content-type"] != "string" || ctx.request.headers["content-type"].toLowerCase().trim() !== `application/json`) {
				ctx.send.plain(406, `Invalid content-type (expected application/json).`);
				resolve(); // reject() causes an error, and that isn't what we want to do!
				return; // don't continue to parse if we have already handled this
			}
			
			let body = ``;
			let body_length = 0;
			const handle_error = function (msg) {
				ctx.request.off(`data`, handle_data);
				ctx.request.off(`end`, handle_end);
				// no need to remove handle_error since we use .once() anyway
				reject(msg);
			}
			const handle_data = function (chunk) {
				if(body_length > max_length_body) {
					ctx.send.plain(413, `Request payload too large`);

					// Remove stray event handlers to avoid memory leaks
					ctx.request.off(`error`, handle_error);
					ctx.request.off(`data`, handle_data);
					ctx.request.off(`end`, handle_end);
					resolve(); // reject causes an error, and that's not what we wanna do
					return;
				}
				body += chunk;
				body_length += chunk.length;
			}
			const handle_end = function() {
				try {
					ctx.env.body = JSON.parse(body);
				} catch(error) {
					ctx.send.plain(400, `JSON syntax error`);
					
					// Remove stray event handlers to avoid memory leaks
					ctx.request.off(`error`, handle_error);
					ctx.request.off(`data`, handle_data);
					
					resolve(); // reject causes an error, and that's not what we wanna do
					return;
				}
				
				// Remove stray event handlers to avoid memory leaks
				ctx.request.off(`error`, handle_error);
				ctx.request.off(`data`, handle_data);
				
				// Only call next if we were fully successful
				next().then(resolve);
			}
			ctx.request.once(`error`, handle_error);
			ctx.request.on(`data`, handle_data);
			ctx.request.once(`end`, handle_end);
		});
	}	
}
