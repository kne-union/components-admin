const path = require('path');
const {CracoRemoteComponentsPlugin} = require("@kne/modules-dev");
const aliasConfig = require("./webstorm.webpack.config");

process.env.CI = false;

const resolveMotionEs = pkg => path.resolve(path.dirname(require.resolve(pkg)), '../es/index.mjs');

module.exports = {
    webpack: {
        alias: aliasConfig.resolve.alias, configure: (webpackConfig) => {
            const definePlugin = webpackConfig.plugins.find((plugin) => plugin.constructor.name === "DefinePlugin");
            Object.assign(definePlugin.definitions["process.env"], {
                DEFAULT_VERSION: `"${process.env.npm_package_version}"`
            });
            // framer-motion 12 的 motion-utils 把 require 写在 import 前面，CRA 会打到 CJS，生产构建报 warnOnce is not exported
            webpackConfig.resolve.alias = Object.assign({}, webpackConfig.resolve.alias, {
                'motion-utils': resolveMotionEs('motion-utils'),
                'motion-dom': resolveMotionEs('motion-dom')
            });
            webpackConfig.module.rules.push({
                test: /\.mjs$/,
                include: /node_modules/,
                type: 'javascript/auto'
            });
            return webpackConfig;
        }
    }, plugins: [{
        plugin: CracoRemoteComponentsPlugin
    }]
};
