# DSPA Nightingale bundle

This repository owns the source and distributable files for the DSPAtlas
sequence, sequence heatmap, structure, and annotation-track components. Edit the
`src/` directory in this repository. The separate `dspa-nightingale` repository
is not a build input and must not be copied over these sources.

## Build from a fresh checkout

Use Node.js 22 (minimum 20.19) and npm. From the repository root:

```sh
npm ci
npm test
npm run build
```

`package-lock.json` locks the complete dependency tree. The build compiles all
four workspaces, in order, using this repository's Rollup and TypeScript
configuration. It writes browser ESM bundles, source maps, and declarations to
each package's `dist/` directory. No sibling checkout, global build tool,
temporary staging directory, or pre-existing `node_modules` is needed.

For one component, use `npm run build --workspace=nightingale-structure` (or run
`npm run build` in its directory). Run all tests from the root with `npm test`.
The suites cover camera clipping, pLDDT, position mapping, active-site mapping,
and the active-site colour overlay. The historical
`alpha-missense-parser.test.js` references an implementation not shipped in this
repository and is excluded explicitly in `jest.config.cjs`.

## Application integration

Build before copying a package into the frontend. Copy that package's `src/`,
`dist/`, and `package.json`; do not copy the build workspace's `node_modules`.
The application installs `nightingale-sequence`, `nightingale-structure`, and
`nightingale-track` under its legacy `@dspa-nightingale` directory. Its heatmap
uses `@nightingale-elements/nightingale-sequence-heatmap`.

The runtime entry point is `dist/index.js`, so copying only changed TypeScript
does not update the browser. Keep source and generated artifacts together when
publishing a bundle revision. The `dspa-main` Dockerfile and
`build_nightingale.sh` rebuild this repository before installing its output.

CI starts from `npm ci`, runs the source tests, deletes existing `dist/`
directories, and rebuilds all four packages. The resulting packages are attached
as a workflow artifact, proving the build does not depend on checked-in output.
