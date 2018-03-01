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

function IsInteger(n) {
  let error = IsInstance(n);
  if (error)
    return error;

  if (!Number.isInteger(n))
    return `not an integer`;
  return null;
}

function IsIntegerInRange(n, min, max) {
  let haveMin = IsInteger(min) == null;
  let haveMax = IsInteger(max) == null;

  if (haveMin && haveMax && min > max) {
    let temp = min;
    min = max;
    max = temp;
  }

  if (haveMin && n < min)
    return `out of bounds; ${n} is not between ${min} and ${max}`

  if (haveMax && n > max)
    return `out of bounds; ${n} is not between ${min} and ${max}`

  return null;
}

function IsArray(o) {
  let error = IsInstance(o);
  if (error)
    return error;

  if (!Array.isArray(o))
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