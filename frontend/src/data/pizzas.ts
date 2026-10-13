export type PizzaCategory = 'classic' | 'specialty' | 'veggie' | 'premium';

export interface Pizza {
  id: number;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  image: string;
  category: PizzaCategory;
  rating: number;
  ingredients: string[];
  isNew?: boolean;
  isPopular?: boolean;
}

export const categories: { value: PizzaCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Pizzas' },
  { value: 'classic', label: 'Classic' },
  { value: 'specialty', label: 'Specialty' },
  { value: 'veggie', label: 'Veggie' },
  { value: 'premium', label: 'Premium' },
];

export const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export const pizzas: Pizza[] = [
  {
    id: 1,
    name: 'Margherita',
    description: 'Classic tomato sauce, fresh mozzarella, basil & olive oil.',
    longDescription:
      'Our Margherita is a timeless Italian masterpiece. We start with our house-made San Marzano tomato sauce, layer on creamy fresh mozzarella di bufala, and finish with fragrant basil leaves and a drizzle of extra virgin olive oil. Baked in our wood-fired oven at 900°F for the perfect charred crust.',
    price: 12.99,
    image: '/images/pizza-margherita.jpg',
    category: 'classic',
    rating: 4.8,
    ingredients: ['San Marzano Tomatoes', 'Fresh Mozzarella', 'Basil', 'Olive Oil', 'Sea Salt'],
    isPopular: true,
  },
  {
    id: 2,
    name: 'Pepperoni',
    description: 'Loaded with crispy pepperoni & stretchy mozzarella cheese.',
    longDescription:
      'The ultimate crowd-pleaser. Our Pepperoni pizza features generous layers of premium cup-and-char pepperoni that curls up and crisps at the edges, sitting atop a bed of our signature blend of mozzarella and provolone cheeses. Each bite delivers that satisfying spicy-savory kick.',
    price: 14.99,
    image: '/images/pizza-pepperoni.jpg',
    category: 'classic',
    rating: 4.9,
    ingredients: ['Pepperoni', 'Mozzarella', 'Provolone', 'Tomato Sauce', 'Oregano'],
    isPopular: true,
  },
  {
    id: 3,
    name: 'BBQ Chicken',
    description: 'Smoky BBQ sauce, grilled chicken, red onions & cilantro.',
    longDescription:
      'A modern classic that brings the smokehouse to your plate. Tender grilled chicken pieces are tossed in our house-made smoky BBQ sauce, then layered with caramelized red onions, smoked gouda, and mozzarella. Finished with fresh cilantro and a final drizzle of BBQ glaze.',
    price: 16.99,
    image: '/images/pizza-bbq-chicken.jpg',
    category: 'specialty',
    rating: 4.7,
    ingredients: ['Grilled Chicken', 'BBQ Sauce', 'Red Onion', 'Smoked Gouda', 'Cilantro', 'Mozzarella'],
    isNew: true,
  },
  {
    id: 4,
    name: 'Garden Veggie',
    description: 'Colorful bell peppers, mushrooms, olives & fresh tomatoes.',
    longDescription:
      'A celebration of garden-fresh vegetables. Colorful bell peppers, earthy mushrooms, briny Kalamata olives, sweet red onions, and ripe Roma tomatoes come together on a bed of our three-cheese blend. Finished with a sprinkle of Italian herbs and a drizzle of garlic-infused olive oil.',
    price: 13.99,
    image: '/images/pizza-veggie.jpg',
    category: 'veggie',
    rating: 4.6,
    ingredients: ['Bell Peppers', 'Mushrooms', 'Olives', 'Red Onion', 'Tomatoes', 'Three-Cheese Blend'],
  },
  {
    id: 5,
    name: 'Hawaiian',
    description: 'Sweet pineapple, savory ham & melted mozzarella.',
    longDescription:
      'Love it or debate it — our Hawaiian pizza is undeniably delicious. We use premium smoked ham and sweet caramelized pineapple chunks, balanced with our tangy tomato sauce and a generous layer of melted mozzarella. The sweet-and-savory combination is perfection in every bite.',
    price: 14.99,
    image: '/images/pizza-hawaiian.jpg',
    category: 'classic',
    rating: 4.5,
    ingredients: ['Smoked Ham', 'Pineapple', 'Mozzarella', 'Tomato Sauce'],
  },
  {
    id: 6,
    name: 'Meat Lovers',
    description: 'Pepperoni, sausage, bacon, ham & ground beef.',
    longDescription:
      'For the carnivore in all of us. This protein-packed masterpiece is loaded with five premium meats: spicy pepperoni, Italian sausage, hickory-smoked bacon, honey-glazed ham, and seasoned ground beef. All piled high on our signature tomato sauce and extra mozzarella.',
    price: 18.99,
    image: '/images/pizza-meat-lovers.jpg',
    category: 'premium',
    rating: 4.8,
    ingredients: ['Pepperoni', 'Italian Sausage', 'Bacon', 'Ham', 'Ground Beef', 'Mozzarella'],
    isPopular: true,
  },
  {
    id: 7,
    name: 'Quattro Formaggi',
    description: 'Four Italian cheeses melted to golden perfection.',
    longDescription:
      'A cheese lover\'s dream come true. Four carefully selected Italian cheeses — creamy mozzarella, tangy gorgonzola, nutty Parmigiano-Reggiano, and smooth fontina — melt together into a rich, golden, bubbling masterpiece. Finished with a drizzle of truffle honey and cracked black pepper.',
    price: 17.99,
    image: '/images/pizza-margherita.jpg',
    category: 'premium',
    rating: 4.7,
    ingredients: ['Mozzarella', 'Gorgonzola', 'Parmigiano-Reggiano', 'Fontina', 'Truffle Honey'],
    isNew: true,
  },
  {
    id: 8,
    name: 'Mediterranean',
    description: 'Sun-dried tomatoes, artichokes, feta & kalamata olives.',
    longDescription:
      'Take a culinary trip to the Mediterranean. This pizza features sun-dried tomatoes, marinated artichoke hearts, creamy feta cheese, Kalamata olives, and roasted red peppers. Built on a garlic-herb olive oil base instead of traditional tomato sauce for an unforgettable flavor profile.',
    price: 15.99,
    image: '/images/pizza-veggie.jpg',
    category: 'veggie',
    rating: 4.6,
    ingredients: ['Sun-Dried Tomatoes', 'Artichoke Hearts', 'Feta', 'Kalamata Olives', 'Roasted Red Peppers'],
  },
];
