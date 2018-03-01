function IsInstance(o) {
  if (o === undefined)
    return 'undefined';
  else if (o == null)
    return 'null';
  else
    return null;
}

function IsStringInput(s) {
  let error = IsInstance(s);
  if (error)
    return error;

  if (typeof s != 'string')
    return 'not a string';
  else if (s == '')
    return 'empty';
  else if (s.trim() == '')
    return 'whitespace'
  else
    return null;
}

function IsNumber(n) {
  let error = IsInstance(n);
  if (error)
    return error;

  if (typeof n != 'number')
    return 'not a number';
  return null;
}

function IsInteger(i) {
  let error = IsInstance(i);
  if (error)
    return error;

  if (!Number.isInteger(i))
    return `not an integer`;
  return null;
}

function IsIntegerInRange(i, min, max) {
  let haveMin = IsInteger(min) == null;
  let haveMax = IsInteger(max) == null;

  if (haveMin && haveMax && min > max) {
    let temp = min;
    min = max;
    max = temp;
  }

  if (haveMin && i < min)
    return `out of bounds; ${i} is not between ${min} and ${max}`

  if (haveMax && i > max)
    return `out of bounds; ${i} is not between ${min} and ${max}`

  return null;
}

function IsArray(arr) {
  let error = IsInstance(arr);
  if (error)
    return error;

  if (!Array.isArray(arr))
    return 'not an array';
  return null;
}

//-------------------------------------
// EXPORTS

exports.IsInstance = IsInstance;
exports.IsStringInput = IsStringInput;
exports.IsArray = IsArray;
exports.IsNumber = IsNumber;
exports.IsInteger = IsInteger;
exports.IsIntegerInRange = IsIntegerInRange;