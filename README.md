Real-Time User Dashboard

A lightweight, full-stack app solving a specific architectural challenge: fetching data from an API and updating the frontend in real-time — no page refreshes, no polling.

Built with Node.js on the backend and plain HTML, CSS, and JavaScript on the frontend, keeping the focus on core fundamentals without unnecessary bloat.

How It Works

The architecture is split into two parts: a standard REST API for data loading, and Server-Sent Events (SSE) for real-time updates.

1. Initial Load
On page open, the frontend makes a fetch() request to GET /api/data. The server responds with the current user array, and JavaScript builds the initial HTML table.

2. The Real-Time Pipeline (SSE)
Immediately after, the frontend opens a permanent, one-way connection via GET /stream using Server-Sent Events. SSE is chosen over WebSockets because the data flow is strictly unidirectional (server → client), making it the most efficient and native fit.

3. Pushing Updates
External requests hit PUT /api/data/:id. Once the backend updates the in-memory data, it actively pushes a user_updated event down the open SSE pipeline to all connected clients.

4. Surgical UI Updates
The frontend listens for user_updated events and finds the exact HTML row that changed — updating it in place without rebuilding the table or touching the rest of the UI.
