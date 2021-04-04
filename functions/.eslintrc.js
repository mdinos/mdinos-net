module.exports = {
  'root': true,
  'env': {
    es6: true,
    node: true,
  },
  'parser': 'babel-eslint',
  'parserOptions': {
    'ecmaVersion': 8,
  },
  'extends': ['eslint:recommended', 'google'],
  'rules': {
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    indent: ['error', 2],
  },
}
