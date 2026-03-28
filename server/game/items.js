// server/game/items.js

const ITEMS = {
  pistol: {
    id: "pistol",
    name: "Pistola",
    type: "weapon",

    damage: 10,
    fireRate: 400,
    ammoType: "light",

    maxAmmo: 12,
    reloadTime: 1000,

    sprite: "pistol.png"
  },

  rifle: {
    id: "rifle",
    name: "Rifle",
    type: "weapon",

    damage: 20,
    fireRate: 150,
    ammoType: "medium",

    maxAmmo: 30,
    reloadTime: 1500,

    sprite: "rifle.png"
  },

  ammo_light: {
    id: "ammo_light",
    name: "Munição leve",
    type: "ammo",
    amount: 20
  }
};

module.exports = { ITEMS };