# Website setup script

[CmdletBinding()]
Param(
	[Parameter(Mandatory=$true)]
	[string]$projectName,
	
	[Parameter(Mandatory=$true)]
	[string]$sitePath
)

if (!([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator"))
{
    $currPath = $MyInvocation.MyCommand.Definition
    Start-Process powershell -wait -ArgumentList "& '$currPath' -projectName '$projectName' -sitePath '$sitePath'" -verb RunAs
    exit
}

$colour = @{ ForegroundColor = "yellow" }
Import-Module WebAdministration

Write-Host "`nCreating the $projectName App Pool in IIS`n" @colour

if (!(Test-Path IIS:\AppPools\$projectName))
{
    $appPool = New-Item IIS:\AppPools\$projectName
    Set-ItemProperty IIS:\AppPools\$projectName managedRuntimeVersion "v4.0"
}
(Get-IISAppPool $projectName | Format-Table | Out-String).Trim()

$siteUrl = "$projectName.dev.local"
Write-Host "`nCreating the $siteUrl Website in IIS`n" @colour

if (!(Test-Path IIS:\Sites\$projectName))
{
    $site = New-Website -Name $projectName -Port 80 -HostHeader $siteUrl -PhysicalPath $sitePath -ApplicationPool $projectName
}
(Get-Website $projectName | Format-Table | Out-String).Trim()

Write-Host "`nAdding the URL $siteUrl to your hosts file" @colour

$hostsFile = "C:\Windows\System32\drivers\etc\hosts"
if (!(Get-Content $hostsFile | Select-String "$siteUrl" -Quiet))
{
    Add-Content $hostsFile "`n127.0.0.1`t$siteUrl"
}

Write-Host "`nSetup complete.`n" @colour