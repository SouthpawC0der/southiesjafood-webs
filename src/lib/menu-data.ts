export type MenuSection = "classics" | "modern";
export type ClassicsCategory = "jerk" | "curry" | "stews";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number; // cents
  section: MenuSection;
  category?: ClassicsCategory;
  image: string;
  popular?: boolean;
  spicy?: boolean;
  tag?: string; // e.g. "New", "Chef's Pick"
  proteinOptions?: string[]; // for Rasta Pasta
};

// ── Jamaican Classics ─────────────────────────────────────────────────────────

const jerkItems: MenuItem[] = [
  {
    id: "jerk-chicken",
    name: "Jerk Chicken",
    description: "Slow-marinated in our signature Scotch bonnet blend, grilled over pimento wood. Served with rice & peas and festival.",
    price: 1895,
    section: "classics",
    category: "jerk",
    image: "/images/jerk-chicken-12.jpg",
    popular: true,
    spicy: true,
  },
  {
    id: "jerk-pork",
    name: "Jerk Pork",
    description: "Fall-off-the-bone pork shoulder rubbed in jerk seasoning and smoked low and slow. Served with white rice and coleslaw.",
    price: 1895,
    section: "classics",
    category: "jerk",
    image: "/images/jerkpork.jpg",
    spicy: true,
  },
  {
    id: "jerk-snapper",
    name: "Jerk Snapper",
    description: "Whole Red Snapper marinated in jerk spices and grilled to perfection. Served with bammy and festival.",
    price: 2195,
    section: "classics",
    category: "jerk",
    image: "/images/Jerk%20Fish.jpg",
    spicy: true,
    popular: true,
  },
  {
    id: "jerk-shrimp",
    name: "Jerk Shrimp",
    description: "Jumbo shrimp tossed in our house jerk sauce and grilled over an open flame. Served with rice & peas.",
    price: 2195,
    section: "classics",
    category: "jerk",
    image: "/images/jerkshrimp.jpeg",
    spicy: true,
  },
];

const curryItems: MenuItem[] = [
  {
    id: "curry-shrimp",
    name: "Curry Shrimp",
    description: "Plump shrimp simmered in a rich coconut curry with Scotch bonnet and fresh thyme. Served with white rice.",
    price: 2195,
    section: "classics",
    category: "curry",
    image: "/images/Curryshrimp.webp",
    popular: true,
  },
  {
    id: "curry-chicken",
    name: "Curry Chicken",
    description: "Tender chicken slow-cooked in a fragrant Jamaican curry with potatoes and scallion. Served with rice & peas.",
    price: 1795,
    section: "classics",
    category: "curry",
    image: "/images/Currychicken.jpg",
  },
  {
    id: "curry-snapper",
    name: "Curry Snapper",
    description: "Red Snapper fillets braised in golden Jamaican curry with tomatoes and peppers. Served with white rice.",
    price: 2195,
    section: "classics",
    category: "curry",
    image: "/images/Currysnapper.jpeg",
  },
  {
    id: "curry-goat",
    name: "Curry Goat",
    description: "Tender goat slow-cooked for hours in a rich Scotch bonnet curry blend. Served with rice & peas and roti.",
    price: 2095,
    section: "classics",
    category: "curry",
    image: "/images/currygoat.jpg",
    popular: true,
    spicy: true,
  },
];

const stewItems: MenuItem[] = [
  {
    id: "beef-stew",
    name: "Beef Stew",
    description: "Hearty chunks of beef braised in a rich Jamaican-spiced gravy with carrots and potatoes. Served with white rice.",
    price: 1795,
    section: "classics",
    category: "stews",
    image: "/images/beefstew.jpeg",
  },
  {
    id: "brown-stew-chicken",
    name: "Brown Stew Chicken",
    description: "Caramelized chicken braised in a dark, savory gravy with onions, garlic, and island herbs. Served with rice & peas.",
    price: 1795,
    section: "classics",
    category: "stews",
    image: "/images/brownstewchicken.jpg",
    popular: true,
  },
  {
    id: "oxtail",
    name: "Oxtail",
    description: "Braised low and slow for 4+ hours until fall-off-the-bone tender. Smothered in rich gravy with butter beans. Served with white rice.",
    price: 2495,
    section: "classics",
    category: "stews",
    image: "/images/oxtail.jpeg",
    popular: true,
    tag: "House Special",
  },
  {
    id: "ackee-saltfish",
    name: "Ackee & Saltfish",
    description: "Jamaica's national dish — ackee sautéed with salted cod, Scotch bonnet, tomatoes, and onions. Served with fried dumpling and plantain.",
    price: 1895,
    section: "classics",
    category: "stews",
    image: "/images/ackeensaltfish.jpg",
    tag: "National Dish",
  },
];

// ── Modern Twists ─────────────────────────────────────────────────────────────

const modernItems: MenuItem[] = [
  {
    id: "jerk-shrimp-tacos",
    name: "Jerk Shrimp Tacos",
    description: "Three soft tacos loaded with jerk shrimp, mango slaw, cilantro crema, and pickled Scotch bonnet. Served with seasoned rice.",
    price: 1695,
    section: "modern",
    image: "/images/shrimptacos.jpeg",
    popular: true,
    spicy: true,
    tag: "Fan Favorite",
  },
  {
    id: "boston-burger",
    name: "Boston Burger",
    description: "Two smashed beef patties, pepper jack cheese, caramelized onions, and our signature pineapple jerk sauce on a brioche bun. Served with fries.",
    price: 1795,
    section: "modern",
    image: "/images/Bostonburger.jpeg",
    popular: true,
    tag: "House Burger",
  },
  {
    id: "rasta-pasta",
    name: "Rasta Pasta",
    description: "Penne in a creamy jerk-infused Alfredo sauce with bell peppers, onions, and fresh herbs. Choose your protein: Chicken, Shrimp, or Pork.",
    price: 1695,
    section: "modern",
    image: "/images/rastapasta.jpeg",
    proteinOptions: ["Chicken", "Shrimp (+$2)", "Pork"],
    tag: "Customer Fave",
  },
  {
    id: "oxtail-grilled-cheese",
    name: "Oxtail Grilled Cheese",
    description: "Slow-braised oxtail piled high on thick-cut sourdough with aged cheddar, caramelized onion jam, and a drizzle of jerk butter. Served with chips.",
    price: 1895,
    section: "modern",
    image: "/images/Oxtailgrilledcheese.jpeg",
    tag: "Chef's Pick",
  },
];

export const classicsCategories = [
  { id: "jerk",   label: "Jerk",             items: jerkItems },
  { id: "curry",  label: "Curry",            items: curryItems },
  { id: "stews",  label: "Stews & Classics", items: stewItems },
];

export const modernMenuItems = modernItems;

export const menuItems: MenuItem[] = [
  ...jerkItems,
  ...curryItems,
  ...stewItems,
  ...modernItems,
];

// Featured items for the homepage
export const featuredItems = [
  menuItems.find((i) => i.id === "jerk-chicken")!,
  menuItems.find((i) => i.id === "oxtail")!,
  menuItems.find((i) => i.id === "boston-burger")!,
];

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
