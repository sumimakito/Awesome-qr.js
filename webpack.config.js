const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "awesome-qr.js",
    libraryTarget: "umd",
    globalObject: "this",
    library: "AwesomeQR",
  },
  optimization: {
    minimize: true,
  },
};
