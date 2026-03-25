import { Kafka, type Producer, type ProducerRecord } from "kafkajs";
import type { KafkaConfig } from "@bun-playground/shared-types";
import { createLogger } from "../logger.ts";

const logger = createLogger("kafka-producer");

let producer: Producer | null = null;

export async function getProducer(config: KafkaConfig): Promise<Producer> {
  if (producer) return producer;

  const kafka = new Kafka({
    clientId: config.clientId,
    brokers: config.brokers,
  });

  producer = kafka.producer();
  await producer.connect();
  logger.info("Kafka producer connected", { brokers: config.brokers });

  return producer;
}

export async function publishMessage(
  config: KafkaConfig,
  topic: string,
  messages: ProducerRecord["messages"],
): Promise<void> {
  const p = await getProducer(config);
  await p.send({ topic, messages });
  logger.debug("Message published", { topic, count: messages.length });
}

export async function disconnectProducer(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
    logger.info("Kafka producer disconnected");
  }
}
