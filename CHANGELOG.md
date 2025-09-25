# Changelog
This is the changelog for [`powahroot`](https://npmjs.org/package/powahroot).


Release template text:

-----

Install or update from npm:

```bash
npm install --save powahroot
```

-----


## v1.3.3 - 25th September 2025
- Fix another embarrassing crash in new `middleware_catch_errors`

## v1.3.2 - 25th September 2025
- Fix embarrassing crash in new `middleware_catch_errors`

## v1.3.1 - 6th June 2025
- `index.mjs`: Also export middleware so that `documentation` (the API docs generate I use) can generate docs for the middleware also

## v1.3.0 - 6th June 2025
- Sender: Append `; charset=utf-8` to `content-type` when sending plain / html responses
- Fix type of `RouterContext.env` to be `RequestEnvironment` and not `Object`
	- Rename `RequestEnvironment.post_data` to `RequestEnvironment.body`
- Add builtin server-side middleware:
	- `middleware_log_requests` - Log requests to stdout
	- `middleware_catch_errors` - Catch and handle errors in route handlers
	- `middleware_parse_json` - Parse JSON-formatted POST data
- Update dependencies


## v1.2.12
- Update dependencies


## v1.2.11
- ....and another one. Just why?


## v1.2.10
- Fix another embarrassing bug in new `RequestContext.querystring` and document behaviour


## v1.2.9
- Fix embarrassing bug in new `RequestContext.querystring`


## v1.2.8
- Add convenience getter `RequestContext.querystring`


## v1.2.7
- Update dependencies to fix security issues


## v1.2.6
 - Create this (long overdue) changelog
 - Update dependencies
 - Rename `master` → `main`
