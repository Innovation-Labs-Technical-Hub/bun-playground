import type { UserEventType } from "@bun-playground/shared-types";
import { publishMessage } from "@bun-playground/shared-utils";
import { kafkaConfig } from "../config.ts";
import { createLogger } from "@bun-playground/shared-utils";

const logger = createLogger("user-events");
const TOPIC = "user-events";

export async function publishUserEvent(
  type: UserEventType,
  userId: string,
  data?: Record<string, unknown>,
): Promise<void> {
  try {
    await publishMessage(kafkaConfig, TOPIC, [
      {
        key: userId,
        value: JSON.stringify({
          type,
          payload: {
            userId,
            timestamp: new Date().toISOString(),
            data,
          },
        }),
      },
    ]);
  } catch (error) {
    // Don't fail the request if event publishing fails
    logger.warn("Failed to publish user event", { type, userId, error: String(error) });
  }
}
