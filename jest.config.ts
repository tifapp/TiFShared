/* eslint-disable @typescript-eslint/naming-convention */
// keys must be regex
export default {
  testEnvironment: "node",
  clearMocks: true,
  transform: {
    "^.+\\.(t|j)s?$": "@swc/jest"
  },
  setupFiles: [
    "<rootDir>/jest/setupExtensions.js",
    "<rootDir>/jest/setupNodeFetch.js"
  ],
  transformIgnorePatterns: [
    "/node_modules/(?!(node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill))"
  ],
  testPathIgnorePatterns: ["/dist/"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  testTimeout: 5000
}
