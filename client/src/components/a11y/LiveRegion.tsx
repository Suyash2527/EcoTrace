import React, { useState, useEffect } from 'react';

// A simple hook to manage announcements globally
let announceFn: (message: string) => void = () => {};

export function useAnnouncer() {
  return { announce: announceFn };
}

export function LiveRegion() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    announceFn = (newMessage: string) => {
      setMessage(newMessage);
      // Clear after a short delay so the same message can be announced again if needed
      setTimeout(() => setMessage(''), 3000);
    };
    return () => {
      announceFn = () => {};
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}
    >
      {message}
    </div>
  );
}
