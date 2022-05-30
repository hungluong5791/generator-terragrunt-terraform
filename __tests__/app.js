"use strict";
const path = require("path");
const assert = require("yeoman-assert");
const helpers = require("yeoman-test");

describe("generator-terragrunt-terraform:app", () => {
  const appName = "test-terraform-app-name";
  const appOwner = "test-terraform-app-owner";
  const appEnvironments = ["dev", "qa", "uat"];
  const appAccountIds = ["1111", "2222", "3333"];
  const appAccountRoleArns = ["1111/role", "2222/role", "3333/role"]
  const appRegions = ["ap-southeast-1", "ap-northeast-1"];
  const initialModuleName = "infrastructure"

  describe("initialize module: false", () => {
    beforeAll(() => {
      return helpers
        .run(path.join(__dirname, "../generators/app"))
        .withPrompts({
          appName,
          appOwner,
          appEnvironments,
          appAccountIds,
          appAccountRoleArns,
          appRegions,
          generateInitialModule: false,
        })
    });

    it("creates app.hcl", () => {
      assert.file(["app.hcl"]);
      assert.fileContent("app.hcl", new RegExp(`app_name\\s*=\\s*"${appName}"`));
      assert.fileContent("app.hcl", new RegExp(`Application\\s*=\\s*"${appName}"`));
      assert.fileContent("app.hcl", new RegExp(`Owner\\s*=\\s*"${appOwner}"`));
    });

    it("creates terragrunt.hcl", () => {
      assert.file(["terragrunt.hcl"]);
    });

    it("creates .editorconfig", () => {
      assert.file([".editorconfig"]);
      assert.fileContent(".editorconfig", /root\s*=\s*true/);
    });

    describe("directory: common", () => {
      it("creates the directory", () => {
        assert.file(["common/.gitkeep"]);
      });
    });

    describe("directory: live", () => {
      it("creates all environment directories", () => {
        appEnvironments.forEach((env) => {
          assert.file(`live/${env}/account.hcl`);
          assert.file(`live/${env}/env.hcl`);
          assert.fileContent(`live/${env}/env.hcl`, new RegExp(`environment\\s*=\\s*"${env}"`));
        })
      });

      it("creates all region directories", () => {
        appEnvironments.forEach((env) => {
          appRegions.forEach((region) => {
            assert.file(`live/${env}/${region}/region.hcl`);
            assert.fileContent(`live/${env}/${region}/region.hcl`, new RegExp(`region\\s*=\\s*"${region}"`));
          })
        })
      });
    });

    describe("directory: modules", () => {
      it("creates the directory", () => {
        assert.file(["modules/.gitkeep"]);
      });
    });
  });

  describe("initialize module: true", () => {
    beforeAll(() => {
      return helpers
        .run(path.join(__dirname, "../generators/app"))
        .withPrompts({
          appName,
          appOwner,
          appEnvironments,
          appAccountIds,
          appAccountRoleArns,
          appRegions,
          generateInitialModule: true,
          initialModuleName,
        })
    });

    it("creates app.hcl", () => {
      assert.file(["app.hcl"]);
      assert.fileContent("app.hcl", new RegExp(`app_name\\s*=\\s*"${appName}"`));
      assert.fileContent("app.hcl", new RegExp(`Application\\s*=\\s*"${appName}"`));
      assert.fileContent("app.hcl", new RegExp(`Owner\\s*=\\s*"${appOwner}"`));
    });

    it("creates terragrunt.hcl", () => {
      assert.file(["terragrunt.hcl"]);
    });

    it("creates .editorconfig", () => {
      assert.file([".editorconfig"]);
      assert.fileContent(".editorconfig", /root\s*=\s*true/);
    });

    describe("directory: common", () => {
      it("creates the directory", () => {
        assert.file(["common/.gitkeep"]);
      });

      it("creates the initial module", () => {
        assert.file([`common/${initialModuleName}.hcl`]);
      });
    });

    describe("directory: live", () => {
      it("creates all environment directories", () => {
        appEnvironments.forEach((env) => {
          assert.file(`live/${env}/account.hcl`);
          assert.file(`live/${env}/env.hcl`);
          assert.fileContent(`live/${env}/env.hcl`, new RegExp(`environment\\s*=\\s*"${env}"`));
        })
      });

      it("creates all region directories", () => {
        appEnvironments.forEach((env) => {
          appRegions.forEach((region) => {
            assert.file(`live/${env}/${region}/region.hcl`);
            assert.fileContent(`live/${env}/${region}/region.hcl`, new RegExp(`region\\s*=\\s*"${region}"`));
          })
        })
      });

      it("creates initial module in all environments & regions", () => {
        appEnvironments.forEach((env) => {
          appRegions.forEach((region) => {
            assert.file(`live/${env}/${region}/terragrunt.hcl`);
          });
        });
      });
    });

    describe("directory: modules", () => {
      it("creates the directory", () => {
        assert.file(["modules/.gitkeep"]);
      });

      it("creates the initial module", () => {
        assert.file([
          `modules/${initialModuleName}/data.tf`,
          `modules/${initialModuleName}/main.tf`,
          `modules/${initialModuleName}/outputs.tf`,
          `modules/${initialModuleName}/variables.tf`,
        ]);
      })
    });
  });
});

describe("generator-terragrunt-terraform:module", () => {
  const moduleName = "test_module"
  const moduleDependencies = "infrastructure"

  beforeAll(() => {
    return helpers
      .run(path.join(__dirname, "../generators/module"))
      .withArguments([moduleName])
      .withOptions({
        moduleDependencies,
      })
  });

  describe("directory: common", () => {
    it("creates common hcl", () => {
      assert.file([`common/${moduleName}.hcl`]);
    });
  });

  describe("directory: module", () => {
    it("creates modules hcl", () => {
      assert.file([
        `modules/${moduleName}/data.tf`,
        `modules/${moduleName}/main.tf`,
        `modules/${moduleName}/outputs.tf`,
        `modules/${moduleName}/variables.tf`,
      ]);
    });
  });
})