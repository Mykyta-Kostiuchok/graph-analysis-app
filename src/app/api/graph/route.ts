import { NextResponse } from "next/server";
import { buildGraph } from "@/lib/algorithms/graphBuilder";
import { calculateAllMetrics } from "@/lib/algorithms/metrics";
import { GraphData } from "@/types/graph";

// Supported file formats
type FileFormat = "json" | "csv" | "graphml" | "adjacency";

async function parseFileToGraphData(
  file: File,
  format: FileFormat,
): Promise<GraphData> {
  const text = await file.text();

  switch (format) {
    case "json":
      return parseJSON(text);
    case "csv":
      return parseCSV(text);
    case "graphml":
      return parseGraphML(text);
    case "adjacency":
      return parseAdjacencyMatrix(text);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function parseJSON(text: string): GraphData {
  const data = JSON.parse(text);

  // Support both {nodes, edges} and {vertices, links} shapes
  return {
    nodes: data.nodes ?? data.vertices ?? [],
    edges: data.edges ?? data.links ?? [],
  };
}

function parseCSV(text: string): GraphData {
  // Expected format: source,target,weight(optional)
  const lines = text
    .trim()
    .split("\n")
    .filter((l) => l.trim());
  const hasHeader =
    lines[0].toLowerCase().includes("source") ||
    lines[0].toLowerCase().includes("from");

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const nodeSet = new Set<string>();
  const edges: GraphData["edges"] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const [source, target, weight] = dataLines[i]
      .split(",")
      .map((s) => s.trim());

    if (!source || !target) continue;

    nodeSet.add(source);
    nodeSet.add(target);

    edges.push({
      id: `e${i}`,
      source,
      target,
      ...(weight !== undefined && { weight: parseFloat(weight) || 1 }),
    });
  }

  return {
    nodes: Array.from(nodeSet).map((id) => ({ id })),
    edges,
  };
}

function parseGraphML(text: string): GraphData {
  const nodes: GraphData["nodes"] = [];
  const edges: GraphData["edges"] = [];

  // Extract directed attribute
  const directedMatch = text.match(/edgedefault="(\w+)"/);
  const directed = directedMatch?.[1] === "directed";

  // Extract nodes
  const nodeRegex = /<node\s+id="([^"]+)"[^/]*(\/|>[\s\S]*?<\/node>)/g;
  let nodeMatch;
  while ((nodeMatch = nodeRegex.exec(text)) !== null) {
    const id = nodeMatch[1];
    const labelMatch = nodeMatch[0].match(/<data[^>]*key="[^"]*label[^"]*"[^>]*>([^<]+)<\/data>/i);
    nodes.push({ id, ...(labelMatch && { label: labelMatch[1] }) });
  }

  // Extract edges
  const edgeRegex = /<edge\s+id="([^"]+)"\s+source="([^"]+)"\s+target="([^"]+)"/g;
  let edgeMatch;
  while ((edgeMatch = edgeRegex.exec(text)) !== null) {
    edges.push({ id: edgeMatch[1], source: edgeMatch[2], target: edgeMatch[3] });
  }

  if (nodes.length === 0) throw new Error("No nodes found in GraphML");

  return { nodes, edges};
}

function parseAdjacencyMatrix(text: string): GraphData {
  const lines = text
    .trim()
    .split("\n")
    .filter((l) => l.trim());
  const nodes: GraphData["nodes"] = [];
  const edges: GraphData["edges"] = [];

  // Check for labeled header row (first cell empty or "node")
  const firstCell = lines[0].split(/[\s,]+/)[0].toLowerCase();
  const hasLabels = isNaN(Number(firstCell)) && firstCell !== "";
  const labelLine = hasLabels ? lines[0].split(/[\s,]+/).slice(1) : null;
  const dataLines = hasLabels ? lines.slice(1) : lines;

  const size = dataLines.length;

  for (let i = 0; i < size; i++) {
    const id = labelLine?.[i] ?? `n${i}`;
    nodes.push({ id });
  }

  let edgeIdx = 0;
  for (let i = 0; i < size; i++) {
    const parts = dataLines[i].split(/[\s,]+/).map(Number);
    // Skip label column if present
    const values = hasLabels ? parts.slice(1) : parts;

    for (let j = 0; j < size; j++) {
      if (values[j] && values[j] !== 0) {
        edges.push({
          id: `e${edgeIdx++}`,
          source: nodes[i].id,
          target: nodes[j].id,
          weight: values[j] !== 1 ? values[j] : undefined,
        });
      }
    }
  }

  return { nodes, edges};
}

function detectFormat(file: File, explicitFormat?: string): FileFormat {
  if (explicitFormat) return explicitFormat as FileFormat;

  const ext = file.name.split(".").pop()?.toLowerCase();
  const mimeType = file.type;

  if (ext === "json" || mimeType === "application/json") return "json";
  if (ext === "csv" || mimeType === "text/csv") return "csv";
  if (ext === "graphml" || ext === "xml") return "graphml";
  if (ext === "txt" || ext === "matrix") return "adjacency";

  // Fallback: try JSON first, then CSV
  return "json";
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    let graphData: GraphData;

    // Branch A: multipart/form-data (file upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided. Send the file in the "file" field.' },
          { status: 400 },
        );
      }

      // Optional explicit format override
      const explicitFormat = formData.get("format") as string | null;
      const format = detectFormat(file, explicitFormat ?? undefined);

      try {
        graphData = await parseFileToGraphData(file, format);
      } catch (parseError) {
        return NextResponse.json(
          {
            error: `Failed to parse file as ${format}: ${parseError instanceof Error ? parseError.message : "unknown parse error"}`,
            hint: "Use the 'format' field to specify: json | csv | graphml | adjacency",
          },
          { status: 422 },
        );
      }
    }
    // Branch B: raw JSON body (backward-compatible)
    else if (contentType.includes("application/json")) {
      graphData = await request.json();
    } else {
      return NextResponse.json(
        {
          error: "Unsupported Content-Type. Use multipart/form-data or application/json.",
        },
        { status: 415 },
      );
    }

    // Validation
    if (!Array.isArray(graphData?.nodes) || !Array.isArray(graphData?.edges)) {
      return NextResponse.json(
        { error: "Invalid graph data: expected nodes[] and edges[] arrays." },
        { status: 400 },
      );
    }

    if (graphData.nodes.length === 0) {
      return NextResponse.json(
        { error: "Graph must contain at least one node." },
        { status: 400 },
      );
    }

    // Build graph & compute metrics 
    const graphResult = buildGraph(graphData);
    const metrics = calculateAllMetrics(graphResult.graph);

    const responseData = {
      success: true,
      graph: {
        nodes: graphResult.graph.nodes().map((nodeId) => ({
          id: nodeId,
          ...graphResult.graph.getNodeAttributes(nodeId),
        })),
        edges: graphResult.graph.edges().map((edgeId) => ({
          id: edgeId,
          source: graphResult.graph.source(edgeId),
          target: graphResult.graph.target(edgeId),
          ...graphResult.graph.getEdgeAttributes(edgeId),
        })),
      },
      metrics,
      stats: {
        nodeCount: graphResult.nodeCount,
        edgeCount: graphResult.edgeCount,
        isDirected: graphResult.isDirected,
        isConnected: graphResult.isConnected,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Graph processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error processing graph",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
