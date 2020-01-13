"use strict";

import RouterContext from 'powahroot/Server/RouterContext.mjs';
//import { middleware_catch_errors } from './monitor.mjs';

// Maximum body size in characters
const max_request_body_length = 128 * 1024; // 128K


function depostify(postdata) {
	return postdata.split("&").reduce(function (decoded, chunk) {
		chunk = chunk.split("=").map(decodeURIComponent);
		decoded[chunk[0]] = chunk[1];
		return decoded;
	}, {})
}


/**
 * Parses URL-encoded POST data out into the context.env.post_data variable.
 * @param	{RouterContext}	context	The context object.
 * @param	{Function}		next	Function to invoke the next middleware item
 */
async function middleware_parse_post(context, next) {
	let raw_post_data = "";
	context.request.on("data", async (chunk) => {
		if(raw_post_data.length + chunk.length > max_request_body_length) {
			context.send.plain(413, "Error: Request payload was too large.");
			return;
		}
		raw_post_data += chunk;
	});
	
	context.request.on("end", async () => {
		context.env.post_data = depostify(raw_post_data);
		// Institute another error-catching safety net. This is needed because
		// we're in an event here, which breaks the async chain.
		//await middleware_catch_errors(context, next);
		await next();
	});
}

export default middleware_parse_post;
