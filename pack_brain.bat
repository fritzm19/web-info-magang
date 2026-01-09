@echo off
setlocal

:: --- CONFIGURATION ---
for %%I in (.) do set "FolderName=%%~nxI"
set "ZipFileName=%FolderName%_Brain_Lite.zip"
set "TreeFile=_PROJECT_STRUCTURE.txt"

echo ========================================================
echo  Creating Surgical Context Pack for: %FolderName%
echo ========================================================

:: 1. Generate a Clean Directory Tree (Excluding heavy folders)
echo [1/3] Generating project structure map...
powershell -Command "Get-ChildItem -Recurse -Exclude 'node_modules','.next','.git','.vscode','dist','build' | Select-Object -ExpandProperty FullName | ForEach-Object { $_.Substring((Get-Location).Path.Length + 1) } > %TreeFile%"

:: 2. Create the Zip with Specific Files + The Tree
echo [2/3] Compressing 10 Critical Files...

:: This PowerShell command zips the Tree File AND the specific list of critical files
powershell -Command "& { ^
    $files = @( ^
        '%TreeFile%', ^
        'PROJECT_CONTEXT.md', ^
        'README.md', ^
        'package.json', ^
        'middleware.ts', ^
        'prisma\schema.prisma', ^
        'app\globals.css', ^
        'app\api\auth\[...nextauth]\route.ts', ^
        'components\LogoutButton.tsx', ^
        'app\page.tsx', ^
        'app\admin\page.tsx' ^
    ); ^
    $validFiles = $files | Where-Object { Test-Path $_ }; ^
    if ($validFiles.Count -eq 0) { Write-Error 'No files found to zip!'; exit 1 } ^
    Compress-Archive -Path $validFiles -DestinationPath '%ZipFileName%' -Force ^
}"

:: 3. Cleanup
echo [3/3] Cleaning up temp files...
if exist "%TreeFile%" del "%TreeFile%"

echo.
if exist "%ZipFileName%" (
    echo  SUCCESS! 🧠
    echo  Lite Archive Created: %ZipFileName%
) else (
    echo  ERROR: Zip creation failed. Check if files exist.
)
echo ========================================================
pause