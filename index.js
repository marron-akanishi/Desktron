/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: anonymous <anonymous@student.42.fr>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2017/10/20 22:51:52 by anonymous         #+#    #+#             */
/*   Updated: 2017/10/21 14:52:21 by anonymous        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var mainWindow = null;

app.on('window-all-closed', function() {
    if (process.platform != 'darwin')
        app.quit();
});

app.on('ready', function() {

    // ブラウザ(Chromium)の起動, 初期画面のロード
    const {size} = electron.screen.getPrimaryDisplay()
    mainWindow = new BrowserWindow({
        "transparent": true,    // ウィンドウの背景を透過
        "frame": false,     // 枠の無いウィンドウ
        "resizable": false,  // ウィンドウのリサイズを禁止
        "alwaysOnTop": true //最前面表示
	});
    mainWindow.setIgnoreMouseEvents(false)
    //mainWindow.maximize();
    //mainWindow.setFullScreen(true);
    mainWindow.loadURL('file://' + __dirname + '/client/index.html');

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});