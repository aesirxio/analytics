const sharedPresets = ['@babel/preset-env', '@babel/preset-react'];
const shared = {
  presets: sharedPresets,
};

const plugins = {
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: ['./src/'],
      },
    ],
  ],
};

module.exports = {
  env: {
    esmUnbundled: shared,
    esmBundled: {
      ...shared,
      presets: [
        [
          '@babel/env',
          {
            targets: '> 0.25%, not dead',
          },
        ],
      ],
      ...plugins,
    },
    cjs: {
      ...shared,
      presets: [
        [
          '@babel/env',
          {
            modules: 'commonjs',
          },
        ],
      ],
      ...plugins,
    },
    test: {
      presets: ['@babel/env'],
      ...plugins,
    },
  },
};
