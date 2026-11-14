param(
    [string]$Text = 'You helped our garden grow. Leaves use light, water and carbon dioxide to make sugars. This is photosynthesis.',
    [string]$Voice = 'am_michael',
    [double]$Speed = 0.96,
    [string]$Output = '',
    [string]$TextFile = ''
)
$ErrorActionPreference = 'Stop'
$python = Join-Path $PSScriptRoot '.venv/Scripts/python.exe'
if (!(Test-Path -LiteralPath $python)) { throw 'Kokoro environment is missing. See README.md.' }
$arguments = @((Join-Path $PSScriptRoot 'generate.py'), '--voice', $Voice, '--speed', [string]$Speed)
if ($TextFile) { $arguments += @('--text-file', $TextFile) } else { $arguments += @('--text', $Text) }
if ($Output) { $arguments += @('--output', $Output) }
& $python @arguments
if ($LASTEXITCODE) { throw 'Speech generation failed.' }
