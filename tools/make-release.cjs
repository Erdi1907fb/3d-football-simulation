// Writes assets/release-v<VERSION>.json: sha256 of every deployable code/text file.
// build.php compares the live server against it. Run after a version bump:
//   node tools/make-release.cjs
const fs=require('fs'),path=require('path'),crypto=require('crypto'),root=path.resolve(__dirname,'..');
const version=Number(fs.readFileSync(root+'/VERSION','utf8').trim().replace(/^v/i,''));
const skip=/^(\.git|docs|tests|tools|data\/private)(\/|$)|^(AGENTS|CLAUDE|README)\.md$|^VERSION$|release-v\d+\.json$/,code=/\.(html|php|js|css|json|htaccess)$|^\.htaccess$/;
const files={};(function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const abs=path.join(dir,e.name),rel=path.relative(root,abs).split(path.sep).join('/');if(skip.test(rel))continue;if(e.isDirectory())walk(abs);else if(code.test(e.name)&&fs.statSync(abs).size<12e6)files[rel]=crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');}})(root);
const sorted=Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b)));
fs.writeFileSync(root+`/assets/release-v${version}.json`,JSON.stringify({build:version,baseBuild:version-1,files:sorted},null,1));
console.log(`release-v${version}.json: ${Object.keys(sorted).length} files`);
