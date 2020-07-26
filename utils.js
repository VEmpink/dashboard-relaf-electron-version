const { app, dialog } = require('electron');

module.exports = {
    /**
     * Cheking primitive value `integer`, `return false;` jika hasilnya `NaN`
     */
    isNumeric: function(val) {
        return !isNaN( parseFloat(val) ) && isFinite(val);
    },

    /**
     * Metode cepat untuk mengecek objek
     */
    isObject: function(val) {
        return typeof val === 'object' && val !== null;
    },
    
    /**
     * Metode pemberian nama file backup database disertai tanggal dan waktu
     */
    databaseFileName: function() {
        let dates = new Date();
        let month = dates.getMonth() + 1;
        let dateForFileName = dates.getDate() + '-' + month + '-' +
            dates.getFullYear();
        let timeForFileName = dates.getHours() + '-' + dates.getMinutes();

        return '/database_date' + dateForFileName + '_time' + timeForFileName + '.json';
    },
    
    /**
     * **Electron dialog box tipe error**
     * 
     * @param {string} title - Judul error
     * @param {string} message - Pesan error
     */
    showError: function(title, message) {
        dialog.showMessageBox({
            type: 'error',
            title: title,
            message: 'Mohon untuk langsung kontak fb.me/vempink',
            detail: message.toString(),
            buttons: ['Tutup aplikasi'],
            cancelId: 1
        }).then(function(returnVal) {
            if (returnVal.response === 0) {
                app.exit();
            }
        }).catch(function(error) { throw error; });
    }
}