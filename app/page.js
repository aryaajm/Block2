"use client";

import { useState } from 'react';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
        });
      const data = await res.json();
      setResponse(data.content || 'No response received.');
      } catch (err) {
       setResponse('Error: ' + err.message);
      } finally {
       setLoading(false);
      }
    }

  return (
      <main style={{ maxWidth: 600, margin: '4rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
        <h1>Course Companion</h1>
        <p>Enter a topic and the AI will explain it in 3 bullet points.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
          <label htmlFor="topic" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
           Topic
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
             id="topic"
             type="text"
             value={topic}
             onChange={(e) => setTopic(e.target.value)}
             placeholder="e.g. Photosynthesis"
             style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }}
            />
            <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
              {loading ? 'Thinking and wondering and wondering some more...' : 'Ask'}
            </button>
          </div>
        </form>

        {response && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
            {response}
          </div>
        )}
      </main>
    );
}
