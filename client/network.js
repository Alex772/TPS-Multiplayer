require("dotenv").config();

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";


const socket = io(SERVER_URL);

socket.on("connect", () => {
    console.log("✅ conectado no servidor");
});

socket.on("init", (data) => {
    console.log("🔥 INIT RECEBIDO:", data);

    window.state = {
        players: data.players,
        bullets: [],
        map: data.map
    };

    window.myId = data.id;
});

socket.on("state", (data) => {

    // 🔥 mantém o map sempre
    window.state = {
        ...window.state,
        players: data.players,
        bullets: data.bullets
    };
});





export function getMyPlayer() {
    if (!window.state || !window.myId) return null;
    return window.state.players[window.myId];
}