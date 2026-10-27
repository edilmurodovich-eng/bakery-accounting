
"use client";

import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import {
  Calculator,
  ChartNoAxesCombined,
  FileDown,
  Plus,
  Trash2,
  ReceiptText,
} from "lucide-react";

type Ingredient = {
  name: string;
  grams: string;
  pricePerKg: string;
};

type Product = {
  id: number;
  name: string;
  cost: string;
  salePrice: string;
};

type Sale = {
  id: number;
  date: string;
  productName: string;
  quantity: string;
  price: string;
  cost: string;
};

type Expense = {
  id: number;
  date: string;
  name: string;
  amount: string;
};

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const money = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(value) + " сум";

const number = (value: string) => {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

export default function Home() {
  const [tab, setTab] = useState<"cost" | "finance">("cost");
  const [productName, setProductName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", grams: "", pricePerKg: "" },
  ]);
  const [yieldCount, setYieldCount] = useState("1");
  const [manualCost, setManualCost] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [saleProduct, setSaleProduct] = useState("");
  const [saleQuantity, setSaleQuantity] = useState("1");
  const [salePrice, setSalePrice] = useState("");
  const [saleCost, setSaleCost] = useState("");
  const [saleDate, setSaleDate] = useState(today());
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(today());
  const [period, setPeriod] = useState("month");
  const [fromDate, setFromDate] = useState(today().slice(0, 7) + "-01");
  const [toDate, setToDate] = useState(today());
  const [message, setMessage] = useState("");

  const ingredientTotal = ingredients.reduce(
    (sum, item) =>
      sum + (number(item.grams) * number(item.pricePerKg)) / 1000,
    0,
  );

  const calculatedCost =
    manualCost.trim() !== ""
      ? number(manualCost)
      : ingredientTotal / Math.max(1, number(yieldCount));

  const filteredSales = useMemo(() => {
    const start =
      period === "day"
        ? today()
        : period === "month"
          ? today().slice(0, 7) + "-01"
          : fromDate;
    const end = period === "custom" ? toDate : today();

    return sales.filter((sale) => sale.date >= start && sale.date <= end);
  }, [sales, period, fromDate, toDate]);

  const filteredExpenses = useMemo(() => {
    const start =
      period === "day"
        ? today()
        : period === "month"
          ? today().slice(0, 7) + "-01"
          : fromDate;
    const end = period === "custom" ? toDate : today();

    return expenses.filter(
      (expense) => expense.date >= start && expense.date <= end,
    );
  }, [expenses, period, fromDate, toDate]);

  const revenue = filteredSales.reduce(
    (sum, sale) => sum + number(sale.quantity) * number(sale.price),
    0,
  );
  const soldCost = filteredSales.reduce(
    (sum, sale) => sum + number(sale.quantity) * number(sale.cost),
    0,
  );
  const expenseTotal = filteredExpenses.reduce(
    (sum, expense) => sum + number(expense.amount),
    0,
  );
  const profit = revenue - soldCost - expenseTotal;

  function addProduct() {
    if (!productName.trim()) {
      setMessage("Введи название изделия.");
      return;
    }
    if (manualCost.trim() === "" && ingredientTotal <= 0) {
      setMessage("Укажи себестоимость или заполни ингредиенты.");
      return;
    }

    setProducts((old) => [
      ...old,
      {
        id: Date.now(),
        name: productName.trim(),
        cost: String(calculatedCost),
        salePrice: "",
      },
    ]);
    setMessage("Изделие добавлено в текущий сеанс.");
    setProductName("");
    setIngredients([{ name: "", grams: "", pricePerKg: "" }]);
    setYieldCount("1");
    setManualCost("");
  }

  function addSale() {
    if (!saleProduct.trim() || number(saleQuantity) <= 0) {
      setMessage("Укажи изделие и количество.");
      return;
    }
    if (number(salePrice) <= 0) {
      setMessage("Укажи цену продажи.");
      return;
    }

    setSales((old) => [
      ...old,
      {
        id: Date.now(),
        date: saleDate,
        productName: saleProduct,
        quantity: saleQuantity,
        price: salePrice,
        cost: saleCost,
      },
    ]);
    setMessage("Продажа добавлена.");
    setSaleProduct("");
    setSaleQuantity("1");
    setSalePrice("");
    setSaleCost("");
  }

  function addExpense() {
    if (!expenseName.trim() || number(expenseAmount) <= 0) {
      setMessage("Укажи название и сумму расхода.");
      return;
    }
    setExpenses((old) => [
      ...old,
      {
        id: Date.now(),
        date: expenseDate,
        name: expenseName.trim(),
        amount: expenseAmount,
      },
    ]);
    setExpenseName("");
    setExpenseAmount("");
    setMessage("Расход добавлен.");
  }

  function exportPdf() {
    const doc = new jsPDF();
    let y = 16;

    const line = (text: string, gap = 8) => {
      if (y > 275) {
        doc.addPage();
        y = 16;
      }
      doc.text(text, 14, y);
      y += gap;
    };

    doc.setFontSize(18);
    line("Bakery Accounting", 11);
    doc.setFontSize(11);
    line(tab === "cost" ? "Sebestoimost produktsii" : "Otchet po prodazham");
    line("Data: " + today());
    line("");

    if (tab === "cost") {
      line("Izdelie: " + (productName || "Ne ukazano"));
      line("Vykhod iz recepta: " + yieldCount);
      ingredients.forEach((item, index) => {
        line(
          `${index + 1}. ${item.name || "Ingredient"}: ${item.grams || "0"} g; ${item.pricePerKg || "0"} sum/kg`,
        );
      });
      line("Stoimost ingredientov: " + money(ingredientTotal));
      line("Sebestoimost odnogo izdeliya: " + money(calculatedCost));
      if (products.length) {
        line("");
        line("Izdelia v tekushem seanse:");
        products.forEach((product) =>
          line(`${product.name}: ${money(number(product.cost))} / sht.`),
        );
      }
    } else {
      line("Period: " + period);
      if (period === "custom") {
        line("S: " + fromDate + " po " + toDate);
      }
      line("Vyручka: " + money(revenue));
      line("Sebestoimost prodannogo: " + money(soldCost));
      line("Dopolnitelnye raskhody: " + money(expenseTotal));
      line("Chistaya pribyl: " + money(profit), 10);

      line("");
      line("Prodazhi:");
      filteredSales.forEach((sale) =>
        line(
          `${sale.date} ${sale.productName}: ${sale.quantity} x ${money(number(sale.price))}`,
        ),
      );
      line("");
      line("Raskhody:");
      filteredExpenses.forEach((expense) =>
        line(`${expense.date} ${expense.name}: ${money(number(expense.amount))}`),
      );
    }

    doc.save(
      `bakery-accounting-${tab}-${today()}.pdf`,
    );
    setMessage("PDF сформирован. Проверь загрузки на устройстве.");
  }

  const field =
    "w-full rounded-xl border border-[#e3d4c6] bg-white px-3 py-3 text-base outline-none focus:border-[#75452f]";
  const button =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition active:scale-[0.98]";
  const label = "mb-1 block text-sm font-medium text-[#66534a]";

  return (
    <main className="min-h-screen bg-[#fff8ef] text-[#30211c]">
      <div className="mx-auto max-w-4xl px-4 pb-10 pt-6 sm:px-6">
        <header className="mb-6 rounded-3xl bg-[#4a241b] p-5 text-white shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e5c59d]">
            Accounting for bakery
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Bakery Accounting
          </h1>
          <p className="mt-2 text-sm text-[#f2e5d8]">
            Себестоимость, продажи и чистая прибыль
          </p>
          <p className="mt-4 rounded-xl bg-white/10 p-3 text-sm">
            Данные не сохраняются после обновления или закрытия страницы.
            Скачивай PDF, чтобы оставить себе отчёт.
          </p>
        </header>

        <nav className="mb-6 grid grid-cols-2 gap-2">
          <button
            className={`${button} ${tab === "cost" ? "bg-[#75452f] text-white" : "border border-[#e3d4c6] bg-white text-[#75452f]"}`}
            onClick={() => {
              setTab("cost");
              setMessage("");
            }}
          >
            <Calculator size={18} /> Себестоимость
          </button>
          <button
            className={`${button} ${tab === "finance" ? "bg-[#75452f] text-white" : "border border-[#e3d4c6] bg-white text-[#75452f]"}`}
            onClick={() => {
              setTab("finance");
              setMessage("");
            }}
          >
            <ChartNoAxesCombined size={18} /> Продажи и прибыль
          </button>
        </nav>

        {message && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-[#e3d4c6] bg-white p-3 text-sm"
          >
            {message}
          </div>
        )}

        {tab === "cost" ? (
          <section className="space-y-5">
            <div className="rounded-2xl border border-[#eaded2] bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-xl font-bold">Расчёт себестоимости</h2>

              <label className={label}>Название изделия</label>
              <input
                className={field}
                placeholder="Например, шоколадный торт"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />

              <div className="mt-5 flex items-center justify-between gap-3">
                <h3 className="font-semibold">Ингредиенты</h3>
                <button
                  className={`${button} bg-[#f3e8dc] text-[#75452f]`}
                  onClick={() =>
                    setIngredients((old) => [
                      ...old,
                      { name: "", grams: "", pricePerKg: "" },
                    ])
                  }
                >
                  <Plus size={16} /> Добавить
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {ingredients.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[#eee2d7] bg-[#fffcf8] p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        Ингредиент {index + 1}
                      </span>
                      {ingredients.length > 1 && (
                        <button
                          aria-label="Удалить ингредиент"
                          className="rounded-lg p-2 text-red-700"
                          onClick={() =>
                            setIngredients((old) =>
                              old.filter((_, i) => i !== index),
                            )
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                    <input
                      className={`${field} mb-2`}
                      placeholder="Название"
                      value={item.name}
                      onChange={(e) =>
                        setIngredients((old) =>
                          old.map((row, i) =>
                            i === index ? { ...row, name: e.target.value } : row,
                          ),
                        )
                      }
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={label}>Граммы</label>
                        <input
                          className={field}
                          type="number"
                          min="0"
                          placeholder="500"
                          value={item.grams}
                          onChange={(e) =>
                            setIngredients((old) =>
                              old.map((row, i) =>
                                i === index
                                  ? { ...row, grams: e.target.value }
                                  : row,
                              ),
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className={label}>Цена за кг (сум)</label>
                        <input
                          className={field}
                          type="number"
                          min="0"
                          placeholder="25000"
                          value={item.pricePerKg}
                          onChange={(e) =>
                            setIngredients((old) =>
                              old.map((row, i) =>
                                i === index
                                  ? { ...row, pricePerKg: e.target.value }
                                  : row,
                              ),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <label className={`${label} mt-5`}>
                Количество изделий из рецепта
              </label>
              <input
                className={field}
                type="number"
                min="1"
                value={yieldCount}
                onChange={(e) => setYieldCount(e.target.value)}
              />

              <div className="mt-5 rounded-xl bg-[#f8f0e7] p-4">
                <label className={label}>
                  Себестоимость одного изделия вручную (сум)
                </label>
                <input
                  className={field}
                  type="number"
                  min="0"
                  placeholder="Оставь пустым для расчёта по ингредиентам"
                  value={manualCost}
                  onChange={(e) => setManualCost(e.target.value)}
                />
                <p className="mt-2 text-xs text-[#66534a]">
                  Если поле заполнено, используется ручная себестоимость.
                  Иначе расчёт идёт по ингредиентам и выходу рецепта.
                </p>
              </div>

              <div className="mt-5 rounded-2xl bg-[#4a241b] p-5 text-white">
                <p className="text-sm text-[#e5c59d]">
                  Себестоимость одного изделия
                </p>
                <p className="mt-1 text-3xl font-bold">
                  {money(calculatedCost)}
                </p>
                <p className="mt-2 text-sm text-[#f2e5d8]">
                  Стоимость всех ингредиентов: {money(ingredientTotal)}
                </p>
              </div>

              <button
                className={`${button} mt-4 w-full bg-[#75452f] text-white`}
                onClick={addProduct}
              >
                <Plus size={18} /> Добавить изделие в текущий сеанс
              </button>

              {products.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-2 font-bold">Изделия текущего сеанса</h3>
                  <div className="space-y-2">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[#eaded2] p-3"
                      >
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-[#66534a]">
                            {money(number(product.cost))} / шт.
                          </p>
                        </div>
                        <button
                          className="p-2 text-red-700"
                          aria-label="Удалить изделие"
                          onClick={() =>
                            setProducts((old) =>
                              old.filter((p) => p.id !== product.id),
                            )
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className={`${button} w-full bg-[#f0dfce] text-[#4a241b]`}
              onClick={exportPdf}
            >
              <FileDown size={19} /> Скачать расчёт в PDF
            </button>
          </section>
        ) : (
          <section className="space-y-5">
            <div className="rounded-2xl border border-[#eaded2] bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-xl font-bold">Добавить продажу</h2>

              <label className={label}>Название изделия</label>
              <input
                className={field}
                list="product-list"
                placeholder="Введи название изделия"
                value={saleProduct}
                onChange={(e) => {
                  const value = e.target.value;
                  setSaleProduct(value);
                  const match = products.find((p) => p.name === value);
                  if (match) setSaleCost(match.cost);
                }}
              />
              <datalist id="product-list">
                {products.map((product) => (
                  <option key={product.id} value={product.name} />
                ))}
              </datalist>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Дата продажи</label>
                  <input
                    className={field}
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>Количество</label>
                  <input
                    className={field}
                    type="number"
                    min="1"
                    value={saleQuantity}
                    onChange={(e) => setSaleQuantity(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>Цена продажи (сум/шт.)</label>
                  <input
                    className={field}
                    type="number"
                    min="0"
                    value={salePrice}
                    placeholder="40000"
                    onChange={(e) => setSalePrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>Себестоимость (сум/шт.)</label>
                  <input
                    className={field}
                    type="number"
                    min="0"
                    value={saleCost}
                    placeholder="20000"
                    onChange={(e) => setSaleCost(e.target.value)}
                  />
                </div>
              </div>

              <button
                className={`${button} mt-4 w-full bg-[#75452f] text-white`}
                onClick={addSale}
              >
                <Plus size={18} /> Добавить продажу
              </button>
            </div>

            <div className="rounded-2xl border border-[#eaded2] bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-xl font-bold">Добавить расход</h2>
              <label className={label}>Название расхода</label>
              <input
                className={field}
                placeholder="Например, аренда или электричество"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
              />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Сумма (сум)</label>
                  <input
                    className={field}
                    type="number"
                    min="0"
                    placeholder="100000"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>Дата</label>
                  <input
                    className={field}
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                  />
                </div>
              </div>
              <button
                className={`${button} mt-4 w-full border border-[#e3d4c6] bg-[#f8f0e7] text-[#75452f]`}
                onClick={addExpense}
              >
                <ReceiptText size={18} /> Добавить расход
              </button>
            </div>

            <div className="rounded-2xl border border-[#eaded2] bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-xl font-bold">Отчёт о прибыли</h2>
              <label className={label}>Период отчёта</label>
              <select
                className={field}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="day">Сегодня</option>
                <option value="month">С начала месяца</option>
                <option value="custom">Выбрать период</option>
              </select>

              {period === "custom" && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className={label}>С даты</label>
                    <input
                      className={field}
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={label}>По дату</label>
                    <input
                      className={field}
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#f8f0e7] p-4">
                  <p className="text-sm text-[#66534a]">Выручка</p>
                  <p className="mt-1 text-xl font-bold">{money(revenue)}</p>
                </div>
                <div className="rounded-xl bg-[#f8f0e7] p-4">
                  <p className="text-sm text-[#66534a]">Себестоимость продаж</p>
                  <p className="mt-1 text-xl font-bold">{money(soldCost)}</p>
                </div>
                <div className="rounded-xl bg-[#f8f0e7] p-4">
                  <p className="text-sm text-[#66534a]">Дополнительные расходы</p>
                  <p className="mt-1 text-xl font-bold">
                    {money(expenseTotal)}
                  </p>
                </div>
                <div className="rounded-xl bg-[#4a241b] p-4 text-white">
                  <p className="text-sm text-[#e5c59d]">Чистая прибыль</p>
                  <p className="mt-1 text-xl font-bold">{money(profit)}</p>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="mb-2 font-bold">Продажи в отчёте</h3>
                {filteredSales.length === 0 ? (
                  <p className="text-sm text-[#66534a]">Продаж за период пока нет.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="flex justify-between gap-3 rounded-xl border border-[#eaded2] p-3 text-sm"
                      >
                        <div>
                          <p className="font-semibold">{sale.productName}</p>
                          <p className="text-[#66534a]">
                            {sale.date} · {sale.quantity} шт.
                          </p>
                        </div>
                        <p className="font-semibold">
                          {money(number(sale.quantity) * number(sale.price))}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5">
                <h3 className="mb-2 font-bold">Расходы в отчёте</h3>
                {filteredExpenses.length === 0 ? (
                  <p className="text-sm text-[#66534a]">Расходов за период пока нет.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex justify-between gap-3 rounded-xl border border-[#eaded2] p-3 text-sm"
                      >
                        <div>
                          <p className="font-semibold">{expense.name}</p>
                          <p className="text-[#66534a]">{expense.date}</p>
                        </div>
                        <p className="font-semibold">{money(number(expense.amount))}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              className={`${button} w-full bg-[#f0dfce] text-[#4a241b]`}
              onClick={exportPdf}
            >
              <FileDown size={19} /> Скачать финансовый отчёт в PDF
            </button>
          </section>
        )}

        <footer className="mt-8 text-center text-xs text-[#806d62]">
          Bakery Accounting · Данные существуют только в текущем сеансе
        </footer>
      </div>
    </main>
  );
}
