# PowerShell script to test base64 image validity in JSON file
param(
    [string]$JsonFilePath = "gujarat_tour_travel.hotels_11-10.json"
)

# Load the JSON file
Write-Host "Loading JSON file: $JsonFilePath"
try {
    $jsonContent = Get-Content -Path $JsonFilePath -Raw | ConvertFrom-Json
    Write-Host "JSON loaded successfully. Found $($jsonContent.Count) hotel records."
} catch {
    Write-Host "Error loading JSON: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Initialize counters
$totalImages = 0
$validImages = 0
$invalidImages = 0
$results = @()

# Function to test base64 image validity
function Test-Base64Image {
    param([string]$base64Data)
    
    try {
        # Remove BSON wrapper if present and extract just the base64 string
        # Handle MongoDB BSON format with nested structure
        if ($base64Data -match '"base64":\s*"([^"]+)"') {
            $base64Data = $matches[1]
        } elseif ($base64Data -match '"binary":"([^"]+)"') {
            $base64Data = $matches[1]
        }
        
        # Try to decode the base64 string
        $bytes = [Convert]::FromBase64String($base64Data)
        
        # Check for common image file signatures
        $isValid = $false
        $imageType = "Unknown"
        
        # Check for JPEG signature (FF D8 FF)
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xD8 -and $bytes[2] -eq 0xFF) {
            $isValid = $true
            $imageType = "JPEG"
        }
        # Check for PNG signature (89 50 4E 47)
        elseif ($bytes.Length -ge 4 -and $bytes[0] -eq 0x89 -and $bytes[1] -eq 0x50 -and $bytes[2] -eq 0x4E -and $bytes[3] -eq 0x47) {
            $isValid = $true
            $imageType = "PNG"
        }
        # Check for GIF signature (47 49 46)
        elseif ($bytes.Length -ge 3 -and $bytes[0] -eq 0x47 -and $bytes[1] -eq 0x49 -and $bytes[2] -eq 0x46) {
            $isValid = $true
            $imageType = "GIF"
        }
        # Check for BMP signature (42 4D)
        elseif ($bytes.Length -ge 2 -and $bytes[0] -eq 0x42 -and $bytes[1] -eq 0x4D) {
            $isValid = $true
            $imageType = "BMP"
        }
        
        return @{
            IsValid = $isValid
            ImageType = $imageType
            Size = $bytes.Length
            Error = $null
        }
        
    } catch {
        return @{
            IsValid = $false
            ImageType = "Unknown"
            Size = 0
            Error = $_.Exception.Message
        }
    }
}

# Process each hotel record
Write-Host "Analyzing image data..." -ForegroundColor Yellow

foreach ($hotel in $jsonContent) {
    $hotelName = if ($hotel.hotel_name) { $hotel.hotel_name } else { "Unknown Hotel" }
    Write-Host "Processing hotel: $hotelName"
    
    # Check all possible image fields
    $imageFields = @("image", "img_1", "img_2", "img_3", "img_4", "img_5")
    
    foreach ($field in $imageFields) {
        if ($hotel.$field -and $hotel.$field -ne "" -and $hotel.$field -ne $null) {
            $totalImages++
            Write-Host "  Testing $field..." -NoNewline
            
            $result = Test-Base64Image -base64Data $hotel.$field
            
            if ($result.IsValid) {
                $validImages++
                Write-Host " Valid $($result.ImageType) (Size: $($result.Size) bytes)" -ForegroundColor Green
            } else {
                $invalidImages++
                Write-Host " Invalid" -ForegroundColor Red
                if ($result.Error) {
                    Write-Host "    Error: $($result.Error)" -ForegroundColor Red
                }
            }
            
            # Store result for summary
            $results += @{
                HotelName = $hotelName
                Field = $field
                IsValid = $result.IsValid
                ImageType = $result.ImageType
                Size = $result.Size
                Error = $result.Error
            }
        }
    }
}

# Display summary
Write-Host ""
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "Total Images Found: $totalImages"
Write-Host "Valid Images: $validImages" -ForegroundColor Green
Write-Host "Invalid Images: $invalidImages" -ForegroundColor Red

if ($invalidImages -gt 0) {
    Write-Host ""
    Write-Host "Invalid Images Details:" -ForegroundColor Red
    $invalidResults = $results | Where-Object { -not $_.IsValid }
    foreach ($invalid in $invalidResults) {
        Write-Host "  - $($invalid.HotelName) -> $($invalid.Field): $($invalid.Error)"
    }
}

# Image type breakdown
Write-Host ""
Write-Host "Image Type Breakdown:" -ForegroundColor Cyan
$validResults = $results | Where-Object { $_.IsValid }
$typeGroups = $validResults | Group-Object ImageType
foreach ($group in $typeGroups) {
    Write-Host "  $($group.Name): $($group.Count) images"
}

Write-Host ""
Write-Host "Analysis complete!" -ForegroundColor Green