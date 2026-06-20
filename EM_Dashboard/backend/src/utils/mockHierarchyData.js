// mockHierarchyData.js

const firstNames = ['Amit', 'Rajesh', 'Suresh', 'Priya', 'Sneha', 'Anjali', 'Vikram', 'Ramesh', 'Rakesh', 'Sanjay', 'Sunil', 'Kavita', 'Neha', 'Pooja', 'Rahul', 'Rohit', 'Manoj', 'Deepak', 'Anil', 'Nitin'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Jain', 'Rao', 'Reddy', 'Deshmukh', 'Bose', 'Chatterjee', 'Iyer', 'Nair', 'Mishra', 'Pandey', 'Yadav', 'Choudhary', 'Mehta', 'Shah'];

const getRandomName = () => {
  const f = firstNames[Math.floor(Math.random() * firstNames.length)];
  const l = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${f} ${l}`;
};

const generateHierarchy = () => {
  const officers = [];
  const voters = [];
  let idCounter = 1;

  const createOfficer = (role, name, parentId = null) => {
    const officer = {
      id: `USR-${idCounter++}`,
      role,
      name,
      parentId
    };
    officers.push(officer);
    return officer;
  };

  // ECI
  const eci = createOfficer('ECI', `Election Commission of India (${getRandomName()})`);

  // 2 CEOs
  for (let c = 1; c <= 2; c++) {
    const ceo = createOfficer('CEO', `Chief Electoral Officer ${c} - ${getRandomName()}`, eci.id);

    // 2 DEOs per CEO
    for (let d = 1; d <= 2; d++) {
      const deo = createOfficer('DEO', `District Election Officer ${c}-${d} - ${getRandomName()}`, ceo.id);

      // 2 ROs per DEO
      for (let r = 1; r <= 2; r++) {
        const ro = createOfficer('Returning Officer', `Returning Officer ${c}-${d}-${r} - ${getRandomName()}`, deo.id);

        // 2 SOs per RO
        for (let s = 1; s <= 2; s++) {
          const so = createOfficer('Sector Officer', `Sector Officer ${c}-${d}-${r}-${s} - ${getRandomName()}`, ro.id);

          // 2 PROs per SO (Booths)
          for (let p = 1; p <= 2; p++) {
            const pro = createOfficer('Presiding Officer', `Presiding Officer ${c}-${d}-${r}-${s}-${p} - ${getRandomName()}`, so.id);

            // 3 POs per PRO
            for (let po = 1; po <= 3; po++) {
              createOfficer('Polling Officer', `Polling Officer ${c}-${d}-${r}-${s}-${p}-${po} - ${getRandomName()}`, pro.id);
            }

            // 10 Users (Voters) per Booth (PRO)
            for (let v = 1; v <= 10; v++) {
              voters.push({
                id: `VOTER-${pro.id}-${v}`,
                role: 'Voter',
                name: `Voter ${v} (${getRandomName()}) of Booth ${c}-${d}-${r}-${s}-${p}`,
                boothId: pro.id
              });
            }
          }
        }
      }
    }
  }

  return { officers, voters };
};

export const hierarchyData = generateHierarchy();
