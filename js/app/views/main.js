var MainView = Backbone.View.extend({
    tagName: 'section',
    id: 'mainView',
    template: {
        source: 'server',
        path: 'js/app/templates/main.html'
    },
    events: {
        'click .nav': '_scrollTo',
        'scroll': '_scroll',
        'click .popOverBlock': '_popOver',
        'click .popOver img': '_showImage',
        'click #modal': '_closeModal',
        'mouseover #ticketsBlock': '_ticketAnimation',
        'mouseout #ticketsBlock': '_ticketAnimation'
    },
    vOffset: 0, // this.el current scrollTop
    delta: 0, // difference between new scrollTop and vOffset when scrolling
    slides: null,
    clouds: null,
    isCloudBottomReachedFirst: true, // for handling the situation when user scrolling very fast
    currentSlide: 0,
    initialize: function(){
        this.on('rendered', function(){
            this._prepareSlides();
            this._prepareClouds();
        });
    },
    scrollTo: function(hash){
        var el = this.$(hash.substring(0, hash.length - 1))[0],
            duration = 200,
            val = this.el.scrollTop,// this.el.scrollTop never can be assigned value more than screen allows. In this cases an animation will never ends without this var
            newVal = el.offsetTop+1,
            step = newVal / duration * 10, // 10 is setTimeout minimum value
            animation = function(){
                val += step;
                this.el.scrollTop = val;
                if (val < newVal) setTimeout(animation, 10);
            }.bind(this);
        animation();
    },
    _scrollTo: function(e){
        e.preventDefault();
        this.scrollTo(e.currentTarget.hash)
    },
    _scroll: function(e){
        var vOffset = e.target.scrollTop,
            delta = vOffset - this.vOffset,
            down = delta > 0,
            nextSlideInd = down ? this.currentSlide + 1 : this.currentSlide - 1,
            nextSlide = this.$slides[nextSlideInd];
        if (nextSlide) {
            if ((down && nextSlide.offsetTop <= vOffset) || (!down && this.$slides[this.currentSlide].offsetTop >= vOffset) || (nextSlideInd == this.$slides.length - 1 && vOffset == this.el.scrollHeight - window.innerHeight + 1)){
                this.currentSlide = nextSlideInd;
                this.module.controller.navigate(nextSlideInd ? nextSlide.id+'/' : '');
            }
        }
        this._cloudsParalax(vOffset, down, Math.abs(delta));
        this._commonAnimation(vOffset, 'about', 0.1, '.stalactites');
        this._commonAnimation(vOffset, 'tickets', .5, '#ticketsBlock');
        this._commonAnimation(vOffset, 'venue', .7, '.marker');
        this.vOffset = vOffset;
    },
    _prepareSlides: function(){
        this.slides = {};
        this.$slides = this.$('.slide');
        this.$slides.each(function(key, slide){
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
                    el.onload = function(){ // css animation does not start if image is not loaded
                        this.className += ' animation';
                    };
                    ret.push({
                        el: el,
                        offset: el.offsetTop // start offset
                    });
                });
                return ret;
            }()
        };
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
    _commonAnimation: function(vOffset, slideId, coef, baseElSelector){
        baseElSelector || (baseElSelector = null);
        var prop = 'is'+slideId+'Animated';
        if (!this[prop]){
            var slide = this.slides[slideId],
                pos = (baseElSelector ? slide.querySelectorAll(baseElSelector)[0] : slide).getBoundingClientRect().top,
                minOffset = window.innerHeight * coef;
            if (pos <= minOffset){
                $(slide).find('.animation').addClass('end');
                this[prop] = true;
            }
        }
    },
    _popOver: function(e){
        $(e.currentTarget).toggleClass('end');
    },
    _calculateImgSize: function(image){
        var imgDim = image.naturalWidth / image.naturalHeight,
            winDim = window.innerWidth / window.innerHeight,
            coef = .8;
        if (winDim > imgDim){ //an image is narrower than window
            image.height = window.innerHeight * coef;
            image.style.margin = Math.abs(window.innerHeight - image.height) / 2 +'px 0 0 '+Math.abs(window.innerWidth - image.height * imgDim) / 2 +'px';
        } else{ //an image is wider than window
            image.width = window.innerWidth * coef;
            image.style.margin = Math.abs(window.innerHeight - image.width / imgDim) / 2 +'px 0 0 '+Math.abs(window.innerWidth - image.width) / 2+'px';
        }
    },
    _showImage: function(e){
        e.stopPropagation();
        var image = document.createElement('img');
        image.src = e.currentTarget.src;
        this._calculateImgSize(image);
        this.$('#modal').html(image);
        document.body.classList.toggle('modal');
    },
    _closeModal: function(){
        var body = document.body;
        body.classList.toggle('modal');
    },
    _ticketAnimation: function(e){
        if (this.isticketsAnimated){
            var els = $(e.currentTarget).find('.animation');
            if (e.type == 'mouseover') els.addClass('hover'); // toggleClass results bug in some cases
            else els.removeClass('hover');
        }
    }
});