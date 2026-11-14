param([string]$Message = "Update NEILO release")
$ErrorActionPreference='Stop'
$project = Split-Path $PSScriptRoot -Parent
$target = Join-Path $project '.publish'
if (!(Test-Path (Join-Path $target '.git'))) {
    git clone https://github.com/zeroomood5-create/the-neilo-project.git $target
    if ($LASTEXITCODE) { throw 'Git clone failed.' }
}
git -C $target pull --ff-only origin main
if ($LASTEXITCODE) { throw 'Pull failed. Review remote changes before publishing.' }
foreach ($directory in @('dist','scripts','tests','docs','data','production')) {
    Copy-Item -LiteralPath (Join-Path $project $directory) -Destination $target -Recurse -Force
}
foreach ($file in @('README.md','package.json','server.mjs','.gitignore','LEVEL_INTEGRATION_PLAN.md','MISSION_CONTENT_WORKFLOW.md','RELEASE_CURRENT.md','GAMEPLAY_REDESIGN_PLAN.md','ONBOARDING_AND_PLAYTEST_REVISION.md','GUIDED_JOURNEY_RELEASE.md')) {
    Copy-Item -LiteralPath (Join-Path $project $file) -Destination $target -Force
}
$kokoroSource = Join-Path $project 'tools/kokoro'
$kokoroTarget = Join-Path $target 'tools/kokoro'
New-Item -ItemType Directory -Path $kokoroTarget -Force | Out-Null
Get-ChildItem -LiteralPath $kokoroSource -File | ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $kokoroTarget -Force }

git -C $target add -A
git -C $target diff --cached --quiet
if ($LASTEXITCODE -eq 1) {
    git -C $target -c user.name=zeroomood5-create -c user.email=325104081+zeroomood5-create@users.noreply.github.com commit -m $Message
    if ($LASTEXITCODE) { throw 'Commit failed.' }
}
git -C $target push origin main
if ($LASTEXITCODE) { throw 'Push failed.' }
git -C $target log -1 --format="%h %ci"

# The game is hosted from the static dist tree, independently of Sites.
$pagesCommit = (git -C $target subtree split --prefix dist).Trim()
if ($LASTEXITCODE) { throw 'Could not prepare GitHub Pages tree.' }
git -C $target push origin "${pagesCommit}:refs/heads/gh-pages"
if ($LASTEXITCODE) { throw 'GitHub Pages push failed; review the existing branch before retrying.' }
Write-Output 'GitHub Pages: https://zeroomood5-create.github.io/the-neilo-project/'
