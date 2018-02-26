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

  if (typeof n == 'number')
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
  let minIsNull = min == null;
  let maxIsNull = max == null;

  let minIsInteger = IsInteger(min) == null;
  let maxIsInteger = IsInteger(max) == null;

  let minIsDefined = !minIsNull && minIsInteger;
  let maxIsDefined = !maxIsNull && maxIsInteger;

  let onlyMinIsDefined = minIsDefined && !maxIsDefined;
  let onlyMaxIsDefined = maxIsDefined && !minIsDefined;
  let bothAreDefined = minIsDefined && maxIsDefined;

  // BOTH are defined
  if (bothAreDefined) {
    if (min > max + 1)
      return `min (${min}) must be less than or equal to max (${max})`;

    if (max < min - 1)
      return `max (${max}) must be greater than or equal to min (${min})`;

    if (min == max && i != min)
      return `out of bounds; must follow rule: ${min} ≤ i ≤ ${max}`;
    return null;
  }

  // MIN only
  if (onlyMinIsDefined) {
    if (i < min)
      return `out of bounds: must follow rule: i ≥ ${min}`;
    return null;
  }

  // MAX only
  if (onlyMaxIsDefined) {
    if (i > max)
      return `out of bounds: must follow rule: i ≤ ${max}`;
    return null;
  }

  // None are defined
  return 'min and max are not valid';
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