locals {
  app_name = "<%= appName %>"
  app_tags = {
    Application = "<%= appName %>"
    Terraform   = "true"
    Owner       = "<%= appOwner %>"
  }
}
