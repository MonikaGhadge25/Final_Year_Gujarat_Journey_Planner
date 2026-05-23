# Debug script to check base64 extraction
$jsonContent = Get-Content -Path "gujarat_tour_travel.hotels_11-10.json" -Raw | ConvertFrom-Json

# Get the first hotel and examine its image field
$firstHotel = $jsonContent[0]
$imageField = $firstHotel.image

Write-Host "Raw image field content:" -ForegroundColor Yellow
$imageField | Write-Host

Write-Host ""
Write-Host "Image field type: $($imageField.GetType().FullName)" -ForegroundColor Cyan
Write-Host "Image field properties:" -ForegroundColor Cyan
$imageField | Get-Member

Write-Host ""
Write-Host "$binary property:" -ForegroundColor Yellow
$imageField.'$binary' | Write-Host

if ($imageField.'$binary') {
    Write-Host "$binary type: $($imageField.'$binary'.GetType().FullName)" -ForegroundColor Cyan
    Write-Host "$binary properties:" -ForegroundColor Cyan
    $imageField.'$binary' | Get-Member
    
    Write-Host "base64 field:" -ForegroundColor Yellow
    $imageField.'$binary'.base64 | Write-Host
    
    if ($imageField.'$binary'.base64) {
        $base64String = $imageField.'$binary'.base64
        Write-Host "Base64 string length: $($base64String.Length)" -ForegroundColor Green
        Write-Host "First 100 chars: $($base64String.Substring(0, [Math]::Min(100, $base64String.Length)))" -ForegroundColor Green
    }
}
