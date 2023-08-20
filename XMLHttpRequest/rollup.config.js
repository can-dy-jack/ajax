import { terser } from "rollup-plugin-terser"

export default {
    input: "index.js",
    output: [
        {
            file: "dist/xhr-cjs.js",
            format: "cjs"
        },
        {
            file: "dist/xhr-es.js",
            format: "es"
        },
        {
            file: "dist/xhr-iife.js",
            format: "iife",
            name: 'xhr',
        },
        {
            file: "dist/xhr-umd.js",
            format: "umd",
            name: 'xhr',
        },
        {
            file: "dist/xhr-iife.min.js",
            format: 'iife',
            name: 'xhr',
            plugins: [terser()]
        }
    ]
}