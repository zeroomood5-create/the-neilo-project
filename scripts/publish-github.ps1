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
foreach ($directory in @('dist','scripts','tests','docs','data')) {
    Copy-Item -LiteralPath (Join-Path $project $directory) -Destination $target -Recurse -Force
}
foreach ($file in @('README.md','package.json','server.mjs','.gitignore','LEVEL_INTEGRATION_PLAN.md','MISSION_CONTENT_WORKFLOW.md','RELEASE_CURRENT.md')) {
    Copy-Item -LiteralPath (Join-Path $project $file) -Destination $target -Force
}
git -C $target add -A
git -C $target diff --cached --quiet
if ($LASTEXITCODE -eq 1) {
    git -C $target -c user.name=zeroomood5-create -c user.email=325104081+zeroomood5-create@users.noreply.github.com commit -m $Message
    if ($LASTEXITCODE) { throw 'Commit failed.' }
}
git -C $target push origin main
if ($LASTEXITCODE) { throw 'Push failed.' }
git -C $target log -1 --format="%h %ci"
