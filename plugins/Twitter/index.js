/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: anonymous <anonymous@student.42.fr>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2017/10/21 15:21:21 by anonymous         #+#    #+#             */
/*   Updated: 2017/10/22 23:55:43 by anonymous        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
const TwitterPinAuth = require('twitter-pin-auth');
const Twitter = require('twit');

module.exports = function Timer(handler, config) {
    this.config = config
    this.handler = handler
    $ = handler.$
    var data = this.handler.localStorage.getItem("Twitter")
    if (!data) {
        this.oauthed = false;
        this.tokens = {};
    } else {
        this.oauthed = true;
        this.tokens = JSON.parse(data);
    }
    this.noticeStream = null
    this.notice = false
    this.client = null;
    (function($) {
        var escapes = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            },
            escapeRegexp = /[&<>"']/g,
            hasEscapeRegexp = new RegExp(escapeRegexp.source),
            unescapes = {
                '&amp;': '&',
                '&lt;': '<',
                '&gt;': '>',
                '&quot;': '"',
                '&#39;': "'"
            },
            unescapeRegexp = /&(?:amp|lt|gt|quot|#39);/g,
            hasUnescapeRegexp = new RegExp(unescapeRegexp.source),
            stripRegExp = /<(?:.|\n)*?>/mg,
            hasStripRegexp = new RegExp(stripRegExp.source),
            nl2brRegexp = /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
            hasNl2brRegexp = new RegExp(nl2brRegexp.source),
            br2nlRegexp = /<br\s*\/?>/mg,
            hasBr2nlRegexp = new RegExp(br2nlRegexp.source);

        $.fn.textWithLF = function(text) {
            var type = typeof text;

            return (type == 'undefined') ?
                htmlToText(this.html()) :
                this.html((type == 'function') ?
                    function(index, oldHtml) {
                        var result = text.call(this, index, htmlToText(oldHtml));
                        return (typeof result == 'undefined') ?
                            result :
                            textToHtml(result);
                    } : textToHtml(text));
        };

        function textToHtml(text) {
            return nl2br(escape(toString(text)));
        }

        function htmlToText(html) {
            return unescape(strip(br2nl(html)));
        }

        function escape(string) {
            return replace(string, escapeRegexp, hasEscapeRegexp, function(match) {
                return escapes[match];
            });
        }

        function unescape(string) {
            return replace(string, unescapeRegexp, hasUnescapeRegexp, function(match) {
                return unescapes[match];
            });
        }

        function strip(html) {
            return replace(html, stripRegExp, hasStripRegexp, '');
        }

        function nl2br(string) {
            return replace(string, nl2brRegexp, hasNl2brRegexp, '$1<br>');
        }

        function br2nl(string) {
            return replace(string, br2nlRegexp, hasBr2nlRegexp, '\n');
        }

        function replace(string, regexp, hasRegexp, replacement) {
            return (string && hasRegexp.test(string)) ?
                string.replace(regexp, replacement) :
                string;
        }

        function toString(value) {
            if (value == null) return '';
            if (typeof value == 'string') return value;
            if (Array.isArray(value)) return value.map(toString) + '';
            var result = value + '';
            return '0' == result && 1 / value == -(1 / 0) ? '-0' : result;
        }
    })(jQuery);
}


module.exports.prototype.menu = function() {
    var that = this
    var menu = {
        label: "Twitter"
    }
    if (this.oauthed) {
        menu.submenu = [{
            label: "通知",
            type: "checkbox",
            checked: that.notice,
            click() {
                that.notice = !that.notice;
                if (that.notice) {
                    that.startListen();
                } else {

                }
            }
        }]
    } else {
        menu.submenu = [{
            label: "認証",
            click: () => { that.oAuth() }
        }]
    }
    return menu
}

module.exports.prototype.startListen = function() {
    var that = this
    if (!that.client) {
        that.client = new Twitter({
            consumer_key: that.config.consumerKey,
            consumer_secret: that.config.consumerKeySecret,
            access_token: that.tokens.accessTokenKey,
            access_token_secret: that.tokens.accessTokenSecret
        })
    }
    if (that.noticeStream)
        that.noticeStream.stop();
    that.noticebStream = that.client.stream('user')
    that.noticebStream.on('favorite', (data) => {
        console.log(data)
        var $form = $('<div></div>');
        var from = data.source.name;
        var $tweet = $('<div></div>');
        var $pic = $('<img></img>')
        $pic.attr({ src: data.source.profile_image_url })
        $pic.css({ float: 'left' });
        $form.append($pic)
        var $mes = $('<div></div>');
        $mes.textWithLF(that.config.message.favorite.replace('%from', from));
        $form.append($mes);
        $form.append($('<br>'));
        $form.css(that.config.message.messageCss);
        $tweet.text(data.target_object.text)
        $form.append($tweet)
        that.handler.pushMessage($form)
    })
}

module.exports.prototype.oAuth = function() {
    const twitterPinAuth = new TwitterPinAuth(this.config.consumerKey, this.config.consumerKeySecret); // <- Use Force login with user that alrealy logged in 
    twitterPinAuth.requestAuthUrl()
        .then((url) => {
            return new Promise((r) => {
                var that = this
                this.handler.remote.shell.openExternal(url);
                var $ipin = $('<div></div>');
                $ipin.append($(`<p>${this.config.message.inputPIN}</p>`));
                var $input = $('<input></input>');
                var $button = $('<input type="button" value="認証"></input>');

                $ipin.append($input);
                $ipin.append($button);
                var ipin = this.handler.pushMessage($ipin, true)

                function input() {
                    var pin = $input.val()
                    that.handler.deleteMessage(ipin);
                    r(pin)
                }

                $input.on('keydown', (e) => {
                    if (e.keyCode === 13)
                        input()
                })
                $button.on('click', () => {
                    input()
                })
            })
        }).then((pin) => {
            return twitterPinAuth.authorize(pin)
        })
        .then((data) => {
            this.oauthed = true;
            this.tokens = {
                accessTokenKey: data.accessTokenKey,
                accessTokenSecret: data.accessTokenSecret
            }
            this.handler.localStorage.setItem('Twitter', JSON.stringify(this.tokens))
            this.handler.pushMessage(this.config.message.oAuthed)
        })
        .catch((err) => {
            console.log(err)
        })
}