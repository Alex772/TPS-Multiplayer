# Progresso de desenvolvimento

## Implementado nesta etapa

- Drop de armas ao morrer com estado persistente de `ammoInMag` e `magsLeft`.
- Pickup de armas do chão restaurando esse estado salvo.
- Drop de arma primária e secundária ao morrer.
- Drop de scope equipada ao morrer.
- Drop de medkits carregados ao morrer.
- Respawn limpando estado temporário e recriando loadout padrão.
- Sistema base de ação em `server/game/actions.js`.
- Uso de medkit com tempo de ação.
- Velocidade reduzida durante uso de medkit.
- Velocidade geral afetada por peso das armas equipadas.
- ADS reduzindo um pouco a velocidade.
- Tecla `4` para usar medkit.
- HUD exibindo quantidade de medkits e ação atual.

## Ainda pendente

- Migrar recarga para o mesmo sistema de ação.
- Implementar bandagem.
- Refinar balanceamento de peso e cura.
- Colete com absorção parcial e durabilidade.
- Garantir que render de HUD fique visualmente ajustado após testes.

## Observação

As mudanças foram feitas buscando não quebrar a base atual, então esta etapa prioriza integração segura antes de expandir mecânicas mais profundas.

---

## Atualização recente

### Correções
- itens dropados por troca ou morte não reaparecem mais no mapa após serem coletados
- itens nativos do mapa continuam usando respawn normalmente

### Melhorias de sistema
- recarga agora usa o mesmo action lock do medkit
- durante reload o jogador fica bloqueado para outras ações conflitantes
- troca de arma cancela reload em andamento de forma centralizada


## Atualização recente
- Sistema de colete implementado como item separado.
- O colete absorve apenas uma parte pequena do dano e perde durabilidade conforme absorve.
- Apenas o colete usa durabilidade; armas, scopes e curas não quebram por uso.
- Quando a durabilidade chega a zero, o colete quebra e sai do jogador.
- O estado do colete é preservado no drop e no pickup.


## Atualização v4
- Correção da troca/pickup enquanto a troca de arma ainda está em andamento: o slot alvo da troca agora é respeitado no pickup.
- Adicionada bandagem como cura leve com ação própria.
- Bandagem entra no inventário, pode ser usada com a tecla 5 e é dropada ao morrer.
- HUD atualizada para mostrar quantidade de bandagens.
- Mantido o sistema de colete único, com durabilidade somente no colete.


---

## Correção v5

- Corrigido bug em que a **pistol não dropava** ao ser substituída por arma do chão.
- Causa raiz: o item `weapon_pistol` não existia em `server/database/items.json`, então o sistema não conseguia instanciar o drop da pistola.
- Resultado: agora a pistol pode ser dropada, renderizada e coletada normalmente como item do mundo.


## Atualização v6

- Implementado dano por distância por arma, com queda progressiva de dano antes do alcance máximo.
- Cada arma agora tem perfil próprio de perda de dano, deixando shotgun forte de perto e mais fraca de longe, enquanto sniper mantém dano alto por mais distância.
- Cura em andamento com medkit ou bandagem agora é cancelada ao receber dano, evitando cura 'forçada' durante troca de tiros.


## Atualização v7

- Adicionada alternância manual da mira equipada com a tecla `3`, alternando entre ferro (`1x`) e o zoom da scope carregada quando a arma atual suporta esse zoom.
- Recarregar agora reduz levemente a velocidade de movimento, mantendo leitura visual melhor da ação e deixando o combate mais consistente com a proposta tática.
- HUD agora mostra barra de progresso para ações em andamento, incluindo reload, medkit e bandagem.
- Essa etapa focou em conforto de teste e clareza do estado do player sem abrir mudanças pesadas na base do mapa.


## Atualização v8
- removida a alternância manual de mira por arma
- ADS agora só ativa se houver mira equipada no slot de scope
- mira passou a ser universal e só altera visão/zoom/comportamento do ADS
- removidas restrições de compatibilidade de mira por arma
- visão reorganizada em dois perfis por arma: hip e ads
- escopos agora aplicam multiplicadores de alcance visual, ângulo e periférica
- ADS agora melhora a precisão prática do disparo sem alterar dano nem alcance físico da bala
- mantido alcance máximo real das balas e queda de dano por distância


## Atualização v9
- correção real de recoil/spread: o recoil estava recuperando rápido demais entre os tiros, o que praticamente zerava o efeito em armas automáticas
- recovery de recoil ajustado para comportamento por segundo, aplicado por tick
- spread agora usa desvio angular real do tiro, em vez de um ajuste vetorial fraco que quase não aparecia
- recoil acumulado agora realmente abre o agrupamento ao segurar o botão de tiro
