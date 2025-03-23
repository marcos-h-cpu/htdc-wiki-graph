import { useState, useEffect } from 'react';
import Head from 'next/head';
import CytoscapeComponent from '../components/CytoscapeComponent';
import Input from '../components/Input';
import FocusNode from '../components/FocusNode';

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
          setFocusedNode={setFocusedNode}
        />
        <Input setNewNode={setNewNode} />
      </main>
      {focusedNode && (
        <FocusNode focusedNode={focusedNode} setFocusedNode={setFocusedNode} />
      )}

    </div>
  );
}
