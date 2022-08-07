const { withBlitz } = require("@blitzjs/next");

module.exports = withBlitz({
  webpack(config) {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
});
