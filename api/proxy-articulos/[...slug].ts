declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
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

  try {
    const url = new URL(req.url);
    let slug = url.pathname.replace(/^\/api\/proxy-articulos\/?/, "");
    let apiPath = "";
    if (!slug || slug === "/") {
      apiPath = "";
    } else {
      const parts = slug.split("/").filter(Boolean);
      // Solo normalizá si el primer segmento es numérico y tiene menos de 7 dígitos
      if (
        parts.length > 0 &&
        /^\d+$/.test(parts[0]) &&
        parts[0].length < 7 &&
        !(parts.length > 1 && parts[1] === "imagenes")
      ) {
        parts[0] = parts[0].padStart(7, "0");
      }
      apiPath = "/" + parts.join("/");
    }
    const apiUrl = new URL(`https://api.hogarshops.com/articulos${apiPath}${url.search}`);
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
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}