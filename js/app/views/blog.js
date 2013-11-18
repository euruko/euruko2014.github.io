var BlogView = Backbone.View.extend({
    tagName: 'section',
    id: 'blogView',
    template: {
        source: 'server',
        path: 'js/app/templates/blog.html'
    }
});