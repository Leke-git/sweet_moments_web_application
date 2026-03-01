import { SiteConfig, BusinessConfig } from './types';

export const ADMIN_EMAILS = [
  'bn.gbemileke@gmail.com',
  'lekingsononpoint@gmail.com'
];

export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  bakeryName: "Sweet Moments",
  contactEmail: "bn.gbemileke@gmail.com",
  announcement: "Welcome to our new automated bakery experience!",
  isMaintenance: false,
  openingHours: "Mon-Fri: 9am - 5pm, Sat: 10am - 4pm",
  deliveryZones: "London (Zones 1-4), SE Postcodes",
  knowledgeBase: "We specialize in luxury artisan cakes. Our signature flavor is Madagascar Vanilla. We require 7 days notice for all orders. All cakes are nut-free unless specified."
};

export const COLORS = {
  bg: '#fdf8f4',
  primary: '#c8614a',
  accent: '#d4956a',
  dark: '#2c1a0e',
  muted: '#9c8878',
  surface: '#ffffff',
  border: '#ede5dc',
  shadow: 'rgba(44, 26, 14, 0.08)',
};

export const GALLERY_CATEGORIES = [
  {
    id: 'weddings',
    title: 'Weddings',
    category: 'Ethereal Elegance',
    description: 'Bespoke tiered creations designed to be the centerpiece of your forever.',
    images: [
      'https://images.unsplash.com/photo-1511208687438-2c5a5abb810c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1522673607200-164883eecd18?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1535254973040-607b474cb80d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=1200',
    ],
  },
  {
    id: 'corporate',
    title: 'Corporate Events',
    category: 'Professional Poise',
    description: 'Elevating brand milestones and corporate gatherings with sophisticated, branded designs.',
    images: [
      'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1200',
    ],
  },
  {
    id: 'birthdays',
    title: 'Birthdays',
    category: 'Vibrant Celebrations',
    description: 'Transforming personal stories into edible art for every milestone.',
    images: [
      'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1530103578275-2d12f3cc0ff6?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1200',
    ],
  },
  {
    id: 'anniversaries',
    title: 'Anniversaries',
    category: 'Timeless Romance',
    description: 'Celebrating the journey of love with refined, intimate designs.',
    images: [
      'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1525138016235-91982283946c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1511208687438-2c5a5abb810c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1535254973040-607b474cb80d?auto=format&fit=crop&q=80&w=1200',
    ],
  },
];

export const REVIEWS = [
  {
    name: "Eleanor Vance",
    cakeImage: "https://images.unsplash.com/photo-1511208687438-2c5a5abb810c?auto=format&fit=crop&q=80&w=600",
    clientImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    comment: "The wedding cake was a masterpiece. Sarah captured our vision perfectly with the hand-pressed florals.",
  },
  {
    name: "Julian Brooks",
    cakeImage: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=600",
    clientImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    comment: "Never had a cake that tasted as good as it looked. The Madagascar Vanilla is out of this world.",
  },
  {
    name: "Sienna Miller",
    cakeImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600",
    clientImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    comment: "An anniversary cake that made my wife cry tears of joy. Minimalist but so full of character.",
  },
];

export const SITE_MAP = [
  { name: 'Home', id: 'home', description: 'Hero section with main call to action' },
  { name: 'Gallery', id: 'gallery', description: 'Photos of past cakes (Weddings, Birthdays, etc.)' },
  { name: 'The Kitchen', id: 'kitchen', description: 'Information about our ingredients and process' },
  { name: 'Reviews', id: 'reviews', description: 'Customer testimonials' },
  { name: 'About', id: 'about', description: 'Story of the bakery and the baker' },
  { name: 'Contact', id: 'contact', description: 'Contact form and location info' },
  { name: 'Order Wizard', id: 'order-now', description: 'The interactive tool to customize and price a cake' },
];

export const DEFAULT_CONFIG: SiteConfig = {
  cake_types: [
    {
      id: 'classic',
      name: 'Classic Round',
      base_price: 65,
      emoji: '🎂',
      photo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600',
      description: 'The timeless choice for any celebration. Available in single or double layers.',
    },
    {
      id: 'tiered',
      name: 'Tiered Celebration',
      base_price: 180,
      emoji: '🏰',
      photo: 'https://images.unsplash.com/photo-1535254973040-607b474cb80d?auto=format&fit=crop&q=80&w=600',
      description: 'Grand, architectural designs for weddings and major milestones.',
    },
    {
      id: 'heart',
      name: 'Heart Shaped',
      base_price: 75,
      emoji: '❤️',
      photo: 'https://images.unsplash.com/photo-1511208687438-2c5a5abb810c?auto=format&fit=crop&q=80&w=600',
      description: 'Vintage-inspired lambeth style hearts. Perfect for romance.',
    },
    {
      id: 'cupcakes',
      name: 'Artisan Cupcakes (x12)',
      base_price: 48,
      emoji: '🧁',
      photo: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=600',
      description: 'Bite-sized masterpieces. Sold in dozens with custom decorations.',
    },
  ],
  sizes: [
    { id: 'small', label: 'Small', servings: 10, multiplier: 1 },
    { id: 'medium', label: 'Medium', servings: 25, multiplier: 1.8 },
    { id: 'large', label: 'Large', servings: 50, multiplier: 3.2 },
  ],
  cake_flavours: ['Madagascar Vanilla', 'Valrhona Chocolate', 'Zesty Lemon', 'Red Velvet', 'Pistachio & Rose'],
  fillings: ['Vanilla Bean Buttercream', 'Dark Chocolate Ganache', 'Raspberry Coulis', 'Salted Caramel', 'Lemon Curd'],
  frosting_types: ['Swiss Meringue Buttercream', 'Ganache', 'Fondant', 'Cream Cheese Frosting'],
  colour_options: ['Natural White', 'Blush Pink', 'Sage Green', 'Dusty Blue', 'Terracotta'],
  dietary_options: ['Gluten Free', 'Vegan', 'Nut Free', 'Dairy Free'],
  surcharges: {
    delivery_fee: 25,
    dietary_per_item: 10,
    fondant_premium: 35,
  },
  delivery_enabled: true,
  min_days_notice: 7,
};
