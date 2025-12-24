import React, { useState, useRef } from 'react';
import { Plus, Mail, Clock, GitBranch, Tag, X, Play, Save, Trash2 } from 'lucide-react';

// Node Types
type NodeType = 'email' | 'delay' | 'condition' | 'tag';

interface Node {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  data: {
    label?: string;
    description?: string;
  };
  parentId?: string; // Simple linking for this demo
}

export const AutomationBuilder: React.FC = () => {
  // Default initial state showing a simple welcome flow
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', type: 'email', x: 250, y: 50, data: { label: 'Welcome Email', description: 'Subject: Welcome to our platform!' } },
    { id: '2', type: 'delay', x: 250, y: 200, data: { label: 'Wait 2 Days', description: 'Delay: 48 hours' }, parentId: '1' },
    { id: '3', type: 'condition', x: 250, y: 350, data: { label: 'Opened Email?', description: 'Condition: email_opened' }, parentId: '2' },
    { id: '4', type: 'email', x: 100, y: 500, data: { label: 'Follow up - Value', description: 'Subject: Did you see this?' }, parentId: '3' },
    { id: '5', type: 'email', x: 400, y: 500, data: { label: 'Offer Discount', description: 'Subject: Special offer for you' }, parentId: '3' },
  ]);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!draggingId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 100; // Center offset
    const y = e.clientY - rect.top - 30;

    setNodes(prev => prev.map(n => n.id === draggingId ? { ...n, x, y } : n));
    setDraggingId(null);
  };

  const addNode = (type: NodeType) => {
    const id = Date.now().toString();
    const newNode: Node = {
      id,
      type,
      x: 50,
      y: 50, // Spawn at top left
      data: {
        label: type === 'email' ? 'New Email' : type === 'delay' ? 'Delay' : type === 'condition' ? 'Condition' : 'Tag',
        description: 'Click to configure'
      }
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id && n.parentId !== id));
  };

  // Helper to draw lines between nodes (Simplified for demo without libraries)
  const renderConnections = () => {
    return nodes.map(node => {
      if (!node.parentId) return null;
      const parent = nodes.find(n => n.id === node.parentId);
      if (!parent) return null;

      // Calculate center points
      const startX = parent.x + 128; // Width/2 roughly
      const startY = parent.y + 100; // Height
      const endX = node.x + 128;
      const endY = node.y;

      // Curvier bezier for flow chart look
      const pathData = `M ${startX} ${startY} C ${startX} ${startY + 50}, ${endX} ${endY - 50}, ${endX} ${endY}`;

      return (
        <g key={`${parent.id}-${node.id}`}>
          <path d={pathData} stroke="#475569" strokeWidth="2" fill="none" strokeDasharray="5,5" />
          <circle cx={endX} cy={endY} r="4" fill="#3b82f6" />
          <circle cx={startX} cy={startY} r="4" fill="#64748b" />
          {/* Logic Logic for Condition branches (Visual only) */}
          {parent.type === 'condition' && (
             <rect x={(startX + endX)/2 - 10} y={(startY + endY)/2 - 10} width="20" height="20" rx="4" fill={node.x < parent.x ? "#ef4444" : "#22c55e"} />
          )}
          {parent.type === 'condition' && (
             <text x={(startX + endX)/2 - 4} y={(startY + endY)/2 + 4} fill="white" fontSize="10" fontWeight="bold">{node.x < parent.x ? "No" : "Yes"}</text>
          )}
        </g>
      );
    });
  };

  const getNodeColor = (type: NodeType) => {
    switch(type) {
      case 'email': return 'bg-blue-600 border-blue-500';
      case 'delay': return 'bg-emerald-600 border-emerald-500';
      case 'condition': return 'bg-amber-600 border-amber-500';
      case 'tag': return 'bg-purple-600 border-purple-500';
      default: return 'bg-slate-700 border-slate-600';
    }
  };

  const getNodeIcon = (type: NodeType) => {
    switch(type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'delay': return <Clock className="h-4 w-4" />;
      case 'condition': return <GitBranch className="h-4 w-4" />;
      case 'tag': return <Tag className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Toolbar */}
      <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 shadow-md z-10">
         <div className="flex items-center gap-4">
            <div className="bg-indigo-500/20 p-2 rounded text-indigo-400">
                <GitBranch className="h-5 w-5" />
            </div>
            <div>
                <h3 className="font-bold text-white">Welcome Series Automation</h3>
                <p className="text-xs text-slate-400">Last saved: Just now</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
             <button className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors">
                 <Save className="h-4 w-4" /> Save
             </button>
             <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-colors">
                 <Play className="h-4 w-4" /> Activate Flow
             </button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Draggable Tools */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 p-4 flex flex-col gap-4 z-10">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Add Components</h4>
            
            <button onClick={() => addNode('email')} className="flex items-center gap-3 p-3 bg-slate-700 hover:bg-blue-600/20 hover:border-blue-500/50 border border-slate-600 rounded-lg transition-all group text-left">
                <div className="p-2 bg-blue-500 rounded-lg text-white shadow-md">
                    <Mail className="h-4 w-4" />
                </div>
                <div>
                    <span className="block font-medium text-slate-200">Email</span>
                    <span className="text-xs text-slate-400">Send a message</span>
                </div>
            </button>

            <button onClick={() => addNode('delay')} className="flex items-center gap-3 p-3 bg-slate-700 hover:bg-emerald-600/20 hover:border-emerald-500/50 border border-slate-600 rounded-lg transition-all group text-left">
                <div className="p-2 bg-emerald-500 rounded-lg text-white shadow-md">
                    <Clock className="h-4 w-4" />
                </div>
                <div>
                    <span className="block font-medium text-slate-200">Delay</span>
                    <span className="text-xs text-slate-400">Wait time</span>
                </div>
            </button>

            <button onClick={() => addNode('condition')} className="flex items-center gap-3 p-3 bg-slate-700 hover:bg-amber-600/20 hover:border-amber-500/50 border border-slate-600 rounded-lg transition-all group text-left">
                <div className="p-2 bg-amber-500 rounded-lg text-white shadow-md">
                    <GitBranch className="h-4 w-4" />
                </div>
                <div>
                    <span className="block font-medium text-slate-200">Condition</span>
                    <span className="text-xs text-slate-400">If/Else logic</span>
                </div>
            </button>

            <button onClick={() => addNode('tag')} className="flex items-center gap-3 p-3 bg-slate-700 hover:bg-purple-600/20 hover:border-purple-500/50 border border-slate-600 rounded-lg transition-all group text-left">
                <div className="p-2 bg-purple-500 rounded-lg text-white shadow-md">
                    <Tag className="h-4 w-4" />
                </div>
                <div>
                    <span className="block font-medium text-slate-200">Tag</span>
                    <span className="text-xs text-slate-400">Add/Remove tag</span>
                </div>
            </button>
            
            <div className="mt-auto p-4 bg-slate-900/50 rounded-lg border border-slate-700 text-center">
                <p className="text-xs text-slate-500">Drag elements to canvas (Simulated via Click for demo)</p>
            </div>
        </div>

        {/* Canvas */}
        <div 
            ref={canvasRef}
            className="flex-1 bg-slate-900 relative overflow-hidden react-flow-bg cursor-grab active:cursor-grabbing"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
           <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
              {renderConnections()}
           </svg>

           {nodes.map(node => (
               <div
                 key={node.id}
                 draggable
                 onDragStart={() => handleDragStart(node.id)}
                 style={{ left: node.x, top: node.y }}
                 className="absolute w-64 z-10 group"
               >
                  <div className={`bg-slate-800 rounded-lg shadow-xl border-l-4 ${getNodeColor(node.type).replace('bg-', 'border-')} border-slate-700 hover:ring-2 ring-blue-500/50 transition-all`}>
                      <div className={`px-4 py-2 border-b border-slate-700 flex items-center justify-between rounded-t-lg bg-gradient-to-r from-slate-800 to-slate-700`}>
                          <div className="flex items-center gap-2">
                              <span className={`p-1 rounded ${getNodeColor(node.type).split(' ')[0]} text-white`}>
                                  {getNodeIcon(node.type)}
                              </span>
                              <span className="font-semibold text-white text-sm">{node.type.charAt(0).toUpperCase() + node.type.slice(1)}</span>
                          </div>
                          <div className="flex gap-1">
                            <span className="text-xs text-slate-400 font-mono">ID: {node.id}</span>
                          </div>
                      </div>
                      <div className="p-4">
                          <p className="text-sm font-medium text-white mb-1">{node.data.label}</p>
                          <p className="text-xs text-slate-400 truncate">{node.data.description}</p>
                          
                          <button 
                            onClick={() => deleteNode(node.id)}
                            className="mt-3 text-xs text-red-400 hover:bg-red-900/30 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                              Delete
                          </button>
                      </div>
                      
                      {/* Connection Points (Visual) */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-800" />
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-800 hover:scale-125 transition-transform cursor-crosshair" />
                      
                      {node.type === 'condition' && (
                        <>
                         <div className="absolute top-1/2 -left-2 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-800" title="False Path"/>
                         <div className="absolute top-1/2 -right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800" title="True Path" />
                        </>
                      )}
                  </div>
               </div>
           ))}
        </div>
      </div>
    </div>
  );
};