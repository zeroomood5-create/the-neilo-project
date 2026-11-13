$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$projectPath = Split-Path -Parent $PSScriptRoot
$audioPath = Join-Path $projectPath 'dist/assets/audio'
New-Item -ItemType Directory -Force -Path $audioPath | Out-Null
$voiceLines = Get-Content -Raw -Encoding utf8 (Join-Path $projectPath 'dist/voice-lines.json') | ConvertFrom-Json
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $synth.Rate = -1
    $synth.Volume = 90
    foreach ($line in $voiceLines) {
        $synth.SelectVoice($line.voice)
        $synth.SetOutputToWaveFile((Join-Path $audioPath ($line.id + '.wav')))
        $synth.Speak($line.text)
        $synth.SetOutputToNull()
        & ffmpeg -hide_banner -loglevel error -y -i (Join-Path $audioPath ($line.id + '.wav')) -codec:a libmp3lame -q:a 4 (Join-Path $audioPath ($line.id + '.mp3'))
        if ($LASTEXITCODE -ne 0) { throw ('Audio conversion failed for ' + $line.id) }
        Remove-Item -LiteralPath (Join-Path $audioPath ($line.id + '.wav'))
        Write-Output ('Created ' + $line.id)
    }
} finally {
    $synth.Dispose()
}
