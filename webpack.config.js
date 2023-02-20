const path = require('path');

module.exports = {
  entry: './dev/public/js/hcMinimalBounding/hcMinimalBounding.js',
  mode: "production",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'hcMinimalBounding.min.js',
    library: 'hcMinimalBounding', //add this line to enable re-use
  },
};
