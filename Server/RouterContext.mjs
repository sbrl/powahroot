"use strict";

// core
import url from 'url';
// npm
import cookie from 'cookie';
// files
import Sender from './Sender.mjs';

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
		this.env = {
			/**
			 * Whether the user is logged in or not.
			 * @type {Boolean}
			 */
			logged_in: false,
			/**
			 * The user's name. Guaranteed to be specified - if only as "anonymous".
			 * @type {String}
			 */
			username: "anonymous",
			/**
			 * The parsed cookie object
			 * @type {Object}
			 */
			cookie: cookie.parse(this.request.headers["cookie"] || ""),
			/**
			 * The parsed post data as an object, if applicable.
			 * @type {Object|null}
			 */
			post_data: null
		};
	}
}

export default RouterContext;
