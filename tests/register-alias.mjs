import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./alias-loader.mjs", {
  parentURL: pathToFileURL(`${import.meta.dirname}/`),
});
