// ─── views/HierarchyGraph.tsx ─────────────────────────────────────────────────
// View wrapper — passes through to graph/HierarchyGraph

import React from 'react';
import { HierarchyGraph as GraphComponent } from '../graph/HierarchyGraph';

export const HierarchyGraph: React.FC = () => (
  <div className="h-full">
    <GraphComponent />
  </div>
);
