/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: anonymous <anonymous@student.42.fr>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2017/10/21 15:21:21 by anonymous         #+#    #+#             */
/*   Updated: 2017/10/21 21:59:44 by anonymous        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
module.exports = function Timer(handler, config) {
    this.config = config
    this.handler = handler
    $ = handler.$
    this.timers = []
    this.timerId = 0;
}

module.exports.prototype.Regist = function() {
    var firstMessage = this.handler.pushMessage(this.config.message.reservation,true);
    var $timer = $('<div></div>')
    var $input = $('<input></input>')
    var $button = $('<input type="button" value="' + this.config.message.ui.set + '"></input>');
    $timer.append($input)
    $timer.append($button);

    var form = this.handler.pushMessage($timer,true)
    var that = this

    function input() {
        var text = $input.val()
        
        that.handler.deleteMessage(firstMessage)
        that.handler.deleteMessage(form)
        if(that.parseTimer(text) != 0){
            that.handler.pushMessage(that.config.message.reservated.replace("%s", text))
            that.addTimer(that.parseTimer(text),text)
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

module.exports.prototype.menu = function() {
    var that = this
    var menu = {
        label: "Timer",
        submenu: [{
            label: "登録",
            click: () => { that.Regist() }
        }]
    }
    if(this.timers.length!=0){
		menu.submenu.push({type:'separator'})
		this.timers.forEach((t)=>{
			menu.submenu.push({
				label:t.label,
				click:()=>{
					clearTimeout(t.timer);
					that.timers = that.timers.filter(d=>{
						return d.id != t.id
					})
				}
			})
		})
    }
    return menu
}

module.exports.prototype.parseTimer = function(text) {
    var time = 0;
    text = text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    });
    var s = text.match(/\d+時間*/);
    if (s) {
        time += parseInt(s[0].match(/\d+/)[0]) * 3600 * 1000
    }

    s = text.match(/\d+分/);
    if (s) {
        time += parseInt(s[0].match(/\d+/)[0]) * 60 * 1000
    }

    s = text.match(/\d+秒/);
    if (s) {
        time += parseInt(s[0].match(/\d+/)[0]) * 1000
    }
	return time
}
module.exports.prototype.addTimer = function(time,label) {
	this.timers.push({
		label:label,
		timer:setTimeout(()=>{
			var t = this.config.message.notice;
			this.handler.pushMessage(t[Math.floor(Math.random()*t.length)]);
		},time),
		id:this.timerId++
	})
}