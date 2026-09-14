const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Borrowing = require('../models/Borrowing');
const Settings = require('../models/Settings');

const runSeed = async () => {
  console.log('--- Starting BookVault Database Seeding ---');

  // Clear existing collections
  await User.deleteMany({});
  await Book.deleteMany({});
  await Member.deleteMany({});
  await Borrowing.deleteMany({});
  await Settings.deleteMany({});

  console.log('Cleared existing collections.');

  // 1. Settings
  const settings = await Settings.create({
    libraryName: 'BookVault Central Library',
    contactEmail: 'support@bookvault.com',
    phone: '+1 (555) 382-9910',
    address: '100 Silicon Ave, Tech District, Suite 500',
    maxBooksPerMember: 5,
    borrowingDuration: 14,
    finePerDay: 10
  });
  console.log('Created Library Settings.');

  // 2. Demo Users
  const adminUser = await User.create({
    name: 'Eleanor Vance (Admin)',
    email: 'admin@bookvault.com',
    password: 'Admin@123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    status: 'active'
  });

  const librarianUser = await User.create({
    name: 'Marcus Brody (Librarian)',
    email: 'librarian@bookvault.com',
    password: 'Librarian@123',
    role: 'librarian',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    status: 'active'
  });

  const memberUser = await User.create({
    name: 'Alex Rivera (Student Member)',
    email: 'member@bookvault.com',
    password: 'Member@123',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
    status: 'active'
  });

  // Additional Librarian
  await User.create({
    name: 'Sarah Chen',
    email: 'sarah.chen@bookvault.com',
    password: 'Librarian@123',
    role: 'librarian',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    status: 'active'
  });

  console.log('Created Demo & Staff Users.');

  // 3. Members (8 realistic members)
  const memberRecords = [
    {
      name: 'Alex Rivera',
      email: 'member@bookvault.com',
      phone: '+1 (555) 234-5678',
      membershipId: 'BV-MEM-1001',
      joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      status: 'active',
      user: memberUser._id
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+1 (555) 876-5432',
      membershipId: 'BV-MEM-1002',
      joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      name: 'David Kim',
      email: 'david.kim@example.com',
      phone: '+1 (555) 345-6789',
      membershipId: 'BV-MEM-1003',
      joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      name: 'Sophia Martinez',
      email: 'sophia.m@example.com',
      phone: '+1 (555) 987-6543',
      membershipId: 'BV-MEM-1004',
      joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      name: 'Rahul Kumar',
      email: 'rahul.kumar@example.com',
      phone: '+1 (555) 456-7890',
      membershipId: 'BV-MEM-1005',
      joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      name: 'Emily Watson',
      email: 'emily.w@example.com',
      phone: '+1 (555) 567-8901',
      membershipId: 'BV-MEM-1006',
      joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      phone: '+1 (555) 678-9012',
      membershipId: 'BV-MEM-1007',
      joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      name: 'Amina Al-Mansoor',
      email: 'amina.m@example.com',
      phone: '+1 (555) 789-0123',
      membershipId: 'BV-MEM-1008',
      joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'inactive'
    }
  ];

  const createdMembers = await Member.create(memberRecords);
  console.log('Created ' + createdMembers.length + ' Members.');

  // 4. Books (16 realistic books from prompt with covers)
  const booksData = [
    {
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. A timeless handbook for software craftsmanship.',
      category: 'Technology',
      publisher: 'Prentice Hall',
      publishedYear: 2008,
      language: 'English',
      pages: 464,
      quantity: 8,
      availableCopies: 6,
      coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'The Pragmatic Programmer: Your Journey to Mastery',
      author: 'David Thomas, Andrew Hunt',
      isbn: '978-0135957059',
      description: 'The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern software development to examine the core process.',
      category: 'Technology',
      publisher: 'Addison-Wesley',
      publishedYear: 2019,
      language: 'English',
      pages: 352,
      quantity: 6,
      availableCopies: 5,
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      isbn: '978-0735211292',
      description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. Tiny Changes, Remarkable Results by renowned productivity expert James Clear.',
      category: 'Non-Fiction',
      publisher: 'Avery',
      publishedYear: 2018,
      language: 'English',
      pages: 320,
      quantity: 10,
      availableCopies: 8,
      coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      isbn: '978-0062315007',
      description: 'A magical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.',
      category: 'Fiction',
      publisher: 'HarperOne',
      publishedYear: 1988,
      language: 'English',
      pages: 208,
      quantity: 7,
      availableCopies: 7,
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest',
      isbn: '978-0262033848',
      description: 'The leading algorithms text in universities worldwide as well as the standard reference for professionals.',
      category: 'Education',
      publisher: 'MIT Press',
      publishedYear: 2009,
      language: 'English',
      pages: 1312,
      quantity: 5,
      availableCopies: 3,
      coverUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
      isbn: '978-0078022159',
      description: 'Presents the fundamental concepts of database management in an intuitive manner geared toward allowing students to begin working with databases as quickly as possible.',
      category: 'Technology',
      publisher: 'McGraw-Hill',
      publishedYear: 2019,
      language: 'English',
      pages: 1376,
      quantity: 4,
      availableCopies: 3,
      coverUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Python Crash Course',
      author: 'Eric Matthes',
      isbn: '978-1593279288',
      description: 'A Hands-On, Project-Based Introduction to Programming with Python. Fast-paced, thorough introduction to programming.',
      category: 'Technology',
      publisher: 'No Starch Press',
      publishedYear: 2019,
      language: 'English',
      pages: 544,
      quantity: 9,
      availableCopies: 8,
      coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Artificial Intelligence: A Modern Approach',
      author: 'Stuart Russell, Peter Norvig',
      isbn: '978-0134610993',
      description: 'The long-anticipated revision of this best-selling text offers the most comprehensive, up-to-date introduction to the theory and practice of artificial intelligence.',
      category: 'Science',
      publisher: 'Pearson',
      publishedYear: 2020,
      language: 'English',
      pages: 1152,
      quantity: 5,
      availableCopies: 4,
      coverUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Don\'t Make Me Think, Revisited',
      author: 'Steve Krug',
      isbn: '978-0321965516',
      description: 'A Common Sense Approach to Web Usability. Hundreds of thousands of Web designers and developers have relied on Krug\'s guide to understand the principles of intuitive navigation.',
      category: 'Technology',
      publisher: 'New Riders',
      publishedYear: 2014,
      language: 'English',
      pages: 216,
      quantity: 7,
      availableCopies: 7,
      coverUrl: 'https://images.unsplash.com/photo-1507842229451-77b3b64c12ef?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Deep Work: Rules for Focused Success in a Distracted World',
      author: 'Cal Newport',
      isbn: '978-1455586691',
      description: 'One of the most valuable skills in our economy is becoming increasingly rare. If you master this skill, you\'ll achieve extraordinary results.',
      category: 'Non-Fiction',
      publisher: 'Grand Central Publishing',
      publishedYear: 2016,
      language: 'English',
      pages: 304,
      quantity: 8,
      availableCopies: 7,
      coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      isbn: '978-0857197689',
      description: 'Timeless lessons on wealth, greed, and happiness doing well with money isn\'t necessarily about what you know. It\'s about how you behave.',
      category: 'Non-Fiction',
      publisher: 'Harriman House',
      publishedYear: 2020,
      language: 'English',
      pages: 256,
      quantity: 11,
      availableCopies: 10,
      coverUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Head First Java',
      author: 'Kathy Sierra, Bert Bates',
      isbn: '978-0596009205',
      description: 'A Brain-Friendly Guide. Learning a complex new language is no easy task especially when it’s an object-oriented computer programming language.',
      category: 'Technology',
      publisher: "O'Reilly Media",
      publishedYear: 2005,
      language: 'English',
      pages: 688,
      quantity: 5,
      availableCopies: 5,
      coverUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Computer Networks',
      author: 'Andrew S. Tanenbaum, David J. Wetherall',
      isbn: '978-0132126953',
      description: 'The ideal introduction to today\'s and tomorrow\'s networks. Tanenbaum describes how networks are structured from the inside out.',
      category: 'Education',
      publisher: 'Pearson',
      publishedYear: 2010,
      language: 'English',
      pages: 960,
      quantity: 6,
      availableCopies: 6,
      coverUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      isbn: '978-1449373320',
      description: 'The Big Ideas Behind Reliable, Scalable, and Maintainable Systems. Data is at the center of many challenges in system design today.',
      category: 'Technology',
      publisher: "O'Reilly Media",
      publishedYear: 2017,
      language: 'English',
      pages: 616,
      quantity: 8,
      availableCopies: 7,
      coverUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Operating System Concepts',
      author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
      isbn: '978-1119800361',
      description: 'The tenth edition of Operating System Concepts has been revised to keep it fresh and up-to-date with contemporary examples of how operating systems function.',
      category: 'Education',
      publisher: 'Wiley',
      publishedYear: 2018,
      language: 'English',
      pages: 1024,
      quantity: 5,
      availableCopies: 5,
      coverUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      isbn: '978-0062316097',
      description: 'From a renowned historian comes a groundbreaking narrative of humanity’s creation and evolution—a #1 international bestseller.',
      category: 'History',
      publisher: 'Harper',
      publishedYear: 2015,
      language: 'English',
      pages: 464,
      quantity: 7,
      availableCopies: 7,
      coverUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const createdBooks = await Book.create(booksData);
  console.log('Created ' + createdBooks.length + ' Books.');

  // 5. Borrowing Records (Active, Returned, Overdue)
  const now = new Date();

  const borrowingsData = [
    // Active loans for Alex Rivera (member@bookvault.com)
    {
      member: createdMembers[0]._id, // Alex Rivera
      book: createdBooks[0]._id, // Clean Code
      issueDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      returnDate: null,
      status: 'Issued',
      fine: 0
    },
    {
      member: createdMembers[0]._id, // Alex Rivera
      book: createdBooks[4]._id, // Intro to Algorithms (Overdue!)
      issueDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days overdue
      returnDate: null,
      status: 'Overdue',
      fine: 60 // 6 days * 10
    },
    // Past returned loan for Alex Rivera
    {
      member: createdMembers[0]._id, // Alex Rivera
      book: createdBooks[2]._id, // Atomic Habits
      issueDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 26 * 24 * 60 * 60 * 1000),
      returnDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000), // returned on time
      status: 'Returned',
      fine: 0
    },

    // Priya Sharma loans
    {
      member: createdMembers[1]._id,
      book: createdBooks[1]._id, // Pragmatic Programmer
      issueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
      returnDate: null,
      status: 'Issued',
      fine: 0
    },
    {
      member: createdMembers[1]._id,
      book: createdBooks[0]._id, // Clean Code
      issueDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
      returnDate: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000), // 2 days late
      status: 'Returned',
      fine: 20
    },

    // David Kim loans
    {
      member: createdMembers[2]._id,
      book: createdBooks[5]._id, // Database System Concepts (Overdue!)
      issueDate: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days overdue
      returnDate: null,
      status: 'Overdue',
      fine: 80
    },
    {
      member: createdMembers[2]._id,
      book: createdBooks[6]._id, // Python Crash Course
      issueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      returnDate: null,
      status: 'Issued',
      fine: 0
    },

    // Sophia Martinez loans
    {
      member: createdMembers[3]._id,
      book: createdBooks[7]._id, // AI: Modern Approach
      issueDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      returnDate: null,
      status: 'Issued',
      fine: 0
    },
    {
      member: createdMembers[3]._id,
      book: createdBooks[9]._id, // Deep Work
      issueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
      returnDate: null,
      status: 'Issued',
      fine: 0
    },

    // Rahul Kumar loans
    {
      member: createdMembers[4]._id,
      book: createdBooks[10]._id, // Psychology of Money
      issueDate: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days overdue
      returnDate: null,
      status: 'Overdue',
      fine: 40
    },
    {
      member: createdMembers[4]._id,
      book: createdBooks[13]._id, // Designing Data-Intensive Apps
      issueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000),
      returnDate: null,
      status: 'Issued',
      fine: 0
    }
  ];

  await Borrowing.create(borrowingsData);
  console.log('Created ' + borrowingsData.length + ' Borrowing Records.');

  console.log('--- Database Seed Complete ---');
};

module.exports = { runSeed };
