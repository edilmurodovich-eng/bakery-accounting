

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RacionRecipeCard = {
  ID?: string;
  Title?: string;
};

type RacionRecipePage = {
  items?: RacionRecipeCard[];
};

type RacionIngredient = {
  name?: string;
  amount?: number;
  unit?: "g" | "ml" | "pcs";
};

type RacionRecipe = {
  id?: string;
  title?: string;
  ingredients?: RacionIngredient[];
};

function normalizeTitle(value: string): string {
  return value
    .toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function isRelevantTitle(query: string, title: string): boolean {
  const q = normalizeTitle(query);
  const t = normalizeTitle(title);

  if (!q || !t) return false;
  if (q === t || t.includes(q) || q.includes(t)) return true;

  const queryWords = q.split(" ").filter((word) => word.length > 2);
  if (queryWords.length === 0) return false;

  const titleWords = new Set(t.split(" "));
  const matched = queryWords.filter((word) =>
    titleWords.has(word)
  ).length;

  return matched === queryWords.length;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Введи название изделия для поиска." },
      { status: 400 }
    );
  }

  if (query.length > 100) {
    return NextResponse.json(
      { error: "Название изделия слишком длинное." },
      { status: 400 }
    );
  }

  try {
    const searchUrl = new URL("https://racion.app/api/recipes");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("lang", "ru");
    searchUrl.searchParams.set("limit", "30");

    const searchResponse = await fetch(searchUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!searchResponse.ok) {
      return NextResponse.json(
        {
          error:
            searchResponse.status === 429
              ? "Превышен лимит поиска. Попробуй позже."
              : "Русская база рецептов временно недоступна.",
        },
        { status: searchResponse.status === 429 ? 429 : 502 }
      );
    }

    const searchData =
      (await searchResponse.json()) as RacionRecipePage;

    const cards = Array.isArray(searchData.items)
      ? searchData.items
      : [];

    const matchingCards = cards
      .filter(
        (card) =>
          typeof card.ID === "string" &&
          typeof card.Title === "string" &&
          isRelevantTitle(query, card.Title)
      )
      .slice(0, 5);

    if (matchingCards.length === 0) {
      return NextResponse.json({
        tinyPlatesResponse: { results: [] },
        error: "В русской базе не найден рецепт с таким названием.",
        provider: "Racion",
      });
    }

    for (const card of matchingCards) {
      const detailUrl = new URL(
        `https://racion.app/api/recipes/${encodeURIComponent(card.ID!)}`
      );

      detailUrl.searchParams.set("lang", "ru");

      const detailResponse = await fetch(detailUrl.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });

      if (!detailResponse.ok) continue;

      const recipe =
        (await detailResponse.json()) as RacionRecipe;

      if (
        !Array.isArray(recipe.ingredients) ||
        recipe.ingredients.length === 0
      ) {
        continue;
      }

      const ingredients = recipe.ingredients
        .filter(
          (ingredient) =>
            typeof ingredient.name === "string" &&
            typeof ingredient.amount === "number" &&
            Number.isFinite(ingredient.amount) &&
            ingredient.amount >= 0 &&
            ["g", "ml", "pcs"].includes(
              String(ingredient.unit)
            )
        )
        .map((ingredient) => ({
          name: ingredient.name,
          quantity: {
            value: ingredient.amount,
            unit: ingredient.unit,
          },
        }));

      if (ingredients.length === 0) continue;

      return NextResponse.json(
        {
          tinyPlatesResponse: {
            results: [
              {
                title: recipe.title || card.Title,
                ingredients,
              },
            ],
          },
          provider: "Racion",
          translationEnabled: false,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.json({
      tinyPlatesResponse: { results: [] },
      error: "В найденных рецептах нет подходящего списка ингредиентов.",
      provider: "Racion",
    });
  } catch (error) {
    console.error("Racion recipe search error:", error);

    return NextResponse.json(
      { error: "Не удалось связаться с русской базой рецептов." },
      { status: 502 }
    );
  }
}
