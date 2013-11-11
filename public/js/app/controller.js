MainController = Backbone.Controller.extend({
    routes: {
        '*slide': 'slide'
    },
    initialize: function(){},
    slide: function(slide){
        this.mainView = this.layout.createView('main');
        this.mainView.once('rendered', function(){
            if (slide) this.scrollTo('#'+slide);
        });
        this.layout.showRegion({content: this.mainView}/*, {transition: 'dissolve'}*/);
    }
});