const https = require('https');

const COUNT_API_URLS = [
  'https://api.countapi.xyz/hit/markdacszzz/portfolio',
  'https://countapi.com/hit/markdacszzz/portfolio',
];

const fetchCount = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, { headers: { Accept: 'application/json' } }, (res) => {
        const contentType = res.headers['content-type'] || '';
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Count API returned ${res.statusCode}`));
          }

          if (!contentType.includes('application/json')) {
            return reject(new Error('Count API response was not JSON'));
          }

          try {
            const data = JSON.parse(body);
            return resolve(data);
          } catch (error) {
            return reject(error);
          }
        });
      })
      .on('error', reject)
      .setTimeout(5000, () => reject(new Error('Count API request timed out')));
  });

exports.handler = async function () {
  for (const url of COUNT_API_URLS) {
    try {
      const response = await fetchCount(url);
      return {
        statusCode: 200,
        body: JSON.stringify({
          count: response.value ?? response.count ?? 0,
          label: 'Total unique visitors',
        }),
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      };
    } catch (error) {
      console.error('Visitor count API failed for', url, error.message);
    }
  }

  return {
    statusCode: 503,
    body: JSON.stringify({
      error: 'Visitor count service unavailable',
      label: 'Visitor count unavailable',
    }),
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  };
};
