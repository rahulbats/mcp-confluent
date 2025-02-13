import { z } from "zod";

// Schema for required environment variables
const envSchema = z.object({
  BOOTSTRAP_SERVERS: z
    .string()
    .describe(
      "List of Kafka broker addresses in the format host1:port1,host2:port2 used to establish initial connection to the Kafka cluster",
    )
    .trim(),
  KAFKA_API_KEY: z
    .string()
    .describe(
      "Authentication credential (username) required to establish secure connection with the Kafka cluster",
    )
    .trim()
    .min(1),
  KAFKA_API_SECRET: z
    .string()
    .describe(
      "Authentication credential (password) paired with KAFKA_API_KEY for secure Kafka cluster access",
    )
    .trim()
    .min(1),
  FLINK_API_KEY: z
    .string()
    .describe(
      "Authentication key for accessing Confluent Cloud's Flink services, including compute pools and SQL statement management",
    )
    .trim()
    .min(1),
  FLINK_API_SECRET: z
    .string()
    .describe(
      "Secret token paired with FLINK_API_KEY for authenticated access to Confluent Cloud's Flink services",
    )
    .trim()
    .min(1),
  CONFLUENT_CLOUD_API_KEY: z
    .string()
    .describe(
      "Master API key for Confluent Cloud platform administration, enabling management of resources across your organization",
    )
    .trim()
    .min(1),
  CONFLUENT_CLOUD_API_SECRET: z
    .string()
    .describe(
      "Master API secret paired with CONFLUENT_CLOUD_API_KEY for comprehensive Confluent Cloud platform administration",
    )
    .trim()
    .min(1),
  CONFIG_PATH: z
    .string()
    .describe(
      "File system path to store and retrieve conversation-based configurations for session persistence (Future Implementation)",
    )
    .optional()
    .default(`${import.meta.dirname}/config/default.json`),
  SCHEMA_REGISTRY_API_KEY: z
    .string()
    .describe(
      "Authentication key for accessing Schema Registry services to manage and validate data schemas",
    )
    .trim()
    .min(1),
  SCHEMA_REGISTRY_API_SECRET: z
    .string()
    .describe(
      "Authentication secret paired with SCHEMA_REGISTRY_API_KEY for secure Schema Registry access",
    )
    .trim()
    .min(1),
});

// Schema for optional configuration from file
const configSchema = z
  .object({
    FLINK_ENV_ID: z
      .string()
      .describe(
        "Unique identifier for the Flink environment, must start with 'env-' prefix",
      )
      .trim()
      .startsWith("env-"),
    FLINK_ORG_ID: z
      .string()
      .describe(
        "Organization identifier within Confluent Cloud for Flink resource management",
      )
      .trim()
      .min(1),
    FLINK_REST_ENDPOINT: z
      .string()
      .describe(
        "Base URL for Confluent Cloud's Flink REST API endpoints used for SQL statement and compute pool management",
      )
      .trim()
      .url(),
    FLINK_COMPUTE_POOL_ID: z
      .string()
      .describe(
        "Unique identifier for the Flink compute pool, must start with 'lfcp-' prefix",
      )
      .trim()
      .startsWith("lfcp-"),
    FLINK_ENV_NAME: z
      .string()
      .describe(
        "Human-readable name for the Flink environment used for identification and display purposes",
      )
      .trim()
      .min(1),
    FLINK_DATABASE_NAME: z
      .string()
      .describe(
        "Name of the associated Kafka cluster used as a database reference in Flink SQL operations",
      )
      .trim()
      .min(1),
    KAFKA_CLUSTER_ID: z
      .string()
      .describe(
        "Unique identifier for the Kafka cluster within Confluent Cloud ecosystem",
      )
      .trim()
      .min(1),
    KAFKA_ENV_ID: z
      .string()
      .describe(
        "Environment identifier for Kafka cluster, must start with 'env-' prefix",
      )
      .trim()
      .startsWith("env-"),
    CONFLUENT_CLOUD_REST_ENDPOINT: z
      .string()
      .describe("Base URL for Confluent Cloud's REST API services")
      .trim()
      .url()
      .default("https://api.confluent.cloud"),
    SCHEMA_REGISTRY_ENDPOINT: z
      .string()
      .describe(
        "URL endpoint for accessing Schema Registry services to manage data schemas",
      )
      .trim()
      .url(),
    KAFKA_REST_ENDPOINT: z
      .string()
      .describe(
        "REST API endpoint for Kafka cluster management and administration",
      )
      .trim()
      .url(),
  })
  .partial(); // Makes all fields optional

export const combinedSchema = envSchema.merge(configSchema);
