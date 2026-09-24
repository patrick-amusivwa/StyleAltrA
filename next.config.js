const withPWA = require("next-pwa");

module.exports = withPWA({
  // module.exports = {
  reactStrictMode: true,
  // swcMinify: true,
  compiler: {
    removeConsole: true,
  },
  images: {
    domains: ["robohash.org", "res.cloudinary.com"],
    loader: "akamai",
    path: "/",
  },
  trailingSlash: true,
  pwa: {
    dest: "public",
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
  },
  // };
});
