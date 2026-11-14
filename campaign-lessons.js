export const campaignLessons = [
 {
  id:'garden',action:'garden-finish',title:'Your garden has a plan',
  personal:name=>name+', you grew and picked a crop for the crew.',
  source:{title:'CSA · Selecting crops for space',url:'https://www.asc-csa.gc.ca/eng/youth-educators/activities/fitness-and-nutrition/interplanetary-farming.asp'},
  scope:'Approximate crop examples. Calendar steps and meal dates are simulation rules. This is not a tested Mars growing schedule.',
  frames:[
   {visual:'garden',title:'A seed needs a place to grow',text:'Plants need suitable light, water, nutrients, temperature and air. Our two switches represent only part of that environment.'},
   {visual:'calendar',title:'Time changes the choice',text:'CSA lists about 21–28 days for leaf lettuce and 45–65 days for soybeans. Our planner used the upper end of each range. Real growing conditions can change the result.'},
   {visual:'kitchen',title:'Harvesting is one step',text:'The example soybeans need boiling. Lettuce can be eaten without cooking. Crops add different nutrients to meals, alongside stored food.'}
  ],
  question:'A new crop needs cooking. What should the crew include in its plan?',choices:['A way to prepare the harvest','Only the planting date'],correct:0
 },
 {
  id:'field',action:'scout-report',title:'A good explorer checks the evidence',
  personal:name=>name+', your report keeps the measurements and the unanswered questions together.',
  source:{title:'NASA RadLab · API and units',url:'https://visualization.osdr.nasa.gov/radlab/gui/data-api/'},
  scope:'The graph uses 1 January 2015 records. The M12 study concerns September 2016. Robot turns are game values.',
  frames:[
   {visual:'archive',title:'What did the rover measure?',text:'RAD aboard Curiosity measured radiation on Mars. Our archive shows 84 absorbed dose rate readings, in micrograys per hour, from 1 January 2015.'},
   {visual:'shelter',title:'A place can change a measurement',text:'In a separate 2016 study at Butte M12, surrounding terrain blocked part of the sky. Researchers found a 4% decrease in expected dose rate there.',source:{title:'Ehresmann et al. · M12 study',url:'https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2021JE006851'}},
   {visual:'unknown',title:'Leave room for a new measurement',text:'A missing value means that measurement is unavailable. A reading at one place does not tell us whether another site is safe.'}
  ],
  question:'The new site has no radiation reading. What belongs in your report?',choices:['A measurement is still needed','The missing reading is zero'],correct:0
 }
];
