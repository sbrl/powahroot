"use strict";

import url from 'url';

import Sender from './Sender.mjs';
import RequestEnvironment from './RequestEnvironment.mjs';

/**
 * Contains context information about a single request / response pair.
 */
class RouterContext {
	constructor(in_request, in_response) {
		/**
		 * The Node.JS request object 
		 * @type	{http.ClientRequest}
		 */
		this.request = in_request;
		/**
		 * The Node.JS response object
		 * @type	{http.ServerResponse}
		 */
		this.response = in_response;
		/**
		 * The parsed request URL
		 * @type	{URL}
		 */
		this.url = url.parse(this.request.url, true);
		/**
		 * The url parameters parsed out by the router
		 * @type	{Object}
		 */
		this.params = {};
		/**
		 * An object containing some utitlity methods for quickly sending responses
		 * @type	{Sender}
		 */
		this.send = new Sender(this.response);
		
		// FUTURE: Refactor the default population of this object elsewhere
		/**
		 * The environment object.
		 * State variables that need to be attached to a specific request can 
		 * go in here.
		 * @type	{Object}
		 */
		this.env = new RequestEnvironment(this.request);
	}
}

export default RouterContext;
