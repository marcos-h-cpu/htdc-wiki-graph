import { set } from 'date-fns';
import { useState } from 'react';

export default function Input({ setNewNode }) {
  const [url, setUrl] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestionBank, setSuggestionBank] = useState([
    "Ring_isomorphism",
    "Pseudoscorpion",
    "Mathematical_Treatise_in_Nine_Sections",
    "Crystal_structure",
    "Yohji_Yamamoto",
    "Astringent",
    "Recreational_use_of_nitrous_oxide"
  ]);

  const suggestInput = () => {
    if (!suggestionBank || suggestionBank.length === 0) {
      console.error("Suggestion bank is empty or undefined.");
      return;
    }
  
    const randomIndex = Math.floor(Math.random() * suggestionBank.length);
    const randomUrl = suggestionBank[randomIndex];
  
    if (!randomUrl) {
      console.error("Random URL is invalid:", randomUrl);
      return;
    }
  
    setUrl(`https://en.wikipedia.org/wiki/${randomUrl}`);
  };

  const fetchData = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
        console.log(result)
        setNewNode(result); 
        setSuggestionBank(result.links)
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
      textAlign: 'left',
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
