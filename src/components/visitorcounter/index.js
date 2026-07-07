import React, { useEffect, useState } from 'react';
import './style.css';

const LOCAL_API = '/api/visitors';
const COUNTAPI_HIT = 'https://api.countapi.xyz/hit/markdacszzz/portfolio';
const COUNTAPI_GET = 'https://api.countapi.xyz/get/markdacszzz/portfolio';

const VisitorCounter = () => {
  const [count, setCount] = useState(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    let isMounted = true;

    const useLocalApi = window.location.hostname.includes('localhost');
    const alreadyCounted = Boolean(window.localStorage.getItem('visitor_counted'));

    const fetchCountApi = async () => {
      try {
        if (!alreadyCounted) {
          const hitResponse = await fetch(COUNTAPI_HIT, {
            headers: { Accept: 'application/json' },
          });
          if (!hitResponse.ok) throw new Error('Count API hit failed');
          const hitData = await hitResponse.json();
          window.localStorage.setItem('visitor_counted', 'true');
          return hitData.value;
        }

        const getResponse = await fetch(COUNTAPI_GET, {
          headers: { Accept: 'application/json' },
        });
        if (!getResponse.ok) throw new Error('Count API get failed');
        const getData = await getResponse.json();
        return getData.value;
      } catch (error) {
        return null;
      }
    };

    const fetchCount = async () => {
      try {
        let value = null;

        if (useLocalApi) {
          const response = await fetch(LOCAL_API, {
            headers: { Accept: 'application/json' },
          });
          if (response.ok) {
            const data = await response.json();
            value = data.count;
          }
        }

        if (value === null) {
          value = await fetchCountApi();
        }

        if (isMounted) {
          setCount(value ?? '—');
          setLabel('Total unique visitors');
        }
      } catch (error) {
        if (isMounted) {
          setCount('—');
          setLabel('Total unique visitors');
        }
      }
    };

    fetchCount();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="visitor_counter" aria-live="polite">
      <span className="visitor_counter__label">Visitors</span>
      <strong className="visitor_counter__value">{count ?? '•••'}</strong>
      <span className="visitor_counter__meta">{label || 'loading...'}</span>
    </div>
  );
};

export default VisitorCounter;
