module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx)$": ["@swc/jest"],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
