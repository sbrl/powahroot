"use strict";

import url from 'url';
import querystring from 'querystring';

import Sender from './Sender.mjs';
import RequestEnvironment from './RequestEnvironment.mjs';

/**
 * Contains context information about a single request / response pair.
 */
class RouterContext {
	/**
	 * Returns the parsed querystring from the request url, or an empty object if no query string was found.
	 * 
	 * NOTE FROM THE NODE.JS DOCS: The object returned by the querystring.parse() method [used in this getter] does not prototypically inherit from the JavaScript Object. This means that typical Object methods such as obj.toString(), obj.hasOwnProperty(), and others are not defined and will not work.
	 *
	 * @return  {Object}  The parsed query string as an object, or an empty object.
	 */
	get querystring() {
		const qs = this.url.querystring;
		if(qs.query == null) return {};
		return querystring.parse(qs);
	}
	
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
