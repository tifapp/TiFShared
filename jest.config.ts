/* eslint-disable @typescript-eslint/naming-convention */
// keys must be regex
export default {
  testEnvironment: "node",
  clearMocks: true,
  transform: {
    "^.+\\.(t|j)s?$": "@swc/jest"
  },
  transformIgnorePatterns: ["/node_modules/(?!(node-fetch))"],
  testPathIgnorePatterns: ["/dist/"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  testTimeout: 5000
}
