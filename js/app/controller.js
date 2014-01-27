'use strict';
var MainController = Backbone.Controller.extend({
    routes: {
        '(home)(about)(tickets)(venue)(/)': 'slide',
        'blog(/:page)(/)': 'blog',
        'blog/post/:id(/)': 'blogPost',
        '*whatever': 'notFound'
    },
    prevBodyClass: '',
    mainView: null,
    initialize: function(){
        this.on('started', function(){
            this.layout.showRegion({header: this.layout.createView('nav')});
        });
        this.on('before', function(name){
            this.mainView = null;
        });
        this.on('navigate', function(){
            var navView = this.layout.getRegion('header').view;
            if (navView.rendered) navView.toggleActive();
        });
    },
    _bodyClass: function(className){
        var body = document.body,
            prevClass = this.prevBodyClass;
        if (prevClass) body.classList.remove(prevClass);
        body.classList.add(className);
        this.prevBodyClass = className;
    },
    slide: function(){
        this._bodyClass('home');
        this.mainView = this.layout.createView('main');
        this.mainView.once('rendered', function(){
            var route = Backbone.history.fragment;
            if (route) this.scrollTo('#'+route);
        });
        this.layout.showRegion({content: this.mainView}, {transition: 'dissolve'});
    },
    _getPosts: function(callback){
        var posts = new PostsCollection;
        posts.on('reset', callback.bind(this, posts));
        posts.fetch({reset: true});
    },
    blog: function(page){
        this._bodyClass('blog');
        this._getPosts(function(posts){
            this.layout.showRegion({content: this.layout.createView('blog', {collection: posts, page: page})}, {transition: 'dissolve'});
        });
    },
    blogPost: function(id){
        this._bodyClass('blogPost');
        this._getPosts(function(posts){
            this.layout.showRegion({content: this.layout.createView('blogPost', {type: 'full', model: posts.at(id-1)})}, {transition: 'dissolve'});
        });
    },
    notFound: function(){
        this.navigate('', true);
    }
});