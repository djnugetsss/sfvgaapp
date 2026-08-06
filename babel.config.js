/**
 * Babel config.
 *
 * `babel-preset-expo` already wires up Expo Router and the JSX transform.
 * The worklets plugin (which Reanimated 4 is built on) MUST be listed last —
 * it rewrites worklet function bodies and needs to see fully-transformed code.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
