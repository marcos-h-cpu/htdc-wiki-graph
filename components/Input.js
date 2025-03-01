import { useState } from 'react';
import styles from './Input.module.css';

export default function Input({ setNewNode }) {
  const [url, setUrl] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
      const result = await response.json();
      if (response.ok) {
        setData(result);
        setNewNode(result); // Send the response to the parent component
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', textAlign: 'center' }}>
      <input
        type="text"
        placeholder="Enter Wikipedia URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: '80%', padding: '10px', marginBottom: '10px' }}
      />
      <br />
      <button onClick={fetchData} disabled={loading} style={{ cursor: 'pointer' }}>
        {loading ? 'Scraping...' : 'Scrape'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data && (
        <div className={styles.container}>
          <h2>{data.title}</h2>
          <div className={styles.field}>
            <p>{data.content}</p>
          </div>
          {console.log(data)}
        </div>
      )}
    </div>
  );
}
