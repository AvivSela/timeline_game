import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

const historicalEvents = [
  // Ancient History
  { name: 'Great Pyramid of Giza', description: 'Construction of the Great Pyramid of Giza begins', chronologicalValue: -2560, difficulty: Difficulty.EASY, category: 'Ancient History' },
  { name: 'Roman Empire Founded', description: 'Rome is founded by Romulus and Remus', chronologicalValue: -753, difficulty: Difficulty.EASY, category: 'Ancient History' },
  { name: 'Jesus Christ Birth', description: 'Traditional date of the birth of Jesus Christ', chronologicalValue: -4, difficulty: Difficulty.EASY, category: 'Ancient History' },
  { name: 'Roman Empire Peak', description: 'Roman Empire reaches its greatest territorial extent under Trajan', chronologicalValue: 117, difficulty: Difficulty.MEDIUM, category: 'Ancient History' },
  { name: 'Fall of Western Rome', description: 'Western Roman Empire falls to Germanic tribes', chronologicalValue: 476, difficulty: Difficulty.MEDIUM, category: 'Ancient History' },

  // Middle Ages
  { name: 'First Crusade', description: 'First Crusade begins to recapture Jerusalem', chronologicalValue: 1096, difficulty: Difficulty.MEDIUM, category: 'Middle Ages' },
  { name: 'Magna Carta', description: 'King John signs the Magna Carta', chronologicalValue: 1215, difficulty: Difficulty.EASY, category: 'Middle Ages' },
  { name: 'Black Death', description: 'Black Death pandemic begins in Europe', chronologicalValue: 1347, difficulty: Difficulty.MEDIUM, category: 'Middle Ages' },
  { name: 'Hundred Years War', description: 'Hundred Years War begins between England and France', chronologicalValue: 1337, difficulty: Difficulty.HARD, category: 'Middle Ages' },
  { name: 'Fall of Constantinople', description: 'Ottoman Empire captures Constantinople', chronologicalValue: 1453, difficulty: Difficulty.MEDIUM, category: 'Middle Ages' },

  // Renaissance
  { name: 'Gutenberg Bible', description: 'First book printed with movable type by Gutenberg', chronologicalValue: 1455, difficulty: Difficulty.EASY, category: 'Renaissance' },
  { name: 'Columbus Discovers America', description: 'Christopher Columbus reaches the Americas', chronologicalValue: 1492, difficulty: Difficulty.EASY, category: 'Renaissance' },
  { name: 'Mona Lisa Painted', description: 'Leonardo da Vinci begins painting the Mona Lisa', chronologicalValue: 1503, difficulty: Difficulty.MEDIUM, category: 'Renaissance' },
  { name: 'Protestant Reformation', description: 'Martin Luther posts his 95 Theses', chronologicalValue: 1517, difficulty: Difficulty.MEDIUM, category: 'Renaissance' },
  { name: 'Shakespeare Born', description: 'William Shakespeare is born', chronologicalValue: 1564, difficulty: Difficulty.MEDIUM, category: 'Renaissance' },

  // Industrial Revolution
  { name: 'Steam Engine Invented', description: 'James Watt improves the steam engine', chronologicalValue: 1769, difficulty: Difficulty.MEDIUM, category: 'Industrial Revolution' },
  { name: 'American Revolution', description: 'Declaration of Independence signed', chronologicalValue: 1776, difficulty: Difficulty.EASY, category: 'Industrial Revolution' },
  { name: 'French Revolution', description: 'Storming of the Bastille begins French Revolution', chronologicalValue: 1789, difficulty: Difficulty.EASY, category: 'Industrial Revolution' },
  { name: 'First Steam Locomotive', description: 'First successful steam locomotive built by Richard Trevithick', chronologicalValue: 1804, difficulty: Difficulty.HARD, category: 'Industrial Revolution' },
  { name: 'Napoleon Bonaparte', description: 'Napoleon becomes Emperor of France', chronologicalValue: 1804, difficulty: Difficulty.MEDIUM, category: 'Industrial Revolution' },

  // 19th Century
  { name: 'Darwin\'s Theory', description: 'Charles Darwin publishes On the Origin of Species', chronologicalValue: 1859, difficulty: Difficulty.MEDIUM, category: '19th Century' },
  { name: 'American Civil War', description: 'American Civil War begins', chronologicalValue: 1861, difficulty: Difficulty.EASY, category: '19th Century' },
  { name: 'Telephone Invented', description: 'Alexander Graham Bell invents the telephone', chronologicalValue: 1876, difficulty: Difficulty.EASY, category: '19th Century' },
  { name: 'Light Bulb Invented', description: 'Thomas Edison invents the practical light bulb', chronologicalValue: 1879, difficulty: Difficulty.EASY, category: '19th Century' },
  { name: 'First Automobile', description: 'Karl Benz builds the first gasoline-powered automobile', chronologicalValue: 1885, difficulty: Difficulty.HARD, category: '19th Century' },

  // 20th Century
  { name: 'First Flight', description: 'Wright brothers make first powered flight', chronologicalValue: 1903, difficulty: Difficulty.EASY, category: '20th Century' },
  { name: 'World War I', description: 'World War I begins', chronologicalValue: 1914, difficulty: Difficulty.EASY, category: '20th Century' },
  { name: 'Russian Revolution', description: 'Russian Revolution overthrows the Tsar', chronologicalValue: 1917, difficulty: Difficulty.MEDIUM, category: '20th Century' },
  { name: 'World War II', description: 'World War II begins', chronologicalValue: 1939, difficulty: Difficulty.EASY, category: '20th Century' },
  { name: 'Atomic Bomb', description: 'First atomic bomb dropped on Hiroshima', chronologicalValue: 1945, difficulty: Difficulty.MEDIUM, category: '20th Century' },
  { name: 'Moon Landing', description: 'Neil Armstrong walks on the moon', chronologicalValue: 1969, difficulty: Difficulty.EASY, category: '20th Century' },
  { name: 'Berlin Wall Falls', description: 'Berlin Wall is demolished', chronologicalValue: 1989, difficulty: Difficulty.EASY, category: '20th Century' },
  { name: 'World Wide Web', description: 'Tim Berners-Lee creates the World Wide Web', chronologicalValue: 1989, difficulty: Difficulty.MEDIUM, category: '20th Century' },

  // 21st Century
  { name: '9/11 Attacks', description: 'Terrorist attacks on World Trade Center', chronologicalValue: 2001, difficulty: Difficulty.EASY, category: '21st Century' },
  { name: 'iPhone Released', description: 'Apple releases the first iPhone', chronologicalValue: 2007, difficulty: Difficulty.EASY, category: '21st Century' },
  { name: 'Barack Obama President', description: 'Barack Obama becomes first African American US President', chronologicalValue: 2009, difficulty: Difficulty.EASY, category: '21st Century' },
  { name: 'COVID-19 Pandemic', description: 'COVID-19 pandemic declared by WHO', chronologicalValue: 2020, difficulty: Difficulty.EASY, category: '21st Century' },
  { name: 'ChatGPT Released', description: 'OpenAI releases ChatGPT to the public', chronologicalValue: 2022, difficulty: Difficulty.EASY, category: '21st Century' }
];

async function main() {
  console.log('Starting database seeding...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.timelineCard.deleteMany();
  await prisma.player.deleteMany();
  await prisma.game.deleteMany();
  await prisma.card.deleteMany();

  // Create historical event cards
  console.log('Creating historical event cards...');
  const createdCards = await Promise.all(
    historicalEvents.map(event => 
      prisma.card.create({
        data: event
      })
    )
  );

  console.log(`Created ${createdCards.length} historical event cards`);

  // Create a sample game for testing
  console.log('Creating sample game...');
  const sampleGame = await prisma.game.create({
    data: {
      roomCode: 'TEST123',
      state: {
        currentTurn: 0,
        round: 1,
        maxRounds: 5
      },
      phase: 'WAITING',
      maxPlayers: 4
    }
  });

  console.log(`Created sample game with room code: ${sampleGame.roomCode}`);

  // Create sample players
  const samplePlayers = await Promise.all([
    prisma.player.create({
      data: {
        name: 'Alice',
        gameId: sampleGame.id,
        handCards: [1, 2, 3],
        isCurrentTurn: true,
        score: 0
      }
    }),
    prisma.player.create({
      data: {
        name: 'Bob',
        gameId: sampleGame.id,
        handCards: [4, 5, 6],
        isCurrentTurn: false,
        score: 0
      }
    })
  ]);

  console.log(`Created ${samplePlayers.length} sample players`);

  // Create sample timeline cards
  const sampleTimelineCards = await Promise.all([
    prisma.timelineCard.create({
      data: {
        gameId: sampleGame.id,
        cardId: createdCards[0].id, // Great Pyramid
        position: 0
      }
    }),
    prisma.timelineCard.create({
      data: {
        gameId: sampleGame.id,
        cardId: createdCards[createdCards.length - 1].id, // ChatGPT
        position: 1
      }
    })
  ]);

  console.log(`Created ${sampleTimelineCards.length} sample timeline cards`);

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 