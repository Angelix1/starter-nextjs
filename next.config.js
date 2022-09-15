const nextConfig = {
  reactStrictMode: true,
  distDir: 'dist',
  compress: false,
  cheerio: require('cheerio'),
  axios: require('axios'),
  querystring: require("querystring"),
  vm: require('vm'),
  "reactive-button": require('reactive-button'),
}

module.exports = nextConfig
