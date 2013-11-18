Backbone.Events.setInstance = function(arg){
    var ret = null;
    if (arg.constructor === Function) ret = new arg;
    else if (arg.constructor === Object) ret = new arg.builder(arg.arguments);
    return ret;
};
Backbone.Events.setMainOpts = function(array, obj){
    _.each(array, function(val){
        if (obj[val]) {
            this[val] = obj[val];
            delete obj[val];
        }
    }.bind(this));
    return obj;
};

Backbone.Module = function(){
    this.initialize(this._setOptions(arguments));
};
_.extend(Backbone.Module.prototype, Backbone.Events, {
    autoStart: false,
    controller: null,
    layout: null,
    modules: null,
    started: false,
    initialize: function(){ return this; },
    _setOptions: function(args){
        if (!this.modules) this.modules = {};
        this.options = {};
        var obj = args[0],
            sets = [
                'autoStart',
                'translation',
                'controller',
                'layout'
            ];
        if (obj){
            if (obj.modules){
                _.each(obj.modules, function(module, name){
                    module = this.modules[name] = this.setInstance(module);
                    module.module = this;
                }.bind(this));
                delete obj.modules;
            }
            this.options = this.setMainOpts(sets, obj);
        }
        return args;
    },
    start: function(){ //starts module and all of its components
        this.trigger('start');
        if (this.layout){
            this.layout = this.setInstance(this.layout);
            this.layout.module = this;
            this.layout.setModule();
        }
        if (this.controller){
            this.controller = this.setInstance(this.controller);
            this.controller.layout = this.layout;
            this.controller.module = this;
            this.controller.trigger('started');
        }
        if (this.modules){
            _.each(this.modules, function(module){
                if (module.autoStart) module.start();
            });
        }
        this.started = true;
        this.trigger('started');
    },
    stop: function(){ //stops module and clears all related data
        if (this.controller) this.controller.stop();
        if (this.layout) this.layout.clearAll();
        this.started = false;
    },
    getModule: function(name){
        return this.modules[name];
    },
    startModule: function(name){
        if (this.modules[name]) this.modules[name].start();
    },
    stopModule: function(name){
        if (this.modules[name]) this.modules[name].stop();
    },
    addModule: function(name, module){
        if (name.constructor === String) this.modules[name] = module;
        else if (name.constructor === Object){
            _.each(name, function(module, name){
                this.addModule(name, module);
            }.bind(this));
        }
    },
    removeModule: function(name){
        if (name.constructor === String){
            this.stopModule(name);
            delete this.modules[name];
        } else if (name.constructor === Array){
            _.each(name, function(name, key){
                this.removeModule(name);
            }.bind(this));
        } else if(name instanceof Backbone.Module){
            for (var key in this.modules){
                if (this.modules[key] == name){
                    this.removeModule(key);
                    break;
                }
            }
        }
    },
    destroy: function(){
        this.stop();
        delete this;
    },
    translate: function(path){
        var val = this.translation.map;
        if (path){
            var pathArr = path.split('.');
            while (pathArr.length){
                var key = pathArr.shift();
                if (val) val = val[key];
            }
            if (val) return val;
            console.warn('Controller.translate: the path: '+path+' is not found in the translation file.');
            return key;
        }
        return null;
    }
});

Backbone.Controller = Backbone.Router.extend({
    route: function(route, name, callback) {
        if (!_.isRegExp(route)) route = this._routeToRegExp(route);
        if (_.isFunction(name)) {
            callback = name;
            name = '';
        }
        if (!callback) callback = this[name];
        var router = this;
        Backbone.history.route(route, function(fragment) {
            var args = router._extractParameters(route, fragment);
            router.trigger('before'+name, args);
            router.trigger('before', name, args);
            callback && callback.apply(router, args);
            router.trigger.apply(router, ['route:' + name].concat(args));
            router.trigger('route', name, args);
            Backbone.history.trigger('route', router, name, args);
        });
        return this;
    },
    stop: function(){ // TODO: test this
        var callbacks = [],
            handlers = Backbone.history.handlers;
        _.each(this.routes, function(funcName){
            callbacks.push(this[funcName]);
        });
        _.each(handlers, function(handler){
            var index = callbacks.indexOf(handler.callback);
            if (index != -1) handlers.splice(index, 1);
        });
    }
});

Backbone.Layout = function(){
    this.initialize(this._setOptions(arguments));
};
_.extend(Backbone.Layout.prototype, Backbone.Events, {
    regions: null,
    views: null,
    viewConstructors: null,
    templates: null,
    initialize: function(){
        return this;
    },
    _setOptions: function(args){
        var obj = args[0];
        this.options = {};
        if (!this.regions) this.regions = {};
        if (!this.views) {
            this.views = {};
            this.viewConstructors = {};
        } else{
            this.viewConstructors = this.views;
            this.views = {}
        }
        if (obj){
            if (obj.regions){
                _.extend(this.regions, obj.regions);
                delete obj.regions;
            }
            if (obj.views){
                _.extend(this.viewConstructors, obj.views);
                delete obj.views;
            }
            this.options = this.setMainOpts(['templates'], obj);
        }
        _.each(this.regions, function(arg, name){
            this._setRegion(name, arg);
        }.bind(this));
        return args;
    },
    _setRegion: function(name, builder){
        var region = this.regions[name] = this.setInstance(builder);
        region.layout = this;
        region.module = this.module;
    },
    setModule: function(){
        _.each(this.regions, function(region){
            region.module = this.module;
        }.bind(this));
    },
    addRegion: function(name, arg){
        if (name.constructor === String) this._setRegion(name, arg);
        else if (name.constructor === Object){
            _.each(name, function(arg, key){
                this._setRegion(key, arg);
            }.bind(this));
        }
    },
    removeRegion: function(name){
        if (name.constructor === String && this.regions[name]){
            this.regions[name].clear();
            delete this.regions[name];
        } else if(name instanceof Backbone.Region){
            for (var key in this.regions){
                if (this.regions[key] == name){
                    this.removeRegion(key);
                    break;
                }
            }
        }
    },
    removeAll: function(){
        _.each(this.regions, function(region, name){
            this.removeRegion(name);
        }.bind(this));
    },
    showRegion: function(){
        var arg = arguments[0];
        if (arguments.length >= 2 && arguments[0].constructor === String && this.regions[arg]) this.regions[arg].show(arguments[1], arguments[2]);
        else if (arguments.length <= 2 && arguments[0].constructor === Object){
            var opts = arguments[1];
            _.each(arg, function(view, name){
                this.regions[name].show(view, opts);
            }.bind(this));
        }
    },
    showHTML: function(){
        var arg = arguments[0];
        if (arguments.length >= 2 && arguments[0].constructor === String && this.regions[arg]) this.regions[arg].showHTML(arguments[1], arguments[2]);
        else if (arguments.length <= 2 && arguments[0].constructor === Object){
            _.each(arg, function(html, name){
                this.regions[name].showHTML(html);
            }.bind(this));
        }
    },
    showNodes: function(){
        var arg = arguments[0];
        if (arguments.length >= 2 && arguments[0].constructor === String && this.regions[arg]) this.regions[arg].showNodes(arguments[1], arguments[2]);
        else if (arguments.length <= 2 && arguments[0].constructor === Object){
            _.each(arg, function(html, name){
                this.regions[name].showNodes(html);
            }.bind(this));
        }
    },
    clearRegion: function(){
        var arg = arguments[0];
        if (arguments.length >= 1 && arg.constructor === String && this.regions[arg]) this.regions[arg].clear(arguments[1]);
        else if (arguments.length <= 1 && arg.constructor === Array){
            var opts = arguments[1];
            _.each(arg, function(name){
                this.regions[name].clear(opts);
            }.bind(this));
        }
    },
    clearAll: function(opts){
        opts || (opts = {});
        _.each(this.regions, function(region, name){
            region.clear(opts);
        }.bind(this));
    },
    getRegion: function(name){
        return this.regions[name];
    },
    getTemplate: function(path){
        var pathArr = path.split('.'),
            tpl = this.templates;
            _.each(pathArr, function(property){
                tpl = tpl[property];
        });
        return tpl;
    },
    addView: function(name, builder){
        if (name.constructor === String) this.viewConstructors[name] = builder;
        else if (name.constructor === Object){
            _.each(name, function(ctor, key){
                this.viewConstructors[key] = ctor;
            }.bind(this));
        }
    },
    createView: function(name, args){
        args || (args = {});
        var view = null;
        if (this.viewConstructors[name]){
            view = this.views[name] = new this.viewConstructors[name](args);
            view.layout = this;
            view.module = this.module;
        }
        return view;
    },
    getView: function(name){
        if (this.views[name]) return this.views[name];
        return null;
    }
});

Backbone.Region = function(){
    this.initialize(this._setOptions(arguments));
};
_.extend(Backbone.Region.prototype, Backbone.Events, {
    el: null,
    view: null,
    templates: null,
    transition: null,
    oldView: null,
    initialize: function(){ return this },
    _setOptions: function(args){
        var obj = args[0],
            sets = ['el'];
        this.options = {};
        this.templates = {};
        if (obj) this.options = this.setMainOpts(sets, obj);
        if (this.el){
            this.$el = $(this.el);
            if (!this.el instanceof HTMLElement) this.el = this.$el[0];
        }
        return args;
    },
    _removeView: function(){
        if (this.view){
            this.view.remove();
            this.view = null;
        } else this.$el.empty();
    },
    _render: function(view, transition){
        transition || (transition = null);
        if (transition){
            this.transition = transition;
            this.oldView = this.view;
        } else{
            this._removeView();
            this.transition = null;
            this.oldView = null;
        }
        view.region = this;
        this.view = view;
        this.view.render(); // view.render() will call region.render() when ready
    },
    render: function(html){
        if (this.transition){
            var transition = this.transition,
                newView = this.view;
            newView.$el.addClass('transition '+transition+' new start');
            if (this.oldView){
                var oldView = this.oldView,
                    region = this.$el,
                    position = {left: oldView.el.offsetLeft, top: oldView.el.offsetTop};
                oldView.$el.one('transitionend webkitTransitionEnd', function(){
                    oldView.remove();
                    newView.$el.removeClass('transition '+transition+' new end');
                }.bind(this));
                position.position = 'absolute';
                oldView.$el.css(position);
                oldView.$el.addClass('transition '+transition+' old end');
                region.prepend(html);
            } else{
                this.$el.html(html);
                newView.$el.one('transitionend webkitTransitionEnd', function(){
                    newView.$el.removeClass('transition '+transition+' new end');
                }.bind(this));
            }
        this.trigger('changed', this.region, this.view, this);
            setTimeout(function(){
                newView.$el.toggleClass('start end');
            }, 0); //spike for timing
        } else{
            this.$el.html(html);
            this.trigger('changed', this.region, this.view, this);
        }
    },
    show: function(view, opts){
        opts || (opts = {});
        if (!opts.once || !this.view) this._render(view, opts.transition);
    },
    showHTML: function(html){
        this.view = null;
        this.clear();
        this.$el.html(html);
        this.trigger('changed', this.region, this.view, this);
    },
    showNodes: function(nodes){
        this.view = null;
        this.clear();
        this.$el.html(nodes);
        this.trigger('changed', this.region, this.view, this);
    },
    clear: function(opts){
        opts || (opts = {});
        var view = this.view;
        if (!view || !opts.transition) this._removeView();
        else {
            this.view = null;
            if (view){
                view.$el.one('transitionend webkitTransitionEnd', function(){
                    view.remove();
                }.bind(this));
                view.$el.addClass('transition '+opts.transition+' old end');
            }
        }
    }
});

Backbone.View = Backbone.View.extend({
    renderObj: null,
    template: null,
    _prepareEl: function(){
        if (this.collection) this.collection.view = this;
        if (this.model) this.model.view = this;
    },
    render: function(){
        this._prepareEl();
        var renderObj = {};
        if (this.renderObj) renderObj = this.renderObj;
        else if (this.model) renderObj = this.model.toJSON();
        else if (this.collection) renderObj = {collection: this.collection.toJSON()};
        this.renderTpl(renderObj);
        return this.el;
    },
    renderTpl: function(obj){
        if (this.template && this.template.constructor === Object){
            if (this.region) this._getTpl(this.region.templates, this.template.path, obj);
            else this._getTpl(this.template, 'tpl', obj);
        }
    },
    _getTpl: function(tplContainer, tplKey, obj){
        if (!tplContainer[tplKey] || this.template.refresh){
            var src = this.template.source;
            if (src == 'markup'){
                tplContainer[tplKey] = $(this.template.path).html();
                this._show(obj);
            } else if(src == 'layout' && this.layout){
                tplContainer[tplKey] = this.layout.getTemplate(this.template.path);
                this._show(obj);
            } else if (src == 'server'){
                var path = !this.template.absolute ? this.template.path : location.protocol+'//'+location.host+this.template.path;
                $.get(path, function(template){
                    tplContainer[tplKey] = template;
                    this._show(obj);
                }.bind(this));
            }
        } else this._show(obj);
    },
    _show: function(obj){
        if (this.region){
            this.$el.html(_.template(this.region.templates[this.template.path], obj, this));
            this.region.render(this.el);
        } else this.$el.html(_.template(this.template.tpl, obj, this));
        this.trigger('rendered', this.el);
    }
});

Backbone.Module.extend = Backbone.Layout.extend = Backbone.Region.extend = Backbone.View.extend;

Backbone.Application = Backbone.Module.extend({
    pushState: false,
    clickEvent: 'click',
    linkSelector: null,
    _setOptions: function(args){
        var obj = args[0];
        Backbone.Application.__super__._setOptions.call(this, args);
        if (obj){
            if (obj.pushState) this.pushState = obj.pushState;
            if (obj.clickEvent) this.clickEvent = obj.clickEvent;
            if (obj.linkSelector) this.linkSelector = obj.linkSelector;
        }
    },
    start: function(){ //starts module and all of its components
        Backbone.Application.__super__.start.apply(this, arguments);
        this._setLinkClass();
        Backbone.history.start({pushState: this.pushState});
    },
    _setLinkClass: function(){
        var link = this.linkSelector;
        if (link){
            $(document.body).on(this.clickEvent, link, function(e){
                e.preventDefault();
                this.controller.navigate(e.currentTarget.hash, true);
            }.bind(this));
        }
    }
});
