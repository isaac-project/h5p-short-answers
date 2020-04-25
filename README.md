# ISAAC

Built on [H5P-Question boilerplate](https://github.com/h5p/h5p-boilerplate/tree/question-type).

## Setup

Clone the repository and install dependencies.

```bash
npm install
```

Build the project.
```bash
npm run build
```

To use JSHint for linting, you should first set `npm` log settings with `echo loglevel=silent >> .npmrc` 
to avoid unnecessary error messages. [Source](https://github.com/npm/npm/issues/6124#issuecomment-317198898).

```bash
npm run lint
```

If you want to let everything be built continuously while you are making changes to the code, run:

```bash
npm run watch
```

The build process will transpile ES6 to earlier versions in order to improve
compatibility to older browsers. If you want to use particular functions that
some browsers don't support, you'll have to add a polyfill.

The build process will also move the source files into one distribution file and
minify the code.
