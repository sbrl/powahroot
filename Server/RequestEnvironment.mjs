"use strict";

import cookie from 'cookie';

/**
 * Holds request environment and state variables.
 */
class RequestEnvironment {
	constructor(request) {
		/**
		 * Whether the user is logged in or not.
		 * @type {Boolean}
		 */
		this.logged_in = false;
		/**
		 * The user's name. Guaranteed to be specified - if only as "anonymous".
		 * @type {String}
		 */
		this.username = "anonymous";
		/**
		 * The parsed cookie object
		 * @type {Object}
		 */
		this.cookie = cookie.parse(request.headers["cookie"] || "");
		/**
		 * The parsed post data as an object, if applicable.
		 * @type {Object|null}
		 */
		this.post_data = null;
	}
}

export default RequestEnvironment;
