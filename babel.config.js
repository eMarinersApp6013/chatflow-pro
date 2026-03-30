module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // WatermelonDB requires decorators — must be before class-properties
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // All three class transform plugins MUST have the same loose value
      // or Babel throws: "loose mode must be the same for all three"
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      // React Native Reanimated must be last
      'react-native-reanimated/plugin',
    ],
  };
};
