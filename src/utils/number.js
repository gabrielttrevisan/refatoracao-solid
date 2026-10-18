module.exports = function isNotNumberField(object, prop) {
  return (
    !object[prop] ||
    typeof object[prop] !== "number" ||
    isNaN(object[prop]) ||
    !Number.isFinite(object[prop])
  );
};
