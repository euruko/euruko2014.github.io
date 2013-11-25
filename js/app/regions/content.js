'use strict';
var ContentRegion = Backbone.Region.extend({
    el: '#content',
    initialize: function(){
        this.on('changed', function(){
            if (this.el.scrollHeight < window.innerHeight) this.el.style.height = '100%';
            else this.el.style.height = 'auto';
        });
    }
});