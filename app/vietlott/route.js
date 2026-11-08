const SOURCES = {
  MEGA: "https://raw.githubusercontent.com/vietvudanh/vietlott-data/main/data/power645.jsonl",
  POWER: "https://raw.githubusercontent.com/vietvudanh/vietlott-data/main/data/power655.jsonl"
};

function validRecord(record, game) {
  const result = record?.result;
  const expectedLength = game === "MEGA" ? 6 : 7;
  const max = game === "MEGA" ? 45 : 55;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(record?.date || "")) return false;
  if (!Array.isArray(result) || result.length !== expectedLength) return false;
  if (!result.every(n => Number.isInteger(n) && n >= 1 && n <= max)) return false;

  const main = result.slice(0, 6);
  if (new Set(main).size !== 6) return false;
  if (game === "POWER" && main.includes(result[6])) return false;

  return true;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const game = (searchParams.get("game") || "MEGA").toUpperCase();

  if (!["MEGA", "POWER"].includes(game)) {
    return Response.json(
      { error: "Unsupported game. Use MEGA or POWER." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(SOURCES[game], {
      headers: { "User-Agent": "Vietnam-AI-Lottery-Pro/2.0" },
      cache: "no-store"
    });

    if (!response.ok) {
      return Response.json(
        { error: "Historical data source unavailable" },
        { status: 502 }
      );
    }

    const body = await response.text();

    const parsed = body
      .split(/\r?\n/)
      .filter(Boolean)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(record => record && validRecord(record, game))
      .map(record => ({
        id: String(record.id),
        date: record.date,
        numbers: record.result.slice(0, 6),
        ...(game === "POWER"
          ? { specialNumber: record.result[6] }
          : {})
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    const unique = [];
    const seen = new Set();

    for (const draw of parsed) {
      const key = draw.id || draw.date;

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(draw);
      }
    }

    return Response.json({
      game,
      source: SOURCES[game],
      sourceType: "Third-party dataset; verify against official Vietlott results",
      fetchedAt: new Date().toISOString(),
      count: unique.length,
      latest: unique[0] || null,
      draws: unique
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
      }
    });

  } catch (error) {
    return Response.json({
      error: "Could not load historical results",
      detail: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}