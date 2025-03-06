import { set } from 'date-fns';
import { useState } from 'react';

export default function Input({ setNewNode }) {
  const [url, setUrl] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestionBank, setSuggestionBank] = useState([
    {
      "id": "Ring_isomorphism",
      "title": "Ring isomorphism"
    },
    {
      "id": "Mathematical_Treatise_in_Nine_Sections",
      "title": "Mathematical Treatise in Nine Sections"
    },
    {
      "id": "Crystal_structure",
      "title": "Crystal structure"
    },
    {
      "id": "Yohji_Yamamoto",
      "title": "Yohji Yamamoto"
    },
    {
      "id": "Prunus_virginiana",
      "title": "Prunus virginiana"
    },
    {
      "id": "Astringent",
      "title": "Astringent"
    },
    {
      "id": "Satyrium_liparops",
      "title": "Satyrium liparops"
    },
    {
      "id": "Recreational_use_of_nitrous_oxide",
      "title": "Recreational use of nitrous oxide"
    },
  ]);

  const suggestInput = () => {
    const randomIndex = Math.floor(Math.random() * suggestionBank.length);
    const randomUrl = suggestionBank[randomIndex];
    console.log(suggestionBank)
    setUrl(`https://en.wikipedia.org/wiki/${randomUrl.linkId}`);
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
        setSuggestionBank(result.links);
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
      <button onClick={suggestInput} disabled={loading} style={{ marginLeft: '10px' }}>
        Suggestion
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
