MainController = Backbone.Controller.extend({
    routes: {
        'blog': 'blog',
        'blog/': 'blog',
        '*slide': 'slide'
    },
    mainView: null,
    initialize: function(){
        this.on('started', function(){
            this.layout.showRegion({header: this.layout.createView('nav')});
        });
        this.on('before', function(name){
            this.mainView = null;
        });
    },
    blog: function(){
        this.mainView = null;
        this.layout.showRegion({content: this.layout.createView('blog')});
    },
    slide: function(slide){
        this.mainView = this.layout.createView('main');
        this.mainView.once('rendered', function(){
            if (slide) this.scrollTo('#'+slide);
        });
        this.layout.showRegion({content: this.mainView}/*, {transition: 'dissolve'}*/);
    }
});