/** Serve a built site directory over HTTP on 127.0.0.1; port 0 picks a free port. */
export function serveDir(dir: string, port?: number): Promise<{ url: string; close: () => Promise<void> }>;
