import {validWorkshop,workshopComplete,workshopAction} from './garden-state.js';
import { crops, gardenPlans } from './mission-data.js';

export function freshGarden() {
  return { round:0, crop:null, day:0, light:false, water:false, harvested:false, cooked:false, reserve:false, complete:false, firstCrop:null, workshop:null };
}
export function freshScout() {
  return { priority:null, helped:false, archive:false, study:false, missing:false, report:null, sent:false, turns:0 };
}
export function restoreCampaign(saved) {
  const garden=freshGarden(), scout=freshScout();
  const g=saved.garden || {}, s=saved.scout || {};
  if ([0,1].includes(g.round)) garden.round=g.round;
  if (Object.hasOwn(crops,g.crop)) garden.crop=g.crop;
  if (Object.hasOwn(crops,g.firstCrop)) garden.firstCrop=g.firstCrop;
  if (Number.isInteger(g.day)) garden.day=Math.max(0,Math.min(70,g.day));
  for (const key of ['light','water','harvested','cooked','reserve','complete']) garden[key]=g[key]===true;
  if (!garden.crop) Object.assign(garden,{day:0,harvested:false,cooked:false,complete:false});
  if (!garden.harvested) garden.cooked=false;
  if (garden.complete && (garden.round!==1 || garden.crop!=='soy' || !garden.cooked)) garden.complete=false;
  const workshop=validWorkshop(g.workshop);
  if(workshop){garden.workshop=workshop;Object.assign(garden,{crop:workshop.crop,day:Math.floor(workshop.day),light:workshop.light,water:workshop.water>=2&&workshop.water<=4,harvested:workshop.picked.every(Boolean),cooked:workshop.cooked});garden.complete=g.complete===true&&workshopComplete(workshop);}
  if (['base','evidence'].includes(s.priority)) scout.priority=s.priority;
  for (const key of ['helped','archive','study','missing','sent']) scout[key]=s[key]===true;
  if (['followup','preliminary'].includes(s.report)) scout.report=s.report;
  if (Number.isInteger(s.turns)) scout.turns=Math.max(0,Math.min(4,s.turns));
  if (!scout.priority) Object.assign(scout,freshScout());
  if (!scout.archive || !scout.missing || !scout.report) scout.sent=false;
  if (scout.report==='followup' && !scout.study) scout.sent=false;
  return {garden,scout};
}

// Called on the engine's cloned state. Failure is discarded by applyAction.
export function campaignAction(state,action) {
  if(action.type.startsWith('garden-workshop-'))return workshopAction(state,action);
  const g=state.garden, s=state.scout;
  const reject=message=>({ok:false,message});
  let message='', note='';
  if (action.type.startsWith('garden-')) {
    if (!state.sent) return reject('Send your first signal so the crew can open the garden planner.');
    const crop=crops[g.crop], plan=gardenPlans[g.round];
    switch (action.type) {
      case 'garden-plant':
        if (g.complete || g.crop) return reject('This tray is already planted. You can replan this trial.');
        if (!Object.hasOwn(crops,action.crop)) return reject('Choose one of the seed packets.');
        g.crop=action.crop;
        message='Seeds planted. Give the tray light and water before advancing the simulation calendar.';
        break;
      case 'garden-light':
      case 'garden-water':
        if (!crop || g.harvested) return reject('Plant a new tray first.');
        g[action.type==='garden-light'?'light':'water']=!g[action.type==='garden-light'?'light':'water'];
        message='The tray controls are updated. Check both light and water.';
        break;
      case 'garden-advance':
        if (!crop || g.harvested || g.complete) return reject('Plant a tray before advancing its calendar.');
        if (!g.light || !g.water) return reject('The tray needs both light and water. The simulation is waiting for you.');
        if (g.day>=crop.modelDay) return reject('Your crop is ready. Try harvesting.');
        if (g.day>=plan.deadline && !g.reserve) return reject('The planned meal date has arrived. Use stored meals while this crop keeps growing, or replan.');
        g.day=Math.min(g.day+7,crop.modelDay, !g.reserve?plan.deadline:70);
        message='Simulation day '+g.day+'. '+(g.day>=crop.modelDay?'Your crop is ready to harvest.':'Watch the leaves as time passes.');
        break;
      case 'garden-reserve':
        if (!crop || g.day<plan.deadline || g.reserve || g.harvested) return reject('Stored meals are available when a crop needs more time.');
        g.reserve=true;
        message='Stored meals cover the wait. This tray can keep growing.';
        note='You used stored meals to keep your longer crop plan going.';
        break;
      case 'garden-replan':
        if (g.complete) return reject('Both plans are recorded. Your garden is complete.');
        Object.assign(g,{crop:null,day:0,light:false,water:false,harvested:false,cooked:false,reserve:false});
        message='A fresh simulation tray. Try another crop or plan.';
        break;
      case 'garden-harvest':
        if (!crop || g.harvested || g.day<crop.modelDay) return reject('This tray needs more growing time.');
        g.harvested=true;
        message=crop.cooking?'Soybeans harvested. Boil them before serving.':'Fresh lettuce! This crop can be eaten without cooking.';
        break;
      case 'garden-cook':
        if (!crop?.cooking || !g.harvested || g.cooked) return reject('Harvest the soybeans before using the cooker.');
        g.cooked=true;
        message='Cooking complete. Your soybeans can join the meal.';
        break;
      case 'garden-next':
        if (g.round!==0 || !g.harvested || (crop.cooking && !g.cooked)) return reject('Finish harvesting and preparing this tray first.');
        g.firstCrop=g.crop;
        note='You planned '+crop.name.toLowerCase()+' for the first meal'+(g.reserve?', using stored food during the wait.':'.');
        Object.assign(g,{round:1,crop:null,day:0,light:false,water:false,harvested:false,cooked:false,reserve:false});
        message='A new request from the crew. This time, plan a protein-containing crop for day 70.';
        break;
      case 'garden-finish':
        if (g.complete) return reject('Your garden plans are already saved.');
        if (g.round!==1 || !g.harvested) return reject('Complete the second harvest first.');
        if (g.crop!=='soy') return reject('The lettuce adds fresh vegetables. The new request also asks for a protein-containing crop. Compare the seed cards and replan.');
        if (!g.cooked) return reject('This crop needs cooking. Let’s prepare it before serving.');
        g.complete=true;
        message=state.name+', you matched the crop to the time and the kitchen. Our garden plans are ready.';
        note='You completed two garden plans, then harvested and prepared soybeans for the longer plan.';
        break;
      default: return reject('That garden control is unavailable.');
    }
  } else {
    if (!state.garden.complete) return reject('Finish the garden plans before opening the field-notes assignment.');
    switch(action.type) {
      case 'scout-priority':
        if(s.priority) return reject('The planner has started. Continue your chosen route.');
        if(!['base','evidence'].includes(action.priority)) return reject('Choose the robot’s first job.');
        s.priority=action.priority;
        if(s.priority==='base'){s.helped=true;s.turns=1;}
        message=s.priority==='base'?'The relay is repaired first. Your evidence task is waiting.':'The robot starts gathering evidence. The base relay waits for its turn.';
        note='You chose '+(s.priority==='base'?'the base relay':'evidence gathering')+' as the robot’s first job.';
        break;
      case 'scout-help':
        if(!s.priority || s.helped) return reject('The relay is already handled, or the planner has not started.');
        s.helped=true;s.turns++;
        message='Relay repaired. The base’s waiting job is done.';
        note='You completed the relay repair after giving the evidence task its turn.';
        break;
      case 'scout-archive':
        if(!s.priority || s.archive) return reject('Choose a route first, or read the archive already opened.');
        s.archive=true;s.turns++;
        message='The archive is open. Read the device, date and unit above the graph.';
        break;
      case 'scout-study':
        if(!s.archive || s.study || s.sent) return reject('Open the RAD archive first. This study may already be in your report.');
        s.study=true;s.turns++;
        message='A second piece of evidence: Curiosity’s 2016 study near Butte M12. It is separate from the 2015 graph.';
        break;
      case 'scout-missing':
        if(!s.archive) return reject('Read the archive first.');
        if(action.value!=='unknown') return reject('The dash means a measurement is unavailable. Choose “Not available” to label it.');
        s.missing=true;
        message='Good label. Missing data stays marked as unavailable.';
        break;
      case 'scout-report':
        if(s.sent) return reject('Your report is already saved. You can finish the waiting relay job.');
        if(!s.archive || !s.missing) return reject('Open the archive and label the missing measurement before sending.');
        if(action.report==='safe') return reject('We have no measurement for our new site. Mark what still needs checking.');
        if(!['preliminary','followup'].includes(action.report)) return reject('Choose a report.');
        if(action.report==='followup' && !s.study) return reject('Read the M12 study before including it.');
        s.report=action.report;s.sent=true;
        message=state.name+', your '+(s.study?'evidence-backed':'preliminary')+' report records what we know and what needs a new measurement.';
        note='You sent a '+s.report+' report'+(s.helped?' after repairing the relay.':', with the relay repair still waiting.');
        break;
      default: return reject('That field-note control is unavailable.');
    }
  }
  return {ok:true,message,note};
}

