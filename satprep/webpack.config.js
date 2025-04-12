const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const env = dotenv.config({ path: path.resolve(__dirname, '.env') }).parsed || {};

// Convert environment variables to process.env format for webpack
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add buffer polyfill
  if (!config.resolve.fallback) {
    config.resolve.fallback = {};
  }
  
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "buffer": require.resolve("buffer/"),
  };

  // Add the DefinePlugin to make environment variables available
  config.plugins.push(
    new webpack.DefinePlugin(envKeys)
  );

  return config;
}; 