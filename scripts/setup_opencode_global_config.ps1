# OpenCode global config setup
# Creates or updates the global OpenCode configuration to enable the Superpowers plugin.

$globalConfigDir = "$env:USERPROFILE\\.config\\opencode"
$globalConfigFile = Join-Path $globalConfigDir "opencode.json"

if (-not (Test-Path $globalConfigDir)) {
  New-Item -ItemType Directory -Force -Path $globalConfigDir | Out-Null
}

$contents = '{ "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"] }'
Set-Content -Path $globalConfigFile -Value $contents -Force

Write-Output "Wrote global opencode.json to $globalConfigFile"
