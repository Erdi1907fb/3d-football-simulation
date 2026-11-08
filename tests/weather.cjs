// V111 weather: rain/snow looks apply and fully restore, late kit materials are adopted,
// particle volumes scale with quality, precipitation is driven by presentation time only.
const assert=require('node:assert/strict'),path=require('path'),root=path.resolve(__dirname,'..');
const T=require(root+'/assets/vendor/three.min.js'),W=require(root+'/assets/weather.js');
function world(){const s=new T.Scene();s.fog=new T.FogExp2(0x101c2d,.0022);const light=new T.DirectionalLight(0xffffff,2);s.add(light);const grass=new T.MeshStandardMaterial({color:0x44aa44,roughness:.9});grass.userData.broadcastSurface=true;s.add(new T.Mesh(new T.PlaneGeometry(1,1),grass));return{s,light,grass};}
const out={};
for(const q of['high','balanced','low']){const {s}=world(),w=W.create(s,{weather:'rain',quality:q});w.update(0);out[q]=w.particles;}
assert(out.high>out.balanced&&out.balanced>out.low,'quality scaling');
const {s,light,grass}=world(),w=W.create(s,{weather:'rain',quality:'balanced'});w.update(3.25);
assert.equal(w.type,'rain');assert(light.intensity<2&&grass.roughness<.9&&s.fog.density>.0022,'rain look');
const fx=s.children.filter(o=>o.material?.uniforms?.uTime);assert(fx.length===2&&fx.every(o=>o.material.uniforms.uTime.value===3.25),'time-driven');
const kit=new T.MeshStandardMaterial({color:0xff0000,roughness:.9});kit.userData.weatherFabric=true;s.add(new T.Mesh(new T.BoxGeometry(),kit));for(let i=0;i<50;i++)w.update(3.3);assert(kit.roughness<.7,'late kit adopted (wet)');
w.set('snow');assert.equal(w.type,'snow');assert(grass.emissive.r>.12&&grass.emissive.r<.3&&grass.emissive.b>grass.emissive.r,'light snow cover (lines stay visible)');assert(kit.roughness===.9,'snow keeps kits dry');
w.set('clear');assert.equal(grass.color.getHex(),0x44aa44);assert.equal(grass.emissive.getHex(),0);assert.equal(grass.roughness,.9);assert.equal(light.intensity,2);assert.equal(s.fog.density,.0022);assert.equal(s.children.filter(o=>o.material?.uniforms?.uTime).length,0,'clear removes particles');
for(const v of['rain','snow','clear','bogus'])assert(W.TYPES.includes(W.setPreference(v)));
console.log(JSON.stringify({PASS:true,particles:out,restoresClear:true,adoptsLateKits:true,types:W.TYPES}));
