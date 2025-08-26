# Run this script as administrator to update hosts file for local development
$hostsFile = "$env:windir\System32\drivers\etc\hosts"
$entries = @"

# bndy-portal local development domains
127.0.0.1 auth.local.bndy.test
127.0.0.1 api.local.bndy.test
127.0.0.1 app.local.bndy.test
"@

Add-Content -Path $hostsFile -Value $entries -Force
Write-Host "Hosts file updated successfully with bndy-portal domains"
