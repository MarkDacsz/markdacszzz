import React, { useEffect, useState } from 'react';
import './style.css';

const VisitorCounter = () => {
  const [count, setCount] = useState(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchCount = async () => {
      try {
        const response = await fetch('/api/visitors', {
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Unable to load visitor count');
        }

        const data = await response.json();

        if (isMounted) {
          setCount(data.count);
          setLabel(data.label || 'Total unique visitors');
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
