"use strict";

import RouterContext from './RouterContext.mjs';
import pathspec_to_regex from '../Shared/Pathspec.mjs';

/**
 * A standalone HTTP router that's based on the principle of middleware.
 * Based on rill (see the npm package bearing the name), but stripped down and 
 * simplified.
 * @param	{Boolean}	verbose		Whether to be verbose and log a bunch of things to the console. Useful for debugging.
 */
class ServerRouter
{
	constructor(verbose = false) {
		/**
		 * The actions to run in turn.
		 * @private
		 * @type {Array<Function>}
		 */
		this.actions = [];
		/** Whether to activate verbose mode. Useful for debugging the router. */
		this.verbose = verbose;
		
		this.default_action = async (ctx) => {
			let message = `No route was found for '${ctx.request.url}'.`;
			if(this.verbose) {
				message += `\n\nRegistered Actions:\n`;
				for(let action of this.actions) {
					message += ` - ${action.toString()}\n`;
				}
			}
			ctx.send.plain(404, message);
		}
	}
	
	/**
	 * Shortcut function for attaching an action to any request method.
	 * Full function: on
	 * @param	{string|RegExp}	pathspec	The pathspec that the route should match against.
	 * @param	{Function}		action		The function to execute when this route is matches.gets passed 2 parameters: context (or type RequestContext) and next (a function). context contains the request / response objects, and next() should be called if the action is middleware.
	 */
	any(pathspec, action) { this.on("*", pathspec, action); }
	/**
	 * Shortcut function for attaching an action to head requests. Full function: on
	 * @param	{string|RegExp}	pathspec	The pathspec that the route should match against.
	 * @param	{Fuction}		action		The function to execute.
	 * @example
	 * router.head("/location/:name/status", (context, _next) => {
	 * 	context.send.plain(200, `Coming in from ${context.params.type} - status ok!`);
	 * });
	 */
	head(pathspec, action) { this.on(["head"], pathspec, action); }
	/**
	 * Shortcut function for attaching an action to get requests. Full function: on
	 * @param	{string|RegExp}	pathspec	The pathspec that the route should match against.
	 * @param	{Fuction}	action	The function to execute.
	 * @example
	 * router.get("/tree/:type", (context, _next) => {
	 * 	context.send.plain(200, `Hello, I am a ${context.params.type}`);
	 * });
	 */
	get(pathspec, action) { this.on(["get"], pathspec, action); }
	/**
	 * Shortcut function for attaching an action to post requests. Full function: on
	 * @param	{string|RegExp}	pathspec	The pathspec that the route should match against.
	 * @param	{Fuction}	action	The function to execute.
	 * @example
	 * router.post("/loaction/:name/update", (context, _next) => {
	 * 	context.send.plain(501, `Hello from ${context.params.name}! I don't yet support updating my firmware.\nYou asked me to update to version ${context.post_data.version}.`);
	 * 	// See https://github.com/sbrl/powahroot/blob/master/examples/parse_post_data.mjs for an example of parsing post data with middleware that works with the above (context.post_data is not created automatically by powahroot)
	 * });
	 */
	post(pathspec, action) { this.on(["post"], pathspec, action); }
	/**
	 * Shortcut function for attaching an action to put requests. Full function: on
	 * @param	{string|RegExp}	pathspec	The pathspec that the route should match against.
	 * @param	{Fuction}	action	The function to execute.
	 */
	put(pathspec, action) { this.on(["put"], pathspec, action); }
	/**
	 * Shortcut function for attaching an action to delete requests. Full function: on
	 * @param	{string|RegExp}	pathspec	The pathspec that the route should match against.
	 * @param	{Fuction}	action	The function to execute.
	 */
	delete(pathspec, action) { this.on(["delete"], pathspec, action); }
	/**
	 * Shortcut function for attaching an action to options requests. Full function: on
	 * @param	{string|RegExp}	pathspec	The pathspec that the route should match against.
	 * @param	{Fuction}	action	The function to execute.
	 * @example
	 * router.options("/location/:name/status", (context, _next) => {
	 * 	context.send.plain(200, `I support these actions:\n - GET: Get my status\n - POST: Set my status\n - OPTIONS: Show this message`);;
	 * });
	 */
	options(pathspec, action) { this.on(["options"], pathspec, action); }
	
	/**
	 * Execute the specified action for requests matching the given parameters.
	 * TODO: Consider merging with on_all and refactoring to take an object literal which we can destructure instead
	 * @param	{array}			methods		The HTTP methods to run the action for. Include '*' to specify all methods.
	 * @param	{string|regex}	pathspec	The specification of the paths that this action should match against. May be a regular expression.
	 * @param	{Function}		action		The action to execute. Will be passed the parameters `context` (RouterContext) and `next` (Function).
	 * @example
	 * router.on(["get"], "/garden/:vegetable", (context) => {
	 * 	context.send(201, `Planted ${context.params.vegetable}`);
	 * });
	 */
	on(methods, pathspec, action) {
		let regex_info = pathspec instanceof RegExp ? {regex: pathspec, tokens: [] } : pathspec_to_regex(pathspec);
		
		// next must be a generator that returns each action in turn
		this.actions.push(async (context, next) => {
			const matches = context.url.pathname.match(regex_info.regex);
			
			if(this.verbose) console.error(`[router/verbose] [${methods.join(", ")} -> ${pathspec} ] Matches: `, matches);
			
			if((methods.indexOf(context.request.method.toLowerCase()) > -1 || methods.indexOf("*") > -1) && matches) {
				if(this.verbose) console.error(`[router/verbose] Match found! Executing action.`);
				for(let i = 1; i < matches.length; i++) { // Skip the top-level group
					context.params[regex_info.tokens[i-1]] = matches[i];
				}
				await action(context, next);
			}
			else {
				if(this.verbose) console.error(`[router/verbose] Nope, didn't match. Moving on`);
				await next();
			}
		});
	}
	
	/**
	 * Adds a route that matches against every request.
	 * Usually useful for middleware (e.g. error handlers, request loggers, authentication handlers, etc.).
	 * @param	{Function}	action	The function to execute.
	 * @example
	 * router.on_all((context) => {
	 * 	context.send.plain(200, "Hello, world!");
	 * });
	 */
	on_all(action) {
		this.actions.push(action);
	}
	
	/**
	 * Runs the specified action for requests if the provided testing function 
	 * returns true.
	 * @param  {Function} test   The testing function. Will be passed the context as it's only parameter.
	 * @param  {Function} action The action to run if the test returns true.
	 */
	onif(test, action) {
		this.actions.push(async (context, next) => {
			let test_result = test(context);
			if(this.verbose) console.error("[router/verbose] Test action result: ", test_result);
			if(test_result)
				await action(context, next);
			else
				await next(context);
		})
	}
	
	/**
	 * Handles the specified request.
	 * Don't forget to await the Promise!
	 * @param	{http.ClientRequest}	request	The request to handle.
	 * @param	{http.ServerResponse}	response	The response object to use to send the response.
	 * @return	{Promise}	A Promise that resolves when handling is complete.
	 * @example
	 * const server = http.createServer(async (request, response) => {
	 * 	await router.handle(request, response);
	 * });
	 * server.listen(3500, "127.0.0.1", () => console.log("Listening on http://127.0.0.1:3500/"));
	 */
	async handle(request, response) {
		let context = new RouterContext(request, response),
			iterator = this.iterate();
		
		// Begin the middleware execution
		this.gen_next(iterator, context)();
	}
	
	/**
	 * Returns an anonymous function that, when called, will execute the next
	 * item of middleware.
	 * It achieves this via a combination of a generator, anonymous function
	 * scope abuse, being recursive, and magic.
	 * You shouldn't need to call this directly.
	 * @private
	 * @param	 {Generator}	iterator	The generator that emits the middleware.
	 * @param	{Object}		context		The context of the request.
	 * @return	{Function}					A magic next function.
	 */
	gen_next(iterator, context) {
		let next_raw = iterator.next();
		// Return the default action if we've reached the end of the line
		if(next_raw.done)
			return async () => { 
				this.default_action(context);
			};
		
		return (async () => {
			if(this.verbose) console.error(`[router/verbose] Executing ${next_raw.value}`);
			await next_raw.value(context, this.gen_next(iterator, context));
		}).bind(this); // Don't forget to bind each successive function to this context
	}
	
	/**
	 * Iterates over all the generated middleware.
	 * @return {Generator} A generator that returns each successive piece of middleware in turn.
	 * @generator
	 */
	*iterate() {
		for(let action of this.actions) {
			yield action;
		}
	}
}

export default ServerRouter;
