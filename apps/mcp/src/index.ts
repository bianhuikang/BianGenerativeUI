import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer } from "./server.js";

const PORT = Number(process.env.MCP_PORT) || 3100;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || ["*"];

const server = createMcpServer();
const transport = new WebStandardStreamableHTTPServerTransport();

const app = new Hono();

app.use(
  "*",
  cors({
    origin:
      ALLOWED_ORIGINS.length === 1 && ALLOWED_ORIGINS[0] === "*"
        ? "*"
        : ALLOWED_ORIGINS,
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "mcp-session-id",
      "Last-Event-ID",
      "mcp-protocol-version",
    ],
    exposeHeaders: ["mcp-session-id", "mcp-protocol-version"],
  })
);

app.get("/health", (c) => c.json({ status: "ok" }));
app.all("/mcp", (c) => transport.handleRequest(c.req.raw));

await server.connect(transport);
serve({ fetch: app.fetch, port: PORT });
console.error(`MCP server running on http://localhost:${PORT}/mcp`);
