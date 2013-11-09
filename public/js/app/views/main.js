var MainView = Backbone.View.extend({
    tagName: 'section',
    id: 'mainView',
    template: {
        source: 'server',
        path: 'js/app/templates/main.html'
    },
    events: {
//        mousewheel: 'scroll',
//        DOMMouseScroll: 'scroll'
    },
    slides: null,
    clouds: null,
    isCloudBottomReachedFirst: true, // for handling the situation when user scrolling very fast
    isArrowAnimated: false,
    initialize: function(){
        this.on('rendered', function(){
            this.slides = {};
            this.$('.slide').each(function(key, slide){
                this.slides[slide.id] = slide.offsetTop;
            }.bind(this));
            var clouds = this.$('.cloud').toArray();
            this.clouds = {
                top: 0, // window vertical boundaries for the clouds vertical animation
                bottom: document.documentElement.clientHeight/4,
                els: function(){
                    var ret = [];
                    _.each(clouds, function(el){
                        ret.push({
                            el: el,
                            offset: el.offsetTop // start offset
                        });
                    });
                    return ret;
                }()
            };
        });
    },
    scroll: function(vOffset, down, delta){
        this._cloudsFloating(vOffset, down, delta);
        this._arrowAnimation(vOffset);
    },
    _cloudsFloating: function(vOffset, down, delta){
        var isBottomReached = vOffset > this.clouds.bottom;
        if (vOffset >= this.clouds.top && (!isBottomReached || this.isCloudBottomReachedFirst)){
            if (down){
                _.each(this.clouds.els, function(cloud){
                    var offset = cloud.el.offsetTop + delta,
                        max = cloud.offset + this.clouds.bottom;
                    cloud.el.style.top = max > offset ? offset+'px' : max+'px';
                }.bind(this));
                if (isBottomReached) this.isCloudBottomReachedFirst = false;
            } else{
                this.isCloudBottomReachedFirst = true;
                _.each(this.clouds.els, function(cloud){
                    var offset = cloud.el.offsetTop - delta,
                        min = cloud.offset - this.clouds.top;
                    cloud.el.style.top = min < offset ? offset+'px' : min+'px';
                }.bind(this));
            }
        }
    },
    _arrowAnimation: function(vOffset){
        if (!this.isArrowAnimated){
            if (this.$('#ticketsSlide')[0].offsetTop - vOffset <= 300){
                this.$('#tickets .front, #tickets .frontShadow, #shaft, #pendulum').addClass('end');
                this.isArrowAnimated = true;
            }
        }
    }
});