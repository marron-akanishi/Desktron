module.exports = function Memo(handler, config) {
    this.config = config
    this.handler = handler
    $ = handler.$
    const { dialog } = require('electron')
    this.memos = []
}

module.exports.prototype.menu = function(){
    var that = this
    var menu = {
        label: "Memo"
    }
    menu.submenu = [
        {
            label: "作成",
            click: () => { that.create() }
        },
        { type: "separator" }
    ]
    if (that.handler.localStorage.getItem("LineMemo")) {
        that.memos = JSON.parse(that.handler.localStorage.getItem("LineMemo"));
        for(let no in that.memos){
            var rObj = {
                label: that.memos[no],
                click: () => { that.delete(no) }
            }
            //console.log(rObj)
            menu.submenu = menu.submenu.concat(rObj)
        }
    }
    return menu
}

module.exports.prototype.create = function(){
    var firstMessage = this.handler.pushMessage(this.config.message.memo, true);
    var $memo = $('<div></div>')
    var $input = $('<input></input>')
    var $button = $('<input type="button" value="' + this.config.message.ui.set + '"></input>');
    $memo.append($input)
    $memo.append($button);

    var form = this.handler.pushMessage($memo, true)
    var that = this

    function input() {
        var text = $input.val()

        that.handler.deleteMessage(firstMessage)
        that.handler.deleteMessage(form)
        if (text != "") {
            if (that.handler.localStorage.getItem("LineMemo")){
                that.memos = JSON.parse(that.handler.localStorage.getItem("LineMemo"));
            }
            that.memos.push(text);
            that.handler.localStorage.setItem("LineMemo", JSON.stringify(that.memos));
            that.handler.pushMessage(that.config.message.seted)
        }
    }

    $input.on('keydown', (e) => {
        if (e.keyCode === 13)
            input()
    })
    $button.on('click', () => {
        input()
    })
}

module.exports.prototype.delete = function (no){
    var that = this;
    var win = that.handler.remote.getCurrentWindow();
    that.memos = JSON.parse(that.handler.localStorage.getItem("LineMemo"));
    var options = {
        type: 'question',
        buttons: ['OK', 'Cancel'],
        title: '確認',
        message: '以下のメモを削除します。よろしいですか？',
        detail: that.memos[no],
    };

    var result = dialog.showMessageBox(win, options);
    if(result === 0){
        that.memos.splice(no, 1);
        that.handler.localStorage.setItem("LineMemo", JSON.stringify(that.memos));
    }
}