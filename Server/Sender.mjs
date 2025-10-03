"use strict";

import { NightInkFile } from 'nightink';

/**
 * Helper methods for quickly sending responses to clients.
 * @param	{http.ServerResponse}	response	The response object to use when sending requests.
 */
class Sender {
	constructor(response) {
		this.response = response;
	}
	
	/**
	 * Sends a HTML response, rendering a NightInk template.
	 * Don't forget to await this!
	 * @param  {number}  status_code       The status code to return.
	 * @param  {string}  template_filename The path to the filename containing the template to render.
	 * @param  {Object}  data              The data to use whilst rendering the template.
	 * @return {Promise}
	 */
	async html(status_code, template_filename, data) {
		let response_html = await NightInkFile(template_filename, data);
		this.response.writeHead(status_code, {
			"content-type": "text/html",
			"content-length": Buffer.byteLength(response_html, "utf8"),
		});
		this.response.end(response_html);
	}
	
	/**
	 * Sends a given string as a HTML response
	 * @param	{number}	status_code	The status code to return.
	 * @param	{string}	html_string	The string of HTML to send.
	 * @return	{void}
	 */
	html_string(status_code, html_string) {
		this.string(status_code, "text/html; charset=utf-8", html_string);
	}
	/**
	 * Sends a given thing of any type as a JSON response.
	 * @param	{number}	status_code	The status code to return.
	 * @param	{any}		obj			The thing to send - will be converted to JSON.
	 * @return	{void}
	 */
	json(status_code, obj) {
		this.string(status_code, "application/json", JSON.stringify(obj));
	}
	/**
	 * Sends a given string with a given content-type.
	 * @param	{number}	status_code	The status code to return.
	 * @param	{number}	type		The content-type header value to send. This should be a MIME type, such as "text/html".
	 * @param	{string}	str			The string to send.
	 * @return	{void}
	 */
	string(status_code, type, str) {
		this.response.writeHead(status_code, {
			"content-type": type,
			"content-length": Buffer.byteLength(str, "utf8")
		});
		this.response.end(str);
	}
	
	/**
	 * Sends an empty response with the given status code.
	 * @param	{Number}	status_code	The HTTP status code to respond to the client with.
	 * @return	{void}
	 */
	empty(status_code) {
		this.response.writeHead(status_code, {
			"content-length": 0
		});
		this.response.end();
	}
	
	/**
	 * Sends a plain text response.
	 * @param  {number} status_code The HTTP status code to return.
	 * @param  {string} data        The data to send.
	 */
	plain(status_code, data) {
		this.response.writeHead(status_code, {
			"content-type": "text/plain; charset=utf-8",
			"content-length": Buffer.byteLength(data, "utf8"),
		});
		this.response.end(data);
	}
	
	/**
	 * Sends a redirect.
	 * @param  {number} status_code The HTTP status code to send.
	 * @param  {string} new_path    The (possibly relative) uri to redirect the client to.
	 * @param  {string} [message=""]     The informational plain-text message to return, just in case.
	 */
	redirect(status_code, new_path, message=``) {
		this.response.writeHead(status_code, {
			"location": new_path,
			"content-type": "text/plain",
			"content-length": message.length
		});
		this.response.end(message);
	}
}

export default Sender;
