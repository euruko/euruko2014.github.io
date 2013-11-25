'use strict';
var BlogView = Backbone.View.extend({
    tagName: 'section',
    id: 'blogView',
    template: {
        source: 'server',
        path: 'js/app/templates/blog.html'
    },
    events: {
        'click #pagination .pageNum': '_changePage',
        'click #pagination .next, #pagination .prev': '_togglePage'
    },
    pages: 1,
    perPage: 3,
    currentPage: 1,
    initialize: function(args){
        this.on('rendered', this._renderPosts);
        this.pages = Math.ceil(this.collection.length / this.perPage);
        if (args.page && args.page <= this.collection.length + 1) this.currentPage = parseInt(args.page);
        this.renderObj = {pages: this.pages};
        this.el.style.minHeight = window.innerHeight+'px';
    },
    _renderPosts: function(){
        this.pageLinks = this.$('#pagination a');
        this.postsList = new PostsListRegion;
        this._showPage();
    },
    _changePage: function(e){
        e.preventDefault();
        this.currentPage = parseInt(e.currentTarget.classList[1]);
        this._showPage();
    },
    _showPage: function(){
        var y = this.currentPage * this.perPage,
            i1 = y - this.perPage,
            posts = this.collection.slice(i1, y),
            page = document.createElement('div');
        page.className = 'page';
        _.each(posts, function(post){
            i1++;
            page.appendChild(this.layout.createView('blogPost', {type: 'short', model: post, index: i1}).render())
        }.bind(this));
        this.postsList.showNode(page, {transition: 'dissolve'});
        this.module.controller.navigate('blog/'+this.currentPage+'/');
        this.pageLinks.filter('.active').removeClass('active');
        this.pageLinks.filter('.'+this.currentPage).addClass('active');
    },
    _togglePage: function(e){
        var where = e.currentTarget.classList[0] == 'next' ? 1 : -1,
            newPage = this.currentPage + where;
        if (newPage && newPage <= this.pages){
            this.currentPage += where;
            this._showPage();
        }
    }
});