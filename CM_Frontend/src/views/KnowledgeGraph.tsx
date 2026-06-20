// ─── views/KnowledgeGraph.tsx ─────────────────────────────────────────────────
// View wrapper — passes through to graph/KnowledgeGraph

import React from 'react';
import { KnowledgeGraph as GraphComponent } from '../graph/KnowledgeGraph';

export const KnowledgeGraph: React.FC = () => (
  <div className="h-full">
    <GraphComponent />
  </div>
);
