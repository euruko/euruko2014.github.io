'use strict';
var App = Backbone.Application.extend({
    initialize: function(){
        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        window.addEventListener('progress', function(e){console.log(e.loaded, e.total)}, false);
        window.addEventListener('load', this._onLoad.bind(this), false);
        this.on('started', this._onStarted);
        // this.pagePreload();
        this.start();
    },
    _onStarted: function(){
        this._bindScroll();
    },
    _onLoad: function(){
        this.trigger('window.loaded', window);
        // this.pageUnPreload();
    },
    _bindScroll: function(){
        var offset = window.scrollY,
            newOffset = offset,
            delta = 0;
        window.addEventListener('scroll', function(){
            var mainView = this.controller.mainView;
            if (mainView){
                newOffset = window.scrollY;
                delta = newOffset - offset;
                offset = newOffset;
                mainView.scroll(newOffset, delta > 0, Math.abs(delta));
            }
        }.bind(this), false);
    },
    _preload: function(parent, pl, modal){
        pl.addEventListener('click', function(e){e.stopPropagation()}, false);
        pl.style.height = parent.offsetHeight+'px';
        pl.style.width = parent.offsetWidth+'px';
        if (modal) pl.classList.add('show');
        parent.appendChild(pl);
        pl.classList.add('animation');
    },
    _unPreload: function(el, selector){
        var pl = el.querySelector(selector);
        if (pl){
            var transitionEnd = function(){
                el.removeChild(pl);
                pl.removeEventListener('webkitTransitionEnd', transitionEnd);
                pl.removeEventListener('transitionend', transitionEnd);
            };
            pl.addEventListener('webkitTransitionEnd', transitionEnd, false);
            pl.addEventListener('transitionend', transitionEnd, false);
            requestAnimationFrame(function(){
                pl.classList.remove('show');
                pl.classList.remove('animation');
            });
        }
    },
    preload: function(el, modal){
        var pl = document.createElement('div'),
            img = document.createElement('img');
        img.onload = this._spinerLoad;
        img.src = 'css/img/preloader.png';
        img.style.left = img.style.top = '50%';
        pl.id = 'preloader';
        pl.appendChild(img);
        this._preload(el, pl, modal);
    },
    _spinerLoad: function(){
        this.style.margin = -this.height / 2 +'px 0 0 '+ -this.width / 2 +'px';
    },
    unPreload: function(el){
        this._unPreload(el, '#preloader');
    },
    pagePreload: function(){
        var body = document.body;
        body.classList.add('loading');
        var pl = document.createElement('div'),
            centered = document.createElement('div'),
            eye1 = document.createElement('img'),
            eye2 = document.createElement('img'),
            p = document.createElement('p');
        eye1.src = eye2.src = 'css/img/eye.png';
        centered.appendChild(eye1);
        centered.appendChild(eye2);
        p.innerText = 'loading...';
        pl.id = 'pagePreloader';
        pl.appendChild(centered);
        pl.appendChild(p);
        this._preload(body, pl, true);
    },
    pageUnPreload: function(){
        var body = document.body;
        body.classList.remove('loading');
        this._unPreload(body, '#pagePreloader');
    }
});
