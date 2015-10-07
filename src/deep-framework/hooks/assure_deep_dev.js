#!/usr/bin/env node
/**
 * Created by AlexanderC on 8/13/15.
 */

// hook to make jscs tests pass!
var npmEnvKey = 'npm_config_production';

if (process.env[npmEnvKey] !== 'true') {
  var path = require('path');
  var fs = require('fs');
  var exec = require('child_process').exec;

  var deepModulePath = path.join(__dirname, '../node_modules');

  fs.readdir(deepModulePath, function (error, files) {
    if (error) {
      console.error('Error while listing deep modules: ' + error);
      process.exit(1);
    }

    for (var i = 0; i < files.length; i++) {
      var basename = files[i];

      if (['.', '..'].indexOf(basename) === -1 && basename.indexOf('deep-') === 0) {
        var modulePath = path.join(deepModulePath, basename);

        fs.stat(modulePath, function (modulePath, error, stats) {
          if (error) {
            console.error('Error while getting stats of ' + modulePath + ': ' + error);
            process.exit(1);
          }

          if (stats.isDirectory()) {
            var packageFile = path.join(modulePath, 'package.json');

            fs.readFile(packageFile, function (error, data) {
              if (error) {
                console.error('Error while reading ' + packageFile + ': ' + error);
                process.exit(1);
              }

              var packageConfig = JSON.parse(data.toString());

              if (!packageConfig) {
                console.error('Broken JSON string in ' + packageFile + ': ' + error);
                process.exit(1);
              }

              var devDependencies = packageConfig.devDependencies || {};

              for (var depName in devDependencies) {
                if (!devDependencies.hasOwnProperty(depName)) {
                  continue;
                }

                var depVersion = devDependencies[depName];
                var depString = depName + '@' + depVersion;

                console.log('Installing ' + depString);

                exec(
                  'cd ' + modulePath + ' && npm install ' + depString,
                  function (depString, error, stdout, stderr) {
                    if (error) {
                      console.error('Error while installing ' + depString + ': ' + stderr);
                    }

                    console.log('Dependency ' + depString + ' installed!');
                  }.bind(this, depString)
                );
              }
            }.bind(this));
          }
        }.bind(this, modulePath));
      }
    }
  });
}
