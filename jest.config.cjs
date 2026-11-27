module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]s$': ['ts-jest', {
      tsconfig: { allowJs: true, module: 'CommonJS', declaration: false, declarationMap: false },
    }],
  },
  moduleNameMapper: {
    '^molstar/lib/(.*)$': '<rootDir>/node_modules/molstar/lib/commonjs/$1',
  },
  // alpha-missense-parser.test.js is an upstream remnant whose implementation
  // is absent from this bundle; run every suite for the components we ship.
  testMatch: [
    '**/src/tests/camera.test.js',
    '**/src/tests/plddt.test.js',
    '**/src/tests/position-mapping.test.js',
    '**/src/tests/active-site-color.test.js',
    '**/src/tests/color-active-sites.test.js',
  ],
};
