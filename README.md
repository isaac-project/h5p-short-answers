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

For linting with JSHint, use the silent flag to ignore irrelevant errors resulting from a 
non-zero exit code.

```bash
npm run lint -s
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
