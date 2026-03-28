// inventory.js

export class Inventory {
  constructor() {
    this.weapons = {}; 
    this.ammo = {};

    this.currentWeapon = null;
  }

  addWeapon(weaponId) {
    this.weapons[weaponId] = true;

    // Se não tiver arma equipada, equipa automaticamente
    if (!this.currentWeapon) {
      this.currentWeapon = weaponId;
    }
  }

  addAmmo(type, amount) {
    if (!this.ammo[type]) {
      this.ammo[type] = 0;
    }

    this.ammo[type] += amount;
  }

  getAmmo(type) {
    return this.ammo[type] || 0;
  }

  setWeapon(weaponId) {
    if (this.weapons[weaponId]) {
      this.currentWeapon = weaponId;
    }
  }
}