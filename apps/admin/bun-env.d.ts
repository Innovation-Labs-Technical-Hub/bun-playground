/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "*.html" {
  const content: Response;
  export default content;
}
