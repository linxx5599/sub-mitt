import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import typescript from '@rollup/plugin-typescript';  
export default {
  input: "src/index.ts", // 输入文件
  output: [
    {
      file: "dist/index.cjs.js", // CommonJS 格式输出文件
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.esm.js", // ES 模块格式输出文件
      format: "es",
      sourcemap: true,
    },
    {
      file: "dist/index.umd.js", // UMD 格式，可用于浏览器和 Node.js
      format: "umd",
      name: "SubMitt", // 全局变量名
      sourcemap: true,
      plugins: [terser()], // 压缩 UMD 版本
    },
  ],
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    resolve(), // 解析外部模块
    commonjs(), // 转换 CommonJS 模块
    terser(), // 压缩代码
  ],
};
