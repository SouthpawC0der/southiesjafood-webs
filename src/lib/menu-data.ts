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
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80",
    spicy: true,
  },
  {
    id: "jerk-snapper",
    name: "Jerk Snapper",
    description: "Whole Red Snapper marinated in jerk spices and grilled to perfection. Served with bammy and festival.",
    price: 2195,
    section: "classics",
    category: "jerk",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    popular: true,
  },
  {
    id: "curry-chicken",
    name: "Curry Chicken",
    description: "Tender chicken slow-cooked in a fragrant Jamaican curry with potatoes and scallion. Served with rice & peas.",
    price: 1795,
    section: "classics",
    category: "curry",
    image: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=800&q=80",
  },
  {
    id: "curry-snapper",
    name: "Curry Snapper",
    description: "Red Snapper fillets braised in golden Jamaican curry with tomatoes and peppers. Served with white rice.",
    price: 2195,
    section: "classics",
    category: "curry",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
  },
  {
    id: "curry-goat",
    name: "Curry Goat",
    description: "Tender goat slow-cooked for hours in a rich Scotch bonnet curry blend. Served with rice & peas and roti.",
    price: 2095,
    section: "classics",
    category: "curry",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80",
  },
  {
    id: "brown-stew-chicken",
    name: "Brown Stew Chicken",
    description: "Caramelized chicken braised in a dark, savory gravy with onions, garlic, and island herbs. Served with rice & peas.",
    price: 1795,
    section: "classics",
    category: "stews",
    image: "https://images.unsplash.com/photo-1624726175512-19b9baf9fbd1?w=800&q=80",
    popular: true,
  },
  {
    id: "oxtail",
    name: "Oxtail",
    description: "Braised low and slow for 4+ hours until fall-off-the-bone tender. Smothered in rich gravy with butter beans. Served with white rice.",
    price: 2495,
    section: "classics",
    category: "stews",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    popular: true,
    tag: "House Burger",
  },
  {
    id: "rasta-pasta",
    name: "Rasta Pasta",
    description: "Penne in a creamy jerk-infused Alfredo sauce with bell peppers, onions, and fresh herbs. Choose your protein: Chicken, Shrimp, or Pork.",
    price: 1695,
    section: "modern",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80",
    proteinOptions: ["Chicken", "Shrimp (+$2)", "Pork"],
    tag: "Customer Fave",
  },
  {
    id: "oxtail-grilled-cheese",
    name: "Oxtail Grilled Cheese",
    description: "Slow-braised oxtail piled high on thick-cut sourdough with aged cheddar, caramelized onion jam, and a drizzle of jerk butter. Served with chips.",
    price: 1895,
    section: "modern",
    image: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=800&q=80",
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
