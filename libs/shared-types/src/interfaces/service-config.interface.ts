export interface ServiceConfig {
  name: string;
  port: number;
  host: string;
  environment: "development" | "staging" | "production";
  logLevel: "debug" | "info" | "warn" | "error";
}

export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  groupId?: string;
}

export interface RedisConfig {
  url: string;
}

export interface ServiceRegistryEntry {
  name: string;
  url: string;
  healthCheck: string;
}
