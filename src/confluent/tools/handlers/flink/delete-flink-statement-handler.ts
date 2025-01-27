import { ClientManager } from "@src/confluent/client-manager.js";
import { getEnsuredParam } from "@src/confluent/helpers.js";
import { CallToolResult, ToolInput } from "@src/confluent/schema.js";
import {
  BaseToolHandler,
  ToolConfig,
  ToolName,
} from "@src/confluent/tools/base-tools.js";
import { wrapAsPathBasedClient } from "openapi-fetch";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const deleteFlinkStatementArguments = z.object({
  organizationId: z
    .string()
    .optional()
    .describe("The unique identifier for the organization."),
  environmentId: z
    .string()
    .optional()
    .describe("The unique identifier for the environment."),
  statementName: z
    .string()
    .regex(
      new RegExp(
        "[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*",
      ),
    )
    .nonempty()
    .max(100)
    .describe(
      "The user provided name of the resource, unique within this environment.",
    ),
});

export class DeleteFlinkStatementHandler extends BaseToolHandler {
  async handle(
    clientManager: ClientManager,
    toolArguments: Record<string, unknown> | undefined,
  ): Promise<CallToolResult> {
    const { statementName, environmentId, organizationId } =
      deleteFlinkStatementArguments.parse(toolArguments);
    const organization_id = getEnsuredParam(
      "FLINK_ORG_ID",
      "Organization ID is required",
      organizationId,
    );
    const environment_id = getEnsuredParam(
      "FLINK_ENV_ID",
      "Environment ID is required",
      environmentId,
    );
    const pathBasedClient = wrapAsPathBasedClient(
      clientManager.getConfluentCloudFlinkRestClient(),
    );
    const { response, error } = await pathBasedClient[
      "/sql/v1/organizations/{organization_id}/environments/{environment_id}/statements/{statement_name}"
    ].DELETE({
      params: {
        path: {
          organization_id: organization_id,
          environment_id: environment_id,
          statement_name: statementName,
        },
      },
    });
    if (error) {
      return this.createResponse(
        `Failed to delete Flink SQL statement: ${JSON.stringify(error)}`,
      );
    }
    return this.createResponse(
      `Flink SQL Statement Deletion Status Code: ${response?.status}`,
    );
  }
  getToolConfig(): ToolConfig {
    return {
      name: ToolName.DELETE_FLINK_STATEMENTS,
      description: "Make a request to delete a statement.",
      inputSchema: zodToJsonSchema(deleteFlinkStatementArguments) as ToolInput,
    };
  }
}
