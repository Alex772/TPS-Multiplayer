import { interpolate } from './network.js';
import { applyLocalMovement } from './input.js';
import { render } from './render.js';

function loop() {
  if (!window.state || !window.myId) {
    requestAnimationFrame(loop);
    return;
  }
  //applyLocalMovement();
  interpolate();
  render(window.state, window.myId);
  requestAnimationFrame(loop);
}

loop();
