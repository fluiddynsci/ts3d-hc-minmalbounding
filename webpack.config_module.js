const path = require('path');

module.exports = {
  entry: './dev/public/js/hcMinimalBounding/hcMinimalBounding.js',
  mode: "production",
  experiments: {
    outputModule: true
  },
  output: {
    libraryTarget: 'module',
    path: path.resolve(__dirname, 'dist'),
    filename: 'hcMinimalBounding.module.min.js',
  },  
};
