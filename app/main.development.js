/* eslint global-require: 1, flowtype-errors/show-errors: 0 */
// @flow
import { app, BrowserWindow } from 'electron';
import MenuBuilder from './menu';

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

var menubar = require('menubar')

var mb = menubar({
  index: `https://dpwx.auditreu.at/scripts/cgiip.exe/WService=auditreu/az9000.htm`,
  webPreferences: {
    nodeIntegration: false
  }
})

let loopStage;
let loadListenerSet = false;

if (loopStage) console.log('loopStage', loopStage);

mb.on('after-show', function afterShow () {
  // mainWindow.webContents.on()
  console.log('after-show')
  const {window} = mb;

  if (loopStage === 'completed') {
    window.webContents.executeJavaScript(`
      if (document.querySelector('input[name=pass]')) {
        // alert('w00t')
        document.querySelector('input[name=user]').value = 'YOUR_USERNAME';
        document.querySelector('input[name=pass]').value = 'YOUR_PASSWORD';
        document.querySelector('button[name=loginbtn]').click();
      }
    `);
    loopStage = 'bookTime';
  } else {
    loopStage = 'login';
  }

  if (!loadListenerSet) {
    window.webContents.on('did-finish-load', () => {
      if (!window) {
        throw new Error('"window" is not defined');
      }

      // console.log('finished load', window.webContents);
      // window.show();
      // window.focus();
      console.log('did-finish-load!', window.webContents.history.slice(-1).pop());

      if (window.webContents.history.length > 1 && window.webContents.history.slice(-1).pop() === 'https://dpwx.auditreu.at/scripts/cgiip.exe/WService=auditreu/az9009.htm?tele=') {
        mb.hideWindow();
        loopStage = 'completed';
        return;
      }

      if (loopStage === 'login') {
        window.webContents.executeJavaScript(`
          if (document.querySelector('input[name=pass]')) {
            // alert('w00t')
            document.querySelector('input[name=user]').value = 'YOUR_USERNAME';
            document.querySelector('input[name=pass]').value = 'YOUR_PASSWORD';
            document.querySelector('button[name=loginbtn]').click();
          }
        `);
        loopStage = 'bookTime';
      } else if (loopStage === 'bookTime' && window.webContents.history.slice(-1).pop() ===   'https://dpwx.auditreu.at/scripts/cgiip.exe/WService=auditreu/az9004.htm') {
        window.webContents.executeJavaScript(`
          window.lastBookingDetails = jq('div.divlogincontent tr:contains("Letzte Buchung von heute") + tr > td');
          if (window.lastBookingDetails) {
            if (/- +$/.test(window.lastBookingDetails.text())) {
              window.element = '#gehidbtn';
              console.log('going');
              // return;
            } else {
              window.element = '#kommidbtn';
              console.log('coming');
            }
          } else {
            window.element = '#kommidbtn';
            console.log('coming');
          }

          if (document.querySelector(window.element)) {
            document.querySelector(window.element).click();
          }
        `);
        loopStage = 'login';
      }
    });
    loadListenerSet = true;
  }
});

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};


app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development') {
    await installExtensions();
  }
  return;
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences: {
      nodeIntegration: false
    }
  });

  mainWindow.loadURL(`https://dpwx.auditreu.at/scripts/cgiip.exe/WService=auditreu/az9000.htm`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    // console.log('finished load', mainWindow.webContents);
    // mainWindow.show();
    // mainWindow.focus();
    mainWindow.webContents.executeJavaScript(`
      if (document.querySelector('input[name=pass]')) {
        document.querySelector('input[name=user]').value = 'YOUR_USERNAME';
        document.querySelector('input[name=pass]').value = 'YOUR_PASSWORD';
        document.querySelector('button[name=loginbtn]').click();
      }
    `);
    setTimeout(() => {
      mainWindow.webContents.executeJavaScript(`
        window.lastBookingDetails = jq('div.divlogincontent tr:contains("Letzte Buchung von heute") + tr > td');
        if (window.lastBookingDetails) {
          if (/- +$/.test(window.lastBookingDetails.text())) {
            window.element = '#gehidbtn';
            console.log('going');
            // return;
          } else {
            window.element = '#kommidbtn';
            console.log('coming');
          }
        } else {
          window.element = '#kommidbtn';
          console.log('coming');
        }
        if (document.querySelector(window.element)) {
          document.querySelector(window.element).click();
        }
      `), 2000
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
