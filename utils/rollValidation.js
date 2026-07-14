
exports.validateRoll = (roll) => {
  const isBTech = /^\d{2}9B1\d+$/.test(roll);
  const isDiploma = /^\d{5}-(CM|C|EC|EE|M)-\d{3}$/i.test(roll);

  return isBTech || isDiploma;
};
