#!/usr/bin/env node
// MCP server exposing DataForge to any MCP client (Claude Desktop, Claude Code,
// Cursor, etc.) as tools that call the DataForge REST API with an API key.
//
// Config (env vars):
//   DATAFORGE_API_KEY   required — created under Settings > API Keys
//   DATAFORGE_BASE_URL  optional — defaults to the hosted MVP

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = process.env.DATAFORGE_BASE_URL || "https://data-forge-jet.vercel.app";
const API_KEY = process.env.DATAFORGE_API_KEY;

if (!API_KEY) {
  console.error("DATAFORGE_API_KEY is required. Create one under Settings > API Keys.");
  process.exit(1);
}

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`DataForge API ${res.status}: ${await res.text()}`);
  }
  return res;
}

const server = new McpServer({ name: "dataforge", version: "0.1.0" });

server.tool(
  "list_projects",
  "List the caller's DataForge projects, with each project's latest batch status.",
  {},
  async () => {
    const projects = await (await api("/api/projects")).json();
    return { content: [{ type: "text", text: JSON.stringify(projects, null, 2) }] };
  }
);

server.tool(
  "create_project",
  "Create a new DataForge project to upload files into.",
  {
    name: z.string().describe("Project name"),
    module: z
      .enum(["LANGUAGE_VOICE", "BUSINESS_DATA", "GENERAL"])
      .optional()
      .describe("Project module, defaults to GENERAL"),
  },
  async ({ name, module }) => {
    const res = await (
      await api("/api/projects", { method: "POST", body: JSON.stringify({ name, module }) })
    ).json();
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  }
);

server.tool(
  "get_batch",
  "Get an upload batch (and its files) by batch ID.",
  { batchId: z.string() },
  async ({ batchId }) => {
    const res = await (await api(`/api/jobs?batchId=${encodeURIComponent(batchId)}`)).json();
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  }
);

server.tool(
  "export_dataset",
  "Generate a dataset export (data card) for an upload batch in the given format.",
  {
    batchId: z.string(),
    format: z.enum(["CSV", "JSON", "PARQUET", "COCO"]),
  },
  async ({ batchId, format }) => {
    const res = await (
      await api("/api/export", { method: "POST", body: JSON.stringify({ batchId, format }) })
    ).json();
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  }
);

server.tool(
  "download_dataset",
  "Download the caller's cleaned dataset as a zip and save it to a local path.",
  { destPath: z.string().describe("Local file path to write the zip to") },
  async ({ destPath }) => {
    const res = await api("/api/download");
    const buffer = Buffer.from(await res.arrayBuffer());
    const { writeFile } = await import("fs/promises");
    await writeFile(destPath, buffer);
    return {
      content: [{ type: "text", text: `Saved ${buffer.length} bytes to ${destPath}` }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
