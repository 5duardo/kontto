module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@store': './src/store',
            '@theme': './src/theme',
            '@services': './src/services',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@types': './src/types'
          }
        }
      ],
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: ['transform-remove-console']
      }
    }
  };
};
