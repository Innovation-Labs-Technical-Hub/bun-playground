import { Kafka, type Consumer, type EachMessagePayload } from "kafkajs";
import type { KafkaConfig } from "@bun-playground/shared-types";
import { createLogger } from "../logger.ts";

const logger = createLogger("kafka-consumer");

export type MessageHandler = (payload: EachMessagePayload) => Promise<void>;

export async function createConsumer(
  config: KafkaConfig,
  topics: string[],
  handler: MessageHandler,
): Promise<Consumer> {
  const kafka = new Kafka({
    clientId: config.clientId,
    brokers: config.brokers,
  });

  const consumer = kafka.consumer({ groupId: config.groupId ?? `${config.clientId}-group` });
  await consumer.connect();

  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: false });
  }

  await consumer.run({
    eachMessage: async (payload) => {
      try {
        await handler(payload);
      } catch (error) {
        logger.error("Error processing message", {
          topic: payload.topic,
          partition: payload.partition,
          offset: payload.message.offset,
          error: String(error),
        });
      }
    },
  });

  logger.info("Kafka consumer started", { topics, groupId: config.groupId });
  return consumer;
}
