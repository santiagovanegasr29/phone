
const { app, BrowserWindow , Menu} = require('electron');
const url = require('url');
const path = require('path');

let mainWindow


function newWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 1900,
        title: 'newWindow',
        webPreferences: {
            nodeIntegration: true
        }

    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol: 'file',
        slashes: true

    }));

  /*   mainWindow.webContents.openDevTools() */
    mainWindow.on('close', function() {
        mainWindow = null
    })


}
  
    app.on('ready', newWindow)
   /*  app.on('window-all-closed', function() {
        if (process.platform !== 'darwin') app.quit()
    }) */

    app.on('activate', function() {
        if (mainWindow === null) createWindow()
    })

const templateMenu = [/* {
    label: 'file',
    submenu: [{
        label: 'sound',
        accelerator: 'Ctrl+A',
        click() {

        }
    }]
} *//* , {
    label: 'audio',
    submenu: [{
        label: 'propieties',
        accelerator: 'Ctrl+H',
        click() {
            newWindow();
        }

    }]
} */]
const menu = Menu.buildFromTemplate(templateMenu)
Menu.setApplicationMenu(menu)