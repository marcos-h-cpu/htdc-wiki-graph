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

useEffect(() => {
    if (newNode && newNode.id) {
      setGraphData((prevData) => ({
        nodes: [...prevData.nodes, { data: newNode }],
        edges: [
          ...prevData.edges,
        ]
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
        <CytoscapeComponent nodesData={[...graphData.nodes, ...graphData.edges]} />
        <Input setNewNode={setNewNode} />

        {/* <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f4f4f4', borderRadius: '5px' }}>
          <h3>Graph Data (JSON)</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {JSON.stringify(graphData, null, 2)}
          </pre>
        </div> */}
      </main>
    </div>
  );
}