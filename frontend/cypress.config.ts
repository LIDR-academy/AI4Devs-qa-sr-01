import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",          // tu frontend
    specPattern: "cypress/integration/**/*.js", // lo que pide el enunciado
    video: false,
  },
});
