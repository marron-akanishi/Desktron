/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   client.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: anonymous <anonymous@student.42.fr>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2017/10/21 11:00:08 by anonymous         #+#    #+#             */
/*   Updated: 2017/10/22 19:53:20 by anonymous        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
const { remote } = require('electron');
const { dialog, Menu } = remote;
const fs = require('fs');
const win = remote.getCurrentWindow();
window.$ = window.jQuery = require('jquery');
//win.toggleDevTools()

const clientConfig = require('../config/client.json')


$(() => {

    const mainImg = $(".dragin")
    const $Mascot = $("#Mascot")
    const $MenuButton = $("#MenuButton")
    const $Clock = $("#Clock")
    const cssWidth = 14 + 16 + 15
    var MascotWidth = $Mascot.width();
    var Plugins = [];
    var Messages = [];
    var MesMaxwidth = MascotWidth

    function WindowResize() {
        //console.log(MesMaxwidth)
        resizeTo(MesMaxwidth, mainImg.height() + $Clock.height() + 30)
    }

    const observer = new MutationObserver((MutaionRecords, MutaionObserver) => {
        WindowResize()
    })
    observer.observe(document.body, { childList: true, attributes: true, subtree: true })

    function clock() {
        var that = this
        // 現在日時を取得
        var d = new Date();

        // デジタル時計を更新
        updateDigitalClock(d);

        // 次の「0ミリ秒」に実行されるよう、次の描画処理を予約
        var delay = 1000 - new Date().getMilliseconds();
        setTimeout(clock, delay);
    }
    function updateDigitalClock(d) {
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
        document.getElementById("Clock").innerHTML = text;
    }
    clock();
    MascotWidth = $Mascot.width() > $Clock.width() ? $Mascot.width() : $Clock.width();
    MesMaxwidth = MascotWidth
    WindowResize();

    function pushMessage(el, timer = false) {
        var messageDiv = $("<p></p>");
        messageDiv.addClass("left_balloon")
        if (typeof el === "string") {
            messageDiv.text(el)
        } else {
            messageDiv.html(el)
        }
        messageDiv.css({ top: clientConfig.message.top + $Clock.height(), left: MascotWidth + clientConfig.message.left })
        messageDiv.hide();
        $Mascot.append(messageDiv)
        var l = MascotWidth + clientConfig.message.left + messageDiv.width() + cssWidth
        MesMaxwidth = MesMaxwidth < l ? l : MesMaxwidth;
        WindowResize()

        Messages.forEach(($) => {
            $.css({
                top: $.offset().top + messageDiv.height() + 14
            })
        })
        var index = Messages.push(messageDiv) - 1;
        messageDiv.fadeIn(clientConfig.message.visibleTime)
        var tm;
        messageDiv._index = index;
        messageDiv._uid = getUniqueStr()
        if (!timer) {
            timer = clientConfig.message.timer;
            tm = setTimeout(() => {
                deleteMessage(messageDiv)
            }, timer)
        }
        if (Messages.length > clientConfig.message.max) {
            !tm && clearTimeout(tm)
            deleteMessage(messageDiv)
        }
        return messageDiv;
    }

    function deleteMessage(d) {
        var index = d._index
        var max = 0;
        window.Messages = Messages
        Messages.forEach((m, i) => {
            if (m._uid === d._uid) {
                d.fadeOut(clientConfig.message.visibleTime, () => {
                    d.remove();
                })
                console.log(Messages)
                Messages.splice(i, 1)
                console.log(Messages)
            } else {
                var l = clientConfig.message.left + m.width() + cssWidth
                max = max < l ? l : max;
            }
        })
        MesMaxwidth = max + MascotWidth;
        console.log(MesMaxwidth)
        WindowResize()
    }

    $("#Clock").bind('contextmenu', (event) => {
        event.preventDefault();
        var menu = [
            {
                label: "プラグイン",
                submenu: [{
                    label: "なし"
                }]
            },
            {
                label: "再読み込み",
                role: 'reload'
            },
            {
                label: "終了",
                role: 'quit'
            }
        ];
        if (Plugins.length != 0) {
            menu[0].submenu = Plugins.map((plugin) => {
                return plugin.menu();
            })
        }
        //console.log(menu)
        Menu.buildFromTemplate(menu).popup()
    });

    (function LoadPlugins() {
        var Handler = {
            $: $,
            pushMessage: pushMessage,
            deleteMessage: deleteMessage,
            Messages: Messages,
            localStorage: localStorage,
            remote: remote
        }
        fs.readdir("./plugins/", (err, files) => {
            if (err) throw err;
            var folders = files.filter((file) => {
                return !fs.statSync('./plugins/' + file).isFile();
            });
            folders.forEach((file) => {
                var dir = "./plugins/" + file + "/"
                var plug = require("." + dir + "index");
                var config = {};
                if (isExistFile(dir + "config.json")) { // 設定ファイルが存在するか
                    if (!isExistFile("./config/" + file + ".json")) {
                        var tmp = fs.readFileSync(dir + "config.json");
                        fs.writeFileSync("./config/" + file + ".json", tmp);
                    }
                    config = require('../config/' + file + '.json');
                }
                Plugins.push(new plug(Handler, config))
            })
        })
    })()
})

function isExistFile(file) {
    try {
        fs.statSync(file);
        return true
    } catch (err) {
        if (err.code === 'ENOENT') return false
    }
}

function getUniqueStr(myStrong) {
    var strong = 1000;
    if (myStrong) strong = myStrong;
    return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16)
}