/**
 * Crema Lounge menu.
 * Items and prices mirror the venue's published listing (PKR).
 * `from` marks items priced by size/portion — the value is the starting price.
 * `price: null` means the venue has not published one yet — shown as "Ask for price".
 */

/** A true-scale 3D model for the AR menu. Paths are relative to /public. */
export interface DishModel {
  /** URL segment for /ar-menu/<slug> — also what a dish QR code points at. */
  readonly slug: string;
  readonly src: string;
  /** Real photo of the dish: list card image and 3D loading poster. */
  readonly photo: string;
  readonly photoAlt: string;
  /** Starting view, model-viewer syntax. Defaults suit a single plate. */
  readonly cameraOrbit?: string;
  readonly cameraTarget?: string;
}

export interface MenuItem {
  readonly name: string;
  readonly description: string;
  readonly price: number | null;
  readonly from?: boolean;
  readonly model?: DishModel;
}

export interface MenuCategory {
  readonly id: string;
  readonly name: string;
  /** Grouping used by the menu page's filter rail. */
  readonly group: MenuGroup;
  readonly items: readonly MenuItem[];
}

export type MenuGroup = "Coffee & Drinks" | "Breakfast" | "Kitchen" | "Sweet";

export const menuGroups: readonly MenuGroup[] = [
  "Coffee & Drinks",
  "Breakfast",
  "Kitchen",
  "Sweet",
] as const;

export const menu: readonly MenuCategory[] = [
  {
    id: "coffee",
    name: "Coffee",
    group: "Coffee & Drinks",
    items: [
      {
        name: "Espresso",
        description: "A concentrated coffee shot, rich and aromatic.",
        price: 480,
        from: true,
      },
      {
        name: "Americano",
        description:
          "Espresso lengthened with hot water for a smooth, robust cup.",
        price: 520,
        from: true,
      },
      {
        name: "Cappuccino",
        description:
          "Equal parts espresso, steamed milk and a deep cap of foam.",
        price: 650,
        from: true,
      },
      {
        name: "Latte",
        description:
          "Espresso with generously steamed milk under a light layer of foam.",
        price: 700,
        from: true,
      },
      {
        name: "Spanish Latte",
        description:
          "Condensed milk folded through espresso — sweet, dense, creamy.",
        price: 750,
        from: true,
      },
      {
        name: "Rose Flavored Latte",
        description:
          "Brewed espresso with steamed milk and aromatic floral notes.",
        price: 800,
        from: true,
      },
      {
        name: "Coconut Flavored Latte",
        description: "Espresso and milk with a mildly sweet coconut finish.",
        price: 800,
        from: true,
      },
      {
        name: "Hazelnut Flavored Latte",
        description:
          "Italian-style espresso with milk and warm aromatic hazelnut.",
        price: 800,
        from: true,
      },
      {
        name: "French Vanilla Flavored Latte",
        description: "Espresso and milk with a mildly sweet vanilla flavour.",
        price: 800,
        from: true,
      },
      {
        name: "Caramel Flavored Latte",
        description: "Brewed espresso with milk and a soft caramel sweetness.",
        price: 800,
        from: true,
      },
    ],
  },
  {
    id: "manual-brew",
    name: "Manual Brew",
    group: "Coffee & Drinks",
    items: [
      {
        name: "V60",
        description:
          "Pour over, brewed slowly to draw out distinct notes and a clean finish.",
        price: 950,
      },
      {
        name: "Aeropress",
        description:
          "Full-bodied and brewed under pressure for a smooth, low-acid cup.",
        price: 900,
      },
    ],
  },
  {
    id: "mocktail",
    name: "Mocktails",
    group: "Coffee & Drinks",
    items: [
      {
        name: "Spicy Mango Mojito",
        description: "Sweet mango, fresh mint and a hint of spice.",
        price: 800,
      },
      {
        name: "Berry Blast",
        description: "Assorted berries muddled with mint and a touch of citrus.",
        price: 700,
      },
      {
        name: "Lime Malt",
        description: "Bright lime, tangy and sweet in balance.",
        price: 600,
      },
    ],
  },
  {
    id: "iced-tea",
    name: "Iced Tea",
    group: "Coffee & Drinks",
    items: [
      {
        name: "Mango Iced Tea",
        description: "Chilled black tea infused with ripe mango.",
        price: 650,
        from: true,
      },
      {
        name: "Raspberry Iced Tea",
        description: "Iced tea with the sweet, tart lift of raspberries.",
        price: 650,
        from: true,
      },
      {
        name: "Lemon Iced Tea",
        description: "Crisp iced tea with a bright lemon twist.",
        price: 650,
        from: true,
      },
    ],
  },
  {
    id: "tea",
    name: "Tea",
    group: "Coffee & Drinks",
    items: [
      {
        name: "Mixed Tea",
        description: "A balanced, aromatic blend of tea leaves.",
        price: 380,
        from: true,
      },
      {
        name: "Green Tea",
        description: "Delicate and soothing, with subtle earthy notes.",
        price: 340,
        from: true,
      },
    ],
  },
  {
    id: "breakfast",
    name: "Breakfast",
    group: "Breakfast",
    items: [
      {
        name: "Grilled Chicken Omelette",
        description:
          "A fluffy omelette filled with tender grilled chicken, served warm.",
        price: 1250,
      },
      {
        name: "Spanish Omelette",
        description:
          "Fluffy eggs with potatoes and onions, cooked to golden perfection.",
        price: 1050,
      },
      {
        name: "Fajita Omelette",
        description:
          "Seasoned fajita vegetables and tender strips of chicken.",
        price: 950,
      },
      {
        name: "Mushroom Cheese Omelette",
        description: "Generously filled with sautéed mushrooms and melted cheese.",
        price: 890,
      },
      {
        name: "Oregano Scrambled Egg with Bagel",
        description:
          "Creamy scrambled eggs seasoned with oregano, with a toasted bagel.",
        price: 1095,
      },
    ],
  },
  {
    id: "french-toast",
    name: "French Toast",
    group: "Breakfast",
    items: [
      {
        name: "Lotus French Toast",
        description:
          "Thick slices dipped in egg batter, infused with Lotus Biscoff.",
        price: 1099,
      },
      {
        name: "Classic French Toast",
        description: "Golden slices dusted with powdered sugar, served with syrup.",
        price: 895,
      },
      {
        name: "Chocolate French Toast",
        description: "French toast infused with rich chocolate.",
        price: 975,
      },
    ],
  },
  {
    id: "pancakes",
    name: "Pancakes",
    group: "Breakfast",
    items: [
      {
        name: "Lotus Pancake",
        description:
          "Fluffy pancakes infused with caramel Lotus Biscoff and drizzled with sauce.",
        price: 1469,
        from: true,
      },
      {
        name: "Classic Pancake",
        description:
          "Golden and fluffy, served with your choice of syrup or fresh fruit.",
        price: 1199,
        from: true,
      },
      {
        name: "Chocolate Pancake",
        description: "Rich cocoa pancakes with a generous chocolate drizzle.",
        price: 1349,
        from: true,
      },
    ],
  },
  {
    id: "waffles",
    name: "Waffles",
    group: "Breakfast",
    items: [
      {
        name: "Blueberry Waffles",
        description: "Crisp golden waffles studded with blueberries and syrup.",
        price: 1250,
      },
      {
        name: "Double Chocolate Waffle",
        description: "Chocolate waffles with extra chips and chocolate sauce.",
        price: 1169,
      },
    ],
  },
  {
    id: "hi-tea",
    name: "Hi Tea",
    group: "Kitchen",
    items: [
      {
        name: "Hi Tea Platter",
        description:
          "Three tiers to share: garden salad, croquettes and carrot cake; chicken sliders, a crumbed tender and finger sandwiches; penne arrabbiata, a grilled wrap and wings with a creamy dip.",
        // PLACEHOLDER: price not published on Instagram — confirm with the venue.
        price: null,
        model: {
          slug: "hi-tea-platter",
          src: "/models/hi-tea-platter.glb",
          photo: "/images/hi-tea-platter.jpg",
          photoAlt:
            "The Crema Lounge Hi Tea Platter on its three-tier black stand",
          cameraOrbit: "18deg 68deg 1.05m",
          cameraTarget: "0m 0.15m 0m",
        },
      },
    ],
  },
  {
    id: "appetizers",
    name: "Appetizers",
    group: "Kitchen",
    items: [
      {
        name: "Dynamite Chicken Bites",
        description: "Crispy chicken tossed in a tangy, slightly spicy dynamite sauce.",
        price: 999,
      },
      {
        name: "Crispy Chicken Tenderloins",
        description: "Seasoned crispy breading, fried to golden perfection.",
        price: 950,
      },
      {
        name: "Battered Fish Goujons",
        description: "Delicately battered and fried until golden and crisp.",
        price: 1475,
      },
      {
        name: "Hand-cut Sea Salt Fries",
        description: "Freshly hand-cut potatoes, crisp and seasoned with sea salt.",
        price: 690,
      },
      {
        name: "Loaded Cheese Fries",
        description: "Golden fries under melted cheese and savoury seasoning.",
        price: 850,
      },
    ],
  },
  {
    id: "panini",
    name: "Panini",
    group: "Kitchen",
    items: [
      {
        name: "Tarragon-infused Chicken Panini",
        description:
          "Grilled chicken with aromatic tarragon, melted cheese and fresh vegetables.",
        price: 1450,
      },
      {
        name: "Smoked Tandoori Spiced Panini",
        description: "Smoky tandoori chicken pressed with fresh fillings.",
        price: 1150,
      },
    ],
  },
  {
    id: "sandwiches",
    name: "Sandwiches",
    group: "Kitchen",
    items: [
      {
        name: "Club Sandwich",
        description:
          "Layered chicken, crisp bacon, lettuce, tomato and mayo on toasted bread.",
        price: 1195,
      },
      {
        name: "Chicken Fajita Sandwich",
        description: "Grilled fajita strips with sautéed onions and peppers.",
        price: 1275,
      },
      {
        name: "Pesto Chicken Sandwich",
        description:
          "Sliced chicken breast, aromatic pesto, greens and cheese on toasted bread.",
        price: 1349,
      },
    ],
  },
  {
    id: "burgers",
    name: "Burgers",
    group: "Kitchen",
    items: [
      {
        name: "Honey Glazed Chicken Burger",
        description:
          "A succulent chicken patty glazed with honey, in a soft bun with fresh toppings.",
        price: 1050,
      },
    ],
  },
  {
    id: "pasta",
    name: "Pasta",
    group: "Kitchen",
    items: [
      {
        name: "Baked Arrabbiata",
        description:
          "Spicy arrabbiata baked with rich tomato, chilli flakes and melted cheese.",
        price: 1350,
      },
      {
        name: "Classic Fettuccine Alfredo",
        description: "Butter, heavy cream and parmesan over fettuccine.",
        price: 1350,
      },
      {
        name: "Basil Pesto Pasta",
        description: "Fresh basil, pine nuts, garlic, parmesan and olive oil.",
        price: 1450,
      },
      {
        name: "Spaghetti & Beef Meatballs",
        description: "Al dente spaghetti with beef meatballs in rich tomato sauce.",
        price: 1550,
      },
      {
        name: "Eggplant Parmigiana",
        description: "Baked eggplant layered with tomato, mozzarella and parmesan.",
        price: 1800,
        model: {
          slug: "eggplant-parmigiana",
          src: "/models/eggplant-parmigiana.glb",
          photo: "/images/eggplant-parmigiana.jpg",
          photoAlt:
            "Eggplant Parmigiana under baked mozzarella, with fettuccine in a pink sauce",
        },
      },
      {
        name: "Chicken Supreme",
        description: "Tender chicken breast in a creamy sauce.",
        price: 1850,
        model: {
          slug: "chicken-supreme",
          src: "/models/chicken-supreme.glb",
          photo: "/images/chicken-supreme.jpg",
          photoAlt:
            "Chicken Supreme in a creamy sauce with fries and sautéed vegetables",
        },
      },
    ],
  },
  {
    id: "poultry",
    name: "Poultry",
    group: "Kitchen",
    items: [
      {
        name: "Moroccan Spiced Chicken",
        description: "Marinated and cooked with fragrant Moroccan spices.",
        price: 1900,
      },
      {
        name: "House Special Chicken",
        description: "Our chef's signature, built on a blend all its own.",
        price: 2050,
      },
      {
        name: "American-style Grilled Chicken",
        description: "Tender grilled chicken, seasoned and cooked through.",
        price: 1950,
      },
      {
        name: "Stuffed Chicken Breast",
        description: "Chicken breast filled with savoury stuffing, golden and tender.",
        price: 1950,
      },
    ],
  },
  {
    id: "salads",
    name: "Salads",
    group: "Kitchen",
    items: [
      {
        name: "Quinoa Salad",
        description: "Fluffy quinoa, fresh vegetables and a light dressing.",
        price: 1250,
      },
      {
        name: "Caesar Salad",
        description: "Romaine, parmesan, croutons and classic Caesar dressing.",
        price: 1050,
      },
      {
        name: "Protein Salad",
        description: "Protein-rich and hearty over fresh greens.",
        price: 1350,
      },
    ],
  },
  {
    id: "desserts",
    name: "Desserts",
    group: "Sweet",
    items: [
      {
        name: "Lotus Cheese Cake",
        description:
          "Creamy cheesecake carrying the caramel character of Lotus biscuits.",
        price: 850,
        from: true,
      },
      {
        name: "Chocolate Fudge Cake",
        description: "Deeply rich, moist and layered with chocolate ganache.",
        price: 459,
        from: true,
      },
      {
        name: "Chocolate & Vanilla Cookie",
        description: "Swirls of rich chocolate and sweet vanilla dough.",
        price: 495,
      },
      {
        name: "Chocolate Brownie",
        description: "Dense and fudgy inside, with a slightly crisp top.",
        price: 495,
      },
      {
        name: "Walnut Brownie",
        description: "A classic brownie studded with crunchy walnuts.",
        price: 549,
      },
    ],
  },
] as const;

/** Hand-picked for the homepage preview — the things people come back for. */
export const signatureItemNames: readonly string[] = [
  "Spanish Latte",
  "V60",
  "Lotus Cheese Cake",
  "Lotus Pancake",
  "Club Sandwich",
  "Aeropress",
] as const;

/** Every dish that has a 3D model, in menu order. */
export const arItems: readonly (MenuItem & { readonly model: DishModel })[] =
  menu.flatMap((category) =>
    category.items.filter(
      (item): item is MenuItem & { readonly model: DishModel } =>
        item.model !== undefined,
    ),
  );

export function formatPrice(price: number | null, from?: boolean): string {
  if (price === null) return "Ask for price";
  const value = `Rs. ${price.toLocaleString("en-PK")}`;
  return from ? `from ${value}` : value;
}
