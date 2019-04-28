/**
 * Converts a path specification into a regular expression.
 * Originally from the server-side sibling of this (client-side) router.
 * @param	{string}	pathspec	The path specification to convert.
 * @param	{Boolean}	verbose		Optional. Whether to be verbose and log some stuff to the console. Default: false
 * @return	{RegExp}	The resulting regular expression
 */
export default function pathspec_to_regex(pathspec, verbose = false) {
	if(pathspec == "*") // Support wildcards
		return { regex: /^/, tokens: [] };
	
	let tokens = [];
	let regex = new RegExp("^" + pathspec.replace(/::?([a-zA-Z0-9\-_]+)/g, (substr/*, index, template (not used)*/) => {
		tokens.push(substr.replace(/:/g, ""));
		
		// FUTURE: We could add optional param support here too
		if(substr.startsWith("::"))
			return `(.+)`;
		else
			return `([^\/]+)`; 
	}) + "$", "i");
	
	if(verbose) console.info("[router/verbose] Created regex", regex);
	
	return { regex, tokens };
}
