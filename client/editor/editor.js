

let TILE_SIZE = 50;
let zoom = 1;
let camX = 0;
let camY = 0;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const layerSelect = document.getElementById("layerSelect");

let currentTile = 1;
let isDrawing = false;
let isPanning = false;

// ============================
// MAP
// ============================

let map = createNewMap(10,10);

function createNewMap(w,h) {
    return {
        name:"My Map",
        width:w,
        height:h,
        layers:[{
            collision:createGrid(w,h),
            interactive:createGrid(w,h),
            items:createGrid(w,h)
        }]
    };
}

function createGrid(w,h) {
    return Array.from({length:h},()=>Array(w).fill(0));
}

// ============================
// PALETTE
// ============================

const tiles = [
    { id:0, color:"#000" },
    { id:1, color:"#555" },
    { id:2, color:"orange" },
    { id:3, color:"blue" },
    { id:4, color:"lime" }
];

const paletteDiv = document.getElementById("palette");

tiles.forEach(t=>{
    const btn=document.createElement("button");
    btn.className="tile-btn";
    btn.style.background=t.color;

    btn.onclick=()=>{
        currentTile=t.id;
        document.querySelectorAll('.tile-btn').forEach(b=>b.classList.remove('tile-selected'));
        btn.classList.add('tile-selected');
    };

    paletteDiv.appendChild(btn);
});

paletteDiv.children[1].classList.add('tile-selected');

// ============================
// DRAW
// ============================

function draw() {
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.translate(camX, camY);
    ctx.scale(zoom, zoom);

    for (let y=0;y<map.height;y++){
        for (let x=0;x<map.width;x++){

            let px=x*TILE_SIZE;
            let py=y*TILE_SIZE;

            if (document.getElementById("showCollision").checked && map.layers[0].collision[y][x]===1){
                ctx.fillStyle="#444";
                ctx.fillRect(px,py,TILE_SIZE,TILE_SIZE);
            }

            if (document.getElementById("showInteractive").checked){
                let inter=map.layers[0].interactive[y][x];
                if (inter===2){ ctx.fillStyle="orange"; ctx.fillRect(px+10,py+10,30,30);} 
                if (inter===3){ ctx.fillStyle="blue"; ctx.fillRect(px+5,py+5,40,40);} 
            }

            if (document.getElementById("showItems").checked && map.layers[0].items[y][x]===4){
                ctx.fillStyle="lime";
                ctx.beginPath();
                ctx.arc(px+25,py+25,8,0,Math.PI*2);
                ctx.fill();
            }

            ctx.strokeStyle="#222";
            ctx.strokeRect(px,py,TILE_SIZE,TILE_SIZE);
        }
    }

    // preview player
    ctx.fillStyle="red";
    ctx.beginPath();
    ctx.arc(100,100,10,0,Math.PI*2);
    ctx.fill();
}

// ============================
// INPUT
// ============================

canvas.addEventListener("mousedown", (e)=>{
    if (e.button===1){ isPanning=true; return; }
    isDrawing=true;
});

canvas.addEventListener("mouseup", ()=>{ isDrawing=false; isPanning=false; });
canvas.addEventListener("mouseleave", ()=>{ isDrawing=false; isPanning=false; });

canvas.addEventListener("mousemove", (e)=>{
    const rect=canvas.getBoundingClientRect();
    const mx=(e.clientX-rect.left-camX)/zoom;
    const my=(e.clientY-rect.top-camY)/zoom;

    const x=Math.floor(mx/TILE_SIZE);
    const y=Math.floor(my/TILE_SIZE);

    if (isPanning){
        camX+=e.movementX;
        camY+=e.movementY;
        draw();
        return;
    }

    if (!isDrawing) return;
    if (x<0||y<0||x>=map.width||y>=map.height) return;

    const layer=layerSelect.value;
    map.layers[0][layer][y][x]=currentTile;

    draw();
});

// zoom
canvas.addEventListener("wheel", (e)=>{
    e.preventDefault();
    zoom += e.deltaY * -0.001;
    zoom = Math.max(0.5, Math.min(3, zoom));
    draw();
});

// ============================
// MAP CONTROL
// ============================

function resizeMap(){
    const w=parseInt(document.getElementById('mapWidth').value);
    const h=parseInt(document.getElementById('mapHeight').value);
    map=createNewMap(w,h);
    draw();
}

function clearMap(){
    map=createNewMap(map.width,map.height);
    draw();
}

// ============================
// IMPORT / EXPORT
// ============================

function exportMap(){
    const dataStr="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(map,null,4));
    const dl=document.createElement('a');
    dl.href=dataStr;
    dl.download='map.json';
    dl.click();
}

document.getElementById("fileInput").addEventListener("change", (e)=>{
    const file=e.target.files[0];
    const reader=new FileReader();

    reader.onload=function(evt){
        map=JSON.parse(evt.target.result);
        draw();
    };

    reader.readAsText(file);
});

// init

draw();

