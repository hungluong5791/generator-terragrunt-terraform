locals {
  region = "<%= regionName %>"
  availability_zones = [<% for (var i = 0; i < regionZones.length ; i++) { %>
    "<%= regionZones[i] %>",<% } %>
  ]
}
