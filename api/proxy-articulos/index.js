export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
    });
  }

  const url = new URL(req.url);
  const apiUrl = new URL(`https://api.hogarshops.com/articulos${url.search}`);
  const accessToken = process.env.ACCESS_TOKEN_PRIVADO;

  if (!accessToken) {
    return new Response(JSON.stringify({ error: "Access token not set" }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  apiUrl.searchParams.set('access_token', accessToken);

  const apiRes = await fetch(apiUrl.toString());
  const contentType = apiRes.headers.get('content-type') || 'application/json';
  const data = await apiRes.text();

  return new Response(data, {
    status: apiRes.status,
    headers: {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    },
  });
}