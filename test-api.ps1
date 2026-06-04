$testData = @{
    name = "Test User"
    email = "newtest@example.com"
    dob = "2000-01-15"
    profession = "Developer"
    photoUrl = ""
    password = "TestPassword123!"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/users/create" -Method POST -ContentType "application/json" -Body $testData
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Content: $($response.Content)"
} catch {
    Write-Host "Error Status: $($_.Exception.Response.StatusCode.Value)"
    Write-Host "Error Message: $($_.Exception.Response.StatusDescription)"
    $errorStream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorStream)
    $errorContent = $reader.ReadToEnd()
    Write-Host "Error Content: $errorContent"
}
