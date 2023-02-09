const path = require('path');
const nodeExternals = require('webpack-node-externals');


module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {enforce: 'post', test: /fontkit[\/\\]index.js$/, loader: "transform?brfs"},
            {enforce: 'post', test: /unicode-properties[\/\\]index.js$/, loader: "transform?brfs"},
            {enforce: 'post', test: /linebreak[\/\\]src[\/\\]linebreaker.js/, loader: "transform?brfs"}
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    target: 'node', // in order to ignore built-in modules like path, fs, etc.
    externals: [{ fs: "commonjs fs" },
        nodeExternals(),
        { xmlhttprequest: '{XMLHttpRequest:XMLHttpRequest}' }],
    output: {
        library: 'QRCodeGenerator',
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};
