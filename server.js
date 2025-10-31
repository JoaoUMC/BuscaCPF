// server.js
// Servidor Express que:
// - serve /public como estático (sua SPA com CRUD)
// - expõe o JSON Server em /api (usando db.json)
// Start local/Render: "node server.js"

const path = require("path");
const express = require("express");
const jsonServer = require("json-server");

const app = express();
const PORT = process.env.PORT || 3000;

// Páginas estáticas
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// JSON Server em /api
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();
app.use("/api", middlewares, router);

// Raiz -> index.html
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 404 simples (para caminhos inexistentes)
app.use((req, res) => {
  res.status(404).send(`<h1>404 - Página não encontrada</h1>
  <p><a href="/">Voltar ao início</a></p>`);
});

app.listen(PORT, () => {
  console.log(`App rodando em http://localhost:${PORT}`);
  console.log(`JSON Server em http://localhost:${PORT}/api`);
});
