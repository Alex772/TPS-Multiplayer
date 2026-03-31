const pendingInputs = [];
export function getPendingInputs() { return pendingInputs; }
export function pushPendingInput(input) {
  pendingInputs.push(input);
  if (pendingInputs.length > 100) pendingInputs.shift();
}
