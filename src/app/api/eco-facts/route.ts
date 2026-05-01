import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EcoFact from '@/models/EcoFact';

const ECO_FACTS_DATA = [
  { fact: "Recycling one aluminum can saves enough energy to run a TV for three hours.", explanation: "Recycling aluminum uses only ~5% of the energy needed to produce new aluminum from raw bauxite ore, making it one of the most energy-efficient recycling processes.", tip: "Always recycle your aluminum cans — it's one of the most impactful single actions you can take.", category: "waste", difficulty: "easy" },
  { fact: "A single mature tree can absorb up to 48 pounds of CO₂ per year.", explanation: "Through photosynthesis, trees convert CO₂ into oxygen and store the carbon in their wood, roots, and leaves — acting as long-term carbon sinks.", tip: "Plant a native tree in your yard or donate to reforestation projects like One Tree Planted.", category: "forests", difficulty: "easy" },
  { fact: "The Great Pacific Garbage Patch is roughly twice the size of Texas.", explanation: "Ocean currents called gyres concentrate floating plastic waste into massive patches. It's mostly microplastics, not a solid island.", tip: "Reduce single-use plastics and participate in local beach or river clean-up events.", category: "ocean", difficulty: "medium" },
  { fact: "Turning off the tap while brushing saves up to 8 gallons of water per day.", explanation: "A standard faucet flows at ~2 gallons/min. Leaving it running during a 4-minute routine wastes 8 gallons — or 2,920 gallons per year.", tip: "Make a habit of turning off water when brushing teeth, shaving, or soaping hands.", category: "water", difficulty: "easy" },
  { fact: "LED bulbs use at least 75% less energy than incandescent bulbs.", explanation: "LEDs convert electricity directly to light with minimal heat waste and last up to 25x longer than traditional bulbs.", tip: "Replace your most-used bulbs with LEDs first — they pay for themselves in energy savings within months.", category: "energy", difficulty: "easy" },
  { fact: "About 1.3 billion tons of food is wasted globally every year.", explanation: "Food waste occurs at every stage from farm to fork. Rotting food in landfills produces methane — a greenhouse gas 80x more potent than CO₂ over 20 years.", tip: "Plan meals, buy only what you need, and compost scraps to cut your food waste to near zero.", category: "food", difficulty: "medium" },
  { fact: "Fast fashion is responsible for ~10% of global carbon emissions.", explanation: "Clothing production requires vast water, energy, and chemicals. Synthetic fabrics shed microplastics in every wash — an estimated 500,000 tonnes enter oceans annually.", tip: "Buy second-hand, repair before replacing, and choose brands with transparent sustainability commitments.", category: "fashion", difficulty: "medium" },
  { fact: "A plant-based diet can reduce your food carbon footprint by up to 73%.", explanation: "Livestock farming generates 14.5% of global greenhouse gases. Producing 1kg of beef uses 15,000 liters of water vs. 1,800 liters for 1kg of wheat.", tip: "Try one plant-based day per week — 'Meatless Monday' across the US alone would equal removing 7.6 million cars.", category: "food", difficulty: "medium" },
  { fact: "Bees pollinate about one-third of everything we eat.", explanation: "Without pollinators, crops like almonds, apples, and berries would fail. Colony collapse disorder has eliminated 30% of honeybee colonies in the US since 2006.", tip: "Plant native wildflowers, avoid pesticides, and buy local honey to support bee populations.", category: "wildlife", difficulty: "easy" },
  { fact: "About 8 million metric tons of plastic enters our oceans every year.", explanation: "That's equivalent to dumping a garbage truck of plastic into the ocean every minute. It breaks into microplastics that contaminate the entire food chain.", tip: "Carry a reusable bottle and bag. Refuse plastic straws. Join ocean cleanup initiatives.", category: "ocean", difficulty: "easy" },
  { fact: "The Amazon rainforest produces 20% of the world's oxygen.", explanation: "Often called the 'lungs of the Earth', the Amazon spans 5.5 million km² and cycles enormous amounts of water and CO₂ through its ecosystem daily.", tip: "Support sustainable products certified by the Rainforest Alliance and avoid products linked to deforestation.", category: "forests", difficulty: "medium" },
  { fact: "Solar panel costs have dropped by 89% in the last decade.", explanation: "Economies of scale, manufacturing innovation, and global competition drove the price of solar electricity from ~$0.36/kWh in 2010 to under $0.04/kWh in 2023.", tip: "Check if your roof qualifies for solar — payback periods are now often under 6 years in sunny climates.", category: "energy", difficulty: "hard" },
  { fact: "Over 1 million species are currently threatened with extinction.", explanation: "The 6th mass extinction is happening now — driven by habitat loss, climate change, pollution, and invasive species. Species are disappearing 1,000x faster than the natural rate.", tip: "Support land conservation funds and buy sustainably certified wood, palm oil, and seafood products.", category: "wildlife", difficulty: "hard" },
  { fact: "Coral reefs support 25% of all marine life despite covering less than 1% of the ocean floor.", explanation: "Reefs provide food, habitat, and income for over 500 million people, but 50% of the world's reefs have died since 1950.", tip: "Choose reef-safe sunscreen (no oxybenzone/octinoxate), and never touch coral when snorkeling.", category: "ocean", difficulty: "hard" },
  { fact: "Electric vehicles produce 50-70% fewer lifetime emissions than petrol cars.", explanation: "Even accounting for battery manufacturing, an EV charged on average grid electricity produces far fewer emissions — and the gap grows as grids get greener.", tip: "If buying a car, consider an EV or hybrid. If driving petrol, keep your tires properly inflated to save up to 3% fuel.", category: "transport", difficulty: "medium" },
  { fact: "A dripping faucet can waste over 3,000 gallons of water per year.", explanation: "One drop per second adds up to 27,000 drops per day — about 3,287 gallons annually. Multiply that by millions of leaky faucets worldwide.", tip: "Fix leaky faucets immediately. Replacing worn washers costs under $5 and takes 10 minutes.", category: "water", difficulty: "easy" },
  { fact: "Switching to a cold wash saves 90% of the energy of a hot wash.", explanation: "Most washing machine energy goes to heating water. Modern detergents are designed to work effectively at 30°C.", tip: "Set your washing machine to 30°C and wash full loads — you'll also extend the life of your clothes.", category: "energy", difficulty: "easy" },
  { fact: "Microplastics have been found in human blood, lungs, and breast milk.", explanation: "We now consume an estimated credit card's worth of microplastic per week through food, water, and air. Long-term health effects are still being studied.", tip: "Filter your tap water, use glass/stainless steel containers, and reduce plastic food packaging where possible.", category: "pollution", difficulty: "hard" },
  { fact: "The Arctic is warming 4x faster than the global average.", explanation: "Arctic amplification — caused by ice-albedo feedback — means as white reflective ice melts, darker ocean absorbs more heat, accelerating warming in a runaway loop.", tip: "Reduce your carbon footprint by supporting carbon pricing policies and renewable energy providers.", category: "climate", difficulty: "hard" },
  { fact: "Peatlands store twice as much carbon as all the world's forests combined.", explanation: "Though covering only 3% of land, peatlands lock away 550 billion tonnes of carbon — formed over thousands of years of accumulated plant matter.", tip: "Support campaigns against peat extraction in horticulture. Buy peat-free compost for your garden.", category: "soil", difficulty: "hard" },
  { fact: "One reusable bag replaces ~700 single-use plastic bags over its lifetime.", explanation: "The average plastic bag is used for just 12 minutes before disposal. It then persists in the environment for up to 1,000 years.", tip: "Keep a foldable reusable bag in your pocket, car, and desk drawer so you always have one on hand.", category: "waste", difficulty: "easy" },
  { fact: "Air pollution kills 7 million people annually — more than AIDS, TB, and malaria combined.", explanation: "Both outdoor and indoor air pollution contribute. Burning fossil fuels, wood, and crop waste are the primary sources.", tip: "Improve indoor air quality with houseplants, open windows, and avoiding synthetic cleaning sprays.", category: "pollution", difficulty: "hard" },
  { fact: "Over 80% of the world's wastewater is discharged without treatment.", explanation: "Untreated sewage and industrial runoff contaminate rivers, lakes, and coastal areas, devastating aquatic ecosystems and human health in lower-income regions.", tip: "Conserve water, dispose of medications properly (not down the drain), and support water infrastructure charities.", category: "water", difficulty: "hard" },
  { fact: "Wind energy is now the cheapest electricity source in history.", explanation: "The levelised cost of onshore wind fell below all fossil fuels globally by 2023, making it the cheapest electricity ever built without subsidies in many markets.", tip: "Switch to a green energy tariff with your provider — many offer 100% renewable electricity at competitive rates.", category: "energy", difficulty: "medium" },
  { fact: "Seagrass meadows sequester carbon up to 35x faster than tropical rainforests.", explanation: "Seagrass, kelp, and mangroves form 'blue carbon' ecosystems that absorb and store enormous amounts of CO₂ per hectare despite occupying little area.", tip: "Support marine protection organizations and avoid anchoring boats in seagrass beds.", category: "ocean", difficulty: "hard" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const random = searchParams.get('random') === 'true';
  const id = searchParams.get('id');

  try {
    await connectDB();

    // Check if we need to seed
    const count = await EcoFact.countDocuments();
    if (count === 0) {
      await EcoFact.insertMany(ECO_FACTS_DATA);
    }

    let query: any = { active: true };

    if (id) {
      const fact = await EcoFact.findById(id);
      return NextResponse.json(fact);
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (random) {
      const facts = await EcoFact.find(query);
      const pick = facts[Math.floor(Math.random() * facts.length)];
      return NextResponse.json(pick ?? null);
    }

    const facts = await EcoFact.find(query).sort({ created_at: -1 });
    return NextResponse.json(facts, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate' }
    });
  } catch (error: any) {
    console.error('EcoFacts API Error:', error);
    // Fallback to static data if DB fails
    if (random) {
      return NextResponse.json(ECO_FACTS_DATA[Math.floor(Math.random() * ECO_FACTS_DATA.length)]);
    }
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}
