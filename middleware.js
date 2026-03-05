export const config = {
  matcher: ['/jira-api/:path*', '/tempo-api/:path*'],
};

export default async function middleware(request) {
  const url = new URL(request.url);

  if (url.pathname.startsWith('/jira-api')) {
    const domain = request.headers.get('x-jira-domain');
    if (!domain) {
      return new Response(JSON.stringify({ error: 'Missing X-Jira-Domain header' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const targetPath = url.pathname.replace(/^\/jira-api/, '');
    const targetUrl = `https://${domain}${targetPath}${url.search}`;

    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('x-jira-domain');
    headers.delete('connection');

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  }

  if (url.pathname.startsWith('/tempo-api')) {
    const targetPath = url.pathname.replace(/^\/tempo-api/, '');
    const targetUrl = `https://api.tempo.io${targetPath}${url.search}`;

    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('connection');

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  }
}
