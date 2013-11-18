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
    _nav: function(e){
        e.preventDefault();
        var mainView = this.module.controller.mainView;
        if (mainView) mainView.scrollTo(e.currentTarget.hash);
        else this.module.controller.navigate(e.currentTarget.hash, true);
    }
});