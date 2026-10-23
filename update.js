// Double-click from Windows Explorer. Windows Script Host runs the existing
// registry-free Python updater in a visible command prompt.
(function () {
  var shell = new ActiveXObject("WScript.Shell");
  var fs = new ActiveXObject("Scripting.FileSystemObject");
  var folder = fs.GetParentFolderName(WScript.ScriptFullName);
  if (!fs.FileExists(fs.BuildPath(folder, "native\\update-standalone.py"))) {
    WScript.Echo("Missing native\\update-standalone.py");
    WScript.Quit(1);
  }
  shell.CurrentDirectory = folder;
  shell.Run("cmd.exe /d /k py -3 native\\update-standalone.py --install", 1, false);
}());
