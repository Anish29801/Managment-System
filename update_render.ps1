# update_render.ps1

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Render CLI - Environment Variable Setup   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "This script will securely ask for your keys and push them to Render.`n"

# Prompt for Render Credentials
$RenderApiKey = Read-Host "1. Paste your Render API Key (from dashboard.render.com/user/settings#api-keys)"
$RenderServiceId = Read-Host "2. Paste your Render Service ID (starts with 'srv-...', found in your Render URL)"

Write-Host "`nNow, open the Firebase Service Account JSON file you downloaded." -ForegroundColor Yellow
$FirebaseClientEmail = Read-Host "3. Paste the 'client_email' value from the JSON"
$FirebasePrivateKey = Read-Host "4. Paste the 'private_key' value from the JSON (Make sure to include the whole string with \n)"

Write-Host "`nPushing variables to Render using CLI..." -ForegroundColor Cyan

# Define the variables
$Body = @(
    @{ envVarName = "FRONTEND_URL"; envVarValue = "https://subtle-paletas-b695cb.netlify.app" },
    @{ envVarName = "FIREBASE_PROJECT_ID"; envVarValue = "task-master-db-3956c" },
    @{ envVarName = "FIREBASE_CLIENT_EMAIL"; envVarValue = $FirebaseClientEmail },
    @{ envVarName = "FIREBASE_PRIVATE_KEY"; envVarValue = $FirebasePrivateKey }
) | ConvertTo-Json

$Headers = @{
    "Authorization" = "Bearer $RenderApiKey"
    "Accept"        = "application/json"
    "Content-Type"  = "application/json"
}

try {
    $Response = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$RenderServiceId/env-vars" -Method Put -Headers $Headers -Body $Body
    Write-Host "`n✅ SUCCESS! Your backend environment variables have been updated." -ForegroundColor Green
    Write-Host "Render is now restarting your backend to apply the changes." -ForegroundColor Green
} catch {
    Write-Host "`n❌ ERROR: Failed to update Render. Please double check your API Key and Service ID." -ForegroundColor Red
    Write-Host $_.Exception.Message
}
