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
    // Extrae el slug correctamente
    let slug = url.pathname.replace(/^\/api\/proxy-articulos\/?/, "");
    let apiPath = "";
    if (!slug || slug === "/") {
      // Ruta base: /api/proxy-articulos
      apiPath = "";
    } else {
      // Rutas anidadas: /api/proxy-articulos/123/imagenes
      const parts = slug.split("/").filter(Boolean);
      if (parts.length > 0 && /^\d+$/.test(parts[0])) {
        parts[0] = parts[0].padStart(7, "0");
      }
      apiPath = "/" + parts.join("/");
    }

    const apiUrl = new URL(`https://api.hogarshops.com/articulos${apiPath}${url.search}`);
    const accessToken = process.env.ACCESS_TOKEN_PRIVADO;

    console.log("API URL:", apiUrl.toString());

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