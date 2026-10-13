const vm=require('vm'),fs=require('fs');
function load(file){
const src=fs.readFileSync(file,'utf8');
const stub=()=>new Proxy(function(){}, {get:(t,k)=>k===Symbol.toPrimitive?()=>0:k==='then'?(()=>stub()):stub(),apply:()=>stub(),construct:()=>stub(),set:()=>true,has:()=>true});
const extra={};let last='';
for(let i=0;i<60;i++){
const ctx={console:{log(){},warn(){},error(){},info(){}},Math,JSON,Date,Object,Array,String,Number,Boolean,Map,Set,WeakMap,WeakSet,Promise,Symbol,Error,TypeError,RegExp,Reflect,Proxy,parseInt,parseFloat,isNaN,isFinite,Infinity,NaN,encodeURIComponent,decodeURIComponent,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame:()=>0,cancelAnimationFrame(){},queueMicrotask(){},performance:{now:()=>0},
 document:stub(),localStorage:{getItem:()=>null,setItem(){},removeItem(){}},sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},navigator:{userAgent:'node',language:'en',languages:['en']},location:{search:'',hash:'',href:'https://pokesurvivor.com/en/',pathname:'/en/',origin:'https://pokesurvivor.com',hostname:'pokesurvivor.com'},
 Image:function(){return stub()},Audio:function(){return stub()},AudioContext:function(){return stub()},fetch:()=>new Promise(()=>{}),addEventListener(){},removeEventListener(){},innerWidth:1280,innerHeight:720,devicePixelRatio:1,matchMedia:()=>({matches:false,addEventListener(){},addListener(){}}),URLSearchParams,URL,Intl,TextEncoder,TextDecoder,Float32Array,Float64Array,Uint8Array,Uint8ClampedArray,Int32Array,Uint16Array,Uint32Array,ArrayBuffer,...extra};
ctx.window=ctx;ctx.self=ctx;ctx.globalThis=ctx;
vm.createContext(ctx);
try{vm.runInContext(src,ctx,{timeout:30000});return {G:ctx.G,err:null}}catch(e){
 const m=/^(\w+) is not defined/.exec(e.message);
 if(m&&m[1]!==last){extra[m[1]]=stub();last=m[1];continue}
 return {G:ctx.G,err:String(e.message).slice(0,200)}}
}}
module.exports=load;
if(require.main===module){const r=load(process.argv[2]);console.log('err:',r.err);console.log(Object.keys(r.G).length,Object.keys(r.G).join(' '))}
