// V254: automatic body build (EA FC 26 body type) — identity-guarded, render-only, user and reviewed builds win.
'use strict';
const A=require('assert/strict'),path=require('path'),root=path.resolve(__dirname,'..');
const C=require(path.join(root,'assets/character-system.js')),data=require(path.join(root,'assets/player-builds.json'));
A.equal(data.schema,1);A.deepEqual(Object.keys(data.codes).sort(),['m','s']);
const rows=Object.entries(data.players);A.ok(rows.length>2000,'builds present');
for(const [id,[code,dob]] of rows){A.match(id,/^[a-z]*-?\d+$/);A.ok(code in data.codes);A.match(dob,/^\d{4}-\d{2}-\d{2}$/);}
C.setBuilds(data);
A.equal(C.resolve({id:'side1-362150',name:'Lamine Yamal',dateOfBirth:'2007-07-13'}).bodyType,'slim');
A.equal(C.resolve({id:'142200',name:'Harry Kane',dateOfBirth:'1993-07-28'}).bodyType,'muscular');
A.equal(C.resolve({id:'362150',name:'Lamine Yamal',dateOfBirth:'1999-01-01'}).bodyType,'athletic','date of birth must match');
A.equal(C.resolve({id:'173896',name:'Mohamed Salah',dateOfBirth:'1992-06-15'}).bodyType,'slim','reviewed build kept');
A.equal(C.resolve({id:'362150',name:'Lamine Yamal',dateOfBirth:'2007-07-13',visualPreview:{bodyType:'muscular'}}).bodyType,'muscular','user choice wins');
C.setBuilds(null);A.equal(C.resolve({id:'362150',name:'Lamine Yamal',dateOfBirth:'2007-07-13'}).bodyType,'athletic');
console.log(JSON.stringify({pass:true,builds:rows.length,slim:rows.filter(r=>r[1][0]==='s').length,muscular:rows.filter(r=>r[1][0]==='m').length}));
