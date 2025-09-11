import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { exec, spawn } from "node:child_process";
import started from "electron-squirrel-startup";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};



const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", () => {
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on("will-quit", () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle('take-screenshot', async () => {
  const mainWindow = BrowserWindow.getAllWindows()[0];

  const slurp = () => {
    return new Promise((resolve, reject) => {
      const slurpProcess = spawn('slurp', [], {
        env: { ...process.env },
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let output = '';
      slurpProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      let errorOutput = '';
      slurpProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      slurpProcess.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else if (code === 1) {
          // User cancellation
          console.log('Selection cancelled by user.');
          resolve(null);
        } else {
          reject(new Error(`slurp exited with code ${code}: ${errorOutput}`));
        }
      });

      slurpProcess.on('error', (err) => {
        reject(err);
      });
    });
  };

  try {
    if (mainWindow) {
      mainWindow.hide();
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('Getting selection from slurp...');
    const geometry = await slurp();

    if (!geometry) {
      console.log('No area selected.');
      return null;
    }

    const tempPath = path.join(os.tmpdir(), `swappy-screenshot-${Date.now()}.png`);
    console.log(`Taking screenshot for geometry: ${geometry}`);
    const grimCommand = `grim -g '${geometry}' '${tempPath}'`;
    console.log(`Executing command: ${grimCommand}`);
    
    return new Promise((resolve, reject) => {
        exec(grimCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`grim error: ${error.message}`);
                return reject(error);
            }
            console.log(`Screenshot saved to ${tempPath}`);
            resolve(tempPath);
        });
    });

  } catch (error) {
    console.error('Screenshot failed:', error);
    return null;
  } finally {
    if (mainWindow) {
      mainWindow.show();
    }
  }
});


ipcMain.handle('get-image-as-base64', async (event, filePath) => {
  try {
    const data = await fs.readFile(filePath);
    return `data:image/png;base64,${data.toString('base64')}`;
  } catch (err) {
    console.error('Failed to read image file:', err);
    return null;
  }
});
