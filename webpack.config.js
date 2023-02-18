const path = require('path');

module.exports = {
  entry: './dev/public/js/hcTightBounding/hcTightBounding.js',
  mode: "production",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'hcTightBounding.min.js',
    library: 'hcTightBounding', //add this line to enable re-use
  },
};
