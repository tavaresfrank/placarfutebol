const express = require("express");
const fs = require("fs");
const WebSocket = require("ws");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("."));

const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
  console.log("Novo cliente de placar conectado.");
  fs.readFile("dados.json", (err, data) => {
    if (!err) {
      ws.send(data.toString());
    }
  });
});

app.get("/dados", (req, res) => {
  fs.readFile("dados.json", (err, data) => {
    if (err) res.status(500).send("Erro ao ler JSON");
    else res.json(JSON.parse(data));
  });
});

app.post("/dados", (req, res) => {
  let dados = req.body;
  if (dados.reset) {
    dados.minutos = 0;
    dados.segundos = 0;
  }
  
  const dadosString = JSON.stringify(dados, null, 2);

  fs.writeFile("dados.json", dadosString, (err) => {
    if (err) {
      res.status(500).send("Erro ao salvar JSON");
    } else {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(dadosString);
        }
      });
      res.send("Salvo e atualizado com sucesso");
    }
  });
});

const server = app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

server.on("upgrade", (request, socket, head) => {
  if (request.url === "/ws") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});