//-------------------------------------
// PATH

function PathExists(path) {
  return `if [ -e ${path} ]; then echo 1; else echo 0; fi`;
}

function PathIsFile(path) {
  return `if [ -f ${path} ]; then echo 1; else echo 0; fi`;
}

function PathIsDir(path) {
  return `if [ -d ${path} ]; then echo 1; else echo 0; fi`;
}

//-------------------------------------
// REMOVE

function RemoveFile(path) {
  return `rm -f ${path}`;
}

function RemoveDir(path) {
  return `rm -fR ${path}`;
}

//--------------------------------------
// COPY

function CopyFile(src, dest) {
  return `cp ${src} ${dest}`;
}

function CopyDir(src, dest) {
  return `cp -R ${src} ${dest}`;
}

//--------------------------------------
// MOVE

function Move(src, dest) {
  return `mv ${src} ${dest}`;
}

//--------------------------------------
// LIST

function ListAllFilenames(dirpath) {
  return `ls -a ${dirpath} --format=single-column`;
}

function ListHiddenFilenames(dirpath) {
  return `ls -a | grep "^\."`;
}

function ListVisibleFilenames(dirpath) {
  return `ls ${dirpath} --format=single-column`;
}

function ListAllLongListings(dirpath) { // permissions, hardlinks, owner, group, size, month, day, (time|year), filename
  return `ls -la ${dirpath}`;
}

function ListFileLongListing(filepath) {
  return `ls -l ${filepath}`;
}

function ListDirLongListing(dirpath) {
  return `ls -ld ${dirpath}`;
}

//-----------------------------------------
// MKDIR

function MakeDir(path) {
  return `mkdir ${path}`;
}

function MakeDirP(path) {
  return `mkdir -p ${path}`;
}

//--------------------------------------
// DISK USAGE

function DiskUsageListAllContents(dirpath) {  // size, filename
  return `du -ha --block-size=1 --max-depth=1 ${dirpath}`;
}

function DiskUsageDirSize(dirpath) { // [errors\n]* size, dirpath
  return `du -sh --block-size=1 ${dirpath}`;
}

//-------------------------------------
// FIND

function FindFilesByName(path, pattern, maxdepth) {
  let cmdStr = `find ${path}`;
  if (maxdepth)
    cmdStr += ` -maxdepth ${maxdepth}`;
  cmdStr += ` -type f -name '${pattern}'`;

  return cmdStr
}

function FindFilesByContent(path, text, maxdepth) {
  let cmdStr = `find ${path}`;
  if (maxdepth)
    cmdStr += ` -maxdepth ${maxdepth}`;
  cmdStr += ` -type f -exec grep -l "${text}" "{}" \\;`;

  return cmdStr
}

function FindFilesByUser(path, user, maxdepth) {
  let cmdStr = `find ${path}`;
  if (maxdepth)
    cmdStr += ` -maxdepth ${maxdepth}`;
  cmdStr += ` -type f -user ${user}`;

  return cmdStr
}

function FindDirsByName(path, pattern, maxdepth) {
  let cmdStr = `find ${path}`;
  if (maxdepth)
    cmdStr += ` -maxdepth ${maxdepth}`;
  cmdStr += ` -type d -name '${pattern}'`;

  return cmdStr
}

function FindEmptyFiles(path, pattern, maxdepth) {
  let cmdStr = `find ${path}`;
  if (maxdepth)
    cmdStr += ` -maxdepth ${maxdepth}`;
  cmdStr += ` -empty -type f`;

  return cmdStr
}

function FindEmptyDirs(path, pattern, maxdepth) {
  let cmdStr = `find ${path}`;
  if (maxdepth)
    cmdStr += ` -maxdepth ${maxdepth}`;
  cmdStr += ` -empty -type d`;

  return cmdStr
}

//-------------------------------------------
// RSYNC

function RsyncStandard(user, host, src, dest) {
  return `rsync -a ${src} ${user}@${host}:${dest}`;
}

function RsyncUpdate(user, host, src, dest) {
  return `rsync -a --update ${src} ${user}@${host}:${dest}`;
}

function RsyncMatch(user, host, src, dest) {
  return `rsync -a --delete-after ${src} ${user}@${host}:${dest}`;
}

function RsyncDryRun(args) {
  return `rsync --dry-run ${args.join(' ')}`;
}

function RsyncManual(args) {
  return `rsync ${args.join(' ')}`;
}

//------------------------------------
// USER INFO

function WhoAmI() { // username
  return `whoami`;
}

function CurrentUserInfo() { // uid, gid, groups
  return `id`;
}

function OtherUserInfo(usernameOrId) {
  return `id ${usernameOrId}`;
}

//-----------------------------------------
// CHOWN

function ChownChangeOwner(paths, newOwnerId, isRecursive) {
  let cmdStr = 'chown'
  if (isRecursive)
    cmdStr += ' -R';
  cmdStr += ` ${newOwnerId} ${paths.join(' ')}`;

  return cmdStr;
}

function ChownChangeGroup(paths, newGroupId, isRecursive) {
  let cmdStr = 'chown'
  if (isRecursive)
    cmdStr += ' -R';
  cmdStr += ` :${newGroupId} ${paths.join(' ')}`;

  return cmdStr;
}

function ChownChangeOwnerAndGroup(paths, newOwnerId, newGroupId, isRecursive) {
  let cmdStr = 'chown'
  if (isRecursive)
    cmdStr += ' -R';
  cmdStr += ` ${newOwnerId}:${newGroupId} ${paths.join(' ')}`;

  return cmdSt
}

function ChownManual(args) {
  return `chown ${args.join(' ')}`;
}

//-----------------------------------------
// CHMOD

function ChmodUsingOctalString(paths, octalStr, isRecursive) {
  let cmdStr = 'chmod';
  if (isRecursive)
    cmdStr += ' -R';
  cmdStr += ` ${octalStr} ${paths.join(' ')}`;

  return cmdStr;
}

function ChmodAddPermissions(paths, classesStr, typesStr, isRecursive) {
  let cmdStr = 'chmod';
  if (isRecursive)
    cmdStr += ' -R';
  cmdStr += ` ${classesStr}+${typesStr} ${paths.join(' ')}`;

  return cmdStr;
}

function ChmodRemovePermissions(paths, classesStr, typesStr, isRecursive) {
  let cmdStr = 'chmod';
  if (isRecursive)
    cmdStr += ' -R';
  cmdStr += ` ${classesStr}-${typesStr} ${paths.join(' ')}`;

  return cmdStr;
}

function ChmodSetPermissions(paths, classesStr, typesStr, isRecursive) {
  let cmdStr = 'chmod';
  if (isRecursive)
    cmdStr += ' -R';
  cmdStr += ` ${classesStr}=${typesStr} ${paths.join(' ')}`;

  return cmdStr;
}

function ChmodManual(args) {
  return `chmod ${args.join(' ')}`;
}

//----------------------------------
// CAT

function CatReadFileContent(path) {
  return `cat ${path}`;
}

//----------------------------------
// ECHO

function EchoWriteToFile(path, text) {
  return `echo "${text}" > ${path}`;
}

//----------------------------------
// ADMIN

function AdminGetGroups() {
  return 'cat /etc/group';
}

function AdminGetUsers() {
  return 'cat /etc/passwd';
}

function AdminWhoIsLoggedIn() {
  return 'w';
}

function AdminProcesses(fields) {
  return `ps xao ${fields.join(',')}`;
}

function AdminKillProcess(pid) {
  return `kill -9 ${pid}`
}

function AdminUptime() {
  return 'uptime';
}

function AdminMemoryCheck() {
  return 'free -t';
}

function AdminTopProcesses() {
  return 'top -b -n 1';
}

function AdminListOpenFilesByUser(user) {
  return `lsof -u ${user}`;
}

//-----------------------------------
// ZIP

function ZipFile(src, dest) {
  return `zip ${dest} ${src}`;
}

function ZipFiles(sources, dest) {
  return `zip ${dest} ${sources.join(' ')}`;
}

function ZipDir(src, dest) {
  return `zip -r ${dest} ${src}`;
}

function ZipDirs(sources, dest) {
  return `zip -r ${dest} ${sources.join(' ')}`;
}

function ZipManual(args) {
  return `zip ${args.join(' ')}`;
}

function ZipDecompress(src, dest) {
  return `unzip ${src} -d ${dest}`;
}

function ZipDecompressManual(args) {
  return `unzip ${args.join(' ')}`;
}

//-----------------------------------
// TAR

function TarCompress(src, dest) {
  return `tar -czvf ${dest} ${src}`;
}

function TarCompressMultiple(sources, dest) {
  return `tar -czvf ${dest} ${sources.join(' ')}`;
}

function TarDecompress(src, dest) {
  return `tar -xzvf ${src} -C ${dest}`;
}

function TarManual(args) {
  return `tar ${args.join(' ')}`;
}

//-------------------------------------
// EXPORTS

exports.PathExists = PathExists;
exports.PathIsFile = PathIsFile;
exports.PathIsDir = PathIsDir;
exports.RemoveFile = RemoveFile;
exports.RemoveDir = RemoveDir;
exports.CopyFile = CopyFile;
exports.CopyDir = CopyDir;
exports.Move = Move;
exports.ListAllFilenames = ListAllFilenames;
exports.ListHiddenFilenames = ListHiddenFilenames;
exports.ListVisibleFilenames = ListVisibleFilenames;
exports.ListAllLongListings = ListAllLongListings;
exports.ListFileLongListing = ListFileLongListing;
exports.ListDirLongListing = ListDirLongListing;
exports.MakeDir = MakeDir;
exports.MakeDirP = MakeDirP;
exports.DiskUsageListAllContents = DiskUsageListAllContents;
exports.DiskUsageDirSize = DiskUsageDirSize;
exports.FindFilesByName = FindFilesByName;
exports.FindFilesByContent = FindFilesByContent;
exports.FindFilesByUser = FindFilesByUser;
exports.FindDirsByName = FindDirsByName;
exports.FindEmptyFiles = FindEmptyFiles;
exports.FindEmptyDirs = FindEmptyDirs;
exports.RsyncStandard = RsyncStandard;
exports.RsyncUpdate = RsyncUpdate;
exports.RsyncMatch = RsyncMatch;
exports.RsyncDryRun = RsyncDryRun;
exports.RsyncManual = RsyncManual;
exports.WhoAmI = WhoAmI;
exports.CurrentUserInfo = CurrentUserInfo;
exports.OtherUserInfo = OtherUserInfo;
exports.ChownChangeOwner = ChownChangeOwner;
exports.ChownChangeOwnerMultiple = ChownChangeOwnerMultiple;
exports.ChownChangeGroup = ChownChangeGroup;
exports.ChownChangeGroupMultiple = ChownChangeGroupMultiple;
exports.ChownChangeOwnerAndGroup = ChownChangeOwnerAndGroup;
exports.ChownChangeOwnerAndGroupMultiple = ChownChangeOwnerAndGroupMultiple;
exports.ChmodUsingOctalString = ChmodUsingOctalString;
exports.ChmodUsingOctalStringMultiple = ChmodUsingOctalStringMultiple;
exports.ChmodAddPermissions = ChmodAddPermissions;
exports.ChmodAddPermissionsMultiple = ChmodAddPermissionsMultiple;
exports.ChmodRemovePermissions = ChmodRemovePermissions;
exports.ChmodRemovePermissionsMultiple = ChmodRemovePermissionsMultiple;
exports.ChmodSetPermissions = ChmodSetPermissions;
exports.ChmodSetPermissionsMultiple = ChmodSetPermissionsMultiple;
exports.CatReadFileContent = CatReadFileContent;
exports.EchoWriteToFile = EchoWriteToFile;
exports.AdminGetGroups = AdminGetGroups;
exports.AdminGetUsers = AdminGetUsers;
exports.AdminWhoIsLoggedIn = AdminWhoIsLoggedIn;
exports.AdminProcesses = AdminProcesses;
exports.AdminKillProcess = AdminKillProcess;
exports.AdminUptime = AdminUptime;
exports.AdminMemoryCheck = AdminMemoryCheck;
exports.AdminTopProcesses = AdminTopProcesses;
exports.AdminListOpenFilesByUser = AdminListOpenFilesByUser;
exports.ZipFile = ZipFile;
exports.ZipFiles = ZipFiles;
exports.ZipDir = ZipDir;
exports.ZipDirs = ZipDirs;
exports.ZipManual = ZipManual;
exports.ZipDecompress = ZipDecompress;
exports.ZipDecompressManual = ZipDecompressManual;
exports.TarCompress = TarCompress;
exports.TarCompressMultiple = TarCompressMultiple;
exports.TarDecompress = TarDecompress;
exports.TarManual = TarManual;
