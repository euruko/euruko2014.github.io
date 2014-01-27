'use strict';
var PostsCollection = Backbone.Collection.extend({
    model: PostModel,
    url: 'blog/data/index.json'
});