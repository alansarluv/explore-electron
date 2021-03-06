const electron = require('electron');
const { app, BrowserWindow, ipcMain, Menu } = electron;
const ffmpeg = require('fluent-ffmpeg'); 

let mainWindow;
let addWindow;

function createAddWindow() {
  addWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    width: 300,
    height: 200,
    title: 'Add New Todo'
  });
  addWindow.loadURL(`file://${__dirname}/add.html`);
  addWindow.on('close', () => addWindow = null); // if addWindow close then refer to null to free space & clean garbage memory
}

ipcMain.on('todo:add', (event, todo) => {
  mainWindow.webContents.send('todo:add', todo);
  addWindow.close();
});

// menuTemplate is used for define all menu inside main navbar
let menuTemplate = [];
menuTemplate.push(
  {
    label: 'File',
    submenu: [
      { 
        label: 'New Todo',
        click() {
          createAddWindow();
        }
      },
      {
        label: 'Clear Todos',
        click() {
          mainWindow.webContents.send('todo:clear');
          console.log("indexjs");
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q', // used for hot keys (shortcut)
        click() {
          app.quit();
        }
      }
    ],
  },
)
if (process.platform === 'darwin') {
  menuTemplate.unshift({ label: '' });
}
// open dev tools only on development process
if (process.env.NODE_ENV !== 'production') {
  menuTemplate.push({
    label: 'Developer',
    submenu: [
      { role: 'reload' }, // electron has number of preset role options one of which is reload
      {
        label: 'Toggle developer view',
        accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
        click(item, focusedWindow) { // focusedWindow is an active window open on electron 
          focusedWindow.toggleDevTools();
        }
      },
    ]
  });
}

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(`file://${__dirname}/main.html`);
  // mainWindow.loadURL('https://hr.talenta.co'); we can reference url to any web as well

  mainWindow.on('closed', () => app.quit());  // to quit electron on main window closed
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

// ipc for fetch video duration using IPC communcation
ipcMain.on('video:submit', (event, path) => {
  ffmpeg.ffprobe(path, (err, metadata) => {
    mainWindow.webContents.send(
      'video:metadata',
      metadata.format.duration
    );
  })
});

