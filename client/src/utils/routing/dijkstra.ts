import type { PathNode, PathEdge, RouteResult, RouteStep } from '../../types';

interface DistanceTable {
  [nodeId: string]: {
    distance: number;
    previousNodeId: string | null;
    edgeUsed: PathEdge | null;
  };
}

/**
 * Deterministic Dijkstra Shortest Path Algorithm for Campus Walking Routes.
 * No AI/ML used - strictly graph theory based on physical road distance.
 */
export function calculateDijkstraRoute(
  startNodeId: string,
  targetNodeId: string,
  nodes: PathNode[],
  edges: PathEdge[]
): RouteResult | null {
  if (!startNodeId || !targetNodeId) return null;
  
  const nodeMap = new Map<string, PathNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  if (!nodeMap.has(startNodeId) || !nodeMap.has(targetNodeId)) return null;

  // Build Adjacency List (Undirected Graph for walking paths)
  const adjacencyList = new Map<string, Array<{ neighborId: string; edge: PathEdge }>>();
  
  nodes.forEach(n => adjacencyList.set(n.id, []));

  edges.forEach(edge => {
    if (adjacencyList.has(edge.from)) {
      adjacencyList.get(edge.from)!.push({ neighborId: edge.to, edge });
    }
    if (adjacencyList.has(edge.to)) {
      adjacencyList.get(edge.to)!.push({ neighborId: edge.from, edge });
    }
  });

  // Initialize Dijkstra Distance Table
  const distances: DistanceTable = {};
  const unvisited = new Set<string>();

  nodes.forEach(node => {
    distances[node.id] = {
      distance: node.id === startNodeId ? 0 : Infinity,
      previousNodeId: null,
      edgeUsed: null,
    };
    unvisited.add(node.id);
  });

  while (unvisited.size > 0) {
    // Pick unvisited node with smallest distance
    let currentId: string | null = null;
    let smallestDistance = Infinity;

    unvisited.forEach(nodeId => {
      if (distances[nodeId].distance < smallestDistance) {
        smallestDistance = distances[nodeId].distance;
        currentId = nodeId;
      }
    });

    if (currentId === null || smallestDistance === Infinity) {
      // Remaining nodes unreachable
      break;
    }

    if (currentId === targetNodeId) {
      // Reached destination!
      break;
    }

    unvisited.delete(currentId);

    const neighbors = adjacencyList.get(currentId) || [];
    for (const { neighborId, edge } of neighbors) {
      if (unvisited.has(neighborId)) {
        const newDist = distances[currentId].distance + edge.distance;
        if (newDist < distances[neighborId].distance) {
          distances[neighborId].distance = newDist;
          distances[neighborId].previousNodeId = currentId;
          distances[neighborId].edgeUsed = edge;
        }
      }
    }
  }

  // Reconstruct path
  if (distances[targetNodeId].distance === Infinity) {
    return null; // No path found
  }

  const pathNodeIds: string[] = [];
  const traversedEdges: PathEdge[] = [];
  let curr: string | null = targetNodeId;

  while (curr !== null) {
    pathNodeIds.unshift(curr);
    const prevEntry: { distance: number; previousNodeId: string | null; edgeUsed: PathEdge | null } = distances[curr];
    if (prevEntry.edgeUsed) {
      traversedEdges.unshift(prevEntry.edgeUsed);
    }
    curr = prevEntry.previousNodeId;
  }


  const pathNodes = pathNodeIds.map(id => nodeMap.get(id)!);
  const totalDistance = Math.round(distances[targetNodeId].distance);
  
  // Walking time in minutes assuming average walking speed of 1.2 m/s (approx 72 m/min)
  const walkingTimeMinutes = Math.max(1, Math.round(totalDistance / 72));

  // Generate Turn-by-Turn Route Instructions
  const steps: RouteStep[] = [];

  for (let i = 0; i < pathNodes.length - 1; i++) {
    const currentNode = pathNodes[i];
    const nextNode = pathNodes[i + 1];
    const edge = traversedEdges[i];

    let instruction = '';
    const road = edge?.roadName || 'campus pathway';

    if (i === 0) {
      instruction = `Start at ${currentNode.name}. Head along ${road}`;
    } else if (i === pathNodes.length - 2) {
      instruction = `Follow ${road} and arrive at ${nextNode.name}`;
    } else {
      instruction = `Continue along ${road} past ${currentNode.name} towards ${nextNode.name}`;
    }

    steps.push({
      stepNumber: i + 1,
      instruction,
      distance: Math.round(edge?.distance || 0),
      landmark: nextNode.name,
    });
  }

  return {
    distance: totalDistance,
    walkingTime: walkingTimeMinutes,
    pathNodeIds,
    nodes: pathNodes,
    edges: traversedEdges,
    steps,
  };
}
