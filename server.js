const express = require("express");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(".")); // serve os arquivos HTML, JSON, etc

// Rota para ler o JSON
app.get("/dados", (req, res) => {
  fs.readFile("dados.json", (err, data) => {
    if (err) res.status(500).send("Erro ao ler JSON");
    else res.json(JSON.parse(data));
  });
});

// Rota para salvar no JSON
app.post("/dados", (req, res) => {
  fs.writeFile("dados.json", JSON.stringify(req.body, null, 2), (err) => {
    if (err) res.status(500).send("Erro ao salvar JSON");
    else res.send("Salvo com sucesso");
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
