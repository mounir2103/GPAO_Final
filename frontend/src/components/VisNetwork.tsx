import React, { useEffect, useRef } from 'react';

interface VisNetworkProps {
  gammes: Record<string, Record<string, number>>;
  niveaux: Record<string, string[]>;
}

const colors = [
  '#2563eb', '#f97316', '#10b981', '#e11d48', '#a21caf', '#f59e42', '#2dd4bf', '#f43f5e', '#6366f1', '#84cc16'
];

const VisNetwork: React.FC<VisNetworkProps> = ({ gammes, niveaux }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug logs
  console.log('VisNetwork gammes:', gammes);
  console.log('VisNetwork niveaux:', niveaux);

  useEffect(() => {
    if (!containerRef.current) return;
    let network: any = null;
    // @ts-ignore
    const Network = window.vis.Network;
    // Nodes: all machines, grouped by niveau (average rank)
    const nodes: any[] = [];
    Object.entries(niveaux).forEach(([moyen, machines], i) => {
      machines.forEach((m, j) => {
        nodes.push({
          id: m,
          label: m + `\n(rang: ${moyen})`,
          level: i,
          x: i * 200,
          y: j * 80,
          color: '#e0e7ff',
          font: { color: '#1e293b', size: 18, face: 'monospace' },
          borderWidth: 2
        });
      });
    });
    // Edges: for each product, draw arrows between its machine sequence
    const edges: any[] = [];
    Object.entries(gammes).forEach(([prod, ops], pidx) => {
      const seq = Object.entries(ops).sort((a, b) => a[1] - b[1]).map(([m]) => m);
      for (let i = 0; i < seq.length - 1; i++) {
        edges.push({
          from: seq[i],
          to: seq[i + 1],
          arrows: 'to',
          color: { color: colors[pidx % colors.length], opacity: 0.8 },
          width: 3,
          label: prod,
          font: { align: 'middle', color: colors[pidx % colors.length], size: 14 },
          smooth: { type: 'curvedCW', roundness: 0.2 + (pidx % 3) * 0.1 }
        });
      }
    });
    const data = { nodes, edges };
    const options = {
      layout: { hierarchical: false },
      nodes: {
        shape: 'box',
        margin: 10,
        borderWidth: 2,
        shadow: true
      },
      edges: {
        smooth: true,
        arrows: { to: { enabled: true, scaleFactor: 1.2 } },
        shadow: false
      },
      physics: false,
      height: '500px'
    };
    network = new Network(containerRef.current!, data, options);
    return () => { if (network) network.destroy(); };
  }, [gammes, niveaux]);

  return <div ref={containerRef} style={{ height: 500, width: '100%', background: '#f8fafc', borderRadius: 8 }} />;
};

export default VisNetwork; 