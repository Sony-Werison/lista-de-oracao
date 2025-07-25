import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { PrayerListType, PrayerCardType } from '../types';
import { ListIcon, UserIcon, ArrowsPointingOutIcon } from './icons';

type MapMode = 'lists' | 'people';

interface Node {
  id: string;
  label: string;
  type: 'root' | 'list' | 'card' | 'person';
  x: number;
  y: number;
  data: any;
  color: string;
  dx?: number;
  dy?: number;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  path: string;
  color: string;
}

const PALETTE = ['#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6366F1'];

const getCurvePath = (source: {x: number, y: number}, target: {x: number, y: number}) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    // Simple quadratic bezier curve for a gentler arc
    const midX = source.x + dx / 2;
    const midY = source.y + dy / 2;
    const controlX = midX - dy * 0.2; // Control point perpendicular to the line
    const controlY = midY + dx * 0.2;
    return `M ${source.x},${source.y} Q ${controlX},${controlY} ${target.x},${target.y}`;
}

const MindMapView: React.FC<{
    lists: PrayerListType[];
    onEditCard: (card: PrayerCardType, listId: string) => void;
}> = ({ lists, onEditCard }) => {
  const [transform, setTransform] = useState({ k: 0.8, x: 0, y: 0 });
  const [mapMode, setMapMode] = useState<MapMode>('lists');
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const startPoint = useRef({ x: 0, y: 0 });
  const viewSize = useRef({ width: 800, height: 600});
  const initialPinchDistance = useRef(0);
  const startTransform = useRef({k: 0, x: 0, y: 0});

  useEffect(() => {
    const parentEl = svgRef.current?.parentElement;
    const resizeObserver = new ResizeObserver(entries => {
        if (entries[0] && parentEl) {
            const { width, height } = entries[0].contentRect;
            viewSize.current = { width, height };
            if (transform.x === 0 && transform.y === 0) { // Center initially
                setTransform(t => ({...t, x: width / 2, y: height / 2}));
            }
        }
    });

    if (parentEl) {
        resizeObserver.observe(parentEl);
    }
    
    return () => resizeObserver.disconnect();
  }, [transform.x, transform.y]);

  const staticGraph = useMemo(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const { width, height } = viewSize.current;
    const centerX = width / 2;
    const centerY = height / 2;

    const rootNode: Node = {
        id: 'root', label: 'Diário de Oração', type: 'root',
        x: centerX, y: centerY, data: {}, color: 'var(--text-primary)'
    };

    if (mapMode === 'lists') {
        const listAngleStep = (2 * Math.PI) / (lists.length || 1);
        lists.forEach((list, listIndex) => {
            const listColor = PALETTE[listIndex % PALETTE.length];
            const listAngle = listIndex * listAngleStep - Math.PI / 2;
            const listNode: Node = {
                id: `list-${list.id}`, label: list.title, type: 'list',
                x: centerX + 180 * Math.cos(listAngle),
                y: centerY + 180 * Math.sin(listAngle),
                data: list, color: listColor
            };
            newNodes.push(listNode);
            newEdges.push({ id: `edge-root-${list.id}`, source: 'root', target: listNode.id, path: '', color: listColor });
            
            const cardAngleSpread = (Math.PI / 2.5);
            const cardAngleStep = list.cards.length > 1 ? cardAngleSpread / (list.cards.length - 1) : 0;
            list.cards.forEach((card, cardIndex) => {
                const cardAngle = listAngle - (cardAngleSpread / 2) + cardIndex * cardAngleStep;
                const cardNode: Node = {
                    id: `card-${card.id}`, label: card.title, type: 'card',
                    x: listNode.x + 150 * Math.cos(cardAngle),
                    y: listNode.y + 150 * Math.sin(cardAngle),
                    data: {...card, listId: list.id}, color: 'var(--text-secondary)'
                };
                newNodes.push(cardNode);
                newEdges.push({ id: `edge-${list.id}-${card.id}`, source: listNode.id, target: cardNode.id, path: '', color: listColor });
            });
        });
    } else { // mapMode === 'people'
        const cardsByPerson = new Map<string, (PrayerCardType & { listId: string })[]>();
        lists.forEach(list => list.cards.forEach(card => {
            const people = card.person ? card.person.split(',').map(p => p.trim()) : ['Geral'];
            people.forEach(personKey => {
                if (!personKey) personKey = 'Geral';
                if (!cardsByPerson.has(personKey)) cardsByPerson.set(personKey, []);
                cardsByPerson.get(personKey)!.push({ ...card, listId: list.id });
            });
        }));

        const people = Array.from(cardsByPerson.keys());
        const personAngleStep = (2 * Math.PI) / (people.length || 1);
        people.forEach((personName, personIndex) => {
            const personColor = PALETTE[personIndex % PALETTE.length];
            const personAngle = personIndex * personAngleStep - Math.PI / 2;
            const personNode: Node = {
                id: `person-${personName}`, label: personName, type: 'person',
                x: centerX + 180 * Math.cos(personAngle),
                y: centerY + 180 * Math.sin(personAngle),
                data: { name: personName }, color: personColor
            };
            newNodes.push(personNode);
            newEdges.push({ id: `edge-root-${personName}`, source: 'root', target: personNode.id, path: '', color: personColor });

            const cards = cardsByPerson.get(personName)!;
            const cardAngleSpread = (Math.PI / 2.5);
            const cardAngleStep = cards.length > 1 ? cardAngleSpread / (cards.length - 1) : 0;
            cards.forEach((card, cardIndex) => {
                // Ensure unique ID for each card instance in the graph
                const uniqueCardId = `card-${personName}-${card.id}`;
                const cardAngle = personAngle - (cardAngleSpread / 2) + cardIndex * cardAngleStep;
                const cardNode: Node = {
                    id: uniqueCardId, label: card.title, type: 'card',
                    x: personNode.x + 120 * Math.cos(cardAngle),
                    y: personNode.y + 120 * Math.sin(cardAngle),
                    data: card, color: 'var(--text-secondary)'
                };
                newNodes.push(cardNode);
                newEdges.push({ id: `edge-person-${personName}-${card.id}`, source: personNode.id, target: uniqueCardId, path: '', color: personColor });
            });
        });
    }
    newNodes.unshift(rootNode); // Add root node for physics calculation
    return { nodes: newNodes, edges: newEdges };
  }, [lists, mapMode]);
  
  const [graph, setGraph] = useState(staticGraph);

  const handleZoomToFit = useCallback(() => {
    if (!svgRef.current || graph.nodes.length <= 1) return;

    const nodesToFit = graph.nodes.filter(n => n.type !== 'root');
    if (nodesToFit.length === 0) return;

    const padding = 80;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodesToFit.forEach(node => {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y);
    });

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    
    const { width: viewWidth, height: viewHeight } = viewSize.current;
    
    if (graphWidth < 1 || graphHeight < 1) {
         setTransform({ k: 1, x: viewWidth/2 - minX, y: viewHeight/2 - minY});
         return;
    }

    const scaleX = (viewWidth - padding * 2) / graphWidth;
    const scaleY = (viewHeight - padding * 2) / graphHeight;
    const k = Math.min(scaleX, scaleY, 1.5);

    const newX = (viewWidth / 2) - ((minX + graphWidth / 2) * k);
    const newY = (viewHeight / 2) - ((minY + graphHeight / 2) * k);
    
    setTransform({ k, x: newX, y: newY });
  }, [graph.nodes]);

  useEffect(() => {
    let nodes = JSON.parse(JSON.stringify(staticGraph.nodes));
    const edges = staticGraph.edges;
    
    if (!nodes.length) {
        setGraph({ nodes: [], edges: [] });
        return;
    }

    const N_ITERATIONS = 200;
    const REPEL_STRENGTH = 8000;
    const SPRING_STRENGTH = 0.08;
    const getSpringLength = (sourceType: string, targetType: string) => {
        if (sourceType === 'root') return 150;
        if (sourceType === 'list' || sourceType === 'person') return 120;
        return 100;
    }

    for (let i = 0; i < N_ITERATIONS; i++) {
        nodes.forEach(n1 => {
            n1.dx = 0;
            n1.dy = 0;
            nodes.forEach(n2 => {
                if (n1 === n2) return;
                const dx = n1.x - n2.x;
                const dy = n1.y - n2.y;
                let distSq = dx * dx + dy * dy;
                if (distSq < 1) distSq = 1;
                const dist = Math.sqrt(distSq);
                const force = REPEL_STRENGTH / distSq;
                n1.dx += (dx / dist) * force;
                n1.dy += (dy / dist) * force;
            });
        });

        edges.forEach(edge => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            if (!source || !target) return;

            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const displacement = dist - getSpringLength(source.type, target.type);
            const force = SPRING_STRENGTH * displacement;
            
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if(source.type !== 'root') {
                source.dx += fx / 2;
                source.dy += fy / 2;
            }
            if(target.type !== 'root') {
                target.dx -= fx / 2;
                target.dy -= fy / 2;
            }
        });

        nodes.forEach(node => {
            if (node.type === 'root') return;
            const DAMPING = 0.95;
            node.x += node.dx * 0.05; // Timestep
            node.y += node.dy * 0.05;
            node.dx *= DAMPING;
            node.dy *= DAMPING;
        });
    }
    
    const { width, height } = viewSize.current;
    const rootNode = nodes.find(n => n.type === 'root');
    if(rootNode) {
        const dx = (width / 2) - rootNode.x;
        const dy = (height / 2) - rootNode.y;
        nodes.forEach(n => {
            n.x += dx;
            n.y += dy;
        });
    }

    const finalEdges = edges.map(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        return { ...edge, path: source && target ? getCurvePath(source, target) : '' };
    });

    setGraph({ nodes, edges: finalEdges });

  }, [staticGraph]);

  useEffect(() => {
    const timer = setTimeout(() => {
        handleZoomToFit();
    }, 350);
    return () => clearTimeout(timer);
  }, [handleZoomToFit]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!svgRef.current) return;
    const { clientX, clientY } = e;
    const { left, top } = svgRef.current.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    const scaleFactor = 1.1;
    const newK = e.deltaY > 0 ? transform.k / scaleFactor : transform.k * scaleFactor;
    const k = Math.max(0.1, Math.min(newK, 5));
    const newX = x - (x - transform.x) * (k / transform.k);
    const newY = y - (y - transform.y) * (k / transform.k);
    setTransform({ k, x: newX, y: newY });
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    isPanning.current = true;
    startPoint.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const newX = e.clientX - startPoint.current.x;
    const newY = e.clientY - startPoint.current.y;
    setTransform({ k: transform.k, x: newX, y: newY });
  };
  
  const handleMouseUp = () => { isPanning.current = false; };
  
    const handleTouchStart = (e: React.TouchEvent) => {
      if (!svgRef.current) return;
      startTransform.current = transform;
      if (e.touches.length === 1) { // Panning
          isPanning.current = true;
          startPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) { // Zooming
          isPanning.current = false; // Disable panning when zooming
          initialPinchDistance.current = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
          );
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 1 && isPanning.current) { // Panning
          const newX = startTransform.current.x + (e.touches[0].clientX - startPoint.current.x);
          const newY = startTransform.current.y + (e.touches[0].clientY - startPoint.current.y);
          setTransform({ k: transform.k, x: newX, y: newY });
      } else if (e.touches.length === 2 && initialPinchDistance.current > 0) { // Zooming
          if (!svgRef.current) return;
          const newDist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
          );
          const scaleFactor = newDist / initialPinchDistance.current;
          const newK = startTransform.current.k * scaleFactor;
          const k = Math.max(0.1, Math.min(newK, 5));

          const { left, top } = svgRef.current.getBoundingClientRect();
          const x = (e.touches[0].clientX + e.touches[1].clientX) / 2 - left;
          const y = (e.touches[0].clientY + e.touches[1].clientY) / 2 - top;

          const newX = x - (x - startTransform.current.x) * (k / transform.k);
          const newY = y - (y - startTransform.current.y) * (k / transform.k);
          setTransform({k, x: newX, y: newY});
      }
  };

  const handleTouchEnd = () => {
      isPanning.current = false;
      initialPinchDistance.current = 0;
  };

  const handleNodeClick = (node: Node) => {
      if (node.type === 'card') {
          onEditCard(node.data, node.data.listId);
      }
  }

  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col p-2 sm:p-4 bg-[var(--bg-color)]">
       <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4 px-1">
            <div className="flex items-center gap-1 p-1 bg-[var(--bg-tertiary)] rounded-lg">
                <button
                    onClick={() => setMapMode('lists')}
                    className={`px-2 sm:px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs transition-colors ${
                        mapMode === 'lists' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--card-bg-hover)]'
                    }`}
                >
                    <ListIcon className="w-4 h-4" />
                    Listas
                </button>
                <button
                    onClick={() => setMapMode('people')}
                    className={`px-2 sm:px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs transition-colors ${
                        mapMode === 'people' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--card-bg-hover)]'
                    }`}
                >
                   <UserIcon className="w-4 h-4" />
                    Pessoas
                </button>
            </div>
            <div className="flex items-center gap-1 p-1 bg-[var(--bg-tertiary)] rounded-lg">
                <button onClick={handleZoomToFit} className="p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--card-bg-hover)]" title="Ajustar à tela"><ArrowsPointingOutIcon className="w-4 h-4"/></button>
            </div>
        </div>
      <div className="flex-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] overflow-hidden cursor-grab active:cursor-grabbing">
        <svg
          ref={svgRef}
          className="w-full h-full"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
            {graph.edges.map(edge => (
                <path
                  key={edge.id}
                  d={edge.path}
                  stroke={edge.color}
                  strokeWidth="1.5"
                  fill="none"
                  style={{ transition: 'd 0.3s ease' }}
                  opacity="0.8"
                />
              )
            )}
            {graph.nodes.map(node => {
              if (node.type === 'root') return null;
              
              const isCategory = node.type === 'list' || node.type === 'person';

              return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onClick={() => handleNodeClick(node)}
                style={{ transition: 'transform 0.3s ease' }}
              >
                <circle r="3.5" fill="var(--bg-secondary)" stroke={node.color} strokeWidth="1.5" />

                {isCategory && (
                    <rect
                        x="8"
                        y="-9"
                        width={node.label.length * 5.5 + 8}
                        height="18"
                        rx="6"
                        ry="6"
                        fill={node.color}
                        fillOpacity="0.2"
                    />
                )}

                <text
                    x={12}
                    y={4}
                    fill={isCategory ? node.color : 'var(--text-secondary)'}
                    fontSize={10}
                    fontWeight={isCategory ? '600' : '400'}
                    className="transition-all group-hover:font-bold"
                    style={{ pointerEvents: 'none', textShadow: '0 0 5px var(--bg-secondary)' }}
                >
                  {node.label}
                </text>
              </g>
              )
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default MindMapView;