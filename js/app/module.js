var App = Backbone.Application.extend({
    initialize: function(){
        this.on('started', function(){
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
        })
    }
});