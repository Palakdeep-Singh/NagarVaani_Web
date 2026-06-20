// ─── INTEGRATION GUIDE: HierarchyGraph in Other Dashboards ───────────────────
//
// The graph/HierarchyGraph component is a self-contained, role-aware widget.
// It connects to the store automatically (reads `officers` array).
// You can override or filter officers via props for scoped views.
//
// ─── 1. CM DASHBOARD (already integrated via views/HierarchyGraph.tsx) ────────
//
//   Tab: 'HierarchyGraph' → views/HierarchyGraph.tsx → wraps GraphComponent
//   No extra props needed — shows full Delhi network.
//
//
// ─── 2. DM DASHBOARD (views/DMView.tsx) ──────────────────────────────────────
//
// Add a "My Network" tab inside DMView that shows only that DM's district.
//
//   import { HierarchyGraph } from '../graph/HierarchyGraph';
//   import { useStore } from '../context/Store';
//
//   // Inside DMView component:
//   const { activeDistrict } = useStore();
//
//   // Anywhere in JSX where you want the graph panel:
//   <div style={{ height: '500px', borderRadius: '16px', overflow: 'hidden' }}>
//     <HierarchyGraph
//       filterDistrict={activeDistrict}
//       hubLabel={`${activeDistrict} Network`}
//       hubSub="District View"
//       showBreadcrumb={true}
//     />
//   </div>
//
//
// ─── 3. DEPARTMENT HEAD DASHBOARD ─────────────────────────────────────────────
//
//   import { HierarchyGraph } from '../graph/HierarchyGraph';
//   import { useStore } from '../context/Store';
//
//   const { activeDepartment } = useStore();
//
//   <div style={{ height: '480px', borderRadius: '16px', overflow: 'hidden' }}>
//     <HierarchyGraph
//       filterDepartment={activeDepartment}
//       hubLabel={activeDepartment}
//       hubSub="Department Network"
//       showBreadcrumb={true}
//     />
//   </div>
//
//
// ─── 4. STANDALONE (no store, custom officers array) ─────────────────────────
//
//   const myOfficers = [
//     { id: '1', name: 'Rajesh Kumar', designation: 'DM', district: 'South Delhi',
//       department: 'Revenue', roleLevel: 'district' },
//     { id: '2', name: 'Priya Singh', designation: 'CEO',  district: 'South Delhi',
//       department: 'Elections' },
//   ];
//
//   <HierarchyGraph
//     officers={myOfficers}
//     hubLabel="South Delhi"
//     hubSub="District Administration"
//   />
//
//
// ─── 5. FULL-PAGE VIEW (like the CM tab) ──────────────────────────────────────
//
//   Wrap in a container that gives the exact height and escapes any parent
//   padding. Copy the pattern from views/HierarchyGraph.tsx:
//
//   <div style={{ margin: '-24px', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
//     <HierarchyGraph hubLabel="My View" />
//   </div>
//
//
// ─── PROPS REFERENCE ──────────────────────────────────────────────────────────
//
//   officers?:          any[]     Override store officers. Default: reads from store.
//   filterDistrict?:    string    Only show officers from this district.
//   filterDepartment?:  string    Only show officers from this department.
//   hubLabel?:          string    Label on the central hub node. Default: 'Delhi CM'.
//   hubSub?:            string    Sub-label on hub node. Default: 'Chief Minister'.
//   bgColor?:           string    Canvas background hex. Default: '#050E1C'.
//   showToolbar?:       boolean   Show top toolbar. Default: true.
//   showBreadcrumb?:    boolean   Show breadcrumb bar. Default: true.
//
// ─────────────────────────────────────────────────────────────────────────────

export {};
