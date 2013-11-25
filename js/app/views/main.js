'use strict';
var MainView = Backbone.View.extend({
    tagName: 'section',
    id: 'mainView',
    template: {
        source: 'server',
        path: 'js/app/templates/main.html'
    },
    events: {
        'click #sideNav .nav': '_scrollTo',
//        'dragstart #sideNav .pointer': '_dragStart',
//        'drag #sideNav .pointer': '_drag',
//        'dragend #sideNav .pointer': '_dragEnd',
        'click .popOverBlock': '_popOver',
        'click .popOver figure': '_showImage',
        'click #modal, #viewer': '_closeViewer',
        'mouseover #ticketsBlock': '_ticketAnimation',
        'mouseout #ticketsBlock': '_ticketAnimation',
        'click .marker, .address': '_renderMap',
        'click #map': '_stopPropagation',
        'click #circles .popOver': '_stopPropagation'
    },
    vOffset: 0, // this.el current scrollTop
    delta: 0, // difference between pointer positions when dragging
    slides: null,
    clouds: null,
    isCloudBottomReachedFirst: true, // for handling the situation when user scrolling very fast
    currentSlide: 0,
    cache: null,
    initialize: function(){
        this.$el.on('load', function(){
            console.log('loaded!!!')
        });
        this.on('rendered', function(){
            this._prepareSlides();
            this._prepareClouds();
//            this._prepareSideNav();
            this._cache();
            this.viewer = this.$('#viewer');
        });
    },
    scrollTo: function(hash){
        var el = this.$(hash.replace('/', ''))[0],
            duration = 200,
            val = window.scrollY,
            newVal = this._calculateOffset(el),
            direction = newVal > val ? 1 : -1,
            step = Math.abs(newVal - val) / duration * 10 * direction, // 10 is setTimeout minimum value
            animation = function(){
                val += step;
                window.scrollTo(0, val);
                if (direction > 0 && val < newVal || direction < 0 && val > newVal) setTimeout(animation, 10);
            }.bind(this);
        animation();
    },
    _scrollTo: function(e){
        e.preventDefault();
        this.scrollTo(e.currentTarget.hash);
    },
    _calculateOffset: function(el){
        return window.innerHeight > el.offsetHeight && el.offsetTop ? Math.abs(el.offsetTop - Math.ceil((window.innerHeight - el.offsetHeight) / 2)) : el.offsetTop;
    },
    scroll: function(vOffset, down, delta){
        var nextSlideInd = down ? this.currentSlide + 1 : this.currentSlide - 1,
            nextSlide = this.$slides[nextSlideInd];
        if (nextSlide) {
            if ((down && this._calculateOffset(nextSlide) - 1 <= vOffset) || (!down && this._calculateOffset(this.$slides[this.currentSlide]) - 2 >= vOffset) || (nextSlideInd == this.$slides.length - 1 && vOffset >= this.el.scrollHeight - window.innerHeight)){
                this.currentSlide = nextSlideInd;
                this.module.controller.navigate(nextSlideInd ? nextSlide.id+'/' : 'home/');
            }
        }
        this._cloudsParalax(vOffset, down, Math.abs(delta));
//        this._pointerAnimation(vOffset, down, Math.abs(delta));
        this._commonAnimation(vOffset, 'about', 0.1, '.stalactites');
        this._commonAnimation(vOffset, 'tickets', .5, '#ticketsBlock');
        this._commonAnimation(vOffset, 'venue', .7, '.marker');
        this.vOffset = vOffset;
    },
    _prepareSlides: function(){
        this.slides = {};
        this.$slides = this.$('.slide');
        this.$slides.each(function(key, slide){
            if (!key) slide.style.height = window.innerHeight * .9 +'px';
            this.slides[slide.id] = slide;
        }.bind(this));
    },
    _prepareClouds: function(){
        var clouds = this.$('.cloud').toArray();
        this.clouds = {
            top: 0, // window vertical boundaries for the clouds vertical animation
            bottom: document.documentElement.clientHeight/4,
            els: function(){
                var ret = [];
                _.each(clouds, function(el){
                    el.classList.add('animation');
                    ret.push({
                        el: el,
                        offset: el.offsetTop // start offset
                    });
                });
                return ret;
            }()
        };
    },
    _prepareSideNav: function(){
        var sideNav = this.$('#sideNav')[0],
            c = .7,
            wih = window.innerHeight,
            links = sideNav.querySelectorAll('.nav');
        sideNav.style.height = wih * c +'px';
        sideNav.style.top = (wih - sideNav.offsetHeight) / 2 +'px';
        _.each(links, function(link){
            var slide = this.slides[link.classList[1]];
            link.style.top = (slide.offsetTop + (slide.offsetHeight / 2)) / this.el.offsetHeight * sideNav.offsetHeight - link.offsetHeight / 2 +'px';
        }.bind(this));
        this.pointer = {
            el: sideNav.querySelector('.pointer'),
            c: sideNav.offsetHeight / this.el.offsetHeight,
            hWih: wih / 2
        };
        this._pointerAnimation(0, undefined, undefined);
    },
    _cloudsParalax: function(vOffset, down, delta){
        var coef = .3,
            transform = 'transform' in this.el.style ? 'transform' : 'webkitTransform';
        vOffset = vOffset * coef;
        delta = delta * coef;
        var isBottomReached = vOffset > this.clouds.bottom;
        if (vOffset >= this.clouds.top && (!isBottomReached || this.isCloudBottomReachedFirst)){
            if (down){
                _.each(this.clouds.els, function(cloud){
                    var offset = cloud.el.offsetTop + delta,
                        max = cloud.offset + this.clouds.bottom;
                    cloud.el.style.top = (max > offset ? offset : max) + 'px';
                }.bind(this));
                if (isBottomReached) this.isCloudBottomReachedFirst = false;
            } else{
                this.isCloudBottomReachedFirst = true;
                _.each(this.clouds.els, function(cloud){
                    var offset = cloud.el.offsetTop - delta,
                        min = cloud.offset - this.clouds.top;
                    cloud.el.style.top = (min < offset ? offset : min) + 'px';
                }.bind(this));
            }
        }
    },
    _pointerAnimation: function(vOffset, down, delta){
        var el = this.pointer.el;
        el.style.top = (vOffset + this.pointer.hWih) * this.pointer.c - el.offsetHeight / 2+'px';
    },
    _changePosition: function(e){
        e.preventDefault();
        e.stopPropagation();
        var y = e.originalEvent.clientY,
            parentH = e.currentTarget.offsetHeight;
        if (y){
            var delta = -(this.delta - y) * this.el.offsetHeight / parentH;
            window.scrollBy(0, delta);
            this.delta = y;
        }
    },
    _dragStart: function(e){
        e.originalEvent.dataTransfer.effectAllowed = "move";
        this.delta = e.originalEvent.clientY;
    },
    _drag: function(e){
        this._changePosition(e);
    },
    _dragEnd: function(e){
        this._changePosition(e);
        this.delta = 0;
    },
    _commonAnimation: function(vOffset, slideId, coef, baseElSelector){
        baseElSelector || (baseElSelector = null);
        var prop = 'is'+slideId+'Animated';
        if (!this[prop]){
            var slide = this.slides[slideId],
                pos = (baseElSelector ? slide.querySelectorAll(baseElSelector)[0] : slide).getBoundingClientRect().top,
                minOffset = window.innerHeight * coef;
            if (pos <= minOffset || this.el.scrollTop + window.innerHeight + 1 >= this.el.scrollHeight){
                $(slide).find('.animation').addClass('end');
                this[prop] = true;
            }
        }
    },
    _popOver: function(e){
        $(e.currentTarget).toggleClass('end');
    },
    _calculateViewerStyles: function(elem){
        var el = this.viewer[0],
            pos = elem.getBoundingClientRect(),
            x = pos.left - window.innerWidth * .1 + elem.offsetWidth / 2,
            y = pos.top - window.innerHeight * .1 + elem.offsetHeight / 2;
        el.style.margin = (window.innerHeight - el.offsetHeight) / 2 + 'px 0 0 ' + (window.innerWidth - el.offsetWidth) / 2 + 'px';
        el.style.transformOrigin = el.style.webkitTransformOrigin = x+'px '+y+'px';
    },
    _showViewer: function(el, originEl){
        this.viewer.html(el);
        this._calculateViewerStyles(originEl);
        document.body.classList.toggle('modal');
    },
    _showImage: function(e){
        e.stopPropagation();
        var preview = e.currentTarget.childNodes[1],
            img = this.cache.images[preview.classList[0]];
        if (img.complete) this._onImgLoad(preview, {currentTarget: img});
        else {
            this.module.preload(e.currentTarget, true);
            img.onload = this._onImgLoad.bind(this, preview);
        }
    },
    _onImgLoad: function(originEl, e){
        var el = e.currentTarget;
        this._calculateImageOffset(el);
        this._showViewer(el, originEl);
        this.module.unPreload(originEl.parentNode);
    },
    _calculateImageOffset: function(image){
        var imgDim = image.naturalWidth / image.naturalHeight,
            viewer = this.viewer[0],
            winDim = viewer.offsetWidth / viewer.offsetHeight;
        if (winDim > imgDim) image.style.marginLeft = Math.abs(viewer.offsetWidth - viewer.offsetHeight * imgDim) / 2 +'px'; //an image is narrower than window
        else image.style.marginTop = Math.abs(viewer.offsetHeight - viewer.offsetWidth / imgDim) / 2 +'px'; //an image is wider than window
    },
    _closeViewer: function(){
        this.viewer.removeClass('show');
        document.body.classList.toggle('modal');
    },
    _ticketAnimation: function(e){
        if (this.isticketsAnimated){
            var els = $(e.currentTarget).find('.animation');
            if (e.type == 'mouseover') els.addClass('hover'); // toggleClass results bug in some cases
            else els.removeClass('hover');
        }
    },
    _cache: function(){
        this.cache = {};
        var hall = document.createElement('img'),
            stage = document.createElement('img'),
            cachePuncher = this.module.options.cachePuncher;
        hall.src = 'css/img/venue/hall_big.jpg'+cachePuncher;
        stage.src = 'css/img/venue/stage_big.jpg'+cachePuncher;
        this.cache.images = {
            hall: hall,
            stage: stage
        }
    },
    _renderMap: function(e){
        if (!this.mapEl){
            var el = this.mapEl = document.createElement('div');
            el.id = 'map';
            var lt = 50.449983,
                ln = 30.527936,
                map = new google.maps.Map(el, {
                    zoom: 17,
                    center: new google.maps.LatLng(lt, ln),
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    streetViewControl: false
                }),
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(lt, ln),
                    map: map,
                    title: '1 Instytutska St, Kyiv',
                    draggable: false
                });
        }
        this._showViewer(this.mapEl, e.currentTarget);
    },
    _stopPropagation: function(e){
        e.stopPropagation();
    }
});