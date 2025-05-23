declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
  const { search } = new URL(req.url);
  const apiUrl = `https://api.hogarshops.com/articulos${search}`;
  const accessToken = process.env.ACCESS_TOKEN_PRIVADO;

  if (!accessToken) {
    return new Response(JSON.stringify({ error: "Access token not set" }), { status: 500 });
  }

  const apiRes = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const contentType = apiRes.headers.get('content-type') || 'application/json';
  const data = await apiRes.text();

  return new Response(data, {
    status: apiRes.status,
    headers: {
      'Content-Type': contentType,
    },
  });
}