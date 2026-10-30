
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type AnyObject = Record<string, any>;

async function translateIngredients(data: any, apiKey: string) {
  const ingredientObjects: AnyObject[] = [];

  function collect(value: any, insideIngredients = false) {
    if (Array.isArray(value)) {
      value.forEach((item) => collect(item, insideIngredients));
      return;
    }

    if (!value || typeof value !== "object") return;

    const entries = Object.entries(value);

    if (insideIngredients) {
      const hasName = ["localName", "name", "display", "original"].some(
        (key) => typeof value[key] === "string" && value[key].trim()
      );

      if (hasName) ingredientObjects.push(value);
    }

    for (const [key, child] of entries) {
      const isIngredientField = key.toLowerCase().includes("ingredient");
      collect(child, insideIngredients || isIngredientField);
    }
  }

  collect(data);

  const uniqueNames = Array.from(
    new Set(
      ingredientObjects
        .map(
          (item) =>
            item.localName || item.name || item.display || item.original
        )
        .filter(
          (name): name is string =>
            typeof name === "string" && name.trim().length > 0
        )
        .map((name) => name.trim())
    )
  );

  if (uniqueNames.length === 0) return data;

  const translated = new Map<string, string>();

  const apiUrl = apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  // DeepL принимает до 50 текстов за один запрос.
  for (let i = 0; i < uniqueNames.length; i += 50) {
    const batch = uniqueNames.slice(i, i + 50);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: batch,
        target_lang: "RU",
        context:
          "Это названия ингредиентов для рецептов кондитерской. Используй правильные русские кулинарные названия.",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`DeepL API status: ${response.status}`);
    }

    const result = await response.json();

    batch.forEach((original, index) => {
      const translation = result.translations?.[index]?.text;

      if (translation) {
        translated.set(original, translation.trim());
      }
    });
  }

  for (const item of ingredientObjects) {
    const original =
      item.localName || item.name || item.display || item.original;

    if (typeof original !== "string") continue;

    const russian = translated.get(original.trim());

    if (!russian) continue;

    // Переводим отображаемые названия, оригинал сохраняем.
    item.localName = russian;

    if ("name" in item) item.name = russian;
    if ("display" in item) item.display = russian;
  }

  return data;
}

export async function GET(request: Request) {
  const apiKey = process.env.TINYPLATES_API_KEY;
  const deeplKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API-ключ Tiny Plates не настроен в Vercel." },
      { status: 500 }
    );
  }

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
    const url = new URL("https://api.tinyplates.dev/search");
    url.searchParams.set("query", query);
    url.searchParams.set("limit", "5");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error("Tiny Plates API status:", response.status);

      return NextResponse.json(
        {
          error:
            response.status === 401 || response.status === 403
              ? "Tiny Plates отклонил ключ или доступ к поиску."
              : "Не удалось получить рецепты. Попробуй позже.",
        },
        { status: response.status === 429 ? 429 : 502 }
      );
    }

    let data = await response.json();

    // Если ключ DeepL добавлен, переводим ингредиенты.
    if (deeplKey) {
      try {
        data = await translateIngredients(data, deeplKey);
      } catch (translationError) {
        // Ошибка перевода не должна ломать поиск рецептов.
        console.error("Ingredient translation error:", translationError);
      }
    }

    return NextResponse.json(
      {
        tinyPlatesResponse: data,
        translationEnabled: Boolean(deeplKey),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Recipe search error:", error);

    return NextResponse.json(
      { error: "Ошибка соединения с сервисом рецептов." },
      { status: 502 }
    );
  }
}
