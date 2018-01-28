# Description
A collection of asynchronous filesystem commands.
All functions are static.

# Install
```
npm install filesystem-async
```

# Classes

### <u>BashScript</u>
* **create(path, content)**
	* path: ```string```
	* content: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```

* **execute(path, content)**
	* path: ```string```
	* content: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```
		* output: ```string```

<i>NOTE: Do not include " #!/bin/bash " in content as it is already set up to be the first line in script. </i>

### <u>Chmod</u>
* **chmod(op, who, types, path)**
	* op: ```string ('+' | '-' | '=')```
	* who: ```array```
	* types: ```array```
	* path: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```

**Examples:** </br>
Chmod.chmod('+', ['u', 'g', 'o'], ['r', 'w'], '/path/to/fileOrDir')</br>

<i>NOTES: 
* u is for user/owner, g is for group, o is for others.
* r is for read, w is for write, x is for executable.
* '+' adds permissions, '-' removes permissions, '=' sets permissions (like saying 'chmod u=rx /path/to/fileOrDir').</i>


### <u>Chown</u>
* **chown(path, uid, gid)**
	* path: ```string```
	* uid: ```int```
	* gid: ```int```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```


### <u>Copy</u>
* **copy(src, dest)**
	* src: ```string```
	* dest: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```


### <u>Directory</u>
* **remove(path)**
	* path: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```

* **create(path)**
	* path: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```

### <u>Execute</u>
* **local(cmd, args)**
	* cmd: ```string```
	* args: ```array```
	* returns: ```Promise```
		* stderr: ```string```
		* stdout: ```string```
		* exitCode: ```int```
 
* **remote(user, host, cmd)**
	* user: ```string```
	* host: ```string``` 
	* cmd: ```string```
	* returns: ```Promise```
		* stderr: ```string```
		* stdout: ```string```
		* exitCode: ```int```

**Examples:**
Execute.local('mkdir', ['-p', '/path/to/dir'])
Execute.remote('you', 'laptop', 'mkdir -p')

### <u>File</u>
* **remove(path)**
	* path: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```

* **create(path, text)**
	* path: ```string```
	* text: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```

* **make_executable(path)**
	* path: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```

* **read(path)**
	* path: ```string```
	* returns: ```Promise```
		* content: ```string```
		* error: ```string```

* **read_lines(path)**
	* path: ```string```
	* returns: ```Promise```
		* lines: ```array```
		* error: ```string```

### <u>Find</u>
* **manual(path, options)**
	* path: ```string```
	* options: ```array```
	* returns: ```Promise```
		* results: ```array```
		* error: ```string```

<i>NOTE: Keep option and associated value together as one string (i.e. '-maxdepth 1 ') </i>
(See linux [find](https://www.lifewire.com/uses-of-linux-command-find-2201100) command for available options).

* **files_by_pattern(path, pattern, maxDepth)**
	* path: ```string```
	* pattern: ```string```
	* maxDepth: ```int```
	* returns: ```Promise```
		* results: ```array```
		* error: ```string```

* **files_by_content(path, text, maxDepth)**
	* path: ```string```
	* text: ```string```
	* maxDepth: ```int```
	* returns: ```Promise```
		* results: ```array```
		* error: ```string```

<i>NOTE: This will return files containing the specified text.</i>

* **files_by_user(path, user, maxDepth)**
	* path: ```string```
	* user: ```string```
	* maxDepth: ```int```
	* returns: ```Promise```
		* results: ```array```
		* error: ```string```

* **dir_by_pattern(path, pattern, maxDepth)**
	* path: ```string```
	* pattern: ```string```
	* maxDepth: ```int```
	* returns: ```Promise```
		* results: ```array```
		* error: ```string```

* **empty_files(path, maxDepth)**
	* path: ```string```
	* maxDepth: ```int```
	* returns: ```Promise```
		* results: ```array```
		* error: ```string```

* **empty_dirs(path, maxDepth)**
	* path: ```string```
	* maxDepth: ```int```
	* returns: ```Promise```
		* results: ```array```
		* error: ```string```

**Examples:** 
Find.manual('/path/to/dir', ['-maxdepth 1', '-type f', '-name "*.txt"'])
Find.files_by_pattern('/path/to/dir', '\*2017\*', 1)
Find.files_by_content('/path/to/dir', 'Finances 2017', 2)
Find.files_by_user('/path/to/dir', 'john', null)
<i>NOTE: Omiting maxDepth results in a full depth search. </i>

### <u>List</u>
* **visible(path)**
	* path: ```string```
	* returns: ```Promise```
		* files: ```array```
		* error: ```string```
 
* **hidden(path)**
	* path: ```string```
	* returns: ```Promise```
		* files: ```array```
		* error: ```string```

* **all(path)**
	* path: ```string```
	* returns: ```Promise```
		* files: ```array```
		* error: ```string```

### <u>Mkdir</u>
* **mkdir(path)**
	* path: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```

* **mkdirp(path)**
	* path: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```

### <u>Move</u>
* **move(src, dest)**
	* src: ```string```
	* dest: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```

### <u>Path</u>
* **exists(path)**
	* returns: ```Promise```
		* exists: ```boolean```
		* error: ```string```

* **is_file(path)**
	* returns: ```Promise```
		* isFile: ```boolean```
		* error: ```string```

* **is_dir(path)**
	* returns: ```Promise```
		* isDir: ```boolean```
		* error: ```string```

* **filename(path)**
	* returns: ```object```
		* name: ```string```
		* error: ```string```

* **extension(path)**
	* returns: ```object```
		* extension: ```string```
		* error: ```string```

* **parent_dir_name(path)**
	* returns: ```object```
		* name: ```string```
		* error: ```string```

* **parent_dir(path)**
	* returns: ```object```
		* dir: ```string (full path)```
		* error: ```string```

* **error(path)**
	* returns: ```string```

* **escape(path)**
	* returns: ```object```
		* string: ```string```
		* error: ```string```

* **contains_whitespace(path)**
	* returns: ```object```
		* hasWhitespace: ```boolean```
		* error: ```string```

### <u>Permissions</u>
* **permissions(path)**
	* path: ```string```
	* returns: ```Promise```
		* permissions: ```object```
			* owner, group, others: ```object```
				* r: ```string```
				* w: ```string```
				* x: ```string```
			* owner_string, group_string, others_string: ```string``` 
		* error: ```string```

* **equal(p1, p2)**
	* p1, p2: ```object```
		* owner, group, others: ```object```
			* r: ```string```
			* w: ```string```
			* x: ```string```
		* returns: ```boolean```

* **obj_to_number_string(obj)**
	* obj: ```object```
		* u, g, o: ```object```
			* r: ```string```
			* w: ```string```
			* x: ```string```
	* returns: ```string```

* **perm_string_to_number_string(permString)**
	* permString: ```string```
	* returns: ```string```

**Example:**
Permissions.perm_string_to_number_string('rw--r--x')

### <u>Remove</u>
* **file(path)**
	* path: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```

* **directory(path)**
	* path: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```

### <u>Rename</u>
* **rename(currPath, newName)**
	* currPath: ```string```
	* newName: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```


### <u>Rsync</u>
* **rsync(user, host, src, dest)**
	* user: ```string```
	* host: ```string```
	* src: ```string```
	* dest: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```
		* stdout: ```string```
		* stderr: ```string```
		* exitCode: ```int```
	
<i>NOTE: This will execute a normal rsync without any special flags or options enabled.</i>

* **update(user, host, src, dest)**
	* user: ```string```
	* host: ```string```
	* src: ```string```
	* dest: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```
		* stdout: ```string```
		* stderr: ```string```
		* exitCode: ```int```
		* 
<i>NOTE: This will only update any items in dest if any changes were made in src.</i>

* **match(user, host, src, dest)**
	* user: ```string```
	* host: ```string```
	* src: ```string```
	* dest: ```string```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```
		* stdout: ```string```
		* stderr: ```string```
		* exitCode: ```int```

<i>NOTE: This will force all content in dest match the content in src. Items will deleted from dest if not present src and vice versa.</i>

* **manual(user, host, src, dest, flags, options)**
	* user: ```string```
	* host: ```string```
	* src: ```string```
	* dest: ```string```
	* flags: ```array```
	* options: ```array```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```
		* stdout: ```string```
		* stderr: ```string```
		* exitCode: ```int```

<i>NOTE: This will let you execute rsync with any flags and options you wish to provide.
(See linux [rsync](https://www.computerhope.com/unix/rsync.htm) command for available options).</i>

* **dry_run(user, host, src, dest, flags, options)**
	* user: ```string```
	* host: ```string```
	* src: ```string```
	* dest: ```string```
	* flags: ```array```
	* options: ```array```
	* returns: ```Promise```
		* success: ```boolean```
		* error: ```string```
		* stdout: ```string```
		* stderr: ```string```
		* exitCode: ```int```

<i>NOTE: This will execute your rsync command without actually modifying anything. (For testing) 
(See linux [rsync](https://www.computerhope.com/unix/rsync.htm) command for available options)..</i>

**Example:** </br>
Rsync.manual('you', 'laptop', 'path/to/src', '/path/to/dest', ['a', 'v'], ['--ignore times', '--size-only'])

### <u>Stats</u>
* **stats(path)**
	* path: ```string```
	* returns: ```Promise```
		* stats
			* size: ```int (bytes)```
			* mode: ```int```
			* uid: ```int```
			* gid: ```int```
			* owner_r: ```string``` 
			* owner_w: ```string```
			* owner_x: ```string```
			* group_r: ```string```
			* group_w: ```string```
			* group_x: ```string```
			* others_r: ```string```
			* others_w: ```string```
			* others_x: ```string```
			* is_dir: ```boolean```
			* is_symlink: ```boolean```
		* error: ```string```

### <u>Timestamp</u>
* **timestamp( )**
	* returns: ```object```
		* hours: ```int (0-23)```
		* minutes: ```int (0-59)```
		* seconds: ```int (0-59)```
		* milliseconds: ```int (0-999)```
		* militaryTime: ```object```
			* hours: ```int (0-23)```
			* minutes: ```int```
			* seconds: ```int```
			* milliseconds: ```int```
			* string: ```string (H:M:S)```
		* meridiemTime: ```object```
			* hours: ```int (0-12)```
			* minutes: ```int```
			* seconds: ```int```
			* milliseconds: ```int```
			* string: ```string (H:M:S AM/PM)```
		* year: ```int```
		* monthNumber: ```int (1-12)```
		* monthName: ```string```
		* dayOfMonth: ```int (1-31)```
		* dayOfWeekNumber: ```int (0=SUN, 6=SAT)```
		* dayOfWeekName: ```string```

* **military_to_meridiem_time(militaryTime)**
	* militaryTime: ```string (HH:MM:SS)```
	* returns: ```string (HH:MM:SS AM/PM)```

* **meridiem_to_military_time(meridiemTime)**
	* militaryTime: ```string (HH:MM:SS AM/PM)```
	* returns: ```string (HH:MM:SS)```

* **difference(d1, d2)**
 	* d1, d2: ```object```
 		* hours: ```int```
		* minutes: ```int```
		* seconds: ```int```
		* milliseconds: ```int```
		* year: ```int```
		* month: ```int```
		* day: ```int```
	* returns: ```int (seconds)```

**Examples:**
Timestamp.military_to_meridiem_time('22:15:00')
Timestamp.meridiem_to_military_time('1:15:00 PM')

### <u>UserInfo</u>
* **current()**
	* returns: ```Promise```
		* info: ```object```
			* username: ```string```
			* uid: ```int```
			* gid: ```int```
			* groups: ```array```
				* {gid: ```int```, name: ```string```}
		* error: ```string```

* **other(username)**
	* username: ```string```
	* returns: ```Promise```
		* info: ```object```
			* username: ```string```
			* uid: ```int```
			* gid: ```int```
			* groups: ```array```
				* {gid: ```int```, name: ```string```}
		* error: ```string```