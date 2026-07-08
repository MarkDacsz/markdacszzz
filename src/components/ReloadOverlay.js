import React, { useEffect, useState } from 'react';
import './reloadOverlay.css';

export default function ReloadOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide overlay shortly after mount to create a smooth initial load
    const t = setTimeout(() => setVisible(false), 600);

    const handleBeforeUnload = () => {
      // Show overlay when the page is about to unload (reload/navigation)
      setVisible(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(t);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className={`reload-overlay ${visible ? 'visible' : 'hidden'}`} aria-hidden={!visible}>
      <div className="reload-panel">
        <div className="reload-spinner" aria-hidden="true">
          <svg viewBox="0 0 50 50" className="spinner-svg">
            <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
          </svg>
        </div>
        <div className="reload-text">Reloading…</div>
      </div>
    </div>
  );
}
