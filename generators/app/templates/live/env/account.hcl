locals {
  account_id   = "<%= accountId %>"
  role_arn     = "arn:aws:iam::<%= accountId %>:role/<%= accountRole %>"
  session_name = "terraform"
}
