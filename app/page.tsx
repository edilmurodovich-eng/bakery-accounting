
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
  Wheat,
  CircleDollarSign,
  Flame,
  Search,
} from "lucide-react";

type Unit = "g" | "kg" | "pcs";
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
  display?: string;
  name?: string;
  original?: string;
  quantity?: {
    value?: number | string;
    unit?: string;
  };
};

type ApiRecipe = {
  title?: string;
  url?: string;
  language?: string;
  ingredients?: ApiRecipeIngredient[];
};

type ApiRecipeResponse = {
  results?: ApiRecipe[];
  error?: string;
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
  "block w-full min-w-0 max-w-full box-border rounded-xl border border-[#e8dce1] bg-white px-3 py-3 text-base text-[#35252c] outline-none transition placeholder:text-[#ad9eaa] focus:border-[#781f3b] focus:ring-2 focus:ring-[#781f3b]/10";

const buttonPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#781f3b] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#58152b] active:scale-[0.98] disabled:opacity-40";

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
  tone = "cream",
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
  tone?: "cream" | "burgundy" | "green";
}) {
  const styles = {
    cream: "bg-[#f1e5ea] text-[#583444]",
    burgundy: "bg-[#781f3b] text-white",
    green: "bg-[#e8f1e8] text-[#365b40]",
  };

  return (
    <div className={`min-w-0 rounded-2xl p-4 sm:p-5 ${styles[tone]}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-xs font-medium leading-5 opacity-80 sm:text-sm">
          {label}
        </span>
        <Icon size={19} className="shrink-0 opacity-80" />
      </div>
      <div className="break-words text-xl font-bold tracking-tight sm:text-2xl">
        {value}
      </div>
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState<"cost" | "finance">("cost");

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: "Мука", amount: "500", unit: "g", price: "10000" },
    { id: 2, name: "Сахар", amount: "200", unit: "g", price: "15000" },
    { id: 3, name: "Яйца", amount: "3", unit: "pcs", price: "2000" },
  ]);

  const [yieldCount, setYieldCount] = useState("10");
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

  const ingredientTotal = useMemo(
    () =>
      ingredients.reduce((sum, item) => {
        const amount = Math.max(0, Number(item.amount) || 0);
        const price = Math.max(0, Number(item.price) || 0);
        return sum + (item.unit === "g" ? amount / 1000 * price : amount * price);
      }, 0),
    [ingredients]
  );

  const totalBatchCost = ingredientTotal + Math.max(0, Number(utilityCost) || 0);

  const calculatedCost =
    manualCost.trim() !== "" && Number(manualCost) >= 0
      ? Number(manualCost)
      : totalBatchCost / Math.max(1, Number(yieldCount) || 1);

  const filteredSales = useMemo(
    () =>
      sales.filter((sale) => {
        if (period === "today") return sale.date === today();
        if (period === "month") return sale.date.slice(0, 7) === today().slice(0, 7);
        return sale.date >= fromDate && sale.date <= toDate;
      }),
    [sales, period, fromDate, toDate]
  );

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        if (period === "today") return expense.date === today();
        if (period === "month") return expense.date.slice(0, 7) === today().slice(0, 7);
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
      current.map((item) => item.id === id ? { ...item, [key]: value } : item)
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
    setNotice(`Загружен пример рецепта «${recipe.name}». Проверьте количества и цены.`);
  }

async function searchOnlineRecipes(query: string) {
  const search = query.trim();

  if (search.length < 2) {
    setApiRecipes([]);
    setRecipeSearchError("");
    return;
  }

function applyOnlineRecipe(recipe: ApiRecipe) {
  const sourceIngredients = recipe.ingredients ?? [];

  const parsedIngredients: Ingredient[] = sourceIngredients.map(
    (item, index) => {
      const quantity = item.quantity;
      const rawUnit = String(quantity?.unit ?? "").toLowerCase();
      const rawAmount = quantity?.value;
      const display = item.display ?? item.original ?? "";
      const name = item.name?.trim() || display.trim() || `Ингредиент ${index + 1}`;

      let unit: Unit = "g";
      let amount = Number(rawAmount);

      if (rawUnit.includes("kg") || rawUnit.includes("kilogram")) {
        unit = "kg";
      } else if (
        rawUnit.includes("piece") ||
        rawUnit.includes("pcs") ||
        rawUnit === "each" ||
        rawUnit === "egg"
      ) {
        unit = "pcs";
      } else if (
        rawUnit.includes("cup") ||
        rawUnit.includes("tbsp") ||
        rawUnit.includes("tsp") ||
        rawUnit.includes("oz") ||
        rawUnit.includes("lb")
      ) {
        unit = "g";
        amount = Number.NaN;
      } else if (
        rawUnit.includes("g") ||
        rawUnit.includes("gram")
      ) {
        unit = "g";
      } else {
        amount = Number.NaN;
      }

      return {
        id: Date.now() + index,
        name,
        amount: Number.isFinite(amount) && amount >= 0 ? String(amount) : "",
        unit,
        price: "",
      };
    }
  );

  setIngredients(parsedIngredients);
  setProductName(recipe.title ?? "");
  setRecipeSearch(recipe.title ?? "");
  setManualCost("");
  setYieldCount("1");
  setNotice(
    "Рецепт загружен. Проверьте количества и единицы измерения, укажите цены в сумах."
  );
}

  setIsSearchingRecipes(true);
  setRecipeSearchError("");

  try {
    const response = await fetch(
      `/api/recipes?query=${encodeURIComponent(search)}`,
      { cache: "no-store" }
    );

    const data: ApiRecipeResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Не удалось найти рецепты.");
    }

    const results = Array.isArray(data.results) ? data.results : [];
    setApiRecipes(results.filter((recipe) =>
      Boolean(recipe.title) &&
      Array.isArray(recipe.ingredients) &&
      recipe.ingredients.length > 0
    ));

    if (results.length === 0) {
      setRecipeSearchError("Рецепты не найдены. Попробуйте другое название.");
    }
  } catch (error) {
    setApiRecipes([]);
    setRecipeSearchError(
      error instanceof Error
        ? error.message
        : "Ошибка поиска рецептов."
    );
  } finally {
    setIsSearchingRecipes(false);
  }
}

  function handleProductNameChange(value: string) {
    setProductName(value);

    const normalized = value.trim().toLocaleLowerCase("ru");
    const match = recipes.find(
      (recipe) => recipe.name.toLocaleLowerCase("ru") === normalized
    );

    if (match) {
      setIngredients(
        match.ingredients.map((item, index) => ({
          ...item,
          id: Date.now() + index,
        }))
      );
      setYieldCount(match.yieldCount);
      setManualCost("");
      setRecipeSearch(match.name);
      setNotice(`Подставлен пример рецепта «${match.name}». Проверьте цены и количества.`);
    }
  }

  function saveProduct() {
    if (!productName.trim()) {
      setNotice("Укажите название изделия.");
      return;
    }
    if (sellingPrice.trim() === "" || !Number.isFinite(Number(sellingPrice)) || Number(sellingPrice) < 0) {
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
    const product = products.find((item) => item.id === Number(saleProductId));

    if (!product) {
      setNotice("Сначала добавьте изделие в калькуляторе.");
      return;
    }
    if (!saleDate || Number(saleQuantity) <= 0 || !salePrice.trim() || Number(salePrice) < 0) {
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
    if (!expenseDate || !expenseName.trim() || Number(expenseAmount) <= 0) {
      setNotice("Укажите дату, название и сумму расхода.");
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
        <header className="mb-7 overflow-hidden rounded-3xl bg-[#58152b] text-white shadow-lg shadow-[#58152b]/10">
          <div className="relative p-5 sm:p-8">
            <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border border-white/10" />
            <div className="absolute -right-3 -top-6 h-32 w-32 rounded-full border border-white/10" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d4a9b8] text-[#58152b]">
                <Wheat size={25} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.23em] text-[#f0d5df]">
                  Учёт кондитерской
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  Bakery Accounting
                </h1>
              </div>
            </div>
            <p className="relative mt-5 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
              Себестоимость, продажи и прибыль — в одном удобном месте.
            </p>
          </div>
        </header>

        <nav className="mb-7 grid grid-cols-2 gap-3">
          <button
            onClick={() => { setTab("cost"); setNotice(""); }}
            className={`flex min-h-[76px] items-center gap-3 rounded-2xl border p-4 text-left transition ${
              tab === "cost"
                ? "border-[#781f3b] bg-white shadow-md"
                : "border-[#e8dce1] bg-[#f1e5ea] hover:bg-white"
            }`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tab === "cost" ? "bg-[#781f3b] text-white" : "bg-white text-[#781f3b]"}`}>
              <Calculator size={21} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">Себестоимость</span>
              <span className="mt-1 block text-xs text-[#81717a]">Расчёт изделий</span>
            </span>
          </button>

          <button
            onClick={() => { setTab("finance"); setNotice(""); }}
            className={`flex min-h-[76px] items-center gap-3 rounded-2xl border p-4 text-left transition ${
              tab === "finance"
                ? "border-[#781f3b] bg-white shadow-md"
                : "border-[#e8dce1] bg-[#f1e5ea] hover:bg-white"
            }`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tab === "finance" ? "bg-[#781f3b] text-white" : "bg-white text-[#781f3b]"}`}>
              <ChartNoAxesCombined size={21} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">Продажи и прибыль</span>
              <span className="mt-1 block text-xs text-[#81717a]">Финансовый учёт</span>
            </span>
          </button>
        </nav>

        {notice && (
          <div role="status" className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-[#e8cbd5] bg-[#fff7fa] px-4 py-3 text-sm text-[#781f3b]">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} className="shrink-0 font-bold" aria-label="Закрыть уведомление">×</button>
          </div>
        )}

        {tab === "cost" && (
          <>
            <SectionTitle
              eyebrow="Раздел 01"
              title="Калькулятор себестоимости"
              description="Выберите пример рецепта или внесите ингредиенты самостоятельно. Все количества и цены можно редактировать."
            />

            <section className="mb-5 rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1e5ea] text-[#781f3b]">
                  <Search size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Быстрый выбор рецепта</h3>
                  <p className="mt-1 text-xs text-[#81717a]">Примеры для начала расчёта</p>
                </div>
              </div>

              <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                Найти рецепт
                <input
                  className={`${field} mt-1.5`}
                  placeholder="Например, Наполеон"
                  value={recipeSearch}
                  onChange={(e) => {
                    setRecipeSearch(e.target.value);
                    const match = recipes.find((recipe) =>
                      recipe.name.toLocaleLowerCase("ru") === e.target.value.trim().toLocaleLowerCase("ru")
                    );
                    if (match) applyRecipe(match);
                  }}
                />
              </label>

<button
  className={`${buttonPrimary} mt-3 w-full`}
  onClick={() => searchOnlineRecipes(recipeSearch)}
  disabled={isSearchingRecipes || recipeSearch.trim().length < 2}
>
  <Search size={17} />
  {isSearchingRecipes ? "Ищем рецепты..." : "Найти рецепты в интернете"}
</button>

{recipeSearchError && (
  <p role="status" className="mt-3 rounded-xl bg-[#fff7fa] p-3 text-sm text-[#781f3b]">
    {recipeSearchError}
  </p>
)}

{apiRecipes.length > 0 && (
  <div className="mt-4 space-y-3">
    <h4 className="text-sm font-bold text-[#50343f]">
      Результаты поиска
    </h4>

    {apiRecipes.map((recipe, index) => (
      <div
        key={`${recipe.url ?? recipe.title}-${index}`}
        className="rounded-xl border border-[#e8dce1] bg-[#fffafb] p-3"
      >
        <p className="font-bold text-[#58152b]">{recipe.title}</p>
        <p className="mt-1 text-xs text-[#81717a]">
          Ингредиентов: {recipe.ingredients?.length ?? 0}
        </p>

        <button
          className={`${buttonSecondary} mt-3 w-full`}
          onClick={() => applyOnlineRecipe(recipe)}
        >
          Выбрать этот рецепт
        </button>

        {recipe.url && (
          <a
            href={recipe.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block break-all text-sm text-[#781f3b] underline"
          >
            Открыть оригинал рецепта
          </a>
        )}
      </div>
    ))}
  </div>
)}

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
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
              <p className="mt-3 text-xs leading-5 text-[#81717a]">
                Рецепты ориентировочные. Проверяйте состав, выход и стоимость продуктов перед расчётом.
              </p>
            </section>

            <section className="mb-5 rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1e5ea] text-[#781f3b]">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Состав рецепта</h3>
                  <p className="mt-1 text-xs text-[#81717a]">Цена указывается за килограмм или штуку</p>
                </div>
              </div>

              <div className="space-y-4">
                {ingredients.map((item, index) => (
                  <div key={item.id} className="min-w-0 rounded-2xl border border-[#eee5ea] bg-[#fffafb] p-3 sm:p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#986b7b]">
                        Ингредиент {index + 1}
                      </span>
                      <button
                        onClick={() => setIngredients((current) => current.filter((entry) => entry.id !== item.id))}
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
                        onChange={(e) => updateIngredient(item.id, "name", e.target.value)}
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
                          onChange={(e) => updateIngredient(item.id, "amount", e.target.value)}
                        />
                      </label>

                      <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                        Единица
                        <select
                          className={`${field} mt-1.5`}
                          value={item.unit}
                          onChange={(e) => updateIngredient(item.id, "unit", e.target.value as Unit)}
                        >
                          <option value="g">Граммы (г)</option>
                          <option value="kg">Килограммы (кг)</option>
                          <option value="pcs">Штуки (шт.)</option>
                        </select>
                      </label>
                    </div>

                    <label className="mt-3 block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                      {item.unit === "pcs" ? "Цена за 1 штуку (сум)" : "Цена за 1 кг (сум)"}
                      <input
                        className={`${field} mt-1.5`}
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        placeholder="0"
                        value={item.price}
                        onChange={(e) => updateIngredient(item.id, "price", e.target.value)}
                      />
                    </label>

                    <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#f1e5ea] px-3 py-2.5">
                      <span className="text-xs text-[#765666]">Стоимость ингредиента</span>
                      <span className="text-sm font-bold text-[#58152b]">
                        {money((Number(item.amount) || 0) * (Number(item.price) || 0) * (item.unit === "g" ? 0.001 : 1))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button className={`${buttonSecondary} mt-4 w-full`} onClick={addIngredient}>
                <Plus size={17} />
                Добавить ингредиент
              </button>

              <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                  Сколько изделий получится из рецепта?
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
                  <span className="text-xs font-medium text-[#765666]">Общая стоимость ингредиентов</span>
                  <p className="mt-2 text-xl font-bold text-[#58152b]">{money(ingredientTotal)}</p>
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
                  <p className="mt-1 text-xs text-[#81717a]">Затраты на весь рецепт</p>
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
                Введите рассчитанную стоимость энергии для одной партии. Тарифы не загружаются автоматически.
              </p>
              <div className="mt-4 rounded-xl bg-[#f1e5ea] p-4">
                <span className="text-xs text-[#765666]">Ингредиенты плюс коммунальные затраты</span>
                <p className="mt-2 text-xl font-bold text-[#58152b]">{money(totalBatchCost)}</p>
              </div>
            </section>

            <section className="mb-5 rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1e5ea] text-[#781f3b]">
                  <CircleDollarSign size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Стоимость одного изделия</h3>
                  <p className="mt-1 text-xs text-[#81717a]">Можно указать себестоимость вручную</p>
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
                <p className="text-sm text-white/70">Себестоимость одного изделия</p>
                <p className="mt-2 break-words text-3xl font-bold tracking-tight sm:text-4xl">{money(calculatedCost)}</p>
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

              <button className={`${buttonPrimary} mt-4 w-full`} onClick={saveProduct}>
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
                  <p className="mt-3 text-sm font-semibold text-[#6f5b6a]">Пока нет добавленных изделий</p>
                  <p className="mt-1 text-xs text-[#9b8490]">Заполните название и цену выше</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-[#fffafb] p-3 sm:p-4">
                      <div className="min-w-0">
                        <p className="break-words font-bold">{product.name}</p>
                        <p className="mt-1 text-xs text-[#81717a]">Себестоимость: {money(product.cost)}</p>
                        <p className="mt-1 text-xs text-[#81717a]">Цена продажи: {money(product.price)}</p>
                      </div>
                      <button
                        onClick={() => {
                          setProducts((current) => current.filter((p) => p.id !== product.id));
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
                    className={`${field} mt-1.5 block box-border w-full min-w-0 max-w-full overflow-hidden`}
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
                      const selected = products.find((p) => p.id === Number(e.target.value));
                      if (selected) setSalePrice(String(selected.price));
                    }}
                  >
                    <option value="">Выберите изделие</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
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

              <button className={`${buttonPrimary} mt-4 w-full`} onClick={addSale} disabled={products.length === 0}>
                <Plus size={17} />
                Добавить продажу
              </button>

              {products.length === 0 && (
                <p className="mt-3 text-xs leading-5 text-[#9b7988]">Сначала добавьте изделия в разделе «Себестоимость».</p>
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

              <button className={`${buttonSecondary} mt-4 w-full`} onClick={addExpense}>
                <Plus size={17} />
                Добавить расход
              </button>
            </section>

            <section className="mb-5 rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 font-bold">Период отчёта</h3>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["today", "Сегодня"],
                  ["month", "Месяц"],
                  ["custom", "Период"],
                ] as const).map(([value, label]) => (
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
                    <input className={`${field} mt-1.5`} type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                  </label>
                  <label className="block min-w-0 text-xs font-semibold text-[#6f5b4e]">
                    Конец периода
                    <input className={`${field} mt-1.5`} type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                  </label>
                </div>
              )}
            </section>

            <section className="mb-5">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#986b7b]">Финансовый результат</p>
                <h3 className="mt-1 text-lg font-bold">{reportPeriod}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Выручка" value={money(revenue)} icon={Wallet} />
                <StatCard label="Себестоимость продаж" value={money(goodsCost)} icon={Package} />
                <StatCard label="Дополнительные расходы" value={money(expenseTotal)} icon={ReceiptText} />
                <StatCard label="Чистая прибыль" value={money(profit)} icon={TrendingUp} tone="green" />
              </div>

              <div className="mt-3 rounded-2xl bg-[#58152b] p-5 text-white">
                <p className="text-sm text-white/70">Итоговая прибыль за период</p>
                <p className="mt-2 break-words text-3xl font-bold sm:text-4xl">{money(profit)}</p>
                <p className="mt-3 text-xs leading-5 text-white/70">
                  Выручка − себестоимость проданных изделий − дополнительные расходы.
                </p>
              </div>
            </section>

            <section className="mb-5 rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 font-bold">Продажи за выбранный период</h3>
              {filteredSales.length === 0 ? (
                <p className="rounded-xl bg-[#fffafb] px-4 py-6 text-center text-sm text-[#81717a]">За этот период продаж пока нет.</p>
              ) : (
                <div className="space-y-3">
                  {filteredSales.map((sale) => (
                    <div key={sale.id} className="flex min-w-0 items-start justify-between gap-3 rounded-xl bg-[#fffafb] p-3">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-bold">{sale.productName}</p>
                        <p className="mt-1 text-xs text-[#81717a]">{sale.date} · {sale.quantity} шт. × {money(sale.price)}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold">{money(sale.price * sale.quantity)}</p>
                        <button className="mt-2 text-xs text-[#a56b7a] underline" onClick={() => setSales((current) => current.filter((item) => item.id !== sale.id))}>Удалить</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mb-5 rounded-2xl border border-[#e8dce1] bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 font-bold">Расходы за выбранный период</h3>
              {filteredExpenses.length === 0 ? (
                <p className="rounded-xl bg-[#fffafb] px-4 py-6 text-center text-sm text-[#81717a]">За этот период дополнительных расходов пока нет.</p>
              ) : (
                <div className="space-y-3">
                  {filteredExpenses.map((expense) => (
                    <div key={expense.id} className="flex min-w-0 items-start justify-between gap-3 rounded-xl bg-[#fffafb] p-3">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-bold">{expense.name}</p>
                        <p className="mt-1 text-xs text-[#81717a]">{expense.date}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold">{money(expense.amount)}</p>
                        <button className="mt-2 text-xs text-[#a56b7a] underline" onClick={() => setExpenses((current) => current.filter((item) => item.id !== expense.id))}>Удалить</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <button className={`${buttonPrimary} w-full`} onClick={exportPdf}>
              <FileDown size={18} />
              Сохранить отчёт в PDF
            </button>
          </>
        )}
      </div>

      <div className="print-only">
        <h1>Bakery Accounting</h1>
        <h2>Финансовый отчёт кондитерской</h2>
        <p>Период: {reportPeriod}</p>
        <hr />

        <h3>Итоги</h3>
        <table>
          <tbody>
            <tr><td>Выручка</td><td>{money(revenue)}</td></tr>
            <tr><td>Себестоимость проданных изделий</td><td>{money(goodsCost)}</td></tr>
            <tr><td>Дополнительные расходы</td><td>{money(expenseTotal)}</td></tr>
            <tr><td><strong>Чистая прибыль</strong></td><td><strong>{money(profit)}</strong></td></tr>
          </tbody>
        </table>

        <h3>Продажи</h3>
        <table>
          <thead>
            <tr>
              <th>Дата</th><th>Изделие</th><th>Кол-во</th><th>Цена</th><th>Выручка</th><th>Себестоимость</th>
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
            {filteredSales.length === 0 && <tr><td colSpan={6}>За выбранный период продаж нет.</td></tr>}
          </tbody>
        </table>

        <h3>Дополнительные расходы</h3>
        <table>
          <thead><tr><th>Дата</th><th>Расход</th><th>Сумма</th></tr></thead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.date}</td><td>{expense.name}</td><td>{money(expense.amount)}</td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && <tr><td colSpan={3}>За выбранный период расходов нет.</td></tr>}
          </tbody>
        </table>

        <p className="print-footer">Отчёт сформирован в Bakery Accounting. Все суммы указаны в сумах.</p>
      </div>
    </main>
  );
}
