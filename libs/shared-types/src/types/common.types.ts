export type ID = string;
export type Timestamp = string; // ISO 8601
export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
