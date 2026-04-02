🎮 GAME DESIGN DOCUMENT (GDD)
Projeto: Jogo de Tiro 2D Top-Down Tático
1. VISÃO GERAL DO JOGO
1.1 Conceito

Um jogo de tiro multiplayer 2D com câmera top-down que busca trazer mecânicas realistas de FPS adaptadas para uma visão estratégica.

O foco não é arcade puro — o jogo prioriza:

tomada de decisão
controle de recursos
posicionamento
risco vs recompensa
leitura de combate
1.2 Pilar de Gameplay

O jogo é construído sobre 5 pilares principais:

1. Peso nas ações

Tudo leva tempo:

recarregar
trocar arma
usar itens
pegar loot
2. Informação limitada
visão baseada em cone
ADS altera percepção
perda de periferia
3. Gestão de recursos
munição por pentes
cura limitada
itens com limite por slot
4. Combate tático
controle de recoil
dano por distância
posicionamento importa
5. Consistência física
armas têm peso
ações têm tempo real
itens existem fisicamente no mapa
2. CORE GAMEPLAY LOOP
Spawn do player
Exploração do mapa
Coleta de armas e equipamentos
Engajamento com outros jogadores
Gestão de recursos (munição, vida, itens)
Morte → drop completo de loot
Repetição
3. SISTEMA DE PLAYER
3.1 Estrutura do Player
player = {
  health: 100,
  vest: {
    vestId,
    durability
  },
  loadout: {},
  action: {},
  combat: {}
}
3.2 Estados principais
vivo
morto
executando ação
em ADS
em combate
4. SISTEMA DE ARMAS
4.1 Estrutura base

Cada arma possui:

dano
alcance
cadência
recoil
spread
velocidade da bala
tamanho do pente
quantidade de pentes
peso
tempo de troca
perfil de dano por distância
4.2 Sistema de munição (PENTES)
Estrutura
weaponState = {
  currentMagAmmo,
  magsRemaining
}
Regras
recarregar DESCARTA o pente atual
sempre entra um pente cheio
balas restantes são perdidas
4.3 Recarga
Condições
não estar em ação bloqueante
possuir pentes restantes
Cancelamento
troca de arma
uso de item
coleta
granada
4.4 Troca de arma
baseada principalmente na arma alvo
arma atual influencia minimamente
4.5 Classes de armas
Pistola
leve
rápida
confiável
SMG
alta cadência
curta distância
Rifle
equilibrado
médio alcance
Shotgun
alto dano próximo
baixa eficiência longe
Sniper
alto dano
alto risco
visão extrema em ADS
5. SISTEMA DE PROJÉTEIS
5.1 Estrutura
bullet = {
  position,
  direction,
  speed,
  traveledDistance,
  maxRange,
  damage
}
5.2 Regras

A bala é destruída quando:

atinge player
colide com obstáculo
alcança distância máxima
6. SISTEMA DE DANO
6.1 Dano por distância

Cada arma possui curva de dano:

curto alcance → dano máximo
médio → redução gradual
longo → dano mínimo
6.2 Interação com ADS

ADS melhora:

precisão
eficiência do dano

Não aumenta dano base diretamente.

7. SISTEMA DE COLETE
7.1 Estrutura
vest = {
  durability: 0-100
}
7.2 Função
absorver parte do dano
perder durabilidade ao absorver
7.3 Fórmula
absorbed = damage * absorptionRate
healthDamage = damage - absorbed
durabilityLoss = absorbed * factor
7.4 Valores iniciais
absorção: ~28%
durabilidade: 100
7.5 HUD
barra azul
escala 0–100
8. SISTEMA DE INVENTÁRIO
8.1 Slots
2 armas
granadas (3 tipos)
bandagem
medkit
energético
mira
8.2 Regras
limite de 3 por item
sem inventário livre
estrutura fixa
9. SISTEMA DE ITENS
9.1 Bandagem
cura 20%
reduz velocidade (base + peso armas)
9.2 Medkit
cura 50%
quase paralisa movimento
depende do peso das armas
9.3 Energético
buff de velocidade
duração limitada
10. SISTEMA DE GRANADAS
10.1 Tipos
Fragmentação
Flash
Smoke
10.2 Ativação
tecla direta (sem seleção)
10.3 Fluxo
pressiona tecla
tempo de preparo
lançamento
consumo do item
10.4 Física
movimento com colisão
preparado para sistema futuro mais avançado
11. SISTEMA DE ADS (AIM)
11.1 Regras
só funciona com mira equipada
11.2 Efeitos
zoom
aumento de alcance visual
redução de cone
redução de periferia
11.3 Dependência

ADS depende de:

arma
mira equipada
12. SISTEMA DE MIRAS
12.1 Tipos
2x
4x
8x
12.2 Função

Afeta:

visão
zoom
foco

NÃO afeta:

dano
alcance real da arma
13. SISTEMA DE COLETA
13.1 Tecla
E
13.2 Armas
substitui arma atual
tempo baseado no peso da arma coletada
13.3 Itens
adiciona ao slot correspondente
respeita limite
13.4 Colete
substitui o atual
antigo é dropado com durabilidade
14. SISTEMA DE MORTE E LOOT
14.1 Regra principal

Ao morrer, o player dropa:

armas (com estado)
itens (quantidade atual)
mira
colete (durabilidade)
14.2 Distribuição
itens espalhados ao redor do corpo
não sobrepostos
15. SISTEMA DE AÇÕES
15.1 Action State
action = {
  type,
  startedAt,
  duration
}
15.2 Tipos
reload
swap
pickup
use_item
throw_grenade
16. MATRIZ DE BLOQUEIO
Ações bloqueiam:
tiro
ADS
outras ações simultâneas
Prioridade
ações longas
combate
movimento
17. HUD
17.1 Elementos
vida
colete
armas
munição
itens
mira
17.2 Feedback visual
barras de progresso
arma ativa destacada
uso de item visível
18. DIREÇÕES FUTURAS
18.1 Sistema de hit por localização
cabeça
torso
membros

Impactará:

dano
colete
efeitos
18.2 Sistema avançado de colisão
tiles menores que o player
colisão refinada
granadas melhoradas
18.3 Balanceamento
ajustes de recoil
ajustes de dano
ajustes de tempo de ação
19. CONCLUSÃO

Este sistema define um jogo:

tático
consistente
com profundidade mecânica
com identidade própria

Ele evita:

spam
ações instantâneas irreais
falta de consequência nas decisões

E constrói:

combate estratégico
gerenciamento de risco
sensação de peso e realismo