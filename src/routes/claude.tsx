import { Component, createSignal, createEffect, onMount } from 'solid-js';
import type { Circle as CircleType } from 'konva/lib/shapes/Circle';
import type { Stage, Layer } from 'konva/lib/index';

interface NodeData {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
}

type NodeSignal = [() => NodeData, (data: Partial<NodeData>) => void];

// Flag for server-side detection
const isServer = typeof window === 'undefined';

const KonvaNodesComponent: Component = () => {
  const containerId = 'canvas-container';
  const [isClient, setIsClient] = createSignal(false);
  const [nodes, setNodes] = createSignal<Map<string, NodeSignal>>(new Map());
  
  let stage: Stage | null = null;
  let layer: Layer | null = null;

  // Example initial nodes
  const initialNodes: NodeData[] = [
    { id: 'node1', x: 100, y: 100, radius: 20, color: 'red' },
    { id: 'node2', x: 200, y: 200, radius: 30, color: 'blue' }
  ];

  // Initialize nodes signals
  initialNodes.forEach(nodeData => {
    const [nodeSignal, setNodeSignal] = createSignal(nodeData);
    nodes().set(nodeData.id, [nodeSignal, setNodeSignal]);
  });

  onMount(() => {
    setIsClient(true);
  });

  createEffect(() => {
    // Skip initialization if we're on the server or Konva isn't ready
    if (isServer || !isClient()) return;

    // Dynamically import Konva only on the client side
    import('konva').then(({ Stage, Layer, Circle }) => {
      // Initialize stage
      stage = new Stage({
        container: containerId,
        width: 800,
        height: 600
      });

      layer = new Layer();
      stage.add(layer);

      // Create Konva nodes for each node signal
      nodes().forEach(([nodeSignal], id) => {
        const data = nodeSignal();
        const circle = new Circle({
          x: data.x,
          y: data.y,
          radius: data.radius,
          fill: data.color,
          id: data.id
        });

        layer?.add(circle);

        // Create effect to update circle when signal changes
        createEffect(() => {
          const currentData = nodeSignal();
          const circleNode = layer?.findOne(`#${data.id}`) as CircleType;
          
          if (circleNode) {
            circleNode.setAttrs({
              x: currentData.x,
              y: currentData.y,
              radius: currentData.radius,
              fill: currentData.color
            });
            circleNode.draw();
          }
        });
      });

      layer.draw();
    });

    // Cleanup function
    return () => {
      stage?.destroy();
      stage = null;
      layer = null;
    };
  });

  // Function to update a node
  const updateNode = (id: string, updates: Partial<NodeData>) => {
    const nodeSignal = nodes().get(id);
    if (nodeSignal) {
      const [getCurrentData, setNodeData] = nodeSignal;
      setNodeData({ ...getCurrentData(), ...updates });
    }
  };

  // Function to add a new node
  const addNode = (nodeData: NodeData) => {
    const [nodeSignal, setNodeSignal] = createSignal(nodeData);
    const nodesMap = nodes();
    nodesMap.set(nodeData.id, [nodeSignal, setNodeSignal]);
    setNodes(nodesMap);

    if (layer) {
      import('konva').then(({ Circle }) => {
        const circle = new Circle({
          x: nodeData.x,
          y: nodeData.y,
          radius: nodeData.radius,
          fill: nodeData.color,
          id: nodeData.id
        });

        layer?.add(circle);
        layer?.draw();

        createEffect(() => {
          const currentData = nodeSignal();
          const circleNode = layer?.findOne(`#${nodeData.id}`) as CircleType;
          
          if (circleNode) {
            circleNode.setAttrs({
              x: currentData.x,
              y: currentData.y,
              radius: currentData.radius,
              fill: currentData.color
            });
            circleNode.draw();
          }
        });
      });
    }
  };

  // Example: Update a node after mount
  createEffect(() => {
    if (!isServer && isClient()) {
      setTimeout(() => {
        updateNode('node1', { 
          x: 150, 
          y: 150, 
          color: 'green' 
        });
      }, 2000);
    }
  });

  return (
    <div 
      id={containerId}
      style={{
        "width": "800px",
        "height": "600px"
      }}
    />
  );
};

export default KonvaNodesComponent;