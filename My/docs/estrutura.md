📘 Documentação Geral — TPS Multiplayer 2D
📌 Visão Geral

Este projeto é um jogo multiplayer 2D com arquitetura cliente-servidor, onde:

O cliente é responsável por renderização, input e predição
O servidor é autoritativo (estado real do jogo)
Existe separação clara entre:
Lobby (menu / salas)
Gameplay (jogo em si)
Ferramentas (editor)
🧱 Estrutura Geral do Projeto
TPS-Multiplayer/
├── client/ # Frontend (jogador)
├── server/ # Backend (autoridade do jogo)
└── My/ # Documentação e modelos
🎮 CLIENT (Frontend)

Responsável por:

Interface (UI)
Entrada do jogador (input)
Renderização (canvas)
Comunicação com servidor
Predição/interpolação
📁 Estrutura do Client
client/
├── index.html # Lobby principal (login + salas)
│
├── lobby/ # Sistema de lobby
│ ├── lobby.js # Lógica principal (salas, login)
│ ├── ui.js # Manipulação de DOM
│ └── api.js # Comunicação com servidor
│
├── game/ # Jogo em si
│ ├── index.html # Canvas + HUD
│ ├── game.js # Loop principal (rAF)
│ ├── network.js # Sincronização com servidor
│ ├── input.js # Teclado e mouse
│ ├── collision.js # Colisão local
│ ├── render.js # Renderização
│ └── hud.js # Interface do jogador
│
├── editor/ # Ferramenta privada
│ ├── index.html
│ └── editor.js
│
├── assets/ # Recursos do jogo
│ ├── sprites/
│ ├── maps/
│ └── sounds/
│
└── styles/
├── main.css
├── lobby.css
└── game.css
🔷 index.html (Lobby)
Responsabilidade:
Entrada do jogador
Criar / entrar em salas
Fluxo:
Login → Lista de salas → Criar/Entrar → Redirecionar para game
🔷 lobby/
lobby.js

Controla:

Login
Criação de salas
Entrada em salas
Eventos socket
ui.js

Responsável por:

Atualizar DOM
Criar botões dinamicamente
Exibir listas
api.js

Centraliza:

Comunicação com backend
Emissão de eventos (socket)
🔷 game/
game.html

Contém:

Canvas
Scripts do jogo
HUD
game.js

Loop principal:

requestAnimationFrame(loop)

loop:
→ processInput()
→ updatePrediction()
→ interpolate()
→ render()
network.js

Responsável por:

Conexão com servidor
Receber estado (players, bullets)
Buffer de estados
Interpolação
input.js

Captura:

Teclado (WASD)
Mouse (mira e tiro)

Envia input a cada ~20Hz

render.js

Desenha:

Mapa (layers)
Jogadores
Balas
HUD
collision.js
Verifica colisão com mapa
Usa AABB (Axis-Aligned Bounding Box)
hud.js

Mostra:

Vida
Arma atual
Munição
Pontuação
🔷 editor/

Ferramenta isolada para:

Criar mapas
Editar tiles
Exportar JSON

⚠️ Não faz parte do jogo em produção

🧠 SERVER (Backend)

Responsável por:

Estado real do jogo
Validação de ações
Física e colisão
Sincronização multiplayer
📁 Estrutura do Server
server/
├── server.js # Entrada principal
│
├── game/
│ ├── gameLoop.js # Loop 60Hz
│ ├── players.js # Gerenciamento de jogadores
│ ├── bullets.js # Sistema de tiros
│ ├── map.js # Carregamento de mapa
│ ├── collision.js # Detecção de hit
│ ├── items.js # Armas e itens
│ ├── reload.js # Recarregar armas
│ ├── inventory.js # Inventário
│ └── maps/ # Mapas JSON
│
├── database/
│ └── db.js # Configuração MongoDB
│
└── package.json
🔷 server.js

Responsável por:

Criar servidor HTTP + Socket.IO
Gerenciar conexões
Eventos:
login
createRoom
joinRoom
input
🔷 gameLoop.js

Executa a cada 60 FPS:

→ mover jogadores
→ atualizar balas
→ detectar colisões
→ enviar estado para clientes
🔷 players.js

Gerencia:

Criação de jogador
Spawn
Remoção
🔷 bullets.js

Responsável por:

Criar balas
Controlar fire rate
Atualizar posição
🔷 map.js

Carrega:

Arquivos JSON
Grid de tiles
3 camadas (background, colisão, overlay)
🔷 collision.js

Detecta:

Tiro acertando jogador
Distância entre entidades
🔷 inventory.js

Controla:

Armas do jogador
Munição
Troca de armas
🔷 reload.js

Lógica de recarga:

reserve → magazine
🔷 items.js

Define:

Pistola
Rifle
Tipos de munição
🧠 SISTEMA DE SALAS (Rooms)

Cada jogador pertence a uma sala:

socket.join(roomId)
Fluxo:
Cliente:
cria/entra sala

Servidor:
associa socket à sala

GameLoop:
envia estado apenas para sala
Exemplo:
io.to(roomId).emit("state", gameState);
🔄 FLUXO COMPLETO DO JOGO

1. Jogador abre index.html
2. Faz login
3. Cria ou entra em sala
4. Redirecionado para game.html
5. Cliente conecta com roomId
6. Servidor adiciona jogador
7. GameLoop começa a enviar estado
8. Cliente renderiza jogo
   📡 SINCRONIZAÇÃO (Networking)
   Cliente:
   Predição local
   Interpolação
   Servidor:
   Autoridade total
   Estratégia:
   Cliente envia input → Servidor valida → Atualiza estado → Envia snapshot
   ⚙️ TECNOLOGIAS USADAS
   Frontend:
   HTML5
   Canvas 2D
   JavaScript
   Backend:
   Node.js
   Socket.IO
   MongoDB (Mongoose)
   📦 PADRÕES UTILIZADOS
   Arquitetura cliente-servidor
   Server authoritative model
   Game loop fixo (60Hz)
   Separação de responsabilidades
   Modularização por sistema
   🚀 ESCALABILIDADE (Futuro)

O projeto já suporta expansão para:

Matchmaking automático
Sistema de contas
Ranking (ELO)
Partidas ranqueadas
Chat em tempo real
Skins e customização
