export default async function handler(req, res) {
  const domain = req.headers['x-jira-domain'];
  if (!domain) {
    return res.status(400).json({ error: 'Missing X-Jira-Domain header' });
  }

  const { path, ...queryParams } = req.query;
  const apiPath = '/' + (Array.isArray(path) ? path.join('/') : (path ?? ''));
  const qs = new URLSearchParams(queryParams).toString();
  const targetUrl = `https://${domain}${apiPath}${qs ? '?' + qs : ''}`;

  const forwardHeaders = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (key !== 'host' && key !== 'x-jira-domain' && key !== 'connection') {
      forwardHeaders[key] = value;
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
    });

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
    return res.status(500).json({ error: 'Jira proxy error', message: err.message });
  }
}
