$f = 'c:\Users\DELL\OneDrive\Desktop\kci\frontend\src\pages\StudentDashboard.jsx'
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
$c = $c -replace 'â€"', '-'
$c = $c -replace 'â€¢', '|'
$c = $c -replace "â\u0080\u009C PASS", 'PASS'
$c = $c -replace "â\u0080\u0094 FAIL", 'FAIL'
$c = $c -replace "â\u0080\u009C Done", 'Done'
$c = $c -replace "â³ Pending", 'Pending'
$c = $c -replace "â\u009C\u0085 Approved", 'Approved'
$c = $c -replace "â\u009C\u0085", ''
$c = $c -replace "â\u008C", ''
$c = $c -replace 'Submit Test .*', 'Submit Test'
[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Host 'Done'
