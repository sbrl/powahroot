"use strict";

import RouterContext from './RouterContext.mjs';

/**
 * A standalone HTTP router that's based on the principle of middleware.
 * Based on rill (see the npm package bearing the name), but stripped down and 
 * simplified.
 */
class Router
{
	constructor(verbose = false) {
		/** The actions to run in turn. */
		this.actions = [];
		/** Whether to activate versbose mode. Useful for debugging the router. */
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
	
	/** Shortcut function for attaching an action to any request method. Full function: on */
	any(pathspec, action) { this.on("*", pathspec, action); }
	/** Shortcut function for attaching an action to head requests. Full function: on */
	head(pathspec, action) { this.on(["head"], pathspec, action); }
	/** Shortcut function for attaching an action to get requests. Full function: on */
	get(pathspec, action) { this.on(["get"], pathspec, action); }
	/** Shortcut function for attaching an action to post requests. Full function: on */
	post(pathspec, action) { this.on(["post"], pathspec, action); }
	/** Shortcut function for attaching an action to put requests. Full function: on */
	put(pathspec, action) { this.on(["put"], pathspec, action); }
	/** Shortcut function for attaching an action to delete requests. Full function: on */
	delete(pathspec, action) { this.on(["delete"], pathspec, action); }
	/** Shortcut function for attaching an action to options requests. Full function: on */
	options(pathspec, action) { this.on(["options"], pathspec, action); }
	
	/**
	 * Execute the specified action for requests matching the given parameters.
	 * TODO: Consider merging with on_all and refactoring to take an object literal which we cna destructure instead
	 * @param	{array}			methods		The HTTP methods to run the action for. Include '*' to specify all methods.
	 * @param	{string|regex}	pathspec	The specification of the paths that this action should match against. May be a regular expression.
	 * @param	{Function}		action		The action to execute. Will be passed the parameters `context` (Object) and `next` (Function).
	 */
	on(methods, pathspec, action) {
		let regex_info = pathspec instanceof RegExp ? {regex: pathspec, tokens: [] } : this.pathspec_to_regex(pathspec);
		
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
	 * Converts a path specification into a regular expression.
	 * @param	{string}	pathspec	The path specification to convert.
	 * @return	{RegExp}	The resulting regular expression
	 */
	pathspec_to_regex(pathspec) {
		if(pathspec == "*") // Support wildcards
			return { regex: /^/, tokens: [] };
		
		let tokens = [];
		let regex = new RegExp("^" + pathspec.replace(/::?([a-zA-Z0-9\-_]+)/g, (substr/*, index, template (not actually used)*/) => {
			tokens.push(substr.replace(/:/g, ""));
			
			// FUTURE: We could add optional param support here too
			if(substr.startsWith("::"))
				return `(.+)`;
			else
				return `([^\/]+)`; 
		}) + "$", "i");
		
		/*if(this.verbose)*/ console.error("[router/verbose] Created regex", regex);
		
		return { regex, tokens };
	}
	
	/**
	 * Handles the specified request.
	 * @param  {http.ClientRequest} request  The request to handle.
	 * @param  {http.ServerResponse} response The response object to use to send the response.
	 * @return {[type]}          [description]
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
	 */
	*iterate() {
		for(let action of this.actions) {
			yield action;
		}
	}
}

export default Router;
