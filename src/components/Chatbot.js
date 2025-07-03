import React, { useState } from 'react';

const Chatbot = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuery = async () => {
    if (!query) return;

    setLoading(true);
    setError('');
    setResponse([]);

    try {
      const res = await fetch(`https://supp.ai/api/agent/search?q=${encodeURIComponent(query)}`);

      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setResponse(data.results || []);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>SUPP AI Research Chatbot</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask me anything..."
        style={{ width: '300px', marginRight: '10px' }}
      />
      <button onClick={handleQuery} disabled={loading}>
        {loading ? 'Loading...' : 'Ask'}
      </button>
      <div style={{ marginTop: '20px' }}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <h2>Response:</h2>
        {response.length > 0 ? (
          response.map((item, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <p><strong>Title:</strong> {item.title}</p>
              <p><strong>Snippet:</strong> {item.snippet}</p>
            </div>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
