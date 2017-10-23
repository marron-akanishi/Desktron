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
    var Plugins = [];
    var Messages = [];
    var MesMaxwidth = mainImg.width()

    function WindowResize() {
        resizeTo(MesMaxwidth, mainImg.height())
    }

    const observer = new MutationObserver((MutaionRecords, MutaionObserver) => {
        WindowResize()
    })
    WindowResize()
    observer.observe(document.body, { childList: true, attributes: true, subtree: true })

    function pushMessage(el, timer = false) {
        var messageDiv = $("<p></p>");
        messageDiv.addClass("left_balloon")
        if (typeof el === "string") {
            messageDiv.text(el)
        } else {
            messageDiv.html(el)
        }
        messageDiv.css({ top: clientConfig.message.top, left: mainImg.width() + clientConfig.message.left })
        messageDiv.hide();
        $Mascot.append(messageDiv)
        var l = mainImg.width() + clientConfig.message.left + messageDiv.width() + 100
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
                var l = clientConfig.message.left + m.width() + 100
                max = max < l ? l : max;
            }
        })
        MesMaxwidth = max + mainImg.width();
        console.log(MesMaxwidth)
        WindowResize()
    }

    $("#MenuButton").on('click', (event) => {
        event.preventDefault();
        var menu = [
            {
                label: "プラグイン",
                submenu: [{
                    label: "なし"
                }]
            },
            {
                label: "開発者ツール",
                role: 'toggledevtools'
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