#!/bin/bash

# UI Freeze Analysis - Static Checks using ripgrep
# Run: bash check-ui-freeze.sh

echo "🔍 UI Freeze Analysis - Static Checks"
echo "======================================"

echo ""
echo "1. Heavy forEach loops with styling operations..."
rg -n "\.forEach\s*\(" --type tsx --type ts | rg -A 5 "\.(font|alignment|fill|border|style|addRow|eachCell)" | wc -l

echo ""
echo "2. setInterval without clearInterval in same file..."
rg -n "setInterval" --type tsx --type ts | rg -v "clearInterval" | wc -l

echo ""
echo "3. setTimeout without clearTimeout in same file..."
rg -n "setTimeout" --type tsx --type ts | rg -v "clearTimeout" | wc -l

echo ""
echo "4. addEventListener without removeEventListener in same file..."
rg -n "addEventListener" --type tsx --type ts | rg -v "removeEventListener" | wc -l

echo ""
echo "5. requestAnimationFrame usage..."
rg -n "requestAnimationFrame" --type tsx --type ts | wc -l

echo ""
echo "6. document.body.style modifications..."
rg -n "document\.body\.style" --type tsx --type ts | wc -l

echo ""
echo "7. JSON.parse in loops (forEach/for)..."
rg -n "JSON\.parse" --type ts --type tsx | rg -A 5 "forEach|for\s*\(" | wc -l

echo ""
echo "8. useEffect with setState patterns..."
rg -n "useEffect" --type tsx | rg -A 10 "setState|set[A-Z]" | wc -l

echo ""
echo "9. ExcelJS/PDF generation functions..."
rg -n "(ExcelJS|jsPDF|pdfmake|html2pdf)" --type ts --type tsx | wc -l

echo ""
echo "10. Portal rendering to document.body..."
rg -n "(createPortal|ReactDOM\.createPortal)" --type tsx | rg -A 3 "document\.body" | wc -l

echo ""
echo "✅ Analysis complete!"
echo ""
echo "💡 Review docs/UI_FREEZE_ACTIONABLE_AUDIT.md for detailed findings"



