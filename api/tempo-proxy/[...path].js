export default async function handler(req, res) {
  const { path, ...queryParams } = req.query;
  const apiPath = '/' + (Array.isArray(path) ? path.join('/') : (path ?? ''));
  const qs = new URLSearchParams(queryParams).toString();
  const targetUrl = `https://api.tempo.io${apiPath}${qs ? '?' + qs : ''}`;

  const forwardHeaders = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (key !== 'host' && key !== 'connection') {
      forwardHeaders[key] = value;
    }
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders,
    };
    if (body && req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = body;
    }

    const response = await fetch(targetUrl, fetchOptions);

    const contentType = response.headers.get('content-type') ?? '';
    res.status(response.status);
    res.setHeader('content-type', contentType);

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.json(data);
    } else {
      const text = await response.text();
      return res.send(text);
    }
  } catch (err) {
    return res.status(500).json({ error: 'Tempo proxy error', message: err.message });
  }
}
