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
};
