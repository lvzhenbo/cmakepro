import * as vscode from "vscode";

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  const commandId = "cmakepro.changefolder";

  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    10
  );

  statusBarItem.command = commandId;
  context.subscriptions.push(statusBarItem);
  statusBarItem.text = "切换文件夹";
  statusBarItem.show();

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(commandId, async () => {
    const workspaceDir = vscode.workspace.workspaceFolders![0].uri.path;

    const files = await vscode.workspace.findFiles("**/CMakeLists.txt");

    const sourceDirectory = files.map((item) => {
      return (
        "${workspaceFolder}" +
        item.path.replace(workspaceDir, "").replace("/CMakeLists.txt", "")
      );
    });

    const quickPick = vscode.window.createQuickPick();
    quickPick.items = sourceDirectory.map((item) => ({ label: item }));

    quickPick.onDidChangeSelection(async (selection) => {
      try {
        if (sourceDirectory.includes(selection[0].label)) {
          await vscode.workspace
            .getConfiguration("cmake")
            .update("sourceDirectory", selection[0].label, false);
          quickPick.hide();
          vscode.window.showInformationMessage("切换文件夹成功!");
        } else {
          vscode.window.showErrorMessage("切换文件夹失败！请提供正确路径");
        }
      } catch (error) {
        console.error(error);
      }
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
