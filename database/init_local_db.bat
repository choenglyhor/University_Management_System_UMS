@echo off
REM ==============================================================================
REM Script to initialize UniversityPortalDB on local Microsoft SQL Server
REM ==============================================================================

echo [1/3] Creating Database UniversityPortalDB if not exists...
sqlcmd -S localhost\SQL2026 -E -Q "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'UniversityPortalDB') CREATE DATABASE UniversityPortalDB;"
if %ERRORLEVEL% NEQ 0 (
    echo Fallback to localhost default instance...
    sqlcmd -S localhost -E -Q "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'UniversityPortalDB') CREATE DATABASE UniversityPortalDB;"
)

echo [2/3] Executing 01_schema.sql...
sqlcmd -S localhost\SQL2026 -E -d UniversityPortalDB -i "%~dp001_schema.sql"
if %ERRORLEVEL% NEQ 0 (
    echo Fallback schema execution on localhost...
    sqlcmd -S localhost -E -d UniversityPortalDB -i "%~dp001_schema.sql"
)

echo [3/3] Executing 02_seed.sql...
sqlcmd -S localhost\SQL2026 -E -d UniversityPortalDB -i "%~dp002_seed.sql"
if %ERRORLEVEL% NEQ 0 (
    echo Fallback seed execution on localhost...
    sqlcmd -S localhost -E -d UniversityPortalDB -i "%~dp002_seed.sql"
)

echo.
echo Database initialization completed successfully!
