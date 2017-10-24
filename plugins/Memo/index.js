module.exports = function Memo(handler, config) {
    this.config = config
    this.handler = handler
    $ = handler.$
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
        }
    ]
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