'use strict';
var NavView = Backbone.View.extend({
    tagName: 'nav',
    id: 'navView',
    template: {
        source: 'server',
        path: 'js/app/templates/nav.html'
    },
    events: {
        'click .nav': '_nav'
    },
    initialize: function(){
        this.on('rendered', function(){
            this.links = this.$('.nav, .navigation');
            this.toggleActive();
        });
    },
    _nav: function(e){
        e.preventDefault();
        var mainView = this.module.controller.mainView;
        if (mainView) mainView.scrollTo(e.currentTarget.hash);
        else this.module.controller.navigate(e.currentTarget.hash, true);
    },
    toggleActive: function(){
        this.links.removeClass('active');
        var frag = Backbone.history.fragment.split('/')[0];
        if (frag) this.$('.'+frag).addClass('active');
    }
});