
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
  ChevronRight,
  CircleDollarSign,
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

const money = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.round(value)) + " сум";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const unitNames: Record<Unit, string> = {
  g: "г",
  kg: "кг",
  pcs: "шт.",
};

const field =
  "w-full min-w-0 rounded-xl border border-[#e8dfd3] bg-white px-3 py-3 text-base text-[#392820] outline-none transition placeholder:text-[#ad9e91] focus:border-[#8b3946] focus:ring-2 focus:ring-[#8b3946]/10";

const buttonPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#6e2635] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#54202b] active:scale-[0.98] disabled:opacity-40";

const buttonSecondary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e8dfd3] bg-white px-4 py-3 text-sm font-semibold text-[#503b30] transition hover:bg-[#faf5ee]";

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
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#986b57]">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-bold tracking-tight text-[#392820] sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#8b796d]">{description}</p>
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
    cream: "bg-[#f7eee2] text-[#5a4032]",
    burgundy: "bg-[#6e2635] text-white",
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

        if (item.unit === "g") return sum + (amount / 1000) * price;
        return sum + amount * price;
      }, 0),
    [ingredients]
  );

  const calculatedCost =
    manualCost.trim() !== "" && Number(manualCost) >= 0
      ? Number(manualCost)
      : ingredientTotal / Math.max(1, Number(yieldCount) || 1);

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

  function updateIngredient(
    id: number,
    key: keyof Ingredient,
    value: string
  ) {
    setIngredients((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      )
    );
  }

  function addIngredient() {
    setIngredients((current) => [
      ...current,
      {
        id: Date.now(),
        name: "",
        amount: "",
        unit: "g",
        price: "",
      },
    ]);
  }

  function saveProduct() {
    if (!productName.trim()) {
      setNotice("Укажите название изделия.");
      return;
    }
    if (sellingPrice.trim() === "" || Number(sellingPrice) < 0) {
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
    if (!saleDate || Number(saleQuantity) <= 0 || Number(salePrice) < 0) {
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
    <main className="min-h-screen bg-[#fbf7f1] text-[#392820]">
      <div className="no-print mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        <header className="mb-7 overflow-hidden rounded-3xl bg-[#54202b] text-white shadow-lg shadow-[#54202b]/10">
          <div className="relative p-5 sm:p-8">
            <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border border-white/10" />
            <div className="absolute -right-3 -top-6 h-32 w-32 rounded-full border border-white/10" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d8b47a] text-[#54202b]">
                <Wheat size={25} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.23em] text-[#e8cda3]">
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
            onClick={() => {
              setTab("cost");
              setNotice("");
            }}
            className={`flex min-h-[76px] items-center gap-3 rounded-2xl border p-4 text-left transition ${
              tab === "cost"
                ? "border-[#6e2635] bg-white shadow-md shadow-[#54202b]/5"
                : "border-[#ece2d6] bg-[#f5eee5] hover:bg-white"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                tab === "cost"
                  ? "bg-[#6e2635] text-white"
                  : "bg-white text-[#6e2635]"
              }`}
            >
              <Calculator size={21} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">Себестоимость</span>
              <span className="mt-1 block text-xs text-[#8b796d]">
                Расчёт изделий
              </span>
            </span>
          </button>

          <button
            onClick={() => {
              setTab("finance");
              setNotice("");
            }}
            className={`flex min-h-[76px] items-center gap-3 rounded-2xl border p-4 text-left transition ${
              tab === "finance"
                ? "border-[#6e2635] bg-white shadow-md shadow-[#54202b]/5"
                : "border-[#ece2d6] bg-[#f5eee5] hover:bg-white"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                tab === "finance"
                  ? "bg-[#6e2635] text-white"
                  : "bg-white text-[#6e2635]"
              }`}
            >
              <ChartNoAxesCombined size={21} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">Продажи и прибыль</span>
              <span className="mt-1 block text-xs text-[#8b796d]">
                Финансовый учёт
              </span>
            </span>
          </button>
        </nav>

        {notice && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-[#e7d4b9] bg-[#fff6e6] px-4 py-3 text-sm text-[#73512d]"
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
              description="Добавьте ингредиенты, укажите количество и стоимость закупки. Для каждого ингредиента выберите подходящую единицу измерения."
            />

            <section className="mb-5 rounded-2xl border border-[#eee4d8] bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7eee2] text-[#6e2635]">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Состав рецепта</h3>
                  <p className="mt-1 text-xs text-[#8b796d]">
                    Цена указывается за килограмм или за штуку
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {ingredients.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#eee5da] bg-[#fdfbf8] p-3 sm:p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#9a8373]">
                        Ингредиент {index + 1}
                      </span>
                      <button
                        onClick={() =>
                          setIngredients((current) =>
                            current.filter((entry) => entry.id !== item.id)
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#a56b6b] transition hover:bg-[#f8e9e7]"
                        aria-label="Удалить ингредиент"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <label className="mb-3 block text-xs font-semibold text-[#6f5b4e]">
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

                    <div className="grid grid-cols-2 gap-3">
                      <label className="min-w-0 text-xs font-semibold text-[#6f5b4e]">
                        Количество
                        <input
                          className={`${field} mt-1.5 block box-border w-full min-w-0 max-w-full overflow-hidden`}
                          type="number"
                          min="0"
                          step="any"
                          inputMode="decimal"
                          placeholder="0"
                          value={item.amount}
                          onChange={(e) =>
                            updateIngredient(item.id, "amount", e.target.value)
                          }
                        />
                      </label>

                      <label className="min-w-0 text-xs font-semibold text-[#6f5b4e]">
                        Единица
                        <select
                          className={`${field} mt-1.5`}
                          value={item.unit}
                          onChange={(e) => {
                            const nextUnit = e.target.value as Unit;
                            updateIngredient(item.id, "unit", nextUnit);
                          }}
                        >
                          <option value="g">Граммы (г)</option>
                          <option value="kg">Килограммы (кг)</option>
                          <option value="pcs">Штуки (шт.)</option>
                        </select>
                      </label>
                    </div>

                    <label className="mt-3 block text-xs font-semibold text-[#6f5b4e]">
                      {item.unit === "pcs"
                        ? "Цена за 1 штуку (сум)"
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

                    <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f4ece2] px-3 py-2.5">
                      <span className="text-xs text-[#7d695a]">
                        Стоимость ингредиента
                      </span>
                      <span className="text-sm font-bold text-[#54202b]">
                        {money(
                          (Number(item.amount) || 0) *
                            (Number(item.price) || 0) *
                            (item.unit === "g" ? 0.001 : 1)
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className={`${buttonSecondary} mt-4 w-full`}
                onClick={addIngredient}
              >
                <Plus size={17} />
                Добавить ингредиент
              </button>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="min-w-0 text-xs font-semibold text-[#6f5b4e]">
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

                <div className="rounded-xl bg-[#f7eee2] p-4">
                  <span className="text-xs font-medium text-[#806757]">
                    Общая стоимость ингредиентов
                  </span>
                  <p className="mt-2 text-xl font-bold text-[#54202b]">
                    {money(ingredientTotal)}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-5 rounded-2xl border border-[#eee4d8] bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7eee2] text-[#6e2635]">
                  <CircleDollarSign size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Стоимость одного изделия</h3>
                  <p className="mt-1 text-xs text-[#8b796d]">
                    Можно указать себестоимость вручную
                  </p>
                </div>
              </div>

              <label className="mb-4 block text-xs font-semibold text-[#6f5b4e]">
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

              <div className="rounded-2xl bg-[#54202b] p-5 text-white">
                <p className="text-sm text-white/70">
                  Себестоимость одного изделия
                </p>
                <p className="mt-2 break-words text-3xl font-bold tracking-tight sm:text-4xl">
                  {money(calculatedCost)}
                </p>
                <p className="mt-2 text-xs leading-5 text-white/60">
                  {manualCost.trim() !== ""
                    ? "Используется указанная вами себестоимость."
                    : "Стоимость ингредиентов разделена на количество изделий."}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="min-w-0 text-xs font-semibold text-[#6f5b4e]">
                  Название изделия
                  <input
                    className={`${field} mt-1.5`}
                    placeholder="Например, чизкейк"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </label>
                <label className="min-w-0 text-xs font-semibold text-[#6f5b4e]">
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

            <section className="rounded-2xl border border-[#eee4d8] bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold">
                <ShoppingBag size={19} className="text-[#6e2635]" />
                Список изделий
              </h3>

              {products.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#dfd2c3] px-4 py-8 text-center">
                  <Package size={27} className="mx-auto text-[#b8a596]" />
                  <p className="mt-3 text-sm font-semibold text-[#6f5b4e]">
                    Пока нет добавленных изделий
                  </p>
                  <p className="mt-1 text-xs text-[#9b897a]">
                    Заполните название и цену выше
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-[#fdf9f4] p-3 sm:p-4"
                    >
                      <div className="min-w-0">
                        <p className="break-words font-bold">{product.name}</p>
                        <p className="mt-1 text-xs text-[#8b796d]">
                          Себестоимость: {money(product.cost)}
                        </p>
                        <p className="mt-1 text-xs text-[#8b796d]">
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
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#a56b6b] hover:bg-[#f8e9e7]"
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

            <section className="mb-5 rounded-2xl border border-[#eee4d8] bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold">
                <ShoppingBag size={19} className="text-[#6e2635]" />
                Новая продажа
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="min-w-0 text-xs font-semibold text-[#6f5b4e]">
                  Дата продажи
                  <input
                    className={`${field} mt-1.5`}
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                  />
                </label>

                <label className="min-w-0 text-xs font-semibold text-[#6f5b4e]">
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

                <label className="min-w-0 text-xs font-semibold text-[#6f5b4e]">
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

                <label className="min-w-0 text-xs font-semibold text-[#6f5b4e]">
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
                <p className="mt-3 text-xs leading-5 text-[#9b7968]">
                  Сначала добавьте изделия в разделе «Себестоимость».
                </p>
              )}
            </section>

            <section className="mb-5 rounded-2xl border border-[#eee4d8] bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold">
                <ReceiptText size={19} className="text-[#6e2635]" />
                Дополнительный расход
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="min-w-0 text-xs font-semibold text-[#6f5b4e]">
                  Дата расхода
                  <input
                    className={`${field} mt-1.5`}
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                  />
                </label>

                <label className="min-w-0 text-xs font-semibold text-[#6f5b4e]">
                  Название расхода
                  <input
                    className={`${field} mt-1.5`}
                    placeholder="Например, доставка"
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                  />
                </label>

                <label className="min-w-0 text-xs font-semibold text-[#6f5b4e] sm:col-span-2">
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

            <section className="mb-5 rounded-2xl border border-[#eee4d8] bg-white p-4 shadow-sm sm:p-6">
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
                        ? "border-[#6e2635] bg-[#6e2635] text-white"
                        : "border-[#e8dfd3] bg-white text-[#6f5b4e] hover:bg-[#faf5ee]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {period === "custom" && (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="min-w-0 text-xs font-semibold text-[#6f5b4e]">
                    Начало периода
                    <input
                      className={`${field} mt-1.5`}
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </label>
                  <label className="min-w-0 text-xs font-semibold text-[#6f5b4e]">
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
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#986b57]">
                  Финансовый результат
                </p>
                <h3 className="mt-1 text-lg font-bold">{reportPeriod}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Выручка"
                  value={money(revenue)}
                  icon={Wallet}
                />
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
                <StatCard
                  label="Чистая прибыль"
                  value={money(profit)}
                  icon={TrendingUp}
                  tone="green"
                />
              </div>

              <div className="mt-3 rounded-2xl bg-[#54202b] p-5 text-white">
                <p className="text-sm text-white/70">Итоговая прибыль за период</p>
                <p className="mt-2 break-words text-3xl font-bold sm:text-4xl">
                  {money(profit)}
                </p>
                <p className="mt-3 text-xs leading-5 text-white/65">
                  Выручка − себестоимость проданных изделий − дополнительные расходы.
                </p>
              </div>
            </section>

            <section className="mb-5 rounded-2xl border border-[#eee4d8] bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 font-bold">Продажи за выбранный период</h3>

              {filteredSales.length === 0 ? (
                <p className="rounded-xl bg-[#fdf9f4] px-4 py-6 text-center text-sm text-[#8b796d]">
                  За этот период продаж пока нет.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex min-w-0 items-start justify-between gap-3 rounded-xl bg-[#fdf9f4] p-3"
                    >
                      <div className="min-w-0">
                        <p className="break-words text-sm font-bold">{sale.productName}</p>
                        <p className="mt-1 text-xs text-[#8b796d]">
                          {sale.date} · {sale.quantity} шт. × {money(sale.price)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold">{money(sale.price * sale.quantity)}</p>
                        <button
                          className="mt-2 text-xs text-[#a56b6b] underline"
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

            <section className="mb-5 rounded-2xl border border-[#eee4d8] bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 font-bold">Расходы за выбранный период</h3>

              {filteredExpenses.length === 0 ? (
                <p className="rounded-xl bg-[#fdf9f4] px-4 py-6 text-center text-sm text-[#8b796d]">
                  За этот период дополнительных расходов пока нет.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex min-w-0 items-start justify-between gap-3 rounded-xl bg-[#fdf9f4] p-3"
                    >
                      <div className="min-w-0">
                        <p className="break-words text-sm font-bold">{expense.name}</p>
                        <p className="mt-1 text-xs text-[#8b796d]">{expense.date}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold">{money(expense.amount)}</p>
                        <button
                          className="mt-2 text-xs text-[#a56b6b] underline"
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

        <footer className="mt-10 border-t border-[#e8dfd3] pt-5 text-center">
          <p className="text-xs font-semibold tracking-wide text-[#806757]">
            Bakery Accounting
          </p>
          <p className="mt-1 text-xs text-[#a18d7d]">
            Простой учёт. Понятные расчёты.
          </p>
        </footer>
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
              <tr><td colSpan={6}>За выбранный период продаж нет.</td></tr>
            )}
          </tbody>
        </table>

        <h3>Дополнительные расходы</h3>
        <table>
          <thead>
            <tr><th>Дата</th><th>Расход</th><th>Сумма</th></tr>
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
              <tr><td colSpan={3}>За выбранный период расходов нет.</td></tr>
            )}
          </tbody>
        </table>

        <p className="print-footer">
          Отчёт сформирован в Bakery Accounting. Все суммы указаны в сумах.
        </p>
      </div>
    </main>
  );
}
