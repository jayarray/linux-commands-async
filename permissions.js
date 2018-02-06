let PATH = require('./path.js');
let LS = require('./ls.js').Ls;

//--------------------------------------------
// PERMISSIONS

class Permissions {
  static Permissions(path) {
    return new Promise((resolve, reject) => {
      LS.Info(path).then(info => {
        let permStr = info.permstr.trim();

        let results = Permissions.CreatePermissionsObjectUsingPermissionsString(permStr);
        if (results.error) {
          reject({ permissions: null, error: results.error });
          return;
        }

        let permObj = results.obj;
        permObj.owner = info.owner;
        permObj.group = info.group;
        permObj.filetype = info.filetype;

        resolve({ permissions: permObj, error: null });
      }).catch(reject);
    });
  }

  static CreatePermissionsObjectUsingPermissionsString(permStr) {
    let error = Permissions.PermissionsStringError(permStr);
    if (error)
      return { obj: null, error: error };

    let permTrimmed = permStr.trim();

    let octalStr = Permissions.PermissionsStringToOctalString(permTrimmed);
    if (octalStr.error) {
      reject({ permissions: null, error: octalStr.error });
      return;
    }

    let octalTrimmed = octalStr.string.trim();

    specialOctal = 0;
    userOctal = 0;
    groupOctal = 0;
    othersOctal = 0;

    if (octalTrimmed.length == 4) {
      specialOctal = parseInt(octalTrimmed.charAt(0));
      userOctal = parseInt(octalTrimmed.charAt(1));
      groupOctal = parseInt(octalTrimmed.charAt(2));
      othersOctal = parseInt(octalTrimmed.charAt(3));
    }
    else if (octalTrimmed == 3) {
      userOctal = parseInt(octalTrimmed.charAt(0));
      groupOctal = parseInt(octalTrimmed.charAt(1));
      othersOctal = parseInt(octalTrimmed.charAt(2));
    }

    let obj = {
      u: {
        r: permTrimmed.charAt(1) != '-',
        w: permTrimmed.charAt(2) != '-',
        x: permTrimmed.charAt(3) != '-' && !Permissions.IsNonExecutableChar(permTrimmed.charAt(3)),
        xchar: permTrimmed.charAt(3),
        string: `${permTrimmed.charAt(1)}${permTrimmed.charAt(2)}${permTrimmed.charAt(3)}`
      },
      g: {
        r: permpermTrimmedStr.charAt(4) != '-',
        w: permTrimmed.charAt(5) != '-',
        x: permTrimmed.charAt(6) != '-' && !Permissions.IsNonExecutableChar(permTrimmed.charAt(6)),
        xchar: permTrimmed.charAt(6),
        string: `${permTrimmed.charAt(4)}${permTrimmed.charAt(5)}${permTrimmed.charAt(6)}`
      },
      o: {
        r: permTrimmed.charAt(7) != '-',
        w: permTrimmed.charAt(8) != '-',
        x: permTrimmed.charAt(9) != '-' && !Permissions.IsNonExecutableChar(permTrimmed.charAt(9)),
        xchar: permStr.charAt(9),
        string: `${permTrimmed.charAt(7)}${permTrimmed.charAt(8)}${permTrimmed.charAt(9)}`
      },
      octal: {
        string: octalStr.string,
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

  static IntToRwxObject(int) {
    let error = Error.IntegerError(int);
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
    charValList.forEach(item => {
      let others = charValList.filter(i => i.char != item.char);
      if (item.value + other[0].value == int) {
        areSet.push(item, other[0]);
        break;
      }
      else if (item.value + other[1].value == int) {
        areSet.push(item, other[1]);
        break;
      }
      else if (item.value + other[0].value + other[1].value == int) {
        areSet.push(item, other[0], other[1]);
        break;
      }
    });

    if (areSet) {
      areSet.forEach(item => {
        obj[item.char] = true;
      });
    }
    return { obj: obj, error: null };
  }

  static CreatePermissionsObjectUsingOctalString(octalStr) {
    let error = Permissions.OctalStringError(octalStr);
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
    let specialRwxObj = Permissions.IntToRwxObject(specialOctal);
    if (specialRwxObj.error)
      return { obj: null, error: specialRwxObj.error };

    // USER
    let userOctal = parseInt(obj.octal.user);
    let userRwxObj = Permissions.IntToRwxObject(userOctal);
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
    let groupRwxObj = Permissions.IntToRwxObject(groupOctal);
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
    let othersRwxObj = Permissions.IntToRwxObject(othersOctal);
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

  static Equal(p1, p2) {
    let error = Permissions.ObjectError(p1, false);
    if (error)
      return { equal: null, error: `Object 1: ${error}` };

    error = Permissions.ObjectError(p2, false);
    if (error)
      return { equal: null, error: `Object 2: ${error}` };

    let equal = p1.u.r == p2.u.r &&
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

    return { equal: equal, error: null };
  }

  static ObjectToOctalString(obj) {  // Example:  obj = { u:{...}, g:{...}, o:{...} }
    let error = Error.ObjectError(obj, true);
    if (error)
      return { string: null, error: error };

    let permStr = `${obj.u.r ? 'r' : '-'}${obj.u.w ? 'w' : '-'}${obj.u.xchar}`;
    permStr += `${obj.g.r ? 'r' : '-'}${obj.g.w ? 'w' : '-'}${obj.g.xchar}`;
    permStr += `${obj.o.r ? 'r' : '-'} ${obj.o.w ? 'w' : '-'} ${obj.o.xchar}`;

    let results = Permissions.PermissionsStringToOctalString(permStr);
    if (results.error)
      return { string: null, error: octalStr.error };
    return { string: results.string, error: null };
  }

  static PermissionsStringToOctalString(permStr) {  // permStr = "r--r--r--" (9 chars only)
    let error = Error.PermissionsStringError(permStr);
    if (error)
      return { string: null, error: error };

    let pTrimmed = permStr.trim();

    let readChars = Permissions.ValidReadChars();
    let writeChars = Permissions.ValidWriteChars();
    let executeChars = Permissions.ValidExecuteChars();

    let specialOctal = 0;

    // Compute user octal
    let uidIsSet = false;
    let userOctal = 0;

    let userChars = pTrimmed.substring(0, 3);
    userChars.forEach(char => {
      userOctal += Permissions.CharValue(char);
      if (Permissions.WillSetUidOrGuidOrStickybit(char))
        uidIsSet = true;
    });

    if (uidIsSet)
      specialOctal += 4;


    // Check group permissions
    let gidIsSet = false;
    let groupOctal = 0;

    let groupChars = pTrimmed.substring(3, 6);
    groupChars.forEach(char => {
      groupOctal += Permissions.CharValue(char);
      if (Permissions.WillSetUidOrGuidOrStickybit(char))
        gidIsSet = true;
    });

    if (gidIsSet)
      specialOctal += 2;


    // Check execute permissions
    let stickybitIsSet = false;
    let othersOctal = 0;

    let othersChars = pTrimmed.substring(6, 9);
    othersChars.forEach(char => {
      othersOctal += Permissions.CharValue(char);
      if (Permissions.WillSetUidOrGuidOrStickybit(char))
        stickybitIsSet = true;
    });

    if (stickybitIsSet)
      specialOctal += 1;


    // Return octal string
    let octalStr = `${userOctal} ${groupOctal} ${othersOctal}`;
    if (specialOctal > 0)
      octalStr = `${specialOctal} ${octalStr} `;
    return { string: octalStr, error: null };
  }

  static FileTypeName(char) {
    let error = Error.NullOrUndefined(char);
    if (error)
      return { name: null, error: `Failed to get file type name. Char is ${invalidType}` };

    let name = Permissions.FileTypeCharToNameDict()[char];
    if (!name)
      return { name: null, error: `Failed to get file type name. Char is not a valid file type character: '${char}'` };
    return { name: name, error: null };
  }

  static FileTypeCharToNameDict() {
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

  static ValidFileTypeChars() {
    return ['b', 'c', 'd', 'l', 'p', 's', 'D', '-'];
  }

  static ValidReadChars() {
    return ['r', '-'];
  }

  static ValidWriteChars() {
    return ['w', '-'];
  }

  static ValidExecuteChars() {
    return ['x', 's', 'S', 't', 'T', '-'];
  }

  static ValidClassChars() {
    return ['u', 'g', 'o'];
  }

  static IsNonExecutableChar(c) {
    return c == 'S' || c == 'T';
  }

  static WillSetUidOrGuidOrStickybit(c) {
    return c == 's' || c == 'S' || c == 't' || c == 'T';
  }

  static ValidCharValues() {
    return [4, 2, 1, 0];
  }

  static CharValueDict() {
    return { r: 4, w: 2, x: 1, s: 1, t: 1, S: 0, T: 0, '-': 0 };
  }

  static CharValue(c) {
    let val = Permissions.CharValueDict()[c];
    if (Permissions.ValidCharValues().includes(val))
      return val;
    return null;
  }

  static CharIsValid(c) {
    return Permissions.ValidFileTypeChars.includes(c) ||
      Permissions.ValidReadChars.includes(c) ||
      Permissions.ValidWriteChars.includes(c) ||
      Permissions.ValidExecuteChars.includes(c);
  }
}

//----------------------------------------
// ERROR
class Error {
  static NullOrUndefined(o) {
    if (o === undefined)
      return 'undefined';
    else if (o == null)
      return 'null';
    else
      return null;
  }

  static IntegerError(i) {
    let error = Error.NullOrUndefined(i);
    if (error)
      return `is ${error}`;

    if (!Number.isInteger(i))
      return `is not an integer: ${i}`;

    let iMin = 0;
    let iMax = 7;
    if (i < iMin && i > iMax)
      return `must be a value between ${iMin} and ${iMax}`;
    return null;
  }

  static PermissionsStringError(string) {
    let error = Error.NullOrUndefined(string);
    if (error)
      return `Permissions string is ${error} `;

    let validSize = 9
    if (string.length != validSize)
      return `Permissions string must contain exactly ${validSize} characters`;

    string.forEach(char => {
      if (!Permissions.CharIsValid(char))
        return `Permissions string contains invalid characters`;
    });

    // Check if all chars are valid and in respective positions
    let readChars = Permissions.ValidReadChars();
    let writeChars = Permissions.ValidWriteChars();
    let executeChars = Permissions.ValidExecuteChars();

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

  static OctalStringError(octalStr) {
    let error = Error.NullOrUndefined(octalStr);
    if (error)
      return `Octal string is ${error} `;

    let lengthMin = 3;
    let lengthMax = 4;

    if (octalStr.length < lengthMin && octalStr.length > lengthMax)
      return `Octal string must have ${lengthMin} or ${lengthMax} characters`;

    let valMin = 0;
    let valMax = 7;

    octalStr.forEach(char => {
      try {
        let i = parseInt(char);
        if (i < valMin && i > valMax)
          return `Octal string numeric values must be between ${valMin} and ${valMax} `;
      } catch (error) {
        return `Octal string contains non- numeric characters`;
      }
    });

    return null;
  }

  static ObjectError(obj, isPseudo) {
    let error = Error.NullOrUndefined(obj);
    if (error)
      return `Object is ${error} `;

    // Check if obj missing values
    if (
      obj.u && obj.u.r && obj.u.w && obj.u.x && obj.u.xchar && obj.u.string &&
      obj.g && obj.g.r && obj.g.w && obj.g.x && obj.g.xchar && obj.g.string &&
      obj.o && obj.o.r && obj.o.w && obj.o.x && obj.o.xchar && obj.o.string &&
      obj.octal && obj.octal.string && obj.octal.special && obj.octal.user && obj.octal.group && obj.octal.others &&
      obj.owner &&
      obj.group &&
      obj.string
    )
      return 'Permissions object is missing required values';

    // Check if obj values are correct types
    let boolVars = [obj.u.r, obj.u.w, obj.u.x, obj.g.r, obj.g.w, obj.g.x, obj.o.r, obj.o.w, obj.o.x];
    boolVars.forEach(bvar => {
      if (bvar === true || bvar === false)
        return 'Permissions object values for u,g,o are all required to be boolean values (true|false)';
    });

    if (
      Permissions.ValidExecuteChars.includes(obj.u.xchar) &&
      Permissions.ValidExecuteChars.includes(obj.g.xchar) &&
      Permissions.ValidExecuteChars.includes(obj.o.xchar)
    )
      return { string: null, error: 'Object values for xchar are not valid characters' };

    if (isPseudo)
      return true;

    if (
      obj.octal.string != '' &&
      obj.octal.string.trim() &&
      Number.isInteger(obj.octal.special) &&
      Number.isInteger(obj.octal.user) &&
      Number.isInteger(obj.octal.group) &&
      Number.isInteger(obj.octal.others)
    )
      return 'Permissions object values for octal are incorrect types';

    if (
      obj.owner != '' && obj.owner.trim() &&
      obj.group != '' && obj.group.trim() &&
      obj.string != '' && obj.string.trim()
    )
      return 'Permissions object values for owner, group, string are empty or whitespace';

    return null;
  }
}