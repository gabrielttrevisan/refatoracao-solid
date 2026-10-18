module.exports = function isNotStringField(object, fieldName) {
  return (
    !(fieldName in object) ||
    typeof object[fieldName] !== "string" ||
    object[fieldName].trim().length === 0
  );
};
