// V254: automatic body build (EA FC 26 body type) — identity-guarded, render-only, user and reviewed builds win.
'use strict';
const A=require('assert/strict'),path=require('path'),root=path.resolve(__dirname,'..');
const C=require(path.join(root,'assets/character-system.js')),data=require(path.join(root,'assets/player-builds.json'));
A.equal(data.schema,2);
const rows=Object.entries(data.players);A.ok(rows.length>2000,'builds present');
for(const [id,[m,u,l,dob]] of rows){A.match(id,/^[a-z]*-?\d+$/);for(const v of [m,u,l])A.ok(v>=-1&&v<=1);A.match(dob,/^\d{4}-\d{2}-\d{2}$/);}
C.setBuilds(data);
A.equal(C.resolve({id:'side1-362150',name:'Lamine Yamal',dateOfBirth:'2007-07-13'}).bodyType,'slim');
A.equal(C.resolve({id:'142200',name:'Harry Kane',dateOfBirth:'1993-07-28'}).bodyType,'muscular');
A.equal(C.resolve({id:'362150',name:'Lamine Yamal',dateOfBirth:'1999-01-01'}).bodyType,'athletic','date of birth must match');
A.equal(C.resolve({id:'173896',name:'Mohamed Salah',dateOfBirth:'1992-06-15'}).bodyType,'slim','reviewed build kept');
A.equal(C.resolve({id:'362150',name:'Lamine Yamal',dateOfBirth:'2007-07-13',visualPreview:{bodyType:'muscular'}}).bodyType,'muscular','user choice wins');
C.setBuilds(null);A.equal(C.resolve({id:'362150',name:'Lamine Yamal',dateOfBirth:'2007-07-13'}).bodyType,'athletic');
C.setBuilds(data);A.deepEqual(C.resolve({id:'142200',name:'Harry Kane',dateOfBirth:'1993-07-28'}).build,{m:.8,u:1,l:.1},'regional build exposed');
A.ok(C.resolve({id:'999',name:'X',position:'CB'}).build.u>0,'role default for unmatched defenders');
console.log(JSON.stringify({pass:true,builds:rows.length}));
