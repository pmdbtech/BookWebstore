const webpack = require("webpack");
const path = require("path");

var jF = path.resolve(__dirname, "js");
var bF = path.resolve(__dirname, "build");

var config = {
    entry : {
        "index" : jF + "/myjs1.js",
        "room":jF + "/room.js",
        "main": jF + "/main.js"
    },
    output: {
        filename:"[name]bundle.js",
        path:bF
    },
    plugins: [
        new webpack.ProvidePlugin({
            $:"jquery",
            jQuery: "jquery"
        })
    ]
};

module.exports = config