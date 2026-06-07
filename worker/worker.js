export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    if (!from || !to) {
      return new Response(JSON.stringify({ error: "from and to are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const yahooUrl =
      `https://transit.yahoo.co.jp/search/print?` +
      `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

    const yahooRes = await fetch(yahooUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "ja,en-US;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const html = await yahooRes.text();

    let minutes = null;

    const matchMin = html.match(/所要時間[：:]\s*(\d+)分/);
    const matchHour = html.match(/所要時間[：:]\s*(\d+)時間(?:(\d+)分)?/);

    if (matchHour) {
      minutes = parseInt(matchHour[1]) * 60 + (matchHour[2] ? parseInt(matchHour[2]) : 0);
    } else if (matchMin) {
      minutes = parseInt(matchMin[1]);
    }

    if (minutes === null) {
      return new Response(
        JSON.stringify({ error: "parse_failed", html_snippet: html.slice(0, 2000) }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    return new Response(
      JSON.stringify({ minutes, from, to }),
      {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  },
};
