# Multi Tiro 2D

Projeto multiplayer 2D com servidor autoritativo em Node.js + Socket.IO.

## O que foi preparado nesta versão

- estrutura mais consistente entre client e server
- carregamento de mapas por `maps.json`
- itens em `items.json`
- armas em `weapons.json`
- visão limitada por colisão e linha de visão
- área curta ao redor do jogador
- cone de visão orientado pela mira
- ADS com scopes 2x, 4x e 8x
- itens de pickup para armas, scopes, munição e kit médico
- estados personalizados por jogador

## Rodar

```bash
cd server
npm install
npm start
```

Abra:

```txt
http://localhost:3000
```
