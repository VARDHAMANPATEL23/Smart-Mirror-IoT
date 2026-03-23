import EventEmitter from "events";

// Singleton in-process emitter — bridges POST /api/layout → GET /api/mirror/[id]/events
const g = global as any;
if (!g._layoutEventEmitter) {
  g._layoutEventEmitter = new EventEmitter();
  g._layoutEventEmitter.setMaxListeners(50);
}

export const layoutEventEmitter: EventEmitter = g._layoutEventEmitter;
