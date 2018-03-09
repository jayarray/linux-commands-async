let LIST = require('./list.js');
let VALIDATE = require('./validate.js');

//----------------------------------------
// ERROR

function IntegerError(i) {
  let error = VALIDATE.IsInteger(i);
  if (error)
    return `is ${error}`;

  let min = 0;
  let max = 7;

  error = VALIDATE.IsIntegerInRange(i, min, max);
  if (error)
    return error;
  return null;
}

function PermissionsStringError(string) {
  let error = VALIDATE.IsInstance(string);
  if (error)
    return `Permissions string is ${error} `;

  let validSize = 9
  if (string.length != validSize)
    return `Permissions string must contain exactly ${validSize} characters`;

  string.split('').forEach(char => {
    if (!CharIsValid(char))
      return `Permissions string contains invalid characters`;
  });

  // Check if all chars are valid and in respective positions
  let readChars = ValidReadChars();
  let writeChars = ValidWriteChars();
  let executeChars = ValidExecuteChars();

  // Check user permissions
  let userChars = string.substring(0, 3);

  for (let i = 0; i < userChars.length; ++i) {
    let currChar = userChars.charAt(i);
    if (i == 0 && !readChars.includes(currChar)) // read
      return `Permissions string contains invalid character for user read permissions`;
    else if (i == 1 && !writeChars.includes(currChar))  // write
      return `Permissions string contains invalid character for user write permissions`;
    else if (i == 2 && !executeChars.includes(currChar))  // execute
      return `Permissions string contains invalid character for user execute permissions`;
  }

  // Check group permissions
  let groupChars = string.substring(3, 6);

  for (let i = 0; i < groupChars.length; ++i) {
    let currChar = groupChars.charAt(i);
    if (i == 0 && !readChars.includes(currChar)) // read
      return `Permissions string contains invalid character for group read permissions`;
    else if (i == 1 && !writeChars.includes(currChar))  // write
      return `Permissions string contains invalid character for group write permissions`;
    else if (i == 2 && !executeChars.includes(currChar))  // execute
      return `Permissions string contains invalid character for group execute permissions`;
  }

  // Check others permissions
  let otherChars = string.substring(6, 9);

  for (let i = 0; i < otherChars.length; ++i) {
    let currChar = otherChars.charAt(i);
    if (i == 0 && !readChars.includes(currChar)) // read
      return `Permissions string contains invalid character for others read permissions`;
    else if (i == 1 && !writeChars.includes(currChar))  // write
      return `Permissions string contains invalid character for others write permissions`;
    else if (i == 2 && !executeChars.includes(currChar))  // execute
      return `Permissions string contains invalid character for others execute permissions`;
  }

  return null; // NO errors detected
}

function OctalStringValidator(octalStr) {
  let error = VALIDATE.IsInstance(octalStr);
  if (error)
    return `Octal string is ${error} `;

  let lengthMin = 3;
  let lengthMax = 4;

  if (octalStr.length < lengthMin && octalStr.length > lengthMax)
    return `Octal string must have ${lengthMin} or ${lengthMax} characters`;

  let numbersAsStrings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => i.toString());
  for (let i = 0; i < octalStr.length; ++i) {
    let char = octalStr.charAt(i);
    if (!numbersAsStrings.includes(char))
      return 'Octal string contains non-numeric characters';
  }

  let valMin = 0;
  let valMax = 7;

  octalStr.split('').forEach(char => {
    try {
      let i = parseInt(char);
      if (i < valMin && i > valMax)
        return `Octal string numeric values must be between ${valMin} and ${valMax} `;
    } catch (error) {
      return `Could not parse char to int: ${error}`;
    }
  });
  return null;
}

function ObjectError(obj, isPseudo) {
  let error = VALIDATE.IsInstance(obj);
  if (error)
    return `Object is ${error} `;

  let prefix = '';
  if (isPseudo)
    prefix = 'Object';
  else
    prefix = 'Permissions object';

  // Check if obj missing values
  let groupChars = ValidClassChars();
  let variableNames = ['r', 'w', 'x', 'xchar', 'string'];

  groupChars.forEach(gChar => {
    variableNames.forEach(varName => {
      if (obj[gChar][varName] === undefined)
        return `${prefix} is missing required values`;
    });
  });

  let octalVariableNames = ['string', 'user', 'group', 'others'];
  octalVariableNames.forEach(varName => {
    if (obj.octal[varName] === undefined)
      return `${prefix} is missing required values`;
  });

  if (obj.owner === undefined || obj.group === undefined || obj.string === undefined)
    return `${prefix} is missing required values`;

  // Check if obj values are correct types
  let boolVars = [obj.u.r, obj.u.w, obj.u.x, obj.g.r, obj.g.w, obj.g.x, obj.o.r, obj.o.w, obj.o.x];
  boolVars.forEach(bvar => {
    if (!(bvar === true) || !(bvar === false))
      return `${prefix} values for u,g,o are all required to be boolean values (true|false)`;
  });

  if (
    !ValidExecuteChars().includes(obj.u.xchar) ||
    !ValidExecuteChars().includes(obj.g.xchar) ||
    !ValidExecuteChars().includes(obj.o.xchar)
  )
    return `${prefix} values for xchar are not valid characters`;

  if (isPseudo)
    return null;

  if (
    obj.octal.string == '' ||
    !obj.octal.string.trim() ||
    !Number.isInteger(obj.octal.special) ||
    !Number.isInteger(obj.octal.user) ||
    !Number.isInteger(obj.octal.group) ||
    !Number.isInteger(obj.octal.others)
  )
    return `${prefix} values for octal are incorrect types`;

  if (
    obj.owner === undefined ||
    obj.group === undefined ||
    obj.string === undefined
  )
    return `${prefix} values for owner, group, string are empty or whitespace`;

  return null;
}

//--------------------------------------------
// PERMISSIONS

/**
 * Get permissions for specified path.
 * @param {string} path
 * @returns {Promise<{u: {r: boolean, w: boolean, x: boolean, xchar: string, string: string}, g: {r: boolean, w: boolean, x: boolean, xchar: string, string: string}, o:{r: boolean, w: boolean, x: boolean, xchar: string, string: string}, octal: {special: number, user: number, group: number, others: number, string: string}, owner: string, group: string, string: string, filetype: string}>} Returns a promise. If it resolves, it returns an object. Else, it returns an error.
 */
function Permissions(path, executor) {
  if (!executor)
    return Promise.reject(`Failed to get permissions: Executor is required`);

  let error = VALIDATE.IsStringInput(path);
  if (error)
    return Promise.reject(`Failed to get permissions: Path is ${error}`);

  return new Promise((resolve, reject) => {
    LIST.Info(path, executor).then(info => {
      let permStr = info.permstr.trim();

      let results = CreatePermissionsObjectUsingPermissionsString(permStr);
      if (results.error) {
        reject(results.error);
        return;
      }

      let permObj = results.obj;
      permObj.owner = info.owner;
      permObj.group = info.group;
      permObj.filetype = info.filetype;

      resolve(permObj);
    }).catch(error => `Failed to get permissions: ${error}`);
  });
}

/**
 * Get permissions for specified path.
 * @param {string} permStr Permissions string
 * @returns {{u: {r: boolean, w: boolean, x: boolean, xchar: string, string: string}, g: {r: boolean, w: boolean, x: boolean, xchar: string, string: string}, o:{r: boolean, w: boolean, x: boolean, xchar: string, string: string}, octal: {special: number, user: number, group: number, others: number, string: string}, owner: string, group: string, string: string, filetype: string}} Returns a promise. If it resolves, it returns an object. Else, it returns an error.
 */
function CreatePermissionsObjectUsingPermissionsString(permStr) {
  let error = PermissionsStringError(permStr);
  if (error)
    return { obj: null, error: error };

  let permTrimmed = permStr.trim();

  let octalStr = PermissionsStringToOctalString(permTrimmed);
  if (octalStr.error)
    return { obj: null, error: octalStr.error };

  let octalTrimmed = octalStr.string.trim();

  let specialOctal = 0;
  let userOctal = 0;
  let groupOctal = 0;
  let othersOctal = 0;

  if (octalTrimmed.length == 4) {
    specialOctal = parseInt(octalTrimmed.charAt(0));
    userOctal = parseInt(octalTrimmed.charAt(1));
    groupOctal = parseInt(octalTrimmed.charAt(2));
    othersOctal = parseInt(octalTrimmed.charAt(3));
  }
  else if (octalTrimmed.length == 3) {
    userOctal = parseInt(octalTrimmed.charAt(0));
    groupOctal = parseInt(octalTrimmed.charAt(1));
    othersOctal = parseInt(octalTrimmed.charAt(2));
  }

  let obj = {
    u: {
      r: permTrimmed.charAt(0) != '-',
      w: permTrimmed.charAt(1) != '-',
      x: permTrimmed.charAt(2) != '-' && !IsNonExecutableChar(permTrimmed.charAt(2)),
      xchar: permTrimmed.charAt(2),
      string: `${permTrimmed.charAt(0)}${permTrimmed.charAt(1)}${permTrimmed.charAt(2)}`
    },
    g: {
      r: permTrimmed.charAt(3) != '-',
      w: permTrimmed.charAt(4) != '-',
      x: permTrimmed.charAt(5) != '-' && !IsNonExecutableChar(permTrimmed.charAt(5)),
      xchar: permTrimmed.charAt(5),
      string: `${permTrimmed.charAt(3)}${permTrimmed.charAt(4)}${permTrimmed.charAt(5)}`
    },
    o: {
      r: permTrimmed.charAt(6) != '-',
      w: permTrimmed.charAt(7) != '-',
      x: permTrimmed.charAt(8) != '-' && !IsNonExecutableChar(permTrimmed.charAt(8)),
      xchar: permStr.charAt(8),
      string: `${permTrimmed.charAt(6)}${permTrimmed.charAt(7)}${permTrimmed.charAt(8)}`
    },
    octal: {
      string: octalTrimmed,
      special: specialOctal,
      user: userOctal,
      group: groupOctal,
      others: othersOctal
    },
    owner: null,
    group: null,
    string: permTrimmed,
    filetype: null
  };
  return { obj: obj, error: null };
}

function IntToRwxObject(int) {
  let error = IntegerError(int);
  if (error)
    return { obj: null, error: `int ${error}` };

  let obj = { r: false, w: false, x: false };

  let charValList = [
    { char: 'r', value: 4 },
    { char: 'w', value: 2 },
    { char: 'x', value: 1 }
  ];

  // Check if only one type is set
  charValList.forEach(item => {
    if (item.value == int) {
      obj[item.char] = true;
      return { obj: obj, error: null };
    }
  });

  // Check if multiple types are set
  let areSet = [];
  for (let i = 0; i < charValList.length; ++i) {
    let currObj = charValList[i];
    let others = charValList.filter(i => i.char != currObj.char);

    if (currObj.value + others[0].value == int) {
      areSet.push(currObj, others[0]);
      break;
    }
    else if (currObj.value + others[1].value == int) {
      areSet.push(currObj, others[1]);
      break;
    }
    else if (currObj.value + others[0].value + others[1].value == int) {
      areSet.push(currObj, others[0], others[1]);
    }
  }

  if (areSet) {
    areSet.forEach(item => {
      obj[item.char] = true;
    });
  }
  return { obj: obj, error: null };
}

/**
 * Get permissions for specified path.
 * @param {string} octalStr Octal string
 * @returns {{u: {r: boolean, w: boolean, x: boolean, xchar: string, string: string}, g: {r: boolean, w: boolean, x: boolean, xchar: string, string: string}, o:{r: boolean, w: boolean, x: boolean, xchar: string, string: string}, octal: {special: number, user: number, group: number, others: number, string: string}, owner: string, group: string, string: string, filetype: string}} Returns a promise. If it resolves, it returns an object. Else, it returns an error.
 */
function CreatePermissionsObjectUsingOctalString(octalStr) {
  let error = OctalStringValidator(octalStr);
  if (error)
    return { obj: null, error: error };

  let octalTrimmed = octalStr.trim();
  let obj = {
    u: { r: false, w: false, x: false, xchar: '-', string: '' },
    g: { r: false, w: false, x: false, xchar: '-', string: '' },
    o: { r: false, w: false, x: false, xchar: '-', string: '' },
    octal: { string: '', special: '', user: '', group: '', others: '' },
    owner: null,
    group: null,
    string: null,
    filetype: null
  };

  // Set octal properties
  obj.octal.string = octalTrimmed;

  obj.octal.special = 0;
  obj.octal.user = 0;
  obj.octal.group = 0;
  obj.octal.others = 0;

  if (octalTrimmed.length == 4) {
    obj.octal.special = parseInt(octalTrimmed.charAt(0));
    obj.octal.user = parseInt(octalTrimmed.charAt(1));
    obj.octal.group = parseInt(octalTrimmed.charAt(2));
    obj.octal.others = parseInt(octalTrimmed.charAt(3));
  }
  else if (octalTrimmed == 3) {
    obj.octal.user = parseInt(octalTrimmed.charAt(0));
    obj.octal.group = parseInt(octalTrimmed.charAt(1));
    obj.octal.others = parseInt(octalTrimmed.charAt(2));
  }

  // SPECIAL
  let specialOctal = parseInt(obj.octal.special);
  let specialRwxObj = IntToRwxObject(specialOctal);
  if (specialRwxObj.error)
    return { obj: null, error: specialRwxObj.error };

  // USER
  let userOctal = parseInt(obj.octal.user);
  let userRwxObj = IntToRwxObject(userOctal);
  if (userRwxObj.error)
    return { obj: null, error: userRwxObj.error };

  obj.u.r = userRwxObj.obj.r;
  obj.u.w = userRwxObj.obj.w;
  obj.u.x = userRwxObj.obj.x;

  if (userRwxObj.obj.x && specialRwxObj.obj.r)
    obj.u.xchar = 's';
  if (!userRwxObj.obj.x && specialRwxObj.obj.r)
    obj.u.xchar = 'S';
  if (userRwxObj.obj.x && !specialRwxObj.obj.r)
    obj.u.xchar = 'x';

  obj.u.string = `${obj.u.r ? 'r' : '-'}${obj.u.w ? 'w' : '-'}${obj.u.xchar}`;


  // GROUP
  let groupOctal = parseInt(obj.octal.group);
  let groupRwxObj = IntToRwxObject(groupOctal);
  if (groupRwxObj.error)
    return { obj: null, error: groupRwxObj.error };

  obj.g.r = groupRwxObj.obj.r;
  obj.g.w = groupRwxObj.obj.w;
  obj.g.x = groupRwxObj.obj.x;

  if (groupRwxObj.obj.x && specialRwxObj.obj.w)
    obj.g.xchar = 's';
  if (!groupRwxObj.obj.x && specialRwxObj.obj.w)
    obj.g.xchar = 'S';
  if (groupRwxObj.obj.x && !specialRwxObj.obj.w)
    obj.g.xchar = 'x';

  obj.g.string = `${obj.g.r ? 'r' : '-'}${obj.g.w ? 'w' : '-'}${obj.g.xchar}`;


  // OTHERS
  let othersOctal = parseInt(obj.octal.others);
  let othersRwxObj = IntToRwxObject(othersOctal);
  if (othersRwxObj.error)
    return { obj: null, error: othersRwxObj.error };

  obj.o.r = othersRwxObj.obj.r;
  obj.o.w = othersRwxObj.obj.w;
  obj.o.x = othersRwxObj.obj.x;

  if (othersRwxObj.obj.x && specialRwxObj.obj.x)
    obj.o.xchar = 't';
  if (!othersRwxObj.obj.x && specialRwxObj.obj.x)
    obj.o.xchar = 'T';
  if (othersRwxObj.obj.x && !specialRwxObj.obj.x)
    obj.o.xchar = 'x';

  obj.o.string = `${obj.o.r ? 'r' : '-'}${obj.o.w ? 'w' : '-'}${obj.o.xchar}`;

  obj.string = `${obj.u.string}${obj.g.string}${obj.o.string}`;

  return { obj: obj, error: null };
}

/**
 * Check if permissions objects are the same.
 * @param {Object} p1 Permissions object
 * @param {Object} p2 Permissions object
 * @returns {boolean} Returns true if both permissions objects are equal, false otherwise.
 */
function Equal(p1, p2) {
  return p1.u.r == p2.u.r &&
    p1.u.w == p2.u.w &&
    p1.u.x == p2.u.x &&
    p1.u.xchar == p2.u.xchar &&
    p1.u.string == p2.u.string &&
    p1.g.r == p2.g.r &&
    p1.g.w == p2.g.w &&
    p1.g.x == p2.g.x &&
    p1.g.xchar == p2.g.xchar &&
    p1.g.string == p2.g.string &&
    p1.o.r == p2.o.r &&
    p1.o.w == p2.o.w &&
    p1.o.x == p2.o.x &&
    p1.o.xchar == p2.o.xchar &&
    p1.o.string == p2.o.string &&
    p1.octal.string == p2.octal.string &&
    p1.octal.special == p2.octal.special &&
    p1.octal.user == p2.octal.user &&
    p1.octal.group == p2.octal.group &&
    p1.octal.others == p2.octal.others &&
    p1.owner == p2.owner &&
    p1.group == p2.group &&
    p1.string == p2.string;
}

function ObjectToOctalString(obj) {  // Example:  obj = { u:{...}, g:{...}, o:{...} }
  let error = ObjectError(obj, true);
  if (error)
    return { string: null, error: error };

  let permStr = `${obj.u.r ? 'r' : '-'}${obj.u.w ? 'w' : '-'}${obj.u.xchar}`;
  permStr += `${obj.g.r ? 'r' : '-'}${obj.g.w ? 'w' : '-'}${obj.g.xchar}`;
  permStr += `${obj.o.r ? 'r' : '-'} ${obj.o.w ? 'w' : '-'} ${obj.o.xchar}`;

  let results = PermissionsStringToOctalString(permStr);
  if (results.error)
    return { string: null, error: octalStr.error };
  return { string: results.string, error: null };
}

function PermissionsStringToOctalString(permStr) {  // permStr = "r--r--r--" (9 chars only)
  let error = PermissionsStringError(permStr);
  if (error)
    return { string: null, error: error };

  let pTrimmed = permStr.trim();

  let readChars = ValidReadChars();
  let writeChars = ValidWriteChars();
  let executeChars = ValidExecuteChars();

  let specialOctal = 0;

  // Compute user octal
  let uidIsSet = false;
  let userOctal = 0;

  let userChars = pTrimmed.substring(0, 3);
  userChars.split('').forEach(char => {
    userOctal += CharValue(char);
    if (WillSetUidOrGuidOrStickybit(char))
      uidIsSet = true;
  });

  if (uidIsSet)
    specialOctal += 4;


  // Check group permissions
  let gidIsSet = false;
  let groupOctal = 0;

  let groupChars = pTrimmed.substring(3, 6);
  groupChars.split('').forEach(char => {
    groupOctal += CharValue(char);
    if (WillSetUidOrGuidOrStickybit(char))
      gidIsSet = true;
  });

  if (gidIsSet)
    specialOctal += 2;


  // Check execute permissions
  let stickybitIsSet = false;
  let othersOctal = 0;

  let othersChars = pTrimmed.substring(6, 9);
  othersChars.split('').forEach(char => {
    othersOctal += CharValue(char);
    if (WillSetUidOrGuidOrStickybit(char))
      stickybitIsSet = true;
  });

  if (stickybitIsSet)
    specialOctal += 1;


  // Return octal string
  let octalStr = `${userOctal}${groupOctal}${othersOctal}`;
  if (specialOctal > 0)
    octalStr = `${specialOctal}${octalStr}`;
  return { string: octalStr, error: null };
}

function FileTypeName(char) {
  let error = VALIDATE.IsInstance(char);
  if (error)
    return { name: null, error: `Failed to get file type name. Char is ${error}` };

  let name = FileTypeCharToNameDict()[char];
  if (!name)
    return { name: null, error: `Failed to get file type name. Char is not a valid file type character: '${char}'` };
  return { name: name, error: null };
}

function FileTypeCharToNameDict() {
  return {
    '-': 'file',
    b: 'block device',
    c: 'character device',
    d: 'directory',
    l: 'symbolic link',
    p: 'named pipe',
    s: 'socket',
    D: 'door'
  };
}

function ValidFileTypeChars() {
  return ['b', 'c', 'd', 'l', 'p', 's', 'D', '-'];
}

function ValidReadChars() {
  return ['r', '-'];
}

function ValidWriteChars() {
  return ['w', '-'];
}

function ValidExecuteChars() {
  return ['x', 's', 'S', 't', 'T', '-'];
}

function ValidClassChars() {
  return ['u', 'g', 'o'];
}

function IsNonExecutableChar(c) {
  return c == 'S' || c == 'T';
}

function WillSetUidOrGuidOrStickybit(c) {
  return c == 's' || c == 'S' || c == 't' || c == 'T';
}

function ValidCharValues() {
  return [4, 2, 1, 0];
}

function CharValueDict() {
  return { r: 4, w: 2, x: 1, s: 1, t: 1, S: 0, T: 0, '-': 0 };
}

function CharValue(c) {
  let val = CharValueDict()[c];
  if (ValidCharValues().includes(val))
    return val;
  return null;
}

function CharIsValid(c) {
  return ValidFileTypeChars().includes(c) ||
    ValidReadChars().includes(c) ||
    ValidWriteChars().includes(c) ||
    ValidExecuteChars().includes(c);
}

//---------------------------------
// EXPORTS

exports.Permissions = Permissions;
exports.CreatePermissionsObjectUsingPermissionsString = CreatePermissionsObjectUsingPermissionsString;
exports.CreatePermissionsObjectUsingOctalString = CreatePermissionsObjectUsingOctalString;
exports.PermissionsStringToOctalString = PermissionsStringToOctalString;
exports.Equal = Equal;