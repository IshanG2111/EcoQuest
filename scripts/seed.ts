import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Badge from '../src/models/Badge';
import Quiz from '../src/models/Quiz';
import User from '../src/models/User';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const initialBadges = [
    { name: 'First Steps', icon_key: 'Footprints', description: 'Joined EcoQuest and started the journey.' },
    { name: 'Eco Warrior', icon_key: 'Shield', description: 'Earned 1000 total Eco Points.' },
    { name: 'Streak Starter', icon_key: 'Flame', description: 'Maintained a 3-day active streak.' },
    { name: 'Perfect Score', icon_key: 'Award', description: 'Got 100% on a quiz.' },
    { name: 'Game Master', icon_key: 'Gamepad2', description: 'Played all available mini-games.' },
];

const sampleQuizzes = [
    {
        title: 'Sustainable Cities: Innovations for Urban Living',
        topic: 'Urban Planning',
        difficulty: 'medium',
        description: 'Explore the technologies and strategies creating the sustainable cities of tomorrow.',
        learning_material: `
<h2>The Rise of Smart and Sustainable Cities</h2>
<p>As global populations shift towards urban centers, the need for sustainable city planning has never been more critical. A <strong>smart city</strong> uses technology and data to improve efficiency, reduce emissions, and enhance the quality of life.</p>
<h3>Key Concepts:</h3>
<ul>
  <li><strong>Green Buildings:</strong> Structures designed to be environmentally responsible and resource-efficient throughout their life-cycle.</li>
  <li><strong>Urban Heat Islands:</strong> Concrete and asphalt absorb and retain heat, making cities significantly warmer than surrounding areas. Green roofs and more trees help mitigate this.</li>
  <li><strong>Mixed-use Development:</strong> Zoning that blends residential, commercial, and cultural uses, reducing the need for long commutes by car.</li>
</ul>
<p>By transitioning to renewable energy, improving public transport, and implementing green building codes, cities can significantly reduce their carbon footprints.</p>
        `,
        points_value: 150,
        is_published: true,
        quiz_questions: [
            {
                question_text: "What is a 'smart city'?",
                options: [
                    "A city with many universities",
                    "A city that uses technology and data to improve efficiency and sustainability",
                    "A city with tall buildings",
                    "A city with fast internet"
                ],
                correct_index: 1,
                question_order: 1,
                explanation: "Smart cities leverage data to optimize resource usage and reduce environmental impact."
            },
            {
                question_text: "What is the primary cause of the urban heat island effect?",
                options: [
                    "More people living together",
                    "Concrete and asphalt absorbing and retaining heat",
                    "Taller buildings blocking wind",
                    "Industrial pollution"
                ],
                correct_index: 1,
                question_order: 2,
                explanation: "Dark urban surfaces absorb solar radiation much more than natural landscapes."
            },
            {
                question_text: "Which urban planning concept helps reduce car dependency?",
                options: [
                    "Suburban sprawl",
                    "Industrial zoning",
                    "Mixed-use development",
                    "Highway expansion"
                ],
                correct_index: 2,
                question_order: 3,
                explanation: "Mixing residential and commercial areas allows people to walk or bike to work and stores."
            }
        ]
    },
    {
        title: 'Marine Ecosystems and Ocean Stewardship',
        topic: 'Marine Biology',
        difficulty: 'easy',
        description: 'Dive deep into the challenges facing our oceans and what we can do to protect them.',
        learning_material: `
<h2>Protecting Our Blue Planet</h2>
<p>Oceans cover <strong>71%</strong> of the Earth's surface and are vital for our survival. They produce over half of the world's oxygen (thanks to phytoplankton) and regulate our global climate.</p>
<h3>Major Threats:</h3>
<ul>
  <li><strong>Ocean Acidification:</strong> As oceans absorb excess carbon dioxide from the atmosphere, their pH levels drop, making them more acidic. This makes it difficult for corals and shellfish to build their shells.</li>
  <li><strong>Coral Bleaching:</strong> Caused primarily by rising ocean temperatures, stressing the corals and causing them to expel their symbiotic algae.</li>
  <li><strong>Plastic Pollution:</strong> The majority of marine plastic comes from land-based sources, including rivers and poorly managed coastal waste. Microplastics are now found in all corners of the ocean.</li>
</ul>
        `,
        points_value: 100,
        is_published: true,
        quiz_questions: [
            {
                question_text: "What percentage of Earth's surface is covered by oceans?",
                options: ["50%", "65%", "71%", "80%"],
                correct_index: 2,
                question_order: 1
            },
            {
                question_text: "What is ocean acidification?",
                options: [
                    "Oceans becoming more salty",
                    "Oceans becoming warmer",
                    "Oceans becoming more acidic due to absorbing CO2",
                    "Oceans becoming polluted with plastic"
                ],
                correct_index: 2,
                question_order: 2,
                explanation: "Excess CO2 in the atmosphere dissolves into the ocean, creating carbonic acid."
            },
            {
                question_text: "Which human activity contributes most to marine plastic pollution?",
                options: [
                    "Industrial fishing",
                    "Ocean transportation",
                    "Land-based sources including rivers and coastal areas",
                    "Oil drilling"
                ],
                correct_index: 2,
                question_order: 3
            }
        ]
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected to MongoDB');

        // 1. Seed Badges
        for (const badgeData of initialBadges) {
            const existing = await Badge.findOne({ name: badgeData.name });
            if (!existing) {
                await Badge.create(badgeData);
                console.log(`Created badge: ${badgeData.name}`);
            } else {
                console.log(`Badge already exists: ${badgeData.name}`);
            }
        }

        // 2. Create an Admin User to own the quizzes
        let adminUser = await User.findOne({ email: 'admin@ecoquest.com' });
        if (!adminUser) {
            const password_hash = await bcrypt.hash('admin123', 10);
            adminUser = await User.create({
                email: 'admin@ecoquest.com',
                password_hash,
                display_name: 'EcoQuest Admin',
                role: 'admin',
            });
            console.log('Created Admin User: admin@ecoquest.com / admin123');
        }

        // 3. Seed Quizzes
        for (const quizData of sampleQuizzes) {
            const existing = await Quiz.findOne({ title: quizData.title });
            if (!existing) {
                await Quiz.create({
                    ...quizData,
                    created_by: adminUser._id
                });
                console.log(`Created quiz: ${quizData.title}`);
            } else {
                console.log(`Quiz already exists: ${quizData.title}`);
            }
        }

        console.log('Seeding complete!');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seed();
