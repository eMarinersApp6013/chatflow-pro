module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // WatermelonDB requires decorators — must be before class-properties
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // Required for WatermelonDB observables
      '@babel/plugin-proposal-class-properties',
      // React Native Reanimated must be last
      'react-native-reanimated/plugin',
    ],
  };
};
