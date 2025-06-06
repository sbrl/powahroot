#!/usr/bin/env node
"use strict";

import http from 'http';

import { ServerRouter, middleware_catch_errors, middleware_log_requests } from '../Server.mjs';

const port = 3029;
const bind_address = `::1`


// ---------------------

const router = new ServerRouter((typeof process.env.DEBUG_ROUTES) === "string");
router.on_all(middleware_catch_errors);
router.on_all(middleware_log_requests);

router.get(`/crash`, async (ctx, next) => {
	throw new Error(`Oops, something went wrong. This is a test error to demonstrate middleware_catch_errors. Error code ${Math.floor(Math.random() * 100)}`);
});
router.get(`/:name`, async (context, next) => {
	context.send.plain(200, `Hello, ${context.params.name}!\n`);
	// We don't call await next() here 'cause this is the last in the chain
});

const server = http.createServer((request, response) => {
	router.handle(request, response);
});

server.listen(port, bind_address, () => {
	const display_address = bind_address.includes(":") ? `[${bind_address}]` : bind_address;
	console.log(`Server listening on http://${display_address}:${port}`);
});
