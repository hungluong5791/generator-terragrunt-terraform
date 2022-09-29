terraform {
  source = "${path_relative_from_include()}/../modules//<%= moduleName %>/"
}

locals {
  account_vars     = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  region_vars      = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  app_vars         = read_terragrunt_config(find_in_parent_folders("app.hcl"))
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))

  aws_account_id = local.account_vars.locals.aws_account_id
  aws_region     = local.region_vars.locals.aws_region

  app_name = local.app_vars.locals.app_name
  app_tags = local.app_vars.locals.app_tags
  env      = local.environment_vars.locals.environment
}
<% if (moduleDependencies && moduleDependencies.length > 0) { %><% for (var i = 0; i < moduleDependencies.length; i++) { %>
dependency "<%= moduleDependencies[i] %>" {
  config_path = "../<%= moduleDependencies[i] %>"
}
<% } %><% } %>
inputs = {<% if (moduleDependencies && moduleDependencies.length > 0) { %><% for (var i = 0; i < moduleDependencies.length; i++) { %>
    // sample_variable = dependency.moduleDependencies[i].outputs.sample_output<% } %><% } %>
}
