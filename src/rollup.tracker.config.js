import "dotenv/config";
import buble from "@rollup/plugin-buble";
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { babel } from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import { uglify } from "rollup-plugin-uglify";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  input: "src/index.js",
  output: {
    file: "public/analytics.js",
    format: "iife",
    name: "analytics",
  },
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    babel({
      babelHelpers: "bundled",
    }),
    json(),
    replace({
      delimiters: ["", ""],
      preventAssignment: true,
      envEndpoint: JSON.stringify(process.env.ENDPOINT_URL),
    }),
    buble({
      objectAssign: true,
      transforms: {
        // make async/await work by default (no transforms)
        asyncAwait: false,
      },
    }),
    terser({ compress: { evaluate: false } }),
    uglify(),
  ],
};
