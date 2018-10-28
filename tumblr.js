// ==UserScript==
// @name            tumblr video url
// @name:zh-CN      tumblr 视频链接
// @namespace       http://www.himysql.com/
// @version         1.1.0
// @create          2017-02-25
// @description     Get video url in dashboard or  video blog page
// @description:zh-CN     获取 tumblr 视频链接
// @author          leopku
// @copyright       2017+, leopku
// @license         MIT License
// @match           *://www.tumblr.com/*
// @match           *://*.tumblr.com/*
// @run-at          document-end
// @grant           GM_registerMenuCommand
// @grant           GM_setClipboard
// @require         https://cdn.staticfile.org/jquery/3.3.1/jquery.min.js
// @require         https://greasyfork.org/scripts/27254-clipboard-js/code/clipboardjs.js?version=174357
// ==/UserScript==

(function () {
    'use strict';
    function convertPosterToVideo(poster) {
        var arr = poster.split('_');
        var vid = "";
        if(arr.length>3){
            for(var i=1;i<arr.length-1;i++){
                if(vid.length>0){
                    vid+="_";
                }
                vid+=arr[i];
            }
        }else{
            vid = arr[1];
        }
        var url = 'https://vtt.tumblr.com/tumblr_' + vid + '.mp4';


        return url;
    }

    function copyURIToClipboard() {
        if (url) {
            GM_setClipboard(url);
            alert('视频链接已经在剪贴板中了');

        }
        else {
            alert('当前页面没有视频资源');
        }
    }

    function insertElementAfterOther(newElement, targetElement) {
        if(!targetElement){
            return;
        }
        var parent = targetElement.parentNode;

        if (parent.lastChild === targetElement) {
            parent.appendChild(newElement);
        }
        else {
            parent.insertBefore(newElement, targetElement.nextSibling);
        }
    }

    // eslint-disable-next-line no-unused-vars
    function insertPostBody(element) {
        var video = element.getElementsByTagName('video');
        var poster = video[0].getAttribute('poster');
        var postBody = document.createElement('p');
        postBody.setAttribute('class', 'post_body');
        postBody.appendChild(document.createTextNode(convertPosterToVideo(poster)));
        var postMedia = element.querySelectorAll('[class="post_media"]');
        insertElementAfterOther(postBody, postMedia[0]);
    }

    function insertButton(element) {
        var video = element.getElementsByTagName('video');
        var poster = video[0].getAttribute('poster');
        var like = element.getElementsByClassName('like')
        if(like.length==0){
            like = getParentByClassName(element,'like');
        }
        console.log(like);
        var cb = document.createElement('div');
        cb.setAttribute('data-clipboard-text', convertPosterToVideo(poster));
        cb.setAttribute('data-thum',poster);
        cb.setAttribute('class', 'post_control post-control-icon icon_queue');
        cb.onclick=function(e){
            var url = e.target.getAttribute("data-clipboard-text");
            var thum = e.target.getAttribute("data-thum");
            $.post("https://www.hmbooks.tk/push/video",{url:url,thum:thum})
        }
        insertElementAfterOther(cb, like[0]);
    }

    function parseVideo(elements) {
        for (var i = 0; i < elements.length; i++) {
            insertButton(elements[i]);
        }
    }

    function getParentByClassName(el,cls){
        if(el.parentElement){
            var parent = el.parentElement;
            var node = parent.getElementsByClassName(cls);
            if(node.length>0){
                return node;
            }
            return getParentByClassName(parent,cls);
        }
        return null;
    }

    function isContain(arr,cls){
        if(arr&&arr.length>0){
            for(var i=0;i<arr.length;i++){
                if(arr[i]==cls){
                    return true;
                }
            }
        }
        return false;
    }

    var clipboard = new Clipboard('[data-clipboard-text]'); // eslint-disable-line no-unused-vars

    if (document.domain === 'www.tumblr.com') {

        // add download url for dynamic loaded videos
        $(document).ready(function(){
            document.getElementById("posts").addEventListener('DOMNodeInserted', function (evt) {
                console.log(evt)
                if(evt.target){
                    var el = evt.target.getElementsByClassName('video_embed');
                    console.log("el:"+el.length)
                    parseVideo(el);
                }
            }, false);
        })


        // add download url for first loaded videos
        var elements = document.getElementsByClassName('dockable_video_embed');
        console.log("dockable_video_embed："+elements.length)
        parseVideo(elements);
        elements = document.getElementsByClassName('is_video');
        console.log("is_video："+elements.length)
        parseVideo(elements);
    }
    else {
        var ogImage = document.head.querySelector('[property="og:image"]').content;
        var url = convertPosterToVideo(ogImage);
        GM_registerMenuCommand('Get Tumblr video url', copyURIToClipboard);
    }

})();
