##############################################################################
# setup-db.ps1
# One-time PostgreSQL setup for KSU Campus Parking (local development).
#
# USAGE: Open PowerShell in the campus-parking/ folder and run:
#   .\setup-db.ps1
#
# What this does:
#   1. Prompts for your postgres superuser password (not stored anywhere)
#   2. Creates parking_user with password 'parking_pass'
#   3. Creates the campus_parking database owned by parking_user
#   4. Grants privileges on the public schema
#   5. Writes .env with the correct DATABASE_URL
#   6. Verifies the connection as parking_user
##############################################################################

param(
    [string]$PgHost      = "127.0.0.1",
    [int]   $PgPort      = 5432,
    [string]$PgSuperUser = "postgres"
)

$ErrorActionPreference = "Stop"

# --------------------------------------------------------------------------
# Helper: run psql non-interactively using PGPASSWORD already set in env.
# Returns $true on success, $false on failure.
# --------------------------------------------------------------------------
function Invoke-Psql {
    param(
        [string]$Database,
        [string]$User,
        [string]$SqlCommand
    )
    $output = & psql `
        -h $PgHost `
        -p $PgPort `
        -U $User `
        -d $Database `
        -c $SqlCommand `
        -w `
        2>&1
    return @{ ExitCode = $LASTEXITCODE; Output = $output }
}

function Invoke-PsqlQuery {
    param(
        [string]$Database,
        [string]$User,
        [string]$SqlCommand
    )
    $output = & psql `
        -h $PgHost `
        -p $PgPort `
        -U $User `
        -d $Database `
        -tAc $SqlCommand `
        -w `
        2>&1
    return @{ ExitCode = $LASTEXITCODE; Output = ($output -join "").Trim() }
}

# --------------------------------------------------------------------------
# Helper: write SQL to a temp file and execute it via psql -f
# Avoids all stdin-piping and here-string embedding issues.
# --------------------------------------------------------------------------
function Invoke-PsqlFile {
    param(
        [string]$Database,
        [string]$User,
        [string]$SqlContent
    )
    $tmpFile = [System.IO.Path]::GetTempFileName()
    [System.IO.File]::WriteAllText($tmpFile, $SqlContent, [System.Text.Encoding]::UTF8)

    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'

    $output = & psql `
        -h $PgHost `
        -p $PgPort `
        -U $User `
        -d $Database `
        -v ON_ERROR_STOP=1 `
        --set=client_min_messages=warning `
        -f $tmpFile `
        -w `
        2>&1

    $code = $LASTEXITCODE
    $ErrorActionPreference = $prevEAP

    Remove-Item $tmpFile -ErrorAction SilentlyContinue
    return @{ ExitCode = $code; Output = $output }
}

# --------------------------------------------------------------------------
Write-Host ""
Write-Host "=== KSU Campus Parking: One-Time Database Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "PostgreSQL target: ${PgHost}:${PgPort} (superuser: ${PgSuperUser})"
Write-Host "Enter your PostgreSQL superuser password:"
$pgPwd = Read-Host -AsSecureString
$bstr  = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPwd)
$env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)

# --------------------------------------------------------------------------
# Step 1: Verify superuser connection
# --------------------------------------------------------------------------
Write-Host ""
Write-Host "[1/5] Verifying superuser connection..." -ForegroundColor Yellow
$r = Invoke-PsqlQuery -Database "postgres" -User $PgSuperUser -SqlCommand "SELECT current_user;"
if ($r.ExitCode -ne 0) {
    Write-Host "ERROR: Cannot connect as '${PgSuperUser}'. Check your password." -ForegroundColor Red
    Write-Host $r.Output
    exit 1
}
Write-Host "      Connected as: $($r.Output)" -ForegroundColor Green

# --------------------------------------------------------------------------
# Step 2: Create parking_user if it does not exist
# --------------------------------------------------------------------------
Write-Host ""
Write-Host "[2/5] Creating parking_user (if not exists)..." -ForegroundColor Yellow

# Use a temp SQL file to avoid PowerShell misinterpreting dollar signs in DO blocks
$createUserSql = @'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname = 'parking_user'
  ) THEN
    CREATE ROLE parking_user WITH LOGIN PASSWORD 'parking_pass';
    RAISE NOTICE 'parking_user created.';
  ELSE
    RAISE NOTICE 'parking_user already exists, skipping.';
  END IF;
END
$$;
'@

$r = Invoke-PsqlFile -Database "postgres" -User $PgSuperUser -SqlContent $createUserSql
if ($r.ExitCode -ne 0) {
    Write-Host "ERROR: Failed to create parking_user." -ForegroundColor Red
    Write-Host $r.Output
    exit 1
}
Write-Host "      OK" -ForegroundColor Green

# --------------------------------------------------------------------------
# Step 3: Create campus_parking database if it does not exist
# --------------------------------------------------------------------------
Write-Host ""
Write-Host "[3/5] Creating campus_parking database (if not exists)..." -ForegroundColor Yellow

$dbCheck = Invoke-PsqlQuery `
    -Database "postgres" `
    -User $PgSuperUser `
    -SqlCommand "SELECT 1 FROM pg_database WHERE datname='campus_parking';"

if ($dbCheck.Output -eq "1") {
    Write-Host "      campus_parking already exists." -ForegroundColor DarkGray
    # Ensure parking_user owns it
    $r = Invoke-Psql `
        -Database "postgres" `
        -User $PgSuperUser `
        -SqlCommand "ALTER DATABASE campus_parking OWNER TO parking_user;"
    if ($r.ExitCode -ne 0) {
        Write-Host "WARNING: Could not alter owner (may need manual fix)." -ForegroundColor DarkYellow
    }
} else {
    $r = Invoke-Psql `
        -Database "postgres" `
        -User $PgSuperUser `
        -SqlCommand "CREATE DATABASE campus_parking OWNER parking_user;"
    if ($r.ExitCode -ne 0) {
        Write-Host "ERROR: Failed to create database." -ForegroundColor Red
        Write-Host $r.Output
        exit 1
    }
    Write-Host "      campus_parking created." -ForegroundColor Green
}
Write-Host "      OK" -ForegroundColor Green

# --------------------------------------------------------------------------
# Step 4: Grant schema privileges
# --------------------------------------------------------------------------
Write-Host ""
Write-Host "[4/5] Granting privileges on public schema..." -ForegroundColor Yellow
$r = Invoke-Psql `
    -Database "campus_parking" `
    -User $PgSuperUser `
    -SqlCommand "GRANT ALL PRIVILEGES ON SCHEMA public TO parking_user;"
if ($r.ExitCode -ne 0) {
    Write-Host "WARNING: Grant may have failed (continuing)." -ForegroundColor DarkYellow
    Write-Host $r.Output
} else {
    Write-Host "      OK" -ForegroundColor Green
}

# --------------------------------------------------------------------------
# Step 5: Write .env file
# --------------------------------------------------------------------------
Write-Host ""
Write-Host "[5/5] Writing .env file..." -ForegroundColor Yellow

# Build .env as an array of lines (no Unicode box-drawing characters)
$envLines = @(
    "# campus-parking/.env"
    "# Generated by setup-db.ps1 - DO NOT COMMIT this file."
    ""
    "# --- Database ---"
    "POSTGRES_USER=parking_user"
    "POSTGRES_PASSWORD=parking_pass"
    "POSTGRES_DB=campus_parking"
    "DATABASE_URL=postgresql://parking_user:parking_pass@127.0.0.1:5432/campus_parking"
    ""
    "# --- Backend Auth ---"
    "JWT_SECRET=dev_jwt_secret_replace_in_prod"
    "JWT_REFRESH_SECRET=dev_refresh_secret_replace_in_prod"
    "JWT_EXPIRES_IN=15m"
    "JWT_REFRESH_EXPIRES_IN=7d"
    ""
    "# --- Backend Server ---"
    "PORT=4000"
    "CLIENT_URL=http://localhost:5173"
    "NODE_ENV=development"
    ""
    "# --- Email (leave blank to disable) ---"
    "SMTP_HOST="
    "SMTP_PORT=587"
    "SMTP_USER="
    "SMTP_PASS="
    "SMTP_FROM=noreply@ksu-parking.local"
    ""
    "# --- Cloudinary (leave blank for local /uploads fallback) ---"
    "CLOUDINARY_CLOUD_NAME="
    "CLOUDINARY_API_KEY="
    "CLOUDINARY_API_SECRET="
    ""
    "# --- Simulator ---"
    "SIMULATOR_ENABLED=true"
    ""
    "# --- Frontend (Vite) ---"
    "VITE_API_URL=http://localhost:4000"
    "VITE_SOCKET_URL=http://localhost:4000"
)

$envPath = Join-Path $PSScriptRoot ".env"
[System.IO.File]::WriteAllLines($envPath, $envLines, [System.Text.Encoding]::ASCII)
Write-Host "      Written: $envPath" -ForegroundColor Green

# --------------------------------------------------------------------------
# Verify: connect as parking_user
# --------------------------------------------------------------------------
Write-Host ""
Write-Host "Verifying parking_user connection to campus_parking..." -ForegroundColor Yellow
$env:PGPASSWORD = "parking_pass"
$r = Invoke-PsqlQuery `
    -Database "campus_parking" `
    -User "parking_user" `
    -SqlCommand "SELECT current_user || ' @ ' || current_database() AS info;"
if ($r.ExitCode -ne 0) {
    Write-Host "ERROR: parking_user cannot connect to campus_parking." -ForegroundColor Red
    Write-Host $r.Output
    exit 1
}
Write-Host "      $($r.Output)" -ForegroundColor Green

# --------------------------------------------------------------------------
Write-Host ""
Write-Host "=== Database setup complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps - run from campus-parking\backend\:" -ForegroundColor White
Write-Host ""
Write-Host "  npm run db:migrate" -ForegroundColor Yellow
Write-Host "  npm run db:seed" -ForegroundColor Yellow
Write-Host ""
