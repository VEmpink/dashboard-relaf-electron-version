const { 
    ipcRenderer,
    contextBridge
 } = require('electron');

contextBridge.exposeInMainWorld('request', {
    toServer: function(channel, data) {
        ipcRenderer.send(channel, data);
    }
});

contextBridge.exposeInMainWorld('receive', {
    fromServer: function(channel, callback) {
        ipcRenderer.once(channel, callback);
    }
});

contextBridge.exposeInMainWorld('onReceive', {
    fromServer: function(channel, callback) {
        ipcRenderer.on(channel, callback);
    }
});

contextBridge.exposeInMainWorld('removListener', {
    fromServer: function(channel, callback) {
        ipcRenderer.removeListener(channel, callback);
    }
});