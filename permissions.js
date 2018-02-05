let PATH = require('./path.js');



//--------------------------------------------
// PERMISSIONS

class Permissions {
  static create_perm_obj_using_perm_string(permStr) {
    let error = Permissions.string_error(permStr);
    if (error)
      return { obj: null, error: error };

    let permTrimmed = permStr.trim();

    let octalStr = Permissions.perm_string_to_octal_string(permTrimmed);
    if (octalStr.error) {
      reject({ permissions: null, error: octalStr.error });
      return;
    }

    let obj = {
      u: {
        r: permTrimmed.charAt(1) != '-',
        w: permTrimmed.charAt(2) != '-',
        x: permTrimmed.charAt(3) != '-' && !Permissions.is_non_executable_char(permTrimmed.charAt(3)),
        xchar: permTrimmed.charAt(3),
        string: `${permTrimmed.charAt(1)}${permTrimmed.charAt(2)}${permTrimmed.charAt(3)}`
      },
      g: {
        r: permpermTrimmedStr.charAt(4) != '-',
        w: permTrimmed.charAt(5) != '-',
        x: permTrimmed.charAt(6) != '-' && !Permissions.is_non_executable_char(permTrimmed.charAt(6)),
        xchar: permTrimmed.charAt(6),
        string: `${permTrimmed.charAt(4)}${permTrimmed.charAt(5)}${permTrimmed.charAt(6)}`
      },
      o: {
        r: permTrimmed.charAt(7) != '-',
        w: permTrimmed.charAt(8) != '-',
        x: permTrimmed.charAt(9) != '-' && !Permissions.is_non_executable_char(permTrimmed.charAt(9)),
        xchar: permStr.charAt(9),
        string: `${permTrimmed.charAt(7)}${permTrimmed.charAt(8)}${permTrimmed.charAt(9)}`
      },
      octal: {
        string: octalStr.string,
        special: parseInt(octalStr.string.charAt(0)),
        user: parseInt(octalStr.string.charAt(1)),
        group: parseInt(octalStr.string.charAt(2)),
        others: parseInt(octalStr.string.charAt(3))
      },
      owner: null,
      group: null,
      string: permTrimmed,
      filetype: null
    };
    return { obj: obj, error: null };
  }

  static int_to_rwx_obj(int) {
    let invalid = invalid_type(int);
    if (invalidType)
      return { obj: null, error: `INT_TO_RWX_ERROR: Int is ${invalidType}` };

    if (Number.isInteger(int))
      return { obj: null, error: `INT_TO_RWX_ERROR: Int is not an integer` };

    let iMin = 0;
    let iMax = 7;
    if (int < iMin && int > iMax)
      return { obj: null, error: `INT_TO_RWX_ERROR: Int must be a value between ${iMin} and ${iMax}` };

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

  static create_perm_obj_using_octal_string(octalStr) {
    let error = Permissions.octal_string_error(octalStr);
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
    obj.octal.special = parseInt(octalTrimmed.charAt(0));
    obj.octal.user = parseInt(octalTrimmed.charAt(1));
    obj.octal.group = parseInt(octalTrimmed.charAt(2));
    obj.octal.others = parseInt(octalTrimmed.charAt(3));

    // SPECIAL
    let specialOctal = parseInt(octalStr.char(0));
    let specialRwxObj = Permissions.int_to_rwx_obj(specialOctal);
    if (specialRwxObj.error)
      return { obj: null, error: specialRwxObj.error };

    // USER
    let userOctal = parseInt(octalStr.char(1));
    let userRwxObj = Permissions.int_to_rwx_obj(userOctal);
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
    let groupOctal = parseInt(octalStr.char(2));
    let groupRwxObj = Permissions.int_to_rwx_obj(groupOctal);
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
    let othersOctal = parseInt(octalStr.char(3));
    let othersRwxObj = Permissions.int_to_rwx_obj(othersOctal);
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

  static permissions(path) {
    return new Promise((resolve, reject) => {
      List.item(path).then(results => {
        if (results.error) {
          reject({ permissions: null, error: results.error });
          return;
        }

        let item = results.item;
        let permStr = item.permstr.trim();

        let permObj = Permissions.create_perm_obj_using_perm_string(permStr);
        if (permObj.error) {
          reject({ permissions: null, error: permObj.error });
          return;
        }

        permObj.owner = item.owner;
        permObj.group = item.group;
        permObj.filetype = item.filetype;

        resolve({ permissions: permObj.obj, error: null });
      }).catch(fatalFail);
    });
  }

  static equal(p1, p2) {
    let error = Permissions.obj_error(p1);
    if (error)
      return { equal: null, error: `PERM1_OBJ_ERROR: ${error}` };

    error = Permissions.obj_error(p2);
    if (error)
      return { equal: null, error: `PERM2_OBJ_ERROR: ${error}` };

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

  static obj_to_octal_string(obj) {  // Example:  obj = { u:{...}, g:{...}, o:{...} }
    let invalidType = invalid_type(obj);
    if (invalidType)
      return { string: null, error: `OBJ_ERROR: Object is ${invalidType}` };

    // Check if obj missing values
    if (
      obj.u && obj.u.r && obj.u.w && obj.u.x && obj.u.xchar &&
      obj.g && obj.g.r && obj.g.w && obj.g.x && obj.g.xchar &&
      obj.o && obj.o.r && obj.o.w && obj.o.x && obj.o.xchar
    )
      return { string: null, error: 'OBJ_ERROR: Object is missing required values' };

    // Check if obj values are correct types
    let boolVars = [obj.u.r, obj.u.w, obj.u.x, obj.g.r, obj.g.w, obj.g.x, obj.o.r, obj.o.w, obj.o.x];
    boolVars.forEach(bvar => {
      if (bvar === true || bvar === false)
        return 'OBJ_ERROR: Object values for u,g,o are all required to be boolean (true|false)';
    });

    if (
      Permissions.valid_execute_chars.includes(obj.u.xchar) &&
      Permissions.valid_execute_chars.includes(obj.g.xchar) &&
      Permissions.valid_execute_chars.includes(obj.o.xchar)
    )
      return { string: null, error: 'OBJ_ERROR: Object values for xchar are not valid characters' };

    let permStr = `${obj.u.r}${obj.u.w}${obj.u.x}${obj.g.r}${obj.g.w}${obj.g.x}${obj.o.r}${obj.o.w}${obj.o.x}`;

    let octalStr = Permissions.perm_string_to_octal_string(permStr);
    if (octalStr.error)
      return { string: null, error: octalStr.error };

    return { string: octalStr.string, error: null };
  }

  static perm_string_to_octal_string(permStr) {  // permStr = "r--r--r--" (9 chars only)
    let error = Permissions.string_error(permStr);
    if (error)
      return { string: null, error: error };

    let pTrimmed = permStr.trim();

    let readChars = Permissions.valid_read_chars();
    let writeChars = Permissions.valid_write_chars();
    let executeChars = Permissions.valid_execute_chars();

    let specialOctal = 0;

    // Compute user octal
    let uidIsSet = false;
    let userOctal = 0;

    let userChars = pTrimmed.substring(0, 3);
    userChars.forEach(char => {
      userOctal += Permissions.char_value(char);
      if (Permissions.will_set_uid_guid_stickybit(char))
        uidIsSet = true;
    });

    if (uidIsSet)
      specialOctal += 4;


    // Check group permissions
    let gidIsSet = false;
    let groupOctal = 0;

    let groupChars = pTrimmed.substring(3, 6);
    groupChars.forEach(char => {
      groupOctal += Permissions.char_value(char);
      if (Permissions.will_set_uid_guid_stickybit(char))
        gidIsSet = true;
    });

    if (gidIsSet)
      specialOctal += 2;


    // Check execute permissions
    let stickybitIsSet = false;
    let othersOctal = 0;

    let othersChars = pTrimmed.substring(6, 9);
    othersChars.forEach(char => {
      othersOctal += Permissions.char_value(char);
      if (Permissions.will_set_uid_guid_stickybit(char))
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

  static file_type_char_name_dict() {
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

  static file_type_name(char) {
    let invalidType = invalid_type(char);
    if (invalidType)
      return { name: null, error: `FILE_TYPE_CHAR_ERROR: Char is ${invalidType}` };

    let name = Permissions.file_type_char_name_dict()[char];
    if (name)
      return { name: name, error: null };
    return { name: null, error: 'FILE_TYPE_CHAR_ERROR: Char is not a valid file type character' };
  }

  static valid_file_type_chars() {
    return ['b', 'c', 'd', 'l', 'p', 's', 'D', '-'];
  }

  static valid_read_chars() {
    return ['r', '-'];
  }

  static valid_write_chars() {
    return ['w', '-'];
  }

  static valid_execute_chars() {
    return ['x', 's', 'S', 't', 'T', '-'];
  }

  static is_non_executable_char(c) {
    return c == 'S' || c == 'T';
  }

  static will_set_uid_guid_stickybit(c) {
    return c == 's' || c == 'S' || c == 't' || c == 'T';
  }

  static valid_char_values() {
    return [4, 2, 1, 0];
  }

  static char_value_dict() {
    return { r: 4, w: 2, x: 1, s: 1, t: 1, S: 0, T: 0, '-': 0 };
  }

  static char_value(c) {
    let val = Permissions.char_value_dict()[c];
    if (Permissions.valid_char_values().includes(val))
      return val;
    return null;
  }

  static char_is_valid(c) {
    return Permissions.valid_file_type_chars.includes(c) ||
      Permissions.valid_read_chars.includes(c) ||
      Permissions.valid_write_chars.includes(c) ||
      Permissions.valid_execute_chars.includes(c);
  }

  static valid_class_chars() {
    return ['u', 'g', 'o'];
  }

  static octal_string_error(octalStr) {
    let invalidType = invalid_type(octalStr);
    if (invalid_type)
      return `Octal string is ${invalidType}`;

    let oTrimmed = octalStr.trim();

    let lengthMin = 3;
    let lengthMax = 4;

    if (octalStr.length < lengthMin && octalStr.length > lengthMax)
      return `Octal string is must have ${lengthMin} or ${lengthMax} characters`;

    let valMin = 0;
    let valMax = 7;

    octalStr.forEach(char => {
      try {
        let i = parseInt(char);
        if (i < valMin && i > valMax)
          return `Octal string numeric values must be between ${valMin} and ${valMax}`;
      } catch {
        return `Octal string contains non-numeric characters`;
      }
    });

    return null;
  }

  static string_error(permStr) {
    let invalidType = invalid_type(permStr);
    if (invalidType)
      return `PERM_STR_ERROR: Permissions string is ${invalidType}`;

    let pTrimmed = permStr.trim();
    let validSize = 9
    if (pTrimmed.length != validSize)
      return `PERM_STR_ERROR: Permissions string must contain exactly ${validSize} characters`;

    pTrimmed.forEach(char => {
      if (!Permissions.char_is_valid(char))
        return `PERM_STR_ERROR: Permissions string contains invalid characters`;
    });

    // Check if all chars are valid and in respective positions
    let readChars = Permissions.valid_read_chars();
    let writeChars = Permissions.valid_write_chars();
    let executeChars = Permiss.valid_execute_chars();

    // Check user permissions
    let userChars = pTrimmed.substring(0, 3);

    for (let i = 0; i < userChars.length; ++i) {
      let currChar = userChars.charAt(i);
      if (i == 0 && !readChars.includes(currChar)) // read
        return `PERM_STR_ERROR: Permissions string contains invalid character for user read permissions`;
      else if (i == 1 && !writeChars.includes(currChar))  // write
        return `PERM_STR_ERROR: Permissions string contains invalid character for user write permissions`;
      else if (i == 2 && !executeChars.includes(currChar))  // execute
        return `PERM_STR_ERROR: Permissions string contains invalid character for user execute permissions`;
    }

    // Check group permissions
    let groupChars = pTrimmed.substring(3, 6);

    for (let i = 0; i < groupChars.length; ++i) {
      let currChar = groupChars.charAt(i);
      if (i == 0 && !readChars.includes(currChar)) // read
        return `PERM_STR_ERROR: Permissions string contains invalid character for group read permissions`;
      else if (i == 1 && !writeChars.includes(currChar))  // write
        return `PERM_STR_ERROR: Permissions string contains invalid character for group write permissions`;
      else if (i == 2 && !executeChars.includes(currChar))  // execute
        return `PERM_STR_ERROR: Permissions string contains invalid character for group execute permissions`;
    }

    // Check others permissions
    let otherChars = pTrimmed.substring(6, 9);

    for (let i = 0; i < otherChars.length; ++i) {
      let currChar = otherChars.charAt(i);
      if (i == 0 && !readChars.includes(currChar)) // read
        return `PERM_STR_ERROR: Permissions string contains invalid character for others read permissions`;
      else if (i == 1 && !writeChars.includes(currChar))  // write
        return `PERM_STR_ERROR: Permissions string contains invalid character for others write permissions`;
      else if (i == 2 && !executeChars.includes(currChar))  // execute
        return `PERM_STR_ERROR: Permissions string contains invalid character for others execute permissions`;
    }

    return null; // NO errors detected
  }

  static obj_error(obj) {
    let invalidType = invalid_type(obj);
    if (invalidType)
      return `Permissions object is ${invalidType}`;

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
        return 'Permissions object values for u,g,o are all required to be boolean (true|false)';
    });

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

//----------------------------------------
// ERROR

class Error {
  // TO DO
}