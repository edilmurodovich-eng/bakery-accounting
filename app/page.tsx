"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  ChartNoAxesCombined,
  Package,
  Plus,
  Trash2,
  FileDown,
  Wallet,
  ShoppingBag,
  TrendingUp,
  ReceiptText,
  Instagram,
  Send,
  CircleDollarSign,
  Flame,
  Search,
} from "lucide-react";

type Unit = "g" | "kg" | "ml" | "pcs";
type Period = "today" | "month" | "custom";

type Ingredient = {
  id: number;
  name: string;
  amount: string;
  unit: Unit;
  price: string;
};

type Product = {
  id: number;
  name: string;
  cost: number;
  price: number;
};

type Sale = {
  id: number;
  date: string;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  cost: number;
};

type Expense = {
  id: number;
  date: string;
  name: string;
  amount: number;
};

type Recipe = {
  name: string;
  yieldCount: string;
  ingredients: Omit<Ingredient, "id">[];
};

type ApiRecipeIngredient = {
  name?: string;
  localName?: string;
  display?: string;
  original?: string;
  quantity?: {
    value?: number;
    unit?: "g" | "ml" | "pcs";
  };
  amount?: number;
  unit?: "g" | "ml" | "pcs";
};

type ApiRecipe = {
  title?: string;
  url?: string;
  language?: string;
  ingredients?: ApiRecipeIngredient[];
};

type ApiRecipeResponse = {
  results?: ApiRecipe[];
  tinyPlatesResponse?: {
    results?: ApiRecipe[];
  };
  error?: string;
};
type ApiPrice = {
  name: string;
  price: number;
  unit: "kg" | "l" | "pcs";
  source: string;
  date: string;
};
type ApiPriceResponse = {
  region: string;
  currency: string;
  note: string;
  prices: ApiPrice[];
};
const ingredientPriceCatalog: Record<string, number> = {
  // Мука
  "мука": 10000,
  "пшеничная мука": 10000,
  "мука пшеничная": 10000,
  "мука высшего сорта": 10000,

  // Сахар
  "сахар": 15000,
  "сахар песок": 15000,
  "сахар-песок": 15000,

  // Яйца
  "яйцо": 2000,
  "яйца": 2000,
  "яйца куриные": 2000,
  "куриные яйца": 2000,
  "яйцо куриное": 2000,

  // Молочные продукты
  "молоко": 12000,
  "молоко 2 5": 12000,
  "молоко 3 2": 12000,
  "молоко 1 5": 12000,
  "молоко пастеризованное": 12000,

  "сливочное масло": 90000,
  "масло сливочное": 90000,
  "сливочное масло 82": 90000,

  "сметана": 30000,
  "сметана 15": 30000,
  "сметана 20": 30000,
  "сметана 25": 30000,

  "сливки": 65000,
  "сливки 10": 65000,
  "сливки 20": 65000,
  "сливки 33": 65000,

  "творог": 40000,
  "творог 5": 40000,
  "творог 9": 40000,

  "сыр": 80000,
  "сыр твердый": 80000,
  "сыр мягкий": 80000,
  "сливочный сыр": 80000,

  // Сладкие ингредиенты
  "мед": 60000,
  "мёд": 60000,
  "крахмал": 25000,
  "какао": 50000,
  "какао порошок": 50000,
  "ванилин": 50000,
  "ваниль": 50000,
  "ванильный сахар": 30000,

  // Разрыхлители
  "дрожжи": 50000,
  "дрожжи сухие": 50000,
  "дрожжи свежие": 30000,
  "разрыхлитель": 30000,
  "сода": 10000,

  // Овощи
  "лук": 5000,
  "лук репчатый": 5000,
  "репчатый лук": 5000,

  "капуста": 8000,
  "капуста белокочанная": 8000,
  "белокочанная капуста": 8000,
  "капуста свежая": 8000,
  "свежая капуста": 8000,

  "морковь": 7000,

  "картофель": 7000,
  "картошка": 7000,

  "чеснок": 20000,

  // Мясо
  "мясо": 90000,
  "говядина": 90000,
  "говядина мякоть": 90000,
  "баранина": 95000,
  "свинина": 80000,
  "курица": 40000,
  "куриное мясо": 40000,
  "куриное филе": 50000,

  // Масла
  "растительное масло": 25000,
  "масло растительное": 25000,
  "подсолнечное масло": 25000,

  // Прочее
  "соль": 5000,
  "вода": 0,
  "лимон": 15000,
  "лимонный сок": 20000,
  "изюм": 40000,
  "орехи": 70000,
  "грецкие орехи": 70000,
  "арахис": 40000,
  "кунжут": 40000,
};

const normalizeIngredientName = (value: string) =>
  value
    .toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е")
    .replace(/,/g, " ")
    .replace(/%/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");

const ingredientAliases: Record<string, string> = {
  "молоко 2 5": "молоко",
  "молоко 3 2": "молоко",
  "молоко 1 5": "молоко",
  "молоко пастеризованное": "молоко",

  "яйца куриные": "яйца",
  "куриные яйца": "яйца",
  "яйцо куриное": "яйца",

  "капуста белокочанная": "капуста",
  "белокочанная капуста": "капуста",
  "капуста свежая": "капуста",
  "свежая капуста": "капуста",

  "лук репчатый": "лук",
  "репчатый лук": "лук",

  "масло сливочное": "сливочное масло",
  "масло растительное": "растительное масло",

  "какао порошок": "какао",

  "дрожжи сухие": "дрожжи",
  "дрожжи свежие": "дрожжи",

  "куриное мясо": "курица",
  "куриное филе": "курица",

  "картошка": "картофель",
};

const findIngredientPrice = (name: string) => {
  const normalized = normalizeIngredientName(name);

  // 1. Сначала проверяем прямое совпадение.
  const directPrice = ingredientPriceCatalog[normalized];

  if (directPrice !== undefined) {
    return directPrice;
  }

  // 2. Затем проверяем известный вариант названия.
  const alias = ingredientAliases[normalized];

  if (alias) {
    return ingredientPriceCatalog[alias] ?? "";
  }

  // 3. Проверяем более длинные названия.
  // Например: "Молоко 2,5% пастеризованное"
  // должно определиться как "Молоко".
  const matchingKey = Object.keys(ingredientPriceCatalog)
    .filter((key) => {
      const normalizedKey = normalizeIngredientName(key);

      return (
        normalized === normalizedKey ||
        normalized.startsWith(`${normalizedKey} `) ||
        normalized.endsWith(` ${normalizedKey}`)
      );
    })
    .sort(
      (a, b) =>
        normalizeIngredientName(b).length -
        normalizeIngredientName(a).length
    )[0];

  if (matchingKey) {
    return ingredientPriceCatalog[matchingKey];
  }

  // 4. Если ничего не найдено — оставляем цену пустой.
  return "";
};
const money = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.round(value)) + " сум";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const field =
  "block w-full min-w-0 max-w-full box-border rounded-xl border border-[#e8dce1] bg-white px-3 py-3 text-base text-[#35252c] outline-none placeholder:text-[#ad9eaa] focus:border-[#781f3b] focus:ring-2 focus:ring-[#781f3b]/10";

const buttonPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#781f3b] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#58152b] disabled:opacity-40";

const buttonSecondary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e8dce1] bg-white px-4 py-3 text-sm font-semibold text-[#50343f] transition hover:bg-[#faf3f6]";

const recipes: Recipe[] = [
  {
    name: "Наполеон",
    yieldCount: "10",
    ingredients: [
      { name: "Мука", amount: "600", unit: "g", price: "10000" },
      { name: "Сливочное масло", amount: "300", unit: "g", price: "90000" },
      { name: "Яйца", amount: "2", unit: "pcs", price: "2000" },
      { name: "Молоко", amount: "1000", unit: "g", price: "12000" },
      { name: "Сахар", amount: "250", unit: "g", price: "15000" },
      { name: "Крахмал", amount: "50", unit: "g", price: "25000" },
    ],
  },
  {
    name: "Медовик",
    yieldCount: "10",
    ingredients: [
      { name: "Мука", amount: "500", unit: "g", price: "10000" },
      { name: "Мёд", amount: "150", unit: "g", price: "60000" },
      { name: "Сахар", amount: "200", unit: "g", price: "15000" },
      { name: "Яйца", amount: "3", unit: "pcs", price: "2000" },
      { name: "Сливочное масло", amount: "100", unit: "g", price: "90000" },
      { name: "Сметана", amount: "600", unit: "g", price: "30000" },
    ],
  },
  {
    name: "Бисквитный торт",
    yieldCount: "8",
    ingredients: [
      { name: "Мука", amount: "200", unit: "g", price: "10000" },
      { name: "Сахар", amount: "200", unit: "g", price: "15000" },
      { name: "Яйца", amount: "6", unit: "pcs", price: "2000" },
      { name: "Сливки", amount: "400", unit: "g", price: "65000" },
    ],
  },
  {
    name: "Печенье",
    yieldCount: "20",
    ingredients: [
      { name: "Мука", amount: "400", unit: "g", price: "10000" },
      { name: "Сахар", amount: "150", unit: "g", price: "15000" },
      { name: "Сливочное масло", amount: "150", unit: "g", price: "90000" },
      { name: "Яйца", amount: "2", unit: "pcs", price: "2000" },
    ],
  },
  {
    name: "Булочки",
    yieldCount: "12",
    ingredients: [
      { name: "Мука", amount: "1000", unit: "g", price: "10000" },
      { name: "Молоко", amount: "400", unit: "g", price: "12000" },
      { name: "Сахар", amount: "100", unit: "g", price: "15000" },
      { name: "Яйца", amount: "2", unit: "pcs", price: "2000" },
      { name: "Дрожжи", amount: "15", unit: "g", price: "50000" },
      { name: "Сливочное масло", amount: "100", unit: "g", price: "90000" },
    ],
  },
  {
    name: "Хлеб",
    yieldCount: "2",
    ingredients: [
      { name: "Мука", amount: "1000", unit: "g", price: "10000" },
      { name: "Дрожжи", amount: "10", unit: "g", price: "50000" },
      { name: "Соль", amount: "20", unit: "g", price: "5000" },
      { name: "Сахар", amount: "20", unit: "g", price: "15000" },
    ],
  },
  {
    name: "Самса",
    yieldCount: "10",
    ingredients: [
      { name: "Мука", amount: "700", unit: "g", price: "10000" },
      { name: "Мясо", amount: "600", unit: "g", price: "90000" },
      { name: "Лук", amount: "300", unit: "g", price: "5000" },
      { name: "Растительное масло", amount: "100", unit: "g", price: "25000" },
    ],
  },
];

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#986b7b]">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-bold tracking-tight text-[#35252c] sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#81717a]">{description}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-[#f1e5ea] p-4 text-[#583444] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-xs font-medium leading-5 opacity-80 sm:text-sm">
          {label}
        </span>
        <Icon size={19} className="shrink-0 opacity-80" />
      </div>
      <div className="break-words text-xl font-bold sm:text-2xl">{value}</div>
    </div>
  );
}

function translateIngredientName(name: string): string {
  const translations: Record<string, string> = {
    flour: "Мука",
    "all-purpose flour": "Пшеничная мука",
    "plain flour": "Пшеничная мука",
    sugar: "Сахар",
    "granulated sugar": "Сахар",
    "powdered sugar": "Сахарная пудра",
    salt: "Соль",
    eggs: "Яйца",
    egg: "Яйцо",
    butter: "Сливочное масло",
    "unsalted butter": "Сливочное масло",
    milk: "Молоко",
    water: "Вода",
    cream: "Сливки",
    "heavy cream": "Жирные сливки",
    "whipping cream": "Сливки для взбивания",
    "sour cream": "Сметана",
    yeast: "Дрожжи",
    "baking powder": "Разрыхлитель",
    "baking soda": "Пищевая сода",
    vanilla: "Ваниль",
    "vanilla extract": "Ванильный экстракт",
    honey: "Мёд",
    cocoa: "Какао",
    "cocoa powder": "Какао-порошок",
    chocolate: "Шоколад",
    "dark chocolate": "Тёмный шоколад",
    "vegetable oil": "Растительное масло",
    oil: "Масло",
    starch: "Крахмал",
    cornstarch: "Кукурузный крахмал",
    "cream cheese": "Сливочный сыр",
    cheese: "Сыр",
    yogurt: "Йогурт",
    yoghurt: "Йогурт",
    cinnamon: "Корица",
    lemon: "Лимон",
    "lemon juice": "Лимонный сок",
    apples: "Яблоки",
    apple: "Яблоко",
    strawberries: "Клубника",
    strawberry: "Клубника",
    raspberries: "Малина",
    raspberry: "Малина",
    almonds: "Миндаль",
    almond: "Миндаль",
    walnuts: "Грецкие орехи",
    raisins: "Изюм",
    raisin: "Изюм",
    "condensed milk": "Сгущённое молоко",
    "sweetened condensed milk": "Сгущённое молоко",
    "puff pastry": "Слоёное тесто",
    pastry: "Тесто",
    dough: "Тесто",
    "bread flour": "Хлебопекарная мука",
    "almond flour": "Миндальная мука",
    "brown sugar": "Коричневый сахар",
    "icing sugar": "Сахарная пудра",
    "maple syrup": "Кленовый сироп",
    gelatin: "Желатин",
    jam: "Варенье",
    "tomato paste": "Томатная паста",
  };

  const cleaned = name
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[,;]+$/g, "")
    .trim();

  if (translations[cleaned]) return translations[cleaned];

  return name.replace(/^\s*[-•]\s*/, "").trim();
}


function parseIngredientAmount(item: ApiRecipeIngredient): {
  name: string;
  amount: string;
  unit: Unit;
} {
  const rawName = String(item.localName ?? item.name ?? "").trim();
  const rawDisplay = String(item.display ?? "").trim();
  const rawOriginal = String(item.original ?? "").trim();

  const candidates = [rawOriginal, rawDisplay, rawName].filter(Boolean);
  const ingredientText = candidates.join(" ").toLowerCase();

  let amount = "";
  let unit: Unit = "g";

  function parseNumber(value: string): number {
    const normalized = value.replace(",", ".").trim();

    if (normalized.includes(" ")) {
      const parts = normalized.split(/\s+/);
      const fraction = parts[1]?.split("/");

      if (fraction?.length === 2) {
        return Number(parts[0]) +
          Number(fraction[0]) / Number(fraction[1]);
      }
    }

    if (normalized.includes("/")) {
      const parts = normalized.split("/");
      return Number(parts[0]) / Number(parts[1]);
    }

    return Number(normalized);
  }

  const isEgg = /egg|ägg|яйц/i.test(ingredientText);

  const isLiquid =
    /water|milk|cream|juice|oil|vinegar|syrup|honey|молок|сливк|вода|сок|масл[ао]? растительн|уксус|сироп/i.test(
      ingredientText
    );

  const spoonWeights: Record<string, number> = {
    flour: 8,
    "wheat flour": 8,
    sugar: 12.5,
    salt: 18,
    "garlic powder": 9,
    "baking powder": 12,
    "baking soda": 14,
    cocoa: 6,
    starch: 8,
    yeast: 9,
    cinnamon: 7,
    мука: 8,
    сахар: 12.5,
    соль: 18,
    "чесночный порошок": 9,
    чеснок: 9,
    разрыхлитель: 12,
    сода: 14,
    какао: 6,
    крахмал: 8,
    дрожжи: 9,
    корица: 7,
  };

  function getSpoonWeight(): number {
    for (const [name, weight] of Object.entries(spoonWeights)) {
      if (ingredientText.includes(name)) return weight;
    }

    return 10;
  }

  function normalizeUnit(
    value: string
  ): { multiplier: number; unit: Unit } | null {
    const u = value.toLowerCase().trim().replace(/\.$/, "");

    if (/^(kg|kgs|kilograms?)$/.test(u)) {
      return { multiplier: 1, unit: "kg" };
    }

    if (/^(g|gr|grams?)$/.test(u)) {
      return { multiplier: 1, unit: "g" };
    }

    if (/^(oz|ounces?)$/.test(u)) {
      return { multiplier: 28.3495, unit: "g" };
    }

    if (/^(lb|lbs|pounds?)$/.test(u)) {
      return { multiplier: 453.592, unit: "g" };
    }

    if (/^(ml|milliliters?|millilitres?)$/.test(u)) {
      return { multiplier: 1, unit: "ml" };
    }

    if (/^(dl|deciliters?|decilitres?)$/.test(u)) {
      return { multiplier: 100, unit: "ml" };
    }

    if (/^(cl|centiliters?|centilitres?)$/.test(u)) {
      return { multiplier: 10, unit: "ml" };
    }

    if (/^(tbsp|tablespoons?|msk)$/.test(u)) {
      return isLiquid
        ? { multiplier: 15, unit: "ml" }
        : { multiplier: getSpoonWeight(), unit: "g" };
    }

    if (/^(tsp|teaspoons?|tsk)$/.test(u)) {
      return isLiquid
        ? { multiplier: 5, unit: "ml" }
        : { multiplier: getSpoonWeight() / 3, unit: "g" };
    }

    if (/^(cup|cups)$/.test(u)) {
      if (isLiquid) return { multiplier: 240, unit: "ml" };

      return {
        multiplier: getSpoonWeight() * 16,
        unit: "g",
      };
    }

    if (/^(krm)$/.test(u)) {
      return { multiplier: isLiquid ? 1 : getSpoonWeight() / 15, unit: isLiquid ? "ml" : "g" };
    }

    if (/^(pc|pcs|piece|pieces|each|egg|eggs|st|package|packages)$/.test(u)) {
      return { multiplier: 1, unit: "pcs" };
    }

    return null;
  }

  const prefixPattern =
    /^\s*(?:ca\.?\s*)?(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?)\s*(kg|kgs|kilograms?|g|gr|grams?|oz|ounces?|lb|lbs|pounds?|ml|milliliters?|millilitres?|dl|deciliters?|decilitres?|cl|centiliters?|centilitres?|tbsp|tablespoons?|msk|tsp|teaspoons?|tsk|cup|cups|krm|pcs?|pieces?|each|eggs?|st\.?|packages?)\b/i;

  let textUnit = "";

  for (const candidate of candidates) {
    const match = candidate.match(prefixPattern);

    if (match) {
      textUnit = match[2];
      break;
    }
  }

  const rawValue = item.quantity?.value;
  const rawUnit = String(item.quantity?.unit ?? "").trim();

  if (rawValue !== undefined && rawValue !== null) {
    const numericValue = parseNumber(String(rawValue));
    const normalized = normalizeUnit(rawUnit || textUnit);

    if (Number.isFinite(numericValue) && numericValue >= 0) {
      if (normalized) {
        amount = String(
          Number((numericValue * normalized.multiplier).toFixed(3))
        );
        unit = normalized.unit;
      } else {
        amount = String(numericValue);
        unit = isEgg ? "pcs" : isLiquid ? "ml" : "g";
      }
    }
  }

  if (!amount) {
    for (const candidate of candidates) {
      const match = candidate.match(prefixPattern);

      if (match) {
        const numericValue = parseNumber(match[1]);
        const normalized = normalizeUnit(match[2]);

        if (
          Number.isFinite(numericValue) &&
          numericValue >= 0 &&
          normalized
        ) {
          amount = String(
            Number((numericValue * normalized.multiplier).toFixed(3))
          );
          unit = normalized.unit;
          break;
        }
      }

      const bareNumber = candidate.match(
        /^\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?)\s*$/
      );

      if (bareNumber) {
        const numericValue = parseNumber(bareNumber[1]);

        if (Number.isFinite(numericValue) && numericValue >= 0) {
          amount = String(numericValue);
          unit = isEgg ? "pcs" : isLiquid ? "ml" : "g";
          break;
        }
      }
    }
  }

  let name = rawName || rawDisplay || rawOriginal || "Ингредиент";

  if (!rawName) {
    name = name.replace(prefixPattern, "");
  }

  name = name
    .replace(/^[\s,;:–—-]+|[\s,;:–—-]+$/g, "")
    .trim();

  return {
    name: translateIngredientName(name || rawName || "Ингредиент"),
    amount,
    unit,
  };
}


export default function Home() {
  const [tab, setTab] = useState<"cost" | "finance">("cost");

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: "Мука", amount: "500", unit: "g", price: "10000" },
    { id: 2, name: "Сахар", amount: "200", unit: "g", price: "15000" },
    { id: 3, name: "Яйца", amount: "3", unit: "pcs", price: "2000" },
  ]);

  const [yieldCount, setYieldCount] = useState("10");
  const [targetYield, setTargetYield] = useState("");
  const [manualCost, setManualCost] = useState("");
  const [productName, setProductName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [utilityCost, setUtilityCost] = useState("0");
  const [recipeSearch, setRecipeSearch] = useState("");
  const [apiRecipes, setApiRecipes] = useState<ApiRecipe[]>([]);
  const [isSearchingRecipes, setIsSearchingRecipes] = useState(false);
  const [recipeSearchError, setRecipeSearchError] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [saleDate, setSaleDate] = useState(today());
  const [saleProductId, setSaleProductId] = useState("");
  const [saleQuantity, setSaleQuantity] = useState("1");
  const [salePrice, setSalePrice] = useState("");

  const [expenseDate, setExpenseDate] = useState(today());
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const [period, setPeriod] = useState<Period>("today");
  const [fromDate, setFromDate] = useState(today());
  const [toDate, setToDate] = useState(today());
  const [notice, setNotice] = useState("");

  // Граммы и миллилитры пересчитываются по цене за килограмм и литр.
  const yieldMultiplier = useMemo(() => {
  const original = Number(yieldCount);
  const target = Number(targetYield);

  if (
    !Number.isFinite(original) ||
    original <= 0 ||
    !Number.isFinite(target) ||
    target <= 0
  ) {
    return 1;
  }

  return target / original;
}, [yieldCount, targetYield]);
  const ingredientTotal = useMemo(
  () =>
    ingredients.reduce((sum, item) => {
      const amount =
        Math.max(0, Number(item.amount) || 0) * yieldMultiplier;
      const price = Math.max(0, Number(item.price) || 0);

      const multiplier =
        item.unit === "g" || item.unit === "ml" ? 0.001 : 1;

      return sum + amount * price * multiplier;
    }, 0),
  [ingredients, yieldMultiplier]
);

  const totalBatchCost =
    ingredientTotal + Math.max(0, Number(utilityCost) || 0);

  const calculatedCost =
    manualCost.trim() !== "" &&
    Number.isFinite(Number(manualCost)) &&
    Number(manualCost) >= 0
      ? Number(manualCost)
      : totalBatchCost / Math.max(1, Number(yieldCount) || 1);

  const filteredSales = useMemo(
    () =>
      sales.filter((sale) => {
        if (period === "today") return sale.date === today();
        if (period === "month")
          return sale.date.slice(0, 7) === today().slice(0, 7);
        return sale.date >= fromDate && sale.date <= toDate;
      }),
    [sales, period, fromDate, toDate]
  );

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        if (period === "today") return expense.date === today();
        if (period === "month")
          return expense.date.slice(0, 7) === today().slice(0, 7);
        return expense.date >= fromDate && expense.date <= toDate;
      }),
    [expenses, period, fromDate, toDate]
  );

  const revenue = filteredSales.reduce(
    (sum, sale) => sum + sale.price * sale.quantity,
    0
  );

  const goodsCost = filteredSales.reduce(
    (sum, sale) => sum + sale.cost * sale.quantity,
    0
  );

  const expenseTotal = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const profit = revenue - goodsCost - expenseTotal;

  function updateIngredient(id: number, key: keyof Ingredient, value: string) {
    setIngredients((current) =>
      current.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  }

  function addIngredient() {
    setIngredients((current) => [
      ...current,
      { id: Date.now(), name: "", amount: "", unit: "g", price: "" },
    ]);
  }

  function applyRecipe(recipe: Recipe) {
    setIngredients(
      recipe.ingredients.map((item, index) => ({
        ...item,
        id: Date.now() + index,
      }))
    );

    setProductName(recipe.name);
    setYieldCount(recipe.yieldCount);
    setManualCost("");
    setRecipeSearch(recipe.name);
    setNotice(
      `Загружен пример рецепта «${recipe.name}». Проверьте количества и цены.`
    );
  }

  async function searchOnlineRecipes(query: string) {
  const search = query.trim();

  if (search.length < 2) {
    setApiRecipes([]);
    setRecipeSearchError("Введите название изделия минимум из 2 символов.");
    return;
  }

  const normalize = (value: string) =>
    value
      .toLocaleLowerCase("ru-RU")
      .replace(/ё/g, "е")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim()
      .replace(/\s+/g, " ");

  const normalizedSearch = normalize(search);

  setIsSearchingRecipes(true);
  setRecipeSearchError("");
  setApiRecipes([]);

  try {
    // Сначала ищем среди встроенных рецептов.
    const localRecipe = recipes.find((recipe) => {
      const name = normalize(recipe.name);

      return (
        name === normalizedSearch ||
        name.includes(normalizedSearch) ||
        normalizedSearch.includes(name)
      );
    });

    if (localRecipe) {
      applyRecipe(localRecipe);
      setRecipeSearch(search);
      return;
    }

    // Если встроенного рецепта нет — обращаемся к Racion.
    const response = await fetch(
      `/api/recipes?query=${encodeURIComponent(search)}`,
      { cache: "no-store" }
    );

    const data: ApiRecipeResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Не удалось найти рецепт.");
    }

    const recipeResults = Array.isArray(data.results)
      ? data.results
      : Array.isArray(data.tinyPlatesResponse?.results)
        ? data.tinyPlatesResponse.results
        : [];

    const bestRecipe = recipeResults.find((recipe) => {
      if (
        !recipe.title ||
        !Array.isArray(recipe.ingredients) ||
        recipe.ingredients.length === 0
      ) {
        return false;
      }

      const title = normalize(recipe.title);

      return (
        title === normalizedSearch ||
        title.includes(normalizedSearch) ||
        normalizedSearch.includes(title)
      );
    });

    if (!bestRecipe) {
      setRecipeSearchError(
        data.error ||
          "Подходящий рецепт не найден. Попробуйте другое название."
      );
      return;
    }

    applyOnlineRecipe(bestRecipe);
    setRecipeSearch(search);
  } catch (error) {
    setRecipeSearchError(
      error instanceof Error
        ? error.message
        : "Ошибка поиска рецепта."
    );
  } finally {
    setIsSearchingRecipes(false);
  }
}

  function applyOnlineRecipe(recipe: ApiRecipe) {
  const sourceIngredients = recipe.ingredients ?? [];

  const parsedIngredients: Ingredient[] = sourceIngredients
    .map((item, index) => {
      const name = item.name?.trim() || "Ингредиент";

      // Racion передаёт количество внутри quantity.
      const amount = item.quantity?.value ?? item.amount;

      const rawUnit = item.quantity?.unit ?? item.unit;

      const unit: Ingredient["unit"] =
        rawUnit === "g" || rawUnit === "ml" || rawUnit === "pcs"
          ? rawUnit
          : "g";

      if (
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return null;
      }

     return {
  id: Date.now() + index,
  name,
  amount: String(amount),
  unit,
  price: String(findIngredientPrice(name)),
};
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (parsedIngredients.length === 0) {
    setRecipeSearchError(
      "Рецепт найден, но количества ингредиентов не удалось прочитать."
    );
    return;
  }

  setIngredients(parsedIngredients);
  setProductName(recipe.title ?? "");
  setManualCost("");
  setYieldCount("1");

  setNotice(
    "Рецепт загружен. Проверьте количества и единицы измерения. Введите закупочные цены ингредиентов для расчёта стоимости."
  );
}

  function handleProductNameChange(value: string) {
    setProductName(value);
  }

  function saveProduct() {
    if (!productName.trim()) {
      setNotice("Укажите название изделия.");
      return;
    }

    if (
      sellingPrice.trim() === "" ||
      !Number.isFinite(Number(sellingPrice)) ||
      Number(sellingPrice) < 0
    ) {
      setNotice("Укажите корректную цену продажи.");
      return;
    }

    const product: Product = {
      id: Date.now(),
      name: productName.trim(),
      cost: Math.max(0, calculatedCost),
      price: Number(sellingPrice),
    };

    setProducts((current) => [...current, product]);
    setSaleProductId(String(product.id));
    setSalePrice(String(product.price));
    setProductName("");
    setSellingPrice("");
    setManualCost("");
    setNotice("Изделие добавлено в список.");
  }

  function addSale() {
    const product = products.find(
      (item) => item.id === Number(saleProductId)
    );

    if (!product) {
      setNotice("Сначала добавьте изделие в калькуляторе.");
      return;
    }

    if (
      !saleDate ||
      !Number.isFinite(Number(saleQuantity)) ||
      Number(saleQuantity) <= 0 ||
      !salePrice.trim() ||
      !Number.isFinite(Number(salePrice)) ||
      Number(salePrice) < 0
    ) {
      setNotice("Проверьте дату, количество и цену продажи.");
      return;
    }

    setSales((current) => [
      ...current,
      {
        id: Date.now(),
        date: saleDate,
        productId: product.id,
        productName: product.name,
        quantity: Number(saleQuantity),
        price: Number(salePrice),
        cost: product.cost,
      },
    ]);

    setNotice("Продажа добавлена.");
    setSaleQuantity("1");
  }

  function addExpense() {
    if (
      !expenseDate ||
      !expenseName.trim() ||
      !Number.isFinite(Number(expenseAmount)) ||
      Number(expenseAmount) <= 0
    ) {
      setNotice("Укажите дату, название и положительную сумму расхода.");
      return;
    }

    setExpenses((current) => [
      ...current,
      {
        id: Date.now(),
        date: expenseDate,
        name: expenseName.trim(),
        amount: Number(expenseAmount),
      },
    ]);

    setExpenseName("");
    setExpenseAmount("");
    setNotice("Расход добавлен.");
  }

  function exportPdf() {
    setNotice("");
    window.setTimeout(() => window.print(), 100);
  }

  const reportPeriod =
    period === "today"
      ? `За ${today()}`
      : period === "month"
        ? `За месяц: ${today().slice(0, 7)}`
        : `С ${fromDate} по ${toDate}`;

  return (
    <main className="min-h-screen bg-[#f5eef1] text-[#35252c]">
      <div className="no-print mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        <header className="mb-7 overflow-hidden rounded-3xl bg-[#450914] text-white shadow-lg">
          <div className="relative p-5 sm:p-8">
            <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border border-white/10" />

            <div className="relative flex items-center gap-4">
              <img
                src="/modigul-logo.png"
                alt="Modigul Accounting"
                className="h-20 w-20 shrink-0 rounded-full object-cover sm:h-24 sm:w-24"
              />

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.23em] text-[#f0d5df]">
                  Учёт кондитерской
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  Modigul Accounting
                </h1>
              </div>
            </div>

            <p className="relative mt-5 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
              Себестоимость, продажи и прибыль — в одном удобном месте.
            </p>

            <div className="relative mt-5 flex justify-end">
              <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2">
                <span className="text-xs font-semibold text-[#f0d5df]">Modigul профиль</span>
                <a
                  href="https://t.me/Modigulproducts"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram Modigul"
                  title="Telegram Modigul"
                  className="rounded-full p-1.5 text-white transition hover:bg-white/15 hover:text-[#f0d5df]"
                >
                  <Send size={19} strokeWidth={2} />
                </a>
                <a
                  href="https://www.instagram.com/modigul_official/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Modigul"
                  title="Instagram Modigul"
                  className="rounded-full p-1.5 text-white transition hover:bg-white/15 hover:text-[#f0d5df]"
                >
                  <Instagram size={20} strokeWidth={2} />
                </a>
              </div>
            </div>
          </div>
        </header>

        <nav className="mb-7 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => {
              setTab("cost");
              setNotice("");
            }}
            className={`flex w-full min-w-0 box-border min-h-[76px] items-center gap-3 rounded-2xl border p-4 text-left transition ${
              tab === "cost"
                ? "border-[#781f3b] bg-white shadow-md"
                : "border-[#e8dce1] bg-[#f1e5ea] hover:bg-white"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                tab === "cost"
                  ? "bg-[#781f3b] text-white"
                  : "bg-white text-[#781f3b]"
              }`}
            >
              <Calculator size={21} />
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-bold">Себестоимость</span>
              <span className="mt-1 block text-xs text-[#81717a]">
                Расчёт изделий
              </span>
            </span>
          </button>

          <button
            onClick={() => {
              setTab("finance");
              setNotice("");
            }}
            className={`flex w-full min-w-0 box-border min-h-[76px] items-center gap-3 rounded-2xl border p-4 text-left transition ${
              tab === "finance"
                ? "border-[#781f3b] bg-white shadow-md"
                : "border-[#e8dce1] bg-[#f1e5ea] hover:bg-white"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                tab === "finance"
                  ? "bg-[#781f3b] text-white"
                  : "bg-white text-[#781f3b]"
              }`}
            >
              <ChartNoAxesCombined size={21} />
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-bold">Продажи и прибыль</span>
              <span className="mt-1 block text-xs text-[#81717a]">
                Финансовый учёт
              </span>
            </span>
          </button>
        </nav>

        {notice && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-[#e8cbd5] bg-[#fff7fa] px-4 py-3 text-sm text-[#781f3b]"
          >
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              className="shrink-0 font-bold"
              aria-label="Закрыть уведомление"
            >
              ×
            </button>
          </div>
        )}

        {tab === "cost" && (
          <>
            <SectionTitle
              eyebrow="Раздел 01"
              title="Калькулятор себестоимости"
              description="Выберите пример рецепта или найдите рецепт в интернете. Все ингредиенты, количества и цены можно редактировать."
            />

            <section className="mb-5 rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1e5ea] text-[#781f3b]">
                  <Search size={20} />
                </div>

                <div>
                  <h3 className="font-bold">Поиск рецепта</h3>
                  <p className="mt-1 text-xs text-[#81717a]">
                    Поиск через интернет или выбор примера
                  </p>
                </div>
              </div>

              <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                Название изделия или рецепта
                <input
                  className={`${field} mt-1.5`}
                  placeholder="Например, Napoleon cake"
                  value={recipeSearch}
                  onChange={(e) => {
                    setRecipeSearch(e.target.value);
                    setRecipeSearchError("");
                  }}
                />
              </label>

              <button
                className={`${buttonPrimary} mt-3 w-full`}
                onClick={() => searchOnlineRecipes(recipeSearch)}
                disabled={
                  isSearchingRecipes || recipeSearch.trim().length < 2
                }
              >
                <Search size={17} />
                {isSearchingRecipes
                  ? "Ищем подходящий рецепт..."
                  : "Найти классический рецепт"}
              </button>
<label className="mt-3 block min-w-0 text-xs font-semibold text-[#6f5b4e]">
  Сколько изделий нужно приготовить?
  <input
    className={`${field} mt-1.5`}
    type="number"
    min="1"
    step="1"
    inputMode="numeric"
    placeholder="Введите количество"
    value={targetYield}
    onChange={(e) => setTargetYield(e.target.value)}
  />
</label>
              {recipeSearchError && (
                <p
                  role="status"
                  className="mt-3 rounded-xl bg-[#fff7fa] p-3 text-sm text-[#781f3b]"
                >
                  {recipeSearchError}
                </p>
              )}

              <div className="mt-5 border-t border-[#eee5ea] pt-4">
                <h4 className="mb-3 text-sm font-bold text-[#50343f]">
                  Примеры рецептов
                </h4>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {recipes.map((recipe) => (
                    <button
                      key={recipe.name}
                      onClick={() => applyRecipe(recipe)}
                      className="min-h-11 rounded-xl border border-[#e8dce1] bg-[#fffafb] px-3 py-2 text-sm font-semibold text-[#781f3b] transition hover:bg-[#f5e8ed]"
                    >
                      {recipe.name}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-[#81717a]">
                Интернет-рецепты могут иметь другие единицы измерения и выход.
                Проверяйте состав и количества перед расчётом. Примеры
                рецептов ориентировочные.
              </p>
            </section>

            <section className="mb-5 rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1e5ea] text-[#781f3b]">
                  <Package size={20} />
                </div>

                <div>
                  <h3 className="font-bold">Состав рецепта</h3>
                  <p className="mt-1 text-xs text-[#81717a]">
                    Цена за килограмм, литр или штуку
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {ingredients.map((item, index) => {
                  const amount = Math.max(0, Number(item.amount) || 0);
                  const price = Math.max(0, Number(item.price) || 0);

                  const ingredientCost =
                    amount *
                    price *
                    (item.unit === "g" || item.unit === "ml" ? 0.001 : 1);

                  return (
                    <div
                      key={item.id}
                      className="min-w-0 rounded-2xl border border-[#eee5ea] bg-[#fffafb] p-3 sm:p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#986b7b]">
                          Ингредиент {index + 1}
                        </span>

                        <button
                          onClick={() =>
                            setIngredients((current) =>
                              current.filter((entry) => entry.id !== item.id)
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#a56b7a] hover:bg-[#f8e9ee]"
                          aria-label="Удалить ингредиент"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      <label className="mb-3 block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                        Название
                        <input
                          className={`${field} mt-1.5`}
                          placeholder="Например, мука"
                          value={item.name}
                          onChange={(e) =>
                            updateIngredient(item.id, "name", e.target.value)
                          }
                        />
                      </label>

                      <div className="grid min-w-0 grid-cols-2 gap-3">
                        <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                          Количество
                          <input
                            className={`${field} mt-1.5`}
                            type="number"
                            min="0"
                            step="any"
                            inputMode="decimal"
                            placeholder="0"
                            value={item.amount}
                            onChange={(e) =>
                              updateIngredient(
                                item.id,
                                "amount",
                                e.target.value
                              )
                            }
                          />
                        </label>
{targetYield.trim() !== "" &&
  Number(targetYield) > 0 &&
  Number(yieldCount) > 0 && (
    <p className="mt-2 text-xs font-semibold text-[#781f3b]">
      Для {targetYield} изделий:{" "}
      {(
        (Number(item.amount) || 0) * yieldMultiplier
      ).toLocaleString("ru-RU", {
        maximumFractionDigits: 2,
      })}{" "}
      {item.unit === "pcs"
        ? "шт."
        : item.unit === "ml"
          ? "мл"
          : item.unit === "kg"
            ? "кг"
            : "г"}
    </p>
  )}
                        <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                          Единица
                          <select
                            className={`${field} mt-1.5`}
                            value={item.unit}
                            onChange={(e) =>
                              updateIngredient(
                                item.id,
                                "unit",
                                e.target.value as Unit
                              )
                            }
                          >
                            <option value="g">Граммы (г)</option>
                            <option value="kg">Килограммы (кг)</option>
                            <option value="ml">Миллилитры (мл)</option>
                            <option value="pcs">Штуки (шт.)</option>
                          </select>
                        </label>
                      </div>

                      <label className="mt-3 block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                        {item.unit === "pcs"
                          ? "Цена за 1 штуку (сум)"
                          : item.unit === "ml"
                            ? "Цена за 1 литр (сум)"
                            : "Цена за 1 кг (сум)"}
                        <input
                          className={`${field} mt-1.5`}
                          type="number"
                          min="0"
                          step="any"
                          inputMode="decimal"
                          placeholder="0"
                          value={item.price}
                          onChange={(e) =>
                            updateIngredient(item.id, "price", e.target.value)
                          }
                        />
                      </label>

                      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#f1e5ea] px-3 py-2.5">
                        <span className="text-xs text-[#765666]">
                          Стоимость ингредиента
                        </span>
                        <span className="text-sm font-bold text-[#58152b]">
                          {money(ingredientCost)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                className={`${buttonSecondary} mt-4 w-full`}
                onClick={addIngredient}
              >
                <Plus size={17} />
                Добавить ингредиент
              </button>

              <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
  <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
    Исходное количество изделий в рецепте
    <input
      className={`${field} mt-1.5`}
      type="number"
      min="1"
      step="1"
      inputMode="numeric"
      value={yieldCount}
      onChange={(e) => setYieldCount(e.target.value)}
    />
  </label>

 <div className="rounded-xl bg-[#f1e5ea] p-4">
    <span className="text-xs font-medium text-[#765666]">
      Общая стоимость ингредиентов
    </span>
    <p className="mt-2 text-xl font-bold text-[#58152b]">
      {money(ingredientTotal)}
    </p>
  </div>
</div>
            </section>

            <section className="mb-5 rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1e5ea] text-[#781f3b]">
                  <Flame size={20} />
                </div>

                <div>
                  <h3 className="font-bold">Электричество и газ</h3>
                  <p className="mt-1 text-xs text-[#81717a]">
                    Затраты на всю партию
                  </p>
                </div>
              </div>

              <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                Электричество и газ на одну партию (сум)
                <input
                  className={`${field} mt-1.5`}
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  placeholder="0"
                  value={utilityCost}
                  onChange={(e) => setUtilityCost(e.target.value)}
                />
              </label>

              <p className="mt-2 text-xs leading-5 text-[#81717a]">
                Введите стоимость энергии для одной партии. Тарифы не
                загружаются автоматически.
              </p>

              <div className="mt-4 rounded-xl bg-[#f1e5ea] p-4">
                <span className="text-xs text-[#765666]">
                  Ингредиенты плюс коммунальные затраты
                </span>
                <p className="mt-2 text-xl font-bold text-[#58152b]">
                  {money(totalBatchCost)}
                </p>
              </div>
            </section>

            <section className="mb-5 rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1e5ea] text-[#781f3b]">
                  <CircleDollarSign size={20} />
                </div>

                <div>
                  <h3 className="font-bold">Стоимость одного изделия</h3>
                  <p className="mt-1 text-xs text-[#81717a]">
                    Можно указать себестоимость вручную
                  </p>
                </div>
              </div>

              <label className="mb-4 block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                Себестоимость одного изделия вручную (сум)
                <input
                  className={`${field} mt-1.5`}
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  placeholder="Оставьте пустым для расчёта по рецепту"
                  value={manualCost}
                  onChange={(e) => setManualCost(e.target.value)}
                />
              </label>

              <div className="rounded-2xl bg-[#58152b] p-5 text-white">
                <p className="text-sm text-white/70">
                  Себестоимость одного изделия
                </p>
                <p className="mt-2 break-words text-3xl font-bold sm:text-4xl">
                  {money(calculatedCost)}
                </p>
                <p className="mt-2 text-xs leading-5 text-white/70">
                  {manualCost.trim() !== ""
                    ? "Используется указанная вами себестоимость."
                    : "Ингредиенты и коммунальные затраты разделены на количество изделий."}
                </p>
              </div>

              <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                  Название изделия
                  <input
                    className={`${field} mt-1.5`}
                    placeholder="Например, Наполеон"
                    value={productName}
                    onChange={(e) => handleProductNameChange(e.target.value)}
                  />
                </label>

                <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                  Цена продажи (сум)
                  <input
                    className={`${field} mt-1.5`}
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    placeholder="Например, 45000"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                  />
                </label>
              </div>

              <button
                className={`${buttonPrimary} mt-4 w-full`}
                onClick={saveProduct}
              >
                <Plus size={17} />
                Добавить изделие в список
              </button>
            </section>

            <section className="rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold">
                <ShoppingBag size={19} className="text-[#781f3b]" />
                Список изделий
              </h3>

              {products.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#dfcbd3] px-4 py-8 text-center">
                  <Package size={27} className="mx-auto text-[#b8a1ab]" />
                  <p className="mt-3 text-sm font-semibold text-[#6f5b6a]">
                    Пока нет добавленных изделий
                  </p>
                  <p className="mt-1 text-xs text-[#9b8490]">
                    Заполните название и цену выше
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-[#fffafb] p-3 sm:p-4"
                    >
                      <div className="min-w-0">
                        <p className="break-words font-bold">{product.name}</p>
                        <p className="mt-1 text-xs text-[#81717a]">
                          Себестоимость: {money(product.cost)}
                        </p>
                        <p className="mt-1 text-xs text-[#81717a]">
                          Цена продажи: {money(product.price)}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setProducts((current) =>
                            current.filter((p) => p.id !== product.id)
                          );
                          setNotice("Изделие удалено из списка.");
                        }}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#a56b7a] hover:bg-[#f8e9ee]"
                        aria-label="Удалить изделие"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {tab === "finance" && (
          <>
            <SectionTitle
              eyebrow="Раздел 02"
              title="Продажи и прибыль"
              description="Добавляйте продажи и расходы, выбирайте период и смотрите финансовый результат."
            />

            <section className="mb-5 rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold">
                <ShoppingBag size={19} className="text-[#781f3b]" />
                Новая продажа
              </h3>

              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block min-w-0 w-full text-xs font-semibold text-[#6f5b4e]">
                  Дата продажи
                  <input
                    className={`${field} mt-1.5 block w-full overflow-hidden`}
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                  />
                </label>

                <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                  Изделие
                  <select
                    className={`${field} mt-1.5`}
                    value={saleProductId}
                    onChange={(e) => {
                      setSaleProductId(e.target.value);
                      const selected = products.find(
                        (p) => p.id === Number(e.target.value)
                      );
                      if (selected) setSalePrice(String(selected.price));
                    }}
                  >
                    <option value="">Выберите изделие</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                  Количество
                  <input
                    className={`${field} mt-1.5`}
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={saleQuantity}
                    onChange={(e) => setSaleQuantity(e.target.value)}
                  />
                </label>

                <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                  Цена за единицу (сум)
                  <input
                    className={`${field} mt-1.5`}
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                  />
                </label>
              </div>

              <button
                className={`${buttonPrimary} mt-4 w-full`}
                onClick={addSale}
                disabled={products.length === 0}
              >
                <Plus size={17} />
                Добавить продажу
              </button>

              {products.length === 0 && (
                <p className="mt-3 text-xs leading-5 text-[#9b7988]">
                  Сначала добавьте изделия в разделе «Себестоимость».
                </p>
              )}
            </section>

            <section className="mb-5 rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold">
                <ReceiptText size={19} className="text-[#781f3b]" />
                Дополнительный расход
              </h3>

              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                  Дата расхода
                  <input
                    className={`${field} mt-1.5`}
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                  />
                </label>

                <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                  Название расхода
                  <input
                    className={`${field} mt-1.5`}
                    placeholder="Например, доставка"
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                  />
                </label>

                <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e] sm:col-span-2">
                  Сумма расхода (сум)
                  <input
                    className={`${field} mt-1.5`}
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    placeholder="0"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                  />
                </label>
              </div>

              <button
                className={`${buttonSecondary} mt-4 w-full`}
                onClick={addExpense}
              >
                <Plus size={17} />
                Добавить расход
              </button>
            </section>

            <section className="mb-5 rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 font-bold">Период отчёта</h3>

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["today", "Сегодня"],
                    ["month", "Месяц"],
                    ["custom", "Период"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setPeriod(value)}
                    className={`min-h-11 rounded-xl border px-2 py-2 text-xs font-semibold transition sm:text-sm ${
                      period === value
                        ? "border-[#781f3b] bg-[#781f3b] text-white"
                        : "border-[#e8dce1] bg-white text-[#6f5b6a] hover:bg-[#faf3f6]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {period === "custom" && (
                <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                    Начало периода
                    <input
                      className={`${field} mt-1.5`}
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </label>

                  <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                    Конец периода
                    <input
                      className={`${field} mt-1.5`}
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </label>
                </div>
              )}
            </section>

            <section className="mb-5">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#986b7b]">
                  Финансовый результат
                </p>
                <h3 className="mt-1 text-lg font-bold">{reportPeriod}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Выручка" value={money(revenue)} icon={Wallet} />

                <StatCard
                  label="Себестоимость продаж"
                  value={money(goodsCost)}
                  icon={Package}
                />

                <StatCard
                  label="Дополнительные расходы"
                  value={money(expenseTotal)}
                  icon={ReceiptText}
                />

                <div className="min-w-0 rounded-2xl bg-[#e8f1e8] p-4 text-[#365b40] sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium leading-5 sm:text-sm">
                      Чистая прибыль
                    </span>
                    <TrendingUp size={19} />
                  </div>

                  <div className="break-words text-xl font-bold sm:text-2xl">
                    {money(profit)}
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-[#58152b] p-5 text-white">
                <p className="text-sm text-white/70">
                  Итоговая прибыль за период
                </p>

                <p className="mt-2 break-words text-3xl font-bold sm:text-4xl">
                  {money(profit)}
                </p>

                <p className="mt-3 text-xs leading-5 text-white/70">
                  Выручка − себестоимость проданных изделий − дополнительные
                  расходы.
                </p>
              </div>
            </section>

            <section className="mb-5 rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 font-bold">Продажи за выбранный период</h3>

              {filteredSales.length === 0 ? (
                <p className="rounded-xl bg-[#fffafb] px-4 py-6 text-center text-sm text-[#81717a]">
                  За этот период продаж пока нет.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex min-w-0 items-start justify-between gap-3 rounded-xl bg-[#fffafb] p-3"
                    >
                      <div className="min-w-0">
                        <p className="break-words text-sm font-bold">
                          {sale.productName}
                        </p>

                        <p className="mt-1 text-xs text-[#81717a]">
                          {sale.date} · {sale.quantity} шт. × {money(sale.price)}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold">
                          {money(sale.price * sale.quantity)}
                        </p>

                        <button
                          className="mt-2 text-xs text-[#a56b7a] underline"
                          onClick={() =>
                            setSales((current) =>
                              current.filter((item) => item.id !== sale.id)
                            )
                          }
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mb-5 rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 font-bold">
                Расходы за выбранный период
              </h3>

              {filteredExpenses.length === 0 ? (
                <p className="rounded-xl bg-[#fffafb] px-4 py-6 text-center text-sm text-[#81717a]">
                  За этот период дополнительных расходов пока нет.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex min-w-0 items-start justify-between gap-3 rounded-xl bg-[#fffafb] p-3"
                    >
                      <div className="min-w-0">
                        <p className="break-words text-sm font-bold">
                          {expense.name}
                        </p>

                        <p className="mt-1 text-xs text-[#81717a]">
                          {expense.date}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold">
                          {money(expense.amount)}
                        </p>

                        <button
                          className="mt-2 text-xs text-[#a56b7a] underline"
                          onClick={() =>
                            setExpenses((current) =>
                              current.filter((item) => item.id !== expense.id)
                            )
                          }
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <button
              className={`${buttonPrimary} w-full`}
              onClick={exportPdf}
            >
              <FileDown size={18} />
              Сохранить отчёт в PDF
            </button>
          </>
        )}
      </div>

      <div className="print-only">
        <h1>Modigul Accounting</h1>
        <h2>Финансовый отчёт кондитерской</h2>
        <p>Период: {reportPeriod}</p>
        <hr />

        <h3>Итоги</h3>

        <table>
          <tbody>
            <tr>
              <td>Выручка</td>
              <td>{money(revenue)}</td>
            </tr>

            <tr>
              <td>Себестоимость проданных изделий</td>
              <td>{money(goodsCost)}</td>
            </tr>

            <tr>
              <td>Дополнительные расходы</td>
              <td>{money(expenseTotal)}</td>
            </tr>

            <tr>
              <td>
                <strong>Чистая прибыль</strong>
              </td>
              <td>
                <strong>{money(profit)}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        <h3>Продажи</h3>

        <table>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Изделие</th>
              <th>Кол-во</th>
              <th>Цена</th>
              <th>Выручка</th>
              <th>Себестоимость</th>
            </tr>
          </thead>

          <tbody>
            {filteredSales.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.date}</td>
                <td>{sale.productName}</td>
                <td>{sale.quantity}</td>
                <td>{money(sale.price)}</td>
                <td>{money(sale.price * sale.quantity)}</td>
                <td>{money(sale.cost * sale.quantity)}</td>
              </tr>
            ))}

            {filteredSales.length === 0 && (
              <tr>
                <td colSpan={6}>За выбранный период продаж нет.</td>
              </tr>
            )}
          </tbody>
        </table>

        <h3>Дополнительные расходы</h3>

        <table>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Расход</th>
              <th>Сумма</th>
            </tr>
          </thead>

          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.date}</td>
                <td>{expense.name}</td>
                <td>{money(expense.amount)}</td>
              </tr>
            ))}

            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={3}>За выбранный период расходов нет.</td>
              </tr>
            )}
          </tbody>
        </table>

        <p className="print-footer">
          Отчёт сформирован в Modigul Accounting. Все суммы указаны в сумах.
        </p>
      </div>
    </main>
  );
}
