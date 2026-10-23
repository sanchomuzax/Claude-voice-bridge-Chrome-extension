// Windows Script Host launcher for the registry-free updater.
// Double-click update.js from the unpacked extension directory.
(function () {
  var shell = new ActiveXObject("WScript.Shell");
  var fs = new ActiveXObject("Scripting.FileSystemObject");
  var folder = fs.GetParentFolderName(WScript.ScriptFullName);
  var updater = fs.BuildPath(fs.BuildPath(folder, "native"), "update-standalone.py");
  if (!fs.FileExists(updater)) {
    WScript.Echo("Missing native\\update-standalone.py");
    WScript.Quit(1);
  }
  // Do not depend on the current working directory (Explorer shortcuts etc.).
  var command = 'cmd.exe /d /c "cd /d ""' + folder + '"" && (where py >nul 2>&1 && py -3 ""native\\update-standalone.py"" --install || python ""native\\update-standalone.py"" --install) & echo. & pause"';
  shell.Run(command, 1, false);
}());
