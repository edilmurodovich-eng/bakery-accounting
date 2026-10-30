
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const apiKey = process.env.TINYPLATES_API_KEY;

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

    const data = await response.json();
console.log("TINYPLATES RESPONSE:", JSON.stringify(data, null, 2));
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Ошибка соединения с сервисом рецептов." },
      { status: 502 }
    );
  }
}
