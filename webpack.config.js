const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const WORK_DIR = __dirname;

module.exports = {
  mode: "production",
  entry: "./src/Map.js",
  output: {
    path: path.resolve(WORK_DIR, "dist"),
    filename: "map.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: path.resolve(WORK_DIR, "dist/demo/index.html"),
      template: path.resolve(WORK_DIR, "demo/index.html"),
    }),
  ],
  devServer: {
    contentBase: path.join(WORK_DIR, "dev"),
    compress: true,
    port: 9000,
  },
};
