const path = require('path');

module.exports = {
  entry: './dev/public/js/hcCurveToolkit/hcCurveToolkit.js',
  mode: "production",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'hcCurveToolkit.min.js',
    library: 'hcCurveToolkit', //add this line to enable re-use
  },
};
