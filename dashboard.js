const {
    app,
    ipcMain,
    dialog
} = require('electron');
const fs = require('fs');
const {
    isNumeric,
    isObject,
    databaseFileName,
    showError
} = require('./utils.js');

/* Checking versi aplikasi */
ipcMain.on('app-version', function(event, args){
    event.sender.send('app-version', app.getVersion());
});

/* Electron dialog tipe error untuk client */
ipcMain.on('showError', function(event, args) {
    showError(args.title, args.message);
});

/* Req dari client untuk mem-backup file database */
ipcMain.on('backupDatabase', function(event, data) {
    dialog.showSaveDialog({
        title: 'Pilih lokasi untuk menyimpan file backup database',
        defaultPath: app.getPath('documents') + databaseFileName()
    }).then(function(res) {
        if (!res.canceled) {
            fs.writeFile(res.filePath, JSON.stringify(data), function(err) {
                if (err) {
                    showError('Error!', err);
                    return;
                }else {
                    event.sender.send('responseBackupDatabase', data.length);
                }
            });
        }
    }).catch(function(err) {
        showError('Error!', err);
        return;
    });
});

/* Req dari client untuk me-restore file database */
ipcMain.on('restoreDatabase', function(event, args) {
    dialog.showOpenDialog({
        title: 'Pilih file backup',
        defaultPath: app.getPath('documents'),
        filters: [{ name: 'Custom File Type', extensions: ['json'] }]
    }).then(function(res) {
        if (!res.canceled) {
            /* Baca file restore yang dibuka user */
            fs.readFile(res.filePaths[0], 'utf-8', function(err, data) {
                if (err) {
                    showError('Error!', err);
                    return;
                }else {
                    event.sender.send('responseRestoreDatabase', data);
                }
            });
        }
    }).catch(function(err) {
        showError('Error!', err);
        return;
    });
});

/* Req dari client untuk menentukan lokasi penyimpanan auto backup database */
ipcMain.on('openDir', function(event, args) {
    dialog.showOpenDialog({
        defaultPath: app.getPath('documents'),
        properties: ['openDirectory']
    }).then(function(response) {
        if (!response.canceled) {
            event.sender.send('responseOpenDir', response.filePaths.toString());
        }
    }).catch(function(error) {
        showError('Error!', error);
        return;
    });
});

/**
 * ID interval auto backup db
 */
let intervalAutoBackup = null;

/**
 * Untuk memulai auto backup db, untuk menghentikan auto backup panggil
 * `clearInterval(intervalAutoBackup)`
 * @param {object} event - event dari `ipcMain.on()`
 * @param {number} interval - waktu interval
 * @param {string} dirPath - lokasi untuk menyimpan file auto backup db
 * @param {array} data - data dari client yang ingin dibackup
 */
function startAutoBackupDB(event, intervalTime, dirPath, data) {
    intervalTime = intervalTime * 1000 * 60; /* Dalam satuan menit */

    intervalAutoBackup = setInterval(function() {
        fs.writeFile(dirPath + databaseFileName(), JSON.stringify(data), function(errno) {
            if (errno) {
                showError('Error!', errno);
                return;
            }else {
                event.sender.send('resultAutoBackup', data.length);
            }
        });
    }, intervalTime);
}

/**
 * Total request `'autoBackupDB'` dari client
 */
let totalReq = 0;

/* Req dari client untu memulai auto backup db */
ipcMain.on('autoBackupDB', function(event, request) {
    totalReq++; /* Setiap client request maka akan terhitung total request-nya */
    
    let autoBackupTime = 30; /* Default jika request.autoBackup bukan Object */
    let dirPath = app.getPath('documents'); /* Sama */

    if (isObject(request.autoBackup)) {
        autoBackupTime = parseFloat(request.autoBackup.time);

        if (!isNumeric(autoBackupTime)) {
            autoBackupTime = 30;
        }

        dirPath = request.autoBackup.dirPath;
    }

    let responseToClient = {
        intervalTime: autoBackupTime,
        dirPath: dirPath
    };

    switch (request.set) {
        case 'start':
            /* Untuk memulai auto backup db hanya bisa dilakukan satu kali request */
            if (totalReq === 1) {
                startAutoBackupDB(event, autoBackupTime, dirPath, request.data);
                event.sender.send('autoBackupSettingsVal', responseToClient);
            }
            break;

        case 'restart':
            clearInterval(intervalAutoBackup);
            startAutoBackupDB(event, autoBackupTime, dirPath, request.data);
            event.sender.send('autoBackupSettingsVal', responseToClient);
            break;
    
        default:
            clearInterval(intervalAutoBackup);

            /*
             * Jika auto backup dimatikan, maka totalReq dikembalikan ke 0,
             * dan pengguna dapat memanggil 'start' kembali
             */
            totalReq = 0;
            break;
    }
});

/* Untuk meluncurkan ulang aplikasi */
ipcMain.on('relaunchApp', function(event, args) {
    app.relaunch();
    app.exit();
});