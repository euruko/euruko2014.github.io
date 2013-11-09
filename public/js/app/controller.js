MainController = Backbone.Controller.extend({
    routes: {
        '*slide': 'slide'
    },
    initialize: function(){},
    slide: function(slide){
        //TODO: scroll to 'slide'
        this.mainView = this.layout.createView('main');
        this.layout.showRegion({content: this.mainView}, {transition: 'dissolve'});
    }
});