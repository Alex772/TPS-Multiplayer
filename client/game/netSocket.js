// client/game/netSocket.js

import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";

/*
    🔥 cria conexão com servidor

    - usando versão ESM (sem depender de <script>)
    - evita erro "io is not defined"
*/

export const socket = io("http://localhost:3000", {
    transports: ["websocket"] // opcional (melhora performance)
});