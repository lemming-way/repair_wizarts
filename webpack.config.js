module.exports = {
  resolve: {
    fallback: {
      util: require.resolve('util/'),
    },
  },
  devServer: {
    port: 5173,
  },
};
