module.exports = {
  webpack: {
    configure: {
      resolve: {
        extensions: ['.js', '.jsx', '.json'],
        fallback: {
          "fs": false,
          "path": false,
        },
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            resolve: {
              fullySpecified: false,
            },
          },
        ],
      },
    },
  },
};