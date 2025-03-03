import { set } from 'date-fns';
import { useState } from 'react';

export default function Input({ setNewNode }) {
  const [url, setUrl] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const urlPool =[
    'https://en.wikipedia.org/wiki/Mathematical_Treatise_in_Nine_Sections',
    'https://en.wikipedia.org/wiki/Crystal_structure',
    'https://en.wikipedia.org/wiki/Yohji_Yamamoto',
    'https://en.wikipedia.org/wiki/Ordre_des_Arts_et_des_Lettres',
    'https://en.wikipedia.org/wiki/Cuisine_of_the_Midwestern_United_States',
    'https://en.wikipedia.org/wiki/Prunus_virginiana',
    'https://en.wikipedia.org/wiki/Astringent',
    'https://en.wikipedia.org/wiki/Satyrium_liparops',
    'https://en.wikipedia.org/wiki/Recreational_use_of_nitrous_oxide',
  ]

  const feelingLucky = () => {
    const randomIndex = Math.floor(Math.random() * urlPool.length);
    const randomUrl = urlPool[randomIndex];
    setUrl(randomUrl);
  }

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
    <div style={{
      width: '500px',
      margin: 'auto', textAlign: 'left',
      position: 'fixed',
      top: '20px',
      left: '20px',
    }}>
      <input
        type="text"
        placeholder="Enter Wikipedia URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: '80%', padding: '10px', marginBottom: '10px' }}
      />
      <br />
      <button onClick={fetchData} disabled={loading} >
        {loading ? 'Scraping...' : 'Scrape'}
      </button>
      <button onClick={feelingLucky} disabled={loading} style={{ marginLeft: '10px' }}>
        Randomize
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
