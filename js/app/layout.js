var MainLayout = Backbone.Layout.extend({
    regions: {
        header: HeaderRegion,
        content: ContentRegion
    },
    views: {
        nav: NavView,
        main: MainView,
        blog: BlogView
    }
});