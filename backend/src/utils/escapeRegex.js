// so a search like "c++" or "(urgent)" is matched literally
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = escapeRegex;
