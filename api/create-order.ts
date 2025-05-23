export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request, context: { env: { ACCESS_TOKEN: string } }) {
  const token = context.env.ACCESS_TOKEN;

  const body = await req.json();

  const response = await fetch('https://api.hogarshops.com/orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
