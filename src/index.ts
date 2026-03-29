import { createServer, IncomingMessage, ServerResponse } from "http";


const PORT = 20191;

const server = createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache"
    });
    res.end("Hello World. Create by Puxa. 2026.");
  }
);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
