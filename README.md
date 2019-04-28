# ![](https://raw.githubusercontent.com/sbrl/powahroot/master/logo-large.png)powahroot

> Client and server-side routing micro frameworks

_Powahroot_ is a pair of micro routing frameworks, presented as an ES6 module:

 - The first is for client-side single-page web applications
 - The other is for handling server-side Node.js requests

It's based on [`rill`](https://www.npmjs.com/package/rill) (see the npm package bearing the name), but stripped down and simplified.


## Getting Started
Install powahroot as a dependency with npm:

```bash
npm install --save powahroot
```

Then `import` the router you're after:

```js
import { ServerRouter } from 'powahroot';
```

```js
import { ClientRouter } from 'powahroot';
```

## Usage

### Paths
Powahroot supports multiple syntax bells and whistles when defining routes. These are documented below:

Syntax							| Meaning
--------------------------------|----------------------------------------
`/index.html`					| Regular route. Matches exactly what it says on the tin.
`*`								| Special key(word?) that matches _any_ route. Must be present on its own without any other characters.
`/add/vegetable/:name/:weight`	| Parameters. Match values an pull them into an object automatically. Does not like forward slashes in parameter values.
`/images/::path`				| Parameter values with forward slashes. If you want to use parameters, but need values to be able to contain forward slashes `/`, this is for you. Don't forget you can mix-and-match this with the previous example!

### Client
Initialise a new router like this:

```js
const router = new ClientRouter({
	// Options object. Default settings:
	verbose: false, // Whether to be verbose in console.log() messages
	listen_pushstate: true, // Whether to react to browser pushstate events (excluding those generated by powahroot itself, because that would cause an infinite loop :P)
});
```

### Server
The server router works slightly differently, to account for the different environment it's designed for. Here's how to use it:

```js
const router = new ServerRouter();
router.on_all(async (context, next) => { console.debug(context.url); await next()})
router.get("/files/::filepath", (context, _next) => context.send.plain(200, `You requested ${context.params.filepath}`));
// .....
```

The `context` argument there is of type `RouterContext`. Check out the API reference (link below) to learn about the other useful properties it has.

### Reference
API docs are generated automatically. View them here:

<https://starbeamrainbowlabs.com/code/powahroot/docs/>

## Licence
Everything in this repository _except_ the logo is licenced under the _Mozilla Public License 2.0.

The logo itself is © Copyright Starbeamrainbowlabs 2019. All rights reserved - though you _may_ use it when linking to this project (or to advertise usage in a 'powered by' logo).
