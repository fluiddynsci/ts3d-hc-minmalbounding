const path = require('path');

module.exports = {
  entry: './dev/public/js/hcCurveToolkit/hcCurveToolkit.js',
  mode: "production",
  experiments: {
    outputModule: true
  },
  output: {
    libraryTarget: 'module',
    path: path.resolve(__dirname, 'dist'),
    filename: 'hcCurveToolkit.module.min.js',
  },  
};
