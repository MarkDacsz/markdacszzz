import React, { useEffect, useState } from 'react';
import './style.css';

const VisitorCounter = () => {
  const [count, setCount] = useState(null);
  const [monthLabel, setMonthLabel] = useState('');

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
          setMonthLabel(data.monthLabel);
        }
      } catch (error) {
        if (isMounted) {
          setCount('—');
          setMonthLabel('current month');
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
      <span className="visitor_counter__label">Monthly visitors</span>
      <strong className="visitor_counter__value">{count ?? '•••'}</strong>
      <span className="visitor_counter__meta">{monthLabel || 'loading...'}</span>
    </div>
  );
};

export default VisitorCounter;
