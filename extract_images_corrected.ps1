# Script to extract images from Gujarat hotel JSON file

# Load JSON file
$jsonPath = "gujarat_tour_travel.hotels_11-10.json"
Write-Host "Loading JSON from: $jsonPath"

try {
    $jsonContent = Get-Content $jsonPath -Raw -Encoding UTF8
    $hotels = $jsonContent | ConvertFrom-Json
    
    Write-Host "Found $($hotels.Count) hotels in JSON"
    
    # Create output directory
    $outputDir = "extracted_images"
    if (!(Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir | Out-Null
        Write-Host "Created directory: $outputDir"
    }
    
    $imageCount = 0
    
    for ($i = 0; $i -lt $hotels.Count; $i++) {
        $hotel = $hotels[$i]
        
        # Check if hotel has image property
        if ($hotel.PSObject.Properties.Name -contains "image") {
            $imageField = $hotel.image
            
            # Debug: Show the structure
            Write-Host "`nHotel $($i + 1) image field type: $($imageField.GetType().Name)"
            
            # Try different approaches to extract base64 data
            $base64String = $null
            
            # Approach 1: Direct access to base64 property
            if ($imageField.PSObject.Properties.Name -contains "base64") {
                Write-Host "Found base64 property directly"
                $base64String = $imageField.base64
            }
            # Approach 2: Access through $binary property
            elseif ($imageField.PSObject.Properties.Name -contains "`$binary") {
                Write-Host "Found `$binary property"
                $binaryObj = $imageField.'$binary'
                if ($binaryObj.PSObject.Properties.Name -contains "base64") {
                    $base64String = $binaryObj.base64
                }
            }
            
            # Check if we found valid base64 data
            if ($base64String -and $base64String.Length -gt 0) {
                try {
                    Write-Host "Processing base64 string of length: $($base64String.Length)"
                    
                    # Convert base64 to bytes
                    $imageBytes = [Convert]::FromBase64String($base64String)
                    
                    # Determine file extension based on file header
                    $extension = ".bin"  # Default extension
                    if ($imageBytes.Length -ge 4) {
                        # Check for JPEG signature
                        if ($imageBytes[0] -eq 0xFF -and $imageBytes[1] -eq 0xD8 -and $imageBytes[2] -eq 0xFF) {
                            $extension = ".jpg"
                        }
                        # Check for PNG signature
                        elseif ($imageBytes[0] -eq 0x89 -and $imageBytes[1] -eq 0x50 -and $imageBytes[2] -eq 0x4E -and $imageBytes[3] -eq 0x47) {
                            $extension = ".png"
                        }
                        # Check for GIF signature
                        elseif ($imageBytes[0] -eq 0x47 -and $imageBytes[1] -eq 0x49 -and $imageBytes[2] -eq 0x46) {
                            $extension = ".gif"
                        }
                    }
                    
                    # Create filename
                    $filename = "hotel_$($i + 1)_image$extension"
                    $filepath = Join-Path $outputDir $filename
                    
                    # Write image file
                    [System.IO.File]::WriteAllBytes($filepath, $imageBytes)
                    
                    Write-Host "Successfully extracted: $filename (Size: $($imageBytes.Length) bytes)"
                    $imageCount++
                }
                catch {
                    Write-Host "Error processing hotel $($i + 1): $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            else {
                Write-Host "No valid base64 data found for hotel $($i + 1)" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "Hotel $($i + 1) has no image field" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nExtraction complete!"
    Write-Host "Total images extracted: $imageCount"
    Write-Host "Images saved to: $outputDir"
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}