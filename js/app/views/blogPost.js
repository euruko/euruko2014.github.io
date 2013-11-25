'use strict';
var BlogPostView = Backbone.View.extend({
    tagName: 'section',
    className: 'blogPost',
    template: {
        source: 'server',
        path: 'js/app/templates/blogPostShort.html'
    },
    templates: {
        full: 'js/app/templates/blogPost.html',
        short: 'js/app/templates/blogPostShort.html'
    },
    events: {
        'click h2, .cover': '_openPost'
    },
    initialize: function(args){
        if (args.type == 'full') this.el.id = 'blogPostView';
        this.template.path = this.templates[args.type];
    },
    _openPost: function(){
        if (!this.el.id) this.module.controller.navigate('blog/post/'+this.options.index+'/', true);
    }
});