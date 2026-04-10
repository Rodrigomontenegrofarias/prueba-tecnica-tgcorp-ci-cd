const path = require('path');

module.exports = {
  entry: './src/index.js', // Cambia esto a tu archivo de entrada
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.txt$/,
        use: 'raw-loader',
      },
      // Otras reglas aquí
    ],
  },
  // Otras configuraciones aquí
};
