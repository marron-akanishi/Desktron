/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: anonymous <anonymous@student.42.fr>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2017/10/21 15:21:21 by anonymous         #+#    #+#             */
/*   Updated: 2017/10/24 16:34:18 by anonymous        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
module.exports = function Clock(handler, config) {
    this.config = config
    this.handler = handler
    $ = handler.$
    this.clock();
    var $Clock = $('<div id="Clock"></div>');
    $Clock.css(config.css)
    $('#Mascot').before($Clock);

    $('#Clock').bind('contextmenu', (e) => { $("#MenuButton").trigger('click', e) });
    $('#MenuButton').hide()
}

module.exports.prototype.menu = function() {
    return {
        label: "Clock",
        enabled: false
    }
}

module.exports.prototype.clock = function() {
    var d = new Date();

    // デジタル時計を更新
    this.updateDigitalClock(d);

    // 次の「0ミリ秒」に実行されるよう、次の描画処理を予約
    var delay = 1000 - new Date().getMilliseconds();
    setTimeout((d) => this.clock(d), delay);
}

module.exports.prototype.updateDigitalClock = function(d) {
    var AA_str = ["日", "月", "火", "水", "木", "金", "土"];
    var YYYY = d.getFullYear().toString();
    var MM = d.getMonth() + 1;
    var DD = d.getDate();
    var AA = d.getDay();
    var hh = d.getHours();
    var mm = d.getMinutes();
    var ss = d.getSeconds();

    // 桁あわせ
    if (MM < 10) { MM = "0" + MM; }
    if (DD < 10) { DD = "0" + DD; }
    if (hh < 10) { hh = "0" + hh; }
    if (mm < 10) { mm = "0" + mm; }
    if (ss < 10) { ss = "0" + ss; }

    var text = YYYY + '/' + MM + '/' + DD + '(' + AA_str[AA] + ')<br>' + hh + ':' + mm + ':' + ss
    $('#Clock').html(text)
}