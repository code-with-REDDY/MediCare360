# MediCare360 Java Spring Boot Backend Runner
$javaBackend = "$PSScriptRoot\java-backend"
Set-Location $javaBackend

$javaCandidates = @()
if ($env:JAVA_HOME) {
    $javaCandidates += Join-Path $env:JAVA_HOME "bin\java.exe"
}
$javaCommand = Get-Command java.exe -ErrorAction SilentlyContinue
if ($javaCommand) {
    $javaCandidates += $javaCommand.Source
}
$javaCandidates += Get-ChildItem "C:\Program Files\Java","C:\Program Files\Eclipse Adoptium","C:\Program Files\Microsoft" -Filter java.exe -Recurse -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty FullName
$javaCandidates += Get-ChildItem "$env:TEMP\medicare-jdk21" -Filter java.exe -Recurse -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty FullName

$java = $javaCandidates |
    Where-Object { Test-Path $_ } |
    Select-Object -Unique |
    Where-Object {
        $versionOutput = (& $_ -version 2>&1 | Out-String)
        $versionOutput -match 'version "2[1-9](?:\.\d+)?'
    } |
    Select-Object -First 1

if (-not $java) {
    Write-Host "Java 21 or newer is required. Install it, then run this script again." -ForegroundColor Red
    exit 1
}

$jar = Join-Path $javaBackend "target\medicare360-1.0.0.jar"
$maven = Get-Command mvn.cmd -ErrorAction SilentlyContinue
if (-not $maven) {
    $maven = Get-Command mvn -ErrorAction SilentlyContinue
}

if ($maven) {
    Write-Host "Building MediCare360 Java backend..." -ForegroundColor Cyan
    & $maven.Source -DskipTests package -q
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build FAILED. Check errors above." -ForegroundColor Red
        exit 1
    }
    Write-Host "Build SUCCESS." -ForegroundColor Green
} elseif (-not (Test-Path $jar)) {
    Write-Host "Maven is not installed and no existing backend JAR was found." -ForegroundColor Red
    exit 1
} else {
    Write-Host "Maven not found; starting the existing backend JAR." -ForegroundColor Yellow
}

$env:MEDICARE_DB_PATH = Join-Path $PSScriptRoot "data\medicare360.db"
$env:JWT_SECRET_KEY = if ($env:JWT_SECRET_KEY) { $env:JWT_SECRET_KEY } else { "local-development-secret-key-1234567890" }

$port = 8080
$listeners = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique)
foreach ($processId in $listeners) {
    if (-not $processId -or $processId -eq 0) {
        Write-Host "Port $port is reported as busy, but Windows did not provide a killable process ID (PID 0). No process was stopped." -ForegroundColor Red
        Write-Host "Check the port reservation or owning service, then run this script again." -ForegroundColor Yellow
        exit 1
    }

    $owner = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
    if ($owner -and $owner.Name -match '^java(w)?\.exe$' -and $owner.CommandLine -like '*medicare360-1.0.0.jar*') {
        Write-Host "Stopping previous MediCare360 backend (PID $processId)..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction Stop
    } else {
        $ownerName = if ($owner) { $owner.Name } else { 'unknown process' }
        Write-Host "Port $port is occupied by PID $processId ($ownerName), not the MediCare360 backend. No process was stopped." -ForegroundColor Red
        Write-Host "Stop that service or configure it to use another port, then run this script again." -ForegroundColor Yellow
        exit 1
    }
}

if ($listeners.Count -gt 0) {
    $deadline = (Get-Date).AddSeconds(10)
    do {
        Start-Sleep -Milliseconds 250
        $stillListening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    } while ($stillListening -and (Get-Date) -lt $deadline)
    if ($stillListening) {
        Write-Host "The previous backend did not release port $port in time." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Starting MediCare360 Spring Boot Backend on http://localhost:$port..." -ForegroundColor Green
Write-Host "Database: $javaBackend\..\data\medicare360.db" -ForegroundColor Gray
Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray
& $java -jar $jar
