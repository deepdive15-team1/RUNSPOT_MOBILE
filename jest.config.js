/** @type {import('jest').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  // 설치 폴더(qa-harness)가 남아 있으면 같은 파일이 두 번 스캔되어 haste 충돌이 난다
  modulePathIgnorePatterns: ["<rootDir>/qa-harness/"],
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/qa-harness/"],
  testMatch: ["<rootDir>/tests/**/*.test.ts", "<rootDir>/tests/**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.svg$": "<rootDir>/tests/__mocks__/svgMock.js",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@mj-studio/.*))",
  ],
  collectCoverageFrom: [
    "src/utils/**/*.ts",
    "src/api/**/*.ts",
    "!src/api/**/*.mock.ts",
  ],
  // 순수 로직은 커버리지를 실제로 강제한다. 화면은 E2E 로 본다.
  coverageThreshold: {
    "src/utils/": {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
  },
};
