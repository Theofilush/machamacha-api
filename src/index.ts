import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";

import { logger } from "hono/logger";
import { productRoute } from "./modules/products/route";

const app = new OpenAPIHono();

app.use(logger());
app.route("/products", productRoute);

app.doc("/openapi.json", {
  openapi: "3.0.4",
  info: {
    version: "1.0.0",
    title: "Machamacha! API",
    description:
      "A RESTful API providing Machamacha is an Indonesian lifestyle brand redefining how matcha lovers enjoy their daily ritual. Rooted in authenticity yet designed for modern convenience, Machamacha offers finely crafted Japanese matcha and tea-inspired powdered drinks that balance wellness with indulgence. From the earthy depth of hojicha to creative latte blends like sakura, taro, and red velvet, every product is made to be natural, instant, and full of character. Available through leading online marketplaces such as Tokopedia and Shopee Indonesia, Machamacha brings premium tea culture into everyday life—simple to prepare, delightful to savor, and always true to quality.",
    contact: {
      name: "API Support Team",
      url: "https://github.com/Theofilush/machamacha",
      email: "support@machamacha.example.com",
    },
    license: {
      name: "MIT License",
      url: "https://opensource.org/licenses/MIT",
    },
  },
});

app.get("/", Scalar({ url: "/openapi.json" }));

export default app;
