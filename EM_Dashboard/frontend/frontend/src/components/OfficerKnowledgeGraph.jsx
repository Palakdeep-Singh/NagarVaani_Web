import React, { useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import api from '../utils/api';

export default function OfficerKnowledgeGraph({ activeMenu }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeMenu === 'Knowledge Graph') {
      fetchGraph();
    }
  }, [activeMenu]);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hierarchy/graph');
      if (res.status === 200) {
        setGraphData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch graph', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading graph...</div>;

  return (
    <div style={{ width: '100%', height: '500px', backgroundColor: '#f9fafb', borderRadius: '12px', padding: '12px' }}>
      {graphData.nodes.length > 0 ? (
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="label"
          nodeAutoColorBy="role"
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = `${node.label}\n${node.role}\nVoters: ${node.voterCount || 0}`;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.fillText(label, node.x, node.y);
          }}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          linkWidth={1}
        />
      ) : (
        <div>No graph data available.</div>
      )}
    </div>
  );
}
