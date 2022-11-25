"use strict";
var path = require('path');
const Generator = require("yeoman-generator");
// Const chalk = require("chalk");
// const yosay = require("yosay");
// const mkdirp = require("mkdirp");
const awsRegions = require('aws-regions');
const mkdirp = require("mkdirp");

const GitInitGenerator = require('generator-git-init/generators/app/index.js');
const yosay = require('yosay');
const { default: chalk } = require('chalk');

module.exports = class extends Generator {
  initializing() {
    this.props = {};
  }

  async prompting() {
    const prompts = [
      {
        type: "input",
        name: "appName",
        message: "What is the Application name?",
        default: this.appname.replace(" ", "-")
      },
      {
        type: "input",
        name: "appOwner",
        message: "Who is the Application owner?",
        default: this.user.git.email()
      },
      {
        type: "confirm",
        name: "generateDefaultEditorConfig",
        message: "Generate default .editorconfig?",
        default: true,
      },
      {
        type: "input",
        name: "appEnvironments",
        message: "Environments to be created (comma separated)",
        filter: (envString) => envString.split(/\s*,\s*/g),
        validate: (answer) => answer.length > 0,
        default: "dev",
      },
      {
        type: "input",
        name: "appAccountIds",
        message: "Account IDs for each Environment (comma separated)",
        filter: (envString) => envString.split(/\s*,\s*/g),
        validate: (answer, answers) => answer.length === answers.appEnvironments.length
      },
      {
        type: "input",
        name: "appAccountRoleNames",
        message: "Account Role name for each Environment (comma separated)",
        filter: (envString) => envString.split(/\s*,\s*/g),
        validate: (answer, answers) => answer.length === answers.appEnvironments.length
      },
      {
        type: "checkbox",
        name: "appRegions",
        message: "Regions to be created",
        choices: () => awsRegions.list({ public: true }).map(region => region.code),
        validate: (answer) => answer.length > 0,
        pageSize: 10,
      },
      {
        type: "confirm",
        name: "generateInitialModule",
        message: "Generate initial module?",
        default: true,
      },
      {
        type: "input",
        name: "initialModuleName",
        message: "Initial Module name?",
        default: "infrastructure",
        when: (answers) => answers.generateInitialModule
      },
      {
        type: "confirm",
        name: "generateVsCodeConfig",
        message: "Generate VSCode config?",
        default: true,
      },
      {
        type: "confirm",
        name: "initializeGit",
        message: "Initialize Git repository?",
        default: false,
      },
    ];

    this.props = await this.prompt(prompts);
  }

  configuring() {
    if (this.props.generateDefaultEditorConfig) {
      this.fs.copy(
        this.templatePath(".editorconfig"),
        this.destinationPath(".editorconfig"),
      )
    }

    this.fs.copy(
      this.templatePath("gitignore"),
      this.destinationPath(".gitignore"),
    )
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath("app.hcl"),
      this.destinationPath("app.hcl"),
      {
        appName: this.props.appName,
        appOwner: this.props.appOwner
      }
    );

    this.fs.copyTpl(
      this.templatePath("terragrunt.hcl"),
      this.destinationPath("terragrunt.hcl"),
    );

    mkdirp.sync(path.join(this.destinationRoot(), 'common'));
    // This.fs.write(this.destinationPath('common/.gitkeep'), '');

    mkdirp.sync(path.join(this.destinationRoot(), 'live'));
    this.props.appEnvironments.forEach((env, idx) => {
      mkdirp.sync(path.join(this.destinationRoot(), 'live', env));
      this.fs.copyTpl(
        this.templatePath(`live/env/account.hcl`),
        this.destinationPath(`live/${env}/account.hcl`),
        {
          accountId: this.props.appAccountIds[idx],
          accountRole: this.props.appAccountRoleNames[idx],
        }
      );
      this.fs.copyTpl(
        this.templatePath(`live/env/env.hcl`),
        this.destinationPath(`live/${env}/env.hcl`),
        {
          envName: env,
        }
      );

      this.props.appRegions.forEach(region => {
        mkdirp.sync(path.join(this.destinationRoot(), 'live', env, region));
        this.fs.copyTpl(
          this.templatePath(`live/env/region/region.hcl`),
          this.destinationPath(`live/${env}/${region}/region.hcl`),
          {
            regionName: region,
            regionZones: awsRegions.lookup({ code: region }).zones,
          }
        );
      });
    });

    mkdirp.sync(path.join(this.destinationRoot(), 'modules'));
    // This.fs.write(this.destinationPath('modules/.gitkeep'), '');

    if (this.props.generateInitialModule) {
      this.composeWith(require.resolve('../module'), {
        arguments: [this.props.initialModuleName],
      })
      // This.fs.delete(this.destinationPath('common/.gitkeep'), '');
      // this.fs.delete(this.destinationPath('modules/.gitkeep'), '');
    }

    if (this.props.generateVsCodeConfig) {
      mkdirp.sync(path.join(this.destinationRoot(), '.vscode'));
      this.fs.copy(
        this.templatePath("vscode/*.json"),
        this.destinationPath(".vscode/"),
      );
    }

    if (this.props.initializeGit) {
      this.composeWith({
        Generator: GitInitGenerator,
        path: require.resolve('generator-git-init/generators/app')
      }, {
        commit: 'Initial Commit',
      })
    }
  }

  async install() {
    const tfVersionCmd = await this.spawnCommand("terraform", ["--version"], { stdio: [process.stderr] });
    tfVersionCmd.stdout.setEncoding('utf8');
    tfVersionCmd.stdout.on('data', (data) => {
      const regex = /Terraform v(.*)/;
      const version = data.match(regex)[1];

      this.log(`terraform version: ${version}`);
    });

    const tgVersionCmd = await this.spawnCommand("terragrunt", ["--version"], { stdio: [process.stderr] });
    tgVersionCmd.stdout.setEncoding('utf8');
    tgVersionCmd.stdout.on('data', (data) => {
      const regex = /terragrunt version v(.*)/;
      const version = data.match(regex)[1];

      this.log(`terragrunt version: ${version}`);
    });
  }

  async end() {
    this.log(yosay(chalk.green('Thank you and have a nice day!')));
  }
};
