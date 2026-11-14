import {crops} from './mission-data.js';
export function validWorkshop(raw){
 if(!raw||!Object.hasOwn(crops,raw.crop)||typeof raw.light!=='boolean'||!Number.isInteger(raw.water)||raw.water<0||raw.water>6||!Number.isFinite(raw.day)||raw.day<0||raw.day>crops[raw.crop].modelDay||!Array.isArray(raw.picked)||raw.picked.length!==3||raw.picked.some(x=>typeof x!=='boolean')||typeof raw.cooked!=='boolean')return null;
 if(raw.day>0&&(!raw.light||raw.water<2||raw.water>4))return null;
 if(raw.picked.some(Boolean)&&raw.day<crops[raw.crop].modelDay)return null;
 if(raw.cooked&&(raw.crop!=='soy'||!raw.picked.every(Boolean)))return null;
 return {version:1,crop:raw.crop,light:raw.light,water:raw.water,day:raw.day,picked:[...raw.picked],cooked:raw.cooked};
}
export function workshopComplete(w){return !!w&&w.picked.every(Boolean)&&w.day>=crops[w.crop].modelDay&&(w.crop!=='soy'||w.cooked);}
export function workshopAction(state,action){
 const g=state.garden;
 if(!state.sent)return {ok:false,message:'Send your first signal before starting the garden.'};
 if(action.type==='garden-workshop-reset'){
  if(g.complete)return {ok:false,message:'Your completed garden is already saved.'};
  Object.assign(g,{crop:null,day:0,light:false,water:false,harvested:false,cooked:false,reserve:false,workshop:null});return {ok:true,message:''};
 }
 if(action.type==='garden-workshop-progress'){
  const w=validWorkshop(action.snapshot);
  if(!w)return {ok:false,message:'The garden conditions or harvest are not ready.'};
  if(g.complete)return {ok:true,message:''};
  if(g.workshop&&(w.crop!==g.workshop.crop||w.day<g.workshop.day||g.workshop.picked.some((v,i)=>v&&!w.picked[i])))return {ok:false,message:'Your garden progress is already saved. Restart the tray to change the crop.'};
  g.workshop=w;Object.assign(g,{crop:w.crop,day:Math.floor(w.day),light:w.light,water:w.water>=2&&w.water<=4,harvested:w.picked.every(Boolean),cooked:w.cooked,reserve:w.crop==='soy',round:w.crop==='soy'?1:0});return {ok:true,message:''};
 }
 if(action.type==='garden-workshop-finish'){
  if(g.complete)return {ok:true,message:''};
  if(!workshopComplete(g.workshop))return {ok:false,message:'Harvest all three plants and prepare the crop before serving.'};
  g.complete=true;g.firstCrop??=g.crop;
  return {ok:true,message:'Your garden is ready. Open the field-notes console next.',note:'You completed a '+g.crop+' growing plan, harvested three plants individually and prepared the crop.'};
 }
 return {ok:false,message:'That garden action is unavailable.'};
}
