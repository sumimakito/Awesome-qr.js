const path = require('path');


module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    externals: [{ fs: "commonjs fs" },
        { xmlhttprequest: '{XMLHttpRequest:XMLHttpRequest}' }],
    output: {
        library: 'QRCodeGenerator',
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};
