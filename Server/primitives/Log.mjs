"use strict";
// I copy this to a lot of different repos I make

import a from './Ansi.mjs';

const LOG_LEVELS = {
	DEBUG: 0,
	INFO: 1,
	LOG: 2,
	WARN: 4,
	ERROR: 8,
	NONE: 2048
};


/**
 * Simple logging class
 * 
 * This is a powahroot-internal class, but can be used outside. There is no guarantee of stability, though this API has been pretty stable.
 * @protected
 * @licence MPL-2.0
 * @author Starbeamrainbowlabs
 * @changelog:
 * - 2025-01-30: Wow, I should have done this a LONG time ago. This thing has been used in like 100 different codebases by now and I'm not even kidding. Swap date + [ log/info/etc ] bit around to make more sense e.g. like dmesg etc
 */
class Log {
	constructor() {
		this.start = new Date();
		
		this.level = LOG_LEVELS.DEBUG;
	}

	debug(...message) {
		if (this.level > LOG_LEVELS.DEBUG) return;
		this.__do_log("debug", ...message);
	}

	info(...message) {
		if(this.level > LOG_LEVELS.INFO) return;
		this.__do_log("info", ...message);
	}
	
	log(...message) {
		if(this.level > LOG_LEVELS.LOG) return;
		this.__do_log("log", ...message);
	}
	
	warn(...message) {
		if(this.level > LOG_LEVELS.WARN) return;
		this.__do_log("warn", ...message);
	}
	
	error(...message) {
		if(this.level > LOG_LEVELS.ERROR) return;
		this.__do_log("error", ...message);
	}
	
	
	__do_log(level, ...message) {
		let part = `[ ${level} ]`;
		switch(level) {
			case "debug":
				part = a.locol + part;
				break;
			case "warn":
				part = a.fyellow + part;
				break;
			case "error":
				part = a.fred + part;
				break;
		}
		message.unshift(part);
		message.unshift(`${a.reset}${a.locol}[ ${((new Date() - this.start) / 1000).toFixed(3)}]${a.reset}`);

		
		console.error(...message);
	}
}

// You won't normally need these
export { LOG_LEVELS };

export default new Log();
