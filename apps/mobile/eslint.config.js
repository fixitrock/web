// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
    expoConfig,
    {
        ignores: ['dist/*'],
        rules: {
            'react-native/no-inline-styles': 'off',
            'react/no-unescaped-entities': 'off',
            'react/display-name': 'off',
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
])
