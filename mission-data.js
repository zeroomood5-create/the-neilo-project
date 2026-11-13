export const sources = {
  crops: {
    title: 'Canadian Space Agency · Interplanetary Farming',
    url: 'https://www.asc-csa.gc.ca/eng/youth-educators/activities/fitness-and-nutrition/interplanetary-farming.asp',
    locator: 'Selecting crops for space · Examples of potential crops',
    scope: 'Approximate teaching examples. Actual growth depends on the environment. These are not tested Mars harvest times.'
  },
  rad: {
    title: 'NASA OSDR · RadLab',
    url: 'https://visualization.osdr.nasa.gov/radlab/gui/data-api/',
    locator: 'absorbed_dose_rate · μGy/hour; MSL-RAD-Surface, 2015-01-01',
    scope: 'Archived Curiosity instrument readings on Mars. A missing equivalent-dose value is not zero.'
  },
  butte: {
    title: 'Ehresmann et al. (2021) · Natural Radiation Shielding on Mars',
    url: 'https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2021JE006851',
    locator: 'Abstract · M12, sols 1456–1467, September 2016',
    scope: '4% decrease in expected dose rate at this location. This does not establish the safety of another site.'
  }
};
export const crops = {
  lettuce: { name:'Leaf lettuce', days:[21,28], modelDay:28, preparation:'Pick and eat', cooking:false, nutrients:'Example nutrients include vitamins K, A and C.' },
  soy: { name:'Soybean', days:[45,65], modelDay:65, preparation:'Boil in shell', cooking:true, nutrients:'Example nutrients include protein, carbohydrates and fats.' }
};
export const gardenPlans = [
  { deadline:35, title:'A fresh addition', request:'Plan a fresh addition to the stored meals by simulation day 35. The cooker is available if you need it.' },
  { deadline:70, title:'A different menu', request:'Now plan a protein-containing crop for day 70. The cooker is ready. What would you grow?' }
];

