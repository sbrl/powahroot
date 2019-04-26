"use strict";

import { NightInkFile } from 'nightink';

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
	 * Sends a plain text response.
	 * @param  {number} status_code The HTTP status code to return.
	 * @param  {string} data        The data to send.
	 */
	plain(status_code, data) {
		this.response.writeHead(status_code, {
			"content-type": "text/plain",
			"content-length": Buffer.byteLength(data, "utf8"),
		});
		this.response.end(data);
	}
	
	/**
	 * Sends a redirect.
	 * @param  {number} status_code The HTTP status code to send.
	 * @param  {string} new_path    The (possibly relative) uri to redirect the client to.
	 * @param  {string} message     The informational plain-text message to return, just in case.
	 */
	redirect(status_code, new_path, message) {
		this.response.writeHead(status_code, {
			"location": new_path,
			"content-type": "text/plain",
			"content-length": message.length
		});
		this.response.end(message);
	}
}

export default Sender;
