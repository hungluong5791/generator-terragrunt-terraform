# generator-terragrunt-terraform [![NPM version][npm-image]][npm-url]
> 

## Installation

First, install [Yeoman](http://yeoman.io) and generator-terragrunt-terraform using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-terragrunt-terraform
```

## Usage

### Generating a project
To generate a new Terragrunt project:

In the directory you want to initialize the project:

```bash
yo terragrunt-terraform
```

### Generating a module
To generate a new Terragrunt module:

In the root directory of the Terragrunt project: (it is assumed that the project was generated using this generator):

```bash
yo terragrunt-terraform:module {{ module_name }}
```

In addition, you can specify the dependencies of the module using comma-separated module names:
```bash
yo terragrunt-terraform:module {{ module_name }} --moduleDependencies infrastructure,eks
```
## License

MIT © [Hung Luong]()


[npm-image]: https://badge.fury.io/js/generator-terragrunt-terraform.svg
[npm-url]: https://npmjs.org/package/generator-terragrunt-terraform
