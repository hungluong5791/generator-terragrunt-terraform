locals {
  app_vars         = read_terragrunt_config(find_in_parent_folders("app.hcl"))
  account_vars     = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  region_vars      = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))

  aws_aws_region   = local.region_vars.locals.aws_region
  aws_account_id   = local.account_vars.locals.aws_account_id
  aws_role_arn     = local.account_vars.locals.aws_role_arn
  aws_session_name = local.account_vars.locals.aws_session_name

  app_name = local.app_vars.locals.app_name
  app_tags = merge(
    local.app_vars.locals.app_tags,
    {
      Environment = local.environment_vars.locals.environment
    }
  )
}

generate "provider" {
  path      = "aws.provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
provider "aws" {
	region = "${local.aws_region}"
	assume_role {
		role_arn = "${local.aws_role_arn}"
		session_name = "${local.aws_session_name}"
	}
	# Only these AWS Account IDs may be operated on by this template
	allowed_account_ids = ["${local.aws_account_id}"]
}
EOF
}

remote_state {
  backend = "s3"

  config = {
    bucket              = "${local.app_name}-${local.aws_account_id}-${local.aws_region}-tfstate"
    s3_bucket_tags      = local.app_tags
    encrypt             = true
    key                 = "${path_relative_to_include()}/terraform.tfstate"
    region              = local.aws_region
    dynamodb_table      = "${local.app_name}-lock"
    dynamodb_table_tags = local.app_tags
  }

  generate = {
    path      = "aws.backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}

inputs = merge(
  local.app_vars.locals,
  local.account_vars.locals,
  local.region_vars.locals,
  local.environment_vars.locals,
)

terraform {
  extra_arguments "plan_out" {
    commands = [
      "plan",
    ]

    arguments = [
      "-out=${get_terragrunt_dir()}/${basename(get_terragrunt_dir())}.tfplan"
    ]
  }

  extra_arguments "apply_plan" {
    commands = [
      "apply",
    ]

    arguments = [
      "${get_terragrunt_dir()}/${basename(get_terragrunt_dir())}.tfplan"
    ]
  }
}
