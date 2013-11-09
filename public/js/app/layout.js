var MainLayout = Backbone.Layout.extend({
    regions: {
        content: ContentRegion
    },
    views: {
        main: MainView
    }
});