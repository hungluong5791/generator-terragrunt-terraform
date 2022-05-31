locals {
  aws_account_id   = "<%= accountId %>"
  aws_role_arn     = "arn:aws:iam::<%= accountId %>:role/<%= accountRole %>"
  aws_session_name = "terraform"
}
