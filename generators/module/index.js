"use strict";
var path = require('path');
const fs = require('fs')
const Generator = require("yeoman-generator");
// Const chalk = require("chalk");
// const yosay = require("yosay");
// const mkdirp = require("mkdirp");
// const awsRegions = require('aws-regions');
const mkdirp = require("mkdirp");

function readSubDir(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  return fs.readdirSync(directoryPath, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
}

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument("moduleName", { type: String, required: true });
    this.option("moduleDependencies", { type: (deps) => deps.split(/\s*,\s*/g) })
  }

  writing() {
    mkdirp.sync(path.join(this.destinationRoot(), 'common'));
    this.fs.copyTpl(
      this.templatePath(`common/module.hcl`),
      this.destinationPath(`common/${this.options.moduleName}.hcl`),
      {
        moduleName: this.options.moduleName,
        moduleDependencies: this.options.moduleDependencies
      }
    );

    mkdirp.sync(path.join(this.destinationRoot(), 'modules', this.options.moduleName));
    this.fs.copy(
      this.templatePath(`module/*.tf`),
      this.destinationPath(`modules/${this.options.moduleName}/`),
    );

    mkdirp.sync(path.join(this.destinationRoot(), 'live'));
    readSubDir(path.join(this.destinationRoot(), 'live')).forEach((env) => {
      readSubDir(path.join(this.destinationRoot(), 'live', env)).forEach(region => {
        mkdirp.sync(path.join(this.destinationRoot(), 'live', env, region, this.options.moduleName));
        this.fs.copyTpl(
          this.templatePath(`live/terragrunt.hcl`),
          this.destinationPath(`live/${env}/${region}/${this.options.moduleName}/terragrunt.hcl`),
          {
            moduleName: this.options.moduleName,
            moduleDependencies: this.options.moduleDependencies
          }
        );
      });
    });
  }
};
