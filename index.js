const {
    app,
    BrowserWindow,
    Tray
} = require('electron');
const path = require('path');
require('./dashboard'); /* file dashboard.js */

function createNewWindow() {
    const iconPath = path.join(app.getAppPath(), 'assets/images/256x256.png');
    
    /* Pengaturan BrowserWindow */
    let newBrowserWindow = new BrowserWindow({
        minWidth: 768,
        width: 1024,
        maxWidth: 1920,
        height: 768,
        minHeight: 480,
        show: false,
        icon: iconPath,
        backgroundColor: '#f4f7fa',
        webPreferences: {
            nodeIntegration: false,/* Disable NodeJS di Client */
            contextIsolation: true,
            enableRemoteModule: false,
            /* File preload.js untuk client yang membutuhkan Coding NodeJS */
            preload: path.join(app.getAppPath(), 'preload.js')
        }
    });

    /* Tray icon */
    let appIcon = new Tray(iconPath);

    /* Load the index.html */
    newBrowserWindow.loadFile('index.html');

    newBrowserWindow.on('ready-to-show', function() {
        newBrowserWindow.maximize();
    });
}

/* 
 * This method will be called when Electron has finished
 * initialization and is ready to create browser windows.
 * Some APIs can only be used after this event occurs.
 */
app.on('ready', function() {
    createNewWindow();
});

/*
 * Quit when all windows are closed, except on macOS. There, it's common
 * for applications and their menu bar to stay active until the user quits
 * explicitly with Cmd + Q.
 */
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    /* 
     * On macOS it's common to re-create a window in the app when the
     * dock icon is clicked and there are no other windows open.
     */
    if (BrowserWindow.getAllWindows().length === 0) {
        createNewWindow();
    }
});