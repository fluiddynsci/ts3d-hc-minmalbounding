const path = require('path');

module.exports = {
  entry: './dev/public/js/hcTightBounding/hcTightBounding.js',
  mode: "production",
  experiments: {
    outputModule: true
  },
  output: {
    libraryTarget: 'module',
    path: path.resolve(__dirname, 'dist'),
    filename: 'hcTightBounding.min.js',
  },  
};
