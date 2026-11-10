// Moves focus to the first field with an error. fieldIds maps field names to input ids,
// in the order they appear on screen. Waits a frame so the error messages are rendered
// and screen readers read them out together with the field.
export const focusFirstError = (errors, fieldIds) => {
  const name = Object.keys(fieldIds).find((key) => errors[key]);
  if (!name) return;
  requestAnimationFrame(() => document.getElementById(fieldIds[name])?.focus());
};
