`# 📋 RFC: Real-Time Event Ingestion Engine

> [!WARNING]
> This RFC introduces breaking changes to existing REST endpoints in favor of gRPC and WebSocket streaming.

---

### Architecture Overview

\`\`\`mermaid
flowchart LR
    A[Client App] -->|WebSocket| B[Edge Ingestion Gateway]
    B --> C[(Kafka Message Stream)]
    C --> D[Flink Event Processor]
    D --> E[(ClickHouse Analytics)]
\`\`\`

### Payload Contract

\`\`\`typescript
export interface IngestionEvent {
  id: string;
  timestamp: number;
  source: string;
  eventType: 'USER_ACTION' | 'SYSTEM_ALERT';
  payload: Record<string, unknown>;
}
\`\`\`
`,