import index from "./index.html";

Bun.serve({
  port: 3010,
  routes: {
    "/*": index,
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log("Admin app running on http://localhost:3010");
