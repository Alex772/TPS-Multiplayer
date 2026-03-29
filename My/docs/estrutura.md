# 🎮 TPS Multiplayer 2D

> Jogo multiplayer 2D com arquitetura cliente-servidor, foco em performance, predição e sincronização em tempo real.

---

## 🚀 Status do Projeto

![status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![node](https://img.shields.io/badge/node-%3E%3D18-green)
![socket.io](https://img.shields.io/badge/socket.io-4.x-black)
![license](https://img.shields.io/badge/license-MIT-blue)

---

## 📌 Visão Geral

Este projeto implementa um sistema multiplayer com:

* 🔵 Cliente com predição e interpolação
* 🔴 Servidor autoritativo
* 🧩 Separação entre lobby, gameplay e ferramentas

### Estrutura lógica:

```
Lobby → Sala → Gameplay → Sincronização
```

---

## 🧱 Estrutura do Projeto

```
TPS-Multiplayer/
├── client/     # Frontend (jogador)
├── server/     # Backend (autoridade do jogo)
└── My/         # Documentação e modelos
```

---

# 🎮 Client (Frontend)

Responsável por:

* Interface (UI)
* Input do jogador
* Renderização (Canvas)
* Predição e interpolação
* Comunicação com servidor

---

## 📁 Estrutura

```
client/
├── index.html          # Lobby (login + salas)

├── lobby/              # Sistema de lobby
│   ├── lobby.js
│   ├── ui.js
│   └── api.js

├── game/               # Jogo
│   ├── game.html
│   ├── game.js
│   ├── network.js
│   ├── input.js
│   ├── collision.js
│   ├── render.js
│   └── hud.js

├── editor/             # Editor de mapas (privado)
│   ├── editor.html
│   └── editor.js

├── assets/
└── styles/
```

---

## 🔷 Fluxo do Cliente

```
Login
 ↓
Lista de salas
 ↓
Entrar/Criar sala
 ↓
Redirecionamento
 ↓
Game loop (render + network)
```

---

# 🧠 Server (Backend)

Responsável por:

* Estado real do jogo
* Validação de ações
* Física e colisão
* Sincronização multiplayer

---

## 📁 Estrutura

```
server/
├── server.js

├── game/
│   ├── gameLoop.js
│   ├── players.js
│   ├── bullets.js
│   ├── map.js
│   ├── collision.js
│   ├── items.js
│   ├── reload.js
│   ├── inventory.js
│   └── maps/

├── database/
│   └── db.js

└── package.json
```

---

## 🔁 Game Loop (Servidor)

Executado a **60Hz**

```
→ mover jogadores
→ atualizar balas
→ detectar colisões
→ enviar estado
```

---

# 🌐 Sistema de Salas

Cada jogador pertence a uma sala:

```js
socket.join(roomId);
```

### Fluxo:

```
Cliente cria/entra sala
Servidor associa socket
GameLoop envia estado por sala
```

### Exemplo:

```js
io.to(roomId).emit("state", gameState);
```

---

# 🔄 Fluxo Completo

```
1. Abre index.html
2. Login
3. Cria/entra sala
4. Redireciona para game
5. Conecta via Socket.IO
6. Servidor registra player
7. Loop começa
8. Cliente renderiza
```

---

# 📡 Networking

## Cliente

* Predição local
* Interpolação

## Servidor

* Autoridade total

### Estratégia

```
Cliente → envia input
Servidor → valida
Servidor → atualiza estado
Servidor → envia snapshot
Cliente → interpola
```

---

# ⚙️ Tecnologias

## Frontend

* HTML5
* Canvas 2D
* JavaScript

## Backend

* Node.js
* Socket.IO
* MongoDB (Mongoose)

---

# 📦 Padrões Utilizados

* Client-Server Architecture
* Server Authoritative Model
* Fixed Tick Rate (60Hz)
* Separação de responsabilidades
* Modularização por sistema

---

# 🚀 Como Rodar o Projeto

## 🔧 Server

```bash
cd server
npm install
node server.js
```

Servidor:

```
http://localhost:3000
```

---

## 🌐 Client

Se estiver usando servidor estático:

```bash
# exemplo com live-server
npx live-server client
```

Ou acesse direto pelo servidor Node (recomendado):

```
http://localhost:3000
```

---

# 🧪 Teste do Socket.IO

Abra no navegador:

```
http://localhost:3000/socket.io/socket.io.js
```

Se carregar → ✔ OK

---

# 🛠️ Futuras Melhorias

* [ ] Matchmaking automático
* [ ] Sistema de contas
* [ ] Ranking (ELO)
* [ ] Salas privadas
* [ ] Chat em tempo real
* [ ] Skins

---

# 📄 Licença

Este projeto está sob a licença MIT.

---

# 👨‍💻 Autor

Desenvolvido como projeto de estudo de multiplayer em tempo real.

---

# ⭐ Contribuição

Sinta-se livre para:

* abrir issues
* sugerir melhorias
* contribuir com código

---
