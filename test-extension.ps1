# Test Extension Script
# This script helps verify the extension package

Write-Host "🧪 Testing Project Extension Grammar" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if VSIX file exists
Write-Host "📦 Checking VSIX file..." -ForegroundColor Yellow
$vsixFile = Get-ChildItem -Filter "project-extension-grammar-*.vsix" | Select-Object -First 1

if ($vsixFile) {
    Write-Host "✅ Found: $($vsixFile.Name)" -ForegroundColor Green
    Write-Host "   Size: $([math]::Round($vsixFile.Length / 1KB, 2)) KB" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "❌ VSIX file not found!" -ForegroundColor Red
    Write-Host "   Run: npm run package" -ForegroundColor Yellow
    exit 1
}

# Check example file
Write-Host "📄 Checking example file..." -ForegroundColor Yellow
if (Test-Path "example.targetlang") {
    Write-Host "✅ example.targetlang exists" -ForegroundColor Green
    $lines = (Get-Content "example.targetlang").Count
    Write-Host "   Lines: $lines" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "⚠️  example.targetlang not found" -ForegroundColor Yellow
    Write-Host ""
}

# Check documentation
Write-Host "📚 Checking documentation..." -ForegroundColor Yellow
$docs = @(
    "README.md",
    "INSTALLATION.md",
    "TESTING_GUIDE.md",
    "PROJECT_SUMMARY.md",
    "DEPLOYMENT_READY.md"
)

foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "✅ $doc" -ForegroundColor Green
    } else {
        Write-Host "❌ $doc missing" -ForegroundColor Red
    }
}
Write-Host ""

# Check required files in package
Write-Host "🔍 Verifying package contents..." -ForegroundColor Yellow
Write-Host "   Running verification script..." -ForegroundColor Gray
npm run package:verify
Write-Host ""

# Run tests
Write-Host "🧪 Running test suite..." -ForegroundColor Yellow
Write-Host "   This may take a moment..." -ForegroundColor Gray
npm test -- --silent
$testResult = $LASTEXITCODE

if ($testResult -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Some tests failed" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

if ($vsixFile -and $testResult -eq 0) {
    Write-Host "✅ Extension is ready for testing!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Install the extension in VS Code/Kiro IDE" -ForegroundColor White
    Write-Host "   - Press Ctrl+Shift+X" -ForegroundColor Gray
    Write-Host "   - Click '...' → Install from VSIX" -ForegroundColor Gray
    Write-Host "   - Select: $($vsixFile.Name)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Open example.targetlang to test" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Follow TESTING_GUIDE.md for detailed tests" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "⚠️  Some issues found" -ForegroundColor Yellow
    Write-Host "   Please fix the issues above before testing" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "For detailed testing instructions, see:" -ForegroundColor Cyan
Write-Host "  TESTING_GUIDE.md" -ForegroundColor White
Write-Host ""
