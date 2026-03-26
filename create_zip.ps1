
$source = 'C:\Users\Admin\Desktop\Afra_Tech_Point'
$dest = 'C:\Users\Admin\Desktop\Afra_Tech_Point_Project.zip'

if (Test-Path $dest) { Remove-Item $dest -Force }

$excludeFolders = @('node_modules', '.next')

Add-Type -Assembly 'System.IO.Compression.FileSystem'
$zip = [System.IO.Compression.ZipFile]::Open($dest, 'Create')

$files = Get-ChildItem -Path $source -Recurse -File | Where-Object {
    $fullPath = $_.FullName
    $relativePath = $fullPath.Substring($source.Length + 1)
    $parts = $relativePath.Split([System.IO.Path]::DirectorySeparatorChar)
    $shouldExclude = $false
    foreach ($part in $parts) {
        if ($excludeFolders -contains $part) {
            $shouldExclude = $true
            break
        }
    }
    -not $shouldExclude
}

foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($source.Length + 1)
    $entryName = 'Afra_Tech_Point\' + $relativePath
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $entryName, 'Optimal') | Out-Null
    Write-Host ('Added: ' + $entryName)
}

$zip.Dispose()
Write-Host ''
Write-Host ('ZIP created successfully at: ' + $dest)
