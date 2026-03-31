# Melhorias implementadas

## Sistemas principais adicionados

- visibilidade baseada em linha de visão usando colisão do mapa
- cone de visão baseado na direção da mira do jogador
- alcance visual diferente por arma
- ADS com zoom progressivo por tipo de mira
- suporte a miras 2x, 4x e 8x
- loot no mundo com armas, munição e scopes
- pickup automático de itens próximos
- rotação de mapas por `server/database/maps.json`
- mapas refeitos com spawn points e loot spawns
- respawn básico após morte
- HUD com scope atual, inventário de miras, pickup e nome do mapa

## Controles

- WASD: mover
- clique esquerdo: atirar
- botão direito ou Shift: ADS / mirar
- C: próxima mira
- X: mira anterior
- Q ou scroll: trocar arma
- 1 / 2: slot direto
- R: recarregar

## Arquivos mais importantes alterados

- `server/server.js`
- `server/game/core/gameLoop.js`
- `server/game/visibility.js`
- `server/game/items/*`
- `server/game/map/*`
- `server/game/players/*`
- `client/game/network.js`
- `client/game/input.js`
- `client/game/render.js`
- `client/game/collision.js`
- `server/database/weapons.json`
- `server/database/items.json`
- `server/database/maps.json`
- `server/database/maps/map1.json`
- `server/database/maps/map2.json`

## Observações

- o servidor agora envia estado filtrado por jogador, então inimigos fora do cone / fora da linha de visão não são enviados para renderização daquele cliente
- o cliente continua recebendo o mapa completo para navegação, mas a renderização aplica fog of war por máscara de visibilidade
- rifles e sniper conseguem aproveitar melhor zoom e visão frontal do que armas curtas
