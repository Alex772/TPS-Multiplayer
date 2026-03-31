# Hotfix aplicado

## Corrigido

### 1. Rastros/pontos aparecendo ao andar
O problema principal estava no cliente em `network.js`.

O código interpolava a posição local e logo depois sobrescrevia tudo com o estado bruto do servidor usando `Object.assign(...)`. Isso gerava artefatos visuais, sensação de duplicação/trilha e jitter.

Agora:
- a posição interpolada/predita é preservada
- o restante dos dados vem do servidor
- a bala também continua interpolada sem sobrescrever a suavização

### 2. ADS/mira “piscando” ao segurar botão direito
O input do mouse foi refeito em `input.js`.

Agora:
- o estado do botão direito é sincronizado pelo bitmask `event.buttons`
- o ADS não depende só de `mousedown`/`mouseup`
- ao perder foco da janela, o estado é limpo corretamente
- o render usa o ADS local do jogador para evitar flicker visual de rede

### 3. Sistema de visibilidade pesado demais
Em `server/game/visibility.js` a máscara de visibilidade foi otimizada.

Agora:
- existe cache por posição/ângulo/estado do ADS
- a máscara não recalcula o mapa inteiro a cada envio
- o cálculo se limita à área de alcance real da visão
- a amostragem da linha de visão foi suavizada para reduzir custo

### 4. Cone por arma melhor balanceado
`server/database/weapons.json` foi ajustado para que cada arma tenha um perfil visual mais coerente.

Exemplo:
- SMG: cone mais aberto e alcance menor
- Rifle: alcance maior e cone mais controlado
- Sniper: cone mais fino e longo, especialmente em ADS

Também foi adicionado `minConeAngle` no normalizador de armas.

## Arquivos alterados
- `client/game/input.js`
- `client/game/network.js`
- `client/game/render.js`
- `server/game/visibility.js`
- `server/game/weapons/weaponDefinitions.js`
- `server/database/weapons.json`

## Observação
Este hotfix ataca os problemas que você relatou:
- “pontos verdes / eu andando no passado”
- travadas quando entra no campo de visão
- ADS bugando ao segurar botão direito
- sniper precisando de cone mais longo e fino

Se ainda sobrar jitter depois do teste real, o próximo passo ideal é:
- interpolar outros players com buffer temporal
- enviar snapshots em taxa fixa menor
- separar máscara de visibilidade de snapshot de gameplay
