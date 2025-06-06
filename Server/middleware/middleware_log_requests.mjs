"use strict";

import pretty_ms from 'pretty-ms';

import log from '../NamespacedLog.mjs'; const l = log("route");

async function middleware_log_requests(ctx, next) {
	let start = new Date();
	
	await next();
	
	l.log(`[${pretty_ms(new Date() - start)}] [${ctx.request.method} ${ctx.response.statusCode}] ${ctx.request.connection.remoteAddress} -> ${ctx.request.url}`);
}

export default middleware_log_requests;
