import { KafkaJS } from "@confluentinc/kafka-javascript";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DefaultClientManager } from "@src/confluent/client-manager.js";
import { ToolHandler } from "@src/confluent/tools/base-tools.js";
import { ToolFactory } from "@src/confluent/tools/tool-factory.js";
import { ToolName } from "@src/confluent/tools/tool-name.js";
import env from "@src/env.js";

const kafkaClientConfig: KafkaJS.CommonConstructorConfig = {
  kafkaJS: {
    brokers: env.BOOTSTRAP_SERVERS?.split(",") ?? [],
    clientId: "mcp-client",
    ssl: true,
    sasl: {
      mechanism: "plain",
      username: env.KAFKA_API_KEY,
      password: env.KAFKA_API_SECRET,
    },
    logLevel: KafkaJS.logLevel.ERROR,
  },
};

const clientManager = new DefaultClientManager(
  kafkaClientConfig,
  env.CONFLUENT_CLOUD_REST_ENDPOINT,
  env.FLINK_REST_ENDPOINT,
);

const toolHandlers = new Map<ToolName, ToolHandler>();
const enabledTools = new Set<ToolName>([
  ToolName.LIST_TOPICS,
  ToolName.CREATE_TOPICS,
  ToolName.DELETE_TOPICS,
  ToolName.PRODUCE_MESSAGE,
  ToolName.LIST_FLINK_STATEMENTS,
  ToolName.READ_FLINK_STATEMENT,
  ToolName.CREATE_FLINK_STATEMENT,
  ToolName.DELETE_FLINK_STATEMENTS,
  ToolName.LIST_CONNECTORS,
  ToolName.READ_CONNECTOR,
  ToolName.CREATE_CONNECTOR,
]);

enabledTools.forEach((toolName) => {
  toolHandlers.set(toolName, ToolFactory.createToolHandler(toolName));
});

const server = new McpServer({
  name: "confluent",
  version: "1.0.0",
});

toolHandlers.forEach((handler, name) => {
  const config = handler.getToolConfig();

  server.tool(
    name as string,
    config.description,
    config.inputSchema,
    async (args) => {
      return await handler.handle(clientManager, args);
    },
  );
});
async function main() {
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("SIGQUIT", cleanup);
  process.on("SIGUSR2", cleanup);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Confluent MCP Server running on stdio");
}

async function cleanup() {
  console.error("Shutting down...");
  await clientManager.disconnect();
  await server.close();
  process.exit(0);
}

main().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
