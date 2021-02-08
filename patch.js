const fs = require('fs');
const f = 'node_modules/@angular-devkit/build-angular/src/webpack/configs/browser.js';

fs.readFile(f, "utf8", function(err, data) {
  if (err) {
    return console.log(err);
  }
  let result = data.replace(
    /node: false/g,
    "node: {fs: 'empty', global: true, crypto: 'empty', tls: 'empty', net: 'empty', process: true, module: false, clearImmediate: false, setImmediate: false}"
  );
  fs.writeFile(f, result, "utf8", function(err) {
    if (err) return console.log(err);
  });
});
