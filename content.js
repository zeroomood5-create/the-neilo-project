// Replace or extend this reviewed content pack independently of the engine.
// Resource values and device behavior in this pack are fictional playtest values.
export const content = {
  id: 'first-signal',
  version: 1,
  provenance: 'Includes archived Curiosity/RAD readings, a published M12 study and CSA crop examples. Resource costs and scenario calendars are simplified game models.',
  title: 'First Signal',
  opening: [
    { eyebrow: 'THE JUNIOR EXPLORERS PROGRAM', title: 'A little further from home.', text: 'A future worth exploring. You and a group of young explorers are travelling to Mars with a trained crew. Today, the red planet finally fills your window.', speaker: 'MISSION COMMANDER', message: 'Look below. That research base used to help explorers learn how to live on Mars.' },
    { eyebrow: 'AN UNEXPECTED LANDING', title: 'A change of course.', text: 'A guidance fault interrupts the visit. The crew follows its safety procedure. Your capsule is directed to the research base while the main ship stays in orbit.', speaker: 'MISSION COMMANDER', message: 'Your capsule will dock at the base. Follow the lights inside. We’ll keep trying to reach you.' },
    { eyebrow: 'MARS RESEARCH BASE', title: 'Someone left a light on.', text: 'Your capsule docks safely. Inside, the base is quiet. Emergency systems are running, but the communication screens are dark. A tiny blue light blinks beneath a workbench.', speaker: 'YOUR NEXT STEP', message: 'Explore the arrival bay. Find the little blue light.' }
  ],
  rooms: {
    arrival: { name: 'Arrival bay', subtitle: 'A new beginning', hotspots: [
      { id: 'wake', label: 'A little blue light', icon: '✦', x: 71, y: 53, walkX: 62 },
      { id: 'window', label: 'Look outside', icon: '◉', x: 39, y: 32, walkX: 40 },
      { id: 'health', label: 'Safety station', icon: '+', x: 78, y: 24, walkX: 73 }
    ] },
    control: { name: 'Mission control', subtitle: 'Bring the base back to life', hotspots: [
      { id: 'power', label: 'Power console', icon: 'ϟ', x: 16, y: 49, walkX: 24 },
      { id: 'comms', label: 'Communication desk', icon: '⌁', x: 69, y: 50, walkX: 70 },
      { id: 'survey', label: 'Field notes', icon: '◉', x: 51, y: 29, walkX: 51 },
      { id: 'archive', label: 'Crew archive', icon: '▣', x: 42, y: 49, walkX: 45 },
      { id: 'habitat', label: 'Water & habitat', icon: '→', x: 93, y: 54, walkX: 86 }
    ] },
    habitat: { name: 'Water & habitat', subtitle: 'Every system is connected', hotspots: [
      { id: 'water', label: 'Water unit', icon: '◈', x: 29, y: 45, walkX: 33 },
      { id: 'plants', label: 'Growing corner', icon: '✳', x: 72, y: 49, walkX: 70 },
      { id: 'control', label: 'Mission control', icon: '←', x: 7, y: 54, walkX: 15 }
    ] }
  },
  devices: [
    { id: 'lights', name: 'Extra cabin lights', draw: 1, description: 'Optional lighting. Emergency lights stay on.' },
    { id: 'water', name: 'Water unit', draw: 3, description: 'Powers a water preparation cycle.' },
    { id: 'uplink', name: 'Communication desk', draw: 4, description: 'Powers the transmitter and antenna controls.' }
  ],
  mentors: {
    agriculture: { name: 'Food & water specialist', role: 'CREW RECORDING', portrait: 'agriculture', text: 'Before you run a device, check its supplies and the power it needs. Look at the whole base, then choose what to run first.' },
    energy: { name: 'Energy specialist', role: 'CREW RECORDING', portrait: 'energy', text: 'Every active device shares the same power supply. You can switch optional devices off and run important jobs one at a time.' },
    systems: { name: 'Systems specialist', role: 'CREW RECORDING', portrait: 'systems', text: 'Start with a check, then prepare the antenna. When the base is ready, test your message before you send it.' },
    health: { name: 'Health & safety specialist', role: 'CREW RECORDING', portrait: 'health', text: 'Keep essential life-support systems running while you work. Take time to prepare the base before starting a new task.' }
  }
};
