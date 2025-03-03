import { useState, useEffect } from 'react';
import Head from 'next/head';
import CytoscapeComponent from '../components/CytoscapeComponent';
import Input from '../components/Input';

export default function Home() {
  const [newNode, setNewNode] = useState(null);
  const [graphData, setGraphData] = useState({
    nodes: [],
    edges: [],
  });

  const [focusedNode, setFocusedNode] = useState(null);

  useEffect(() => {
    if (newNode && newNode.id) {
      setGraphData((prevData) => ({
        nodes: [...prevData.nodes, { data: newNode }],
        edges: [...prevData.edges],
      }));
    }
  }, [newNode]);

  return (
    <div>
      <Head>
        <title>howtodisappearcompletely</title>
        <meta name="description" content="A web scraping and visualization app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <CytoscapeComponent 
          nodesData={[...graphData.nodes, ...graphData.edges]} 
          setFocusedNode={setFocusedNode} // Pass click handler
        />
        <Input setNewNode={setNewNode} />
      </main>

      {focusedNode && (
        <div style={{
          width: '500px',
          maxHeight: '300px',
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '10px',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(206, 223, 255, 0.5) 52.5%, rgba(0, 85, 255, 0.15) 100%)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          border: '1px solid #ddd',
          borderRadius: '3px',
          zIndex: 10
        }}>
          <h3>{focusedNode.title || "Untitled"}</h3>
          <p>{focusedNode.content || "No content available"}</p>
          <button onClick={() => setFocusedNode(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
