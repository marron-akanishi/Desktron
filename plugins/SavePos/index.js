module.exports = function Timer(handler, config) {
    this.config = config
    this.handler = handler
    $ = handler.$
    var win = require("electron").remote.getCurrentWindow();
    if (handler.localStorage.getItem("windowPosition")) {
        var pos = JSON.parse(handler.localStorage.getItem("windowPosition"));
        win.setPosition(pos[0], pos[1]);
    }
    win.on('move', function(){
        handler.localStorage.setItem("windowPosition", JSON.stringify(win.getPosition()));
    })
}

module.exports.prototype.menu = function(){
    var menu = {
        label: "SavePos",
        visible: false
    }
    return menu
}