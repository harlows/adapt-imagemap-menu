define([
    'coreJS/adapt',
    'coreViews/menuView'
], function(Adapt, MenuView) {

    var ImageMapMenuView = MenuView.extend({
        
        postRender: function() {
            var nthChild = 0;
            this.model.getChildren().each(function(item) {
                if (item.get('_isAvailable')) {
                    nthChild++;
                    item.set('_nthChild', nthChild);
                    this.$('.imagemapmenu-items').append(new ImageMapMenuItemView({model: item}).$el);
                }
            });
            $('.menu').addClass('imagemapmenu');
            this.listenTo(Adapt, "imageMapMenu:itemOpen", this.showOverlay);
            this.listenTo(Adapt, "imageMapMenu:itemClosed", this.hideOverlay);
        },
        
        showOverlay: function() {
            this.$('.menu-container > .imagemapmenu-overlay').addClass('show');
        },
        
        hideOverlay: function() {
            this.$('.menu-container > .imagemapmenu-overlay').removeClass('show');
        }

    }, {
        template: 'imagemapmenu'
    });

    var ImageMapMenuItemView = MenuView.extend({

        events: {
            'click .menu-item-hotspot':'showDetails',
            'click .menu-item-done':'hideDetails'
        },

        className: function() {
            var nthChild = this.model.get('_nthChild');
            return [
                'menu-item',
                'menu-item-' + this.model.get('_id') ,
                this.model.get('_classes'),
                this.model.get('_isVisited') ? 'visited' : '',
                this.model.get('_isComplete') ? 'completed' : '',
                this.model.get('_isLocked') ? 'locked' : '',
                'nth-child-' + nthChild,
                nthChild % 2 === 0 ? 'nth-child-even' : 'nth-child-odd'
            ].join(' ');
        },

        preRender: function() {
            this.model.checkCompletionStatus();
            this.model.checkInteractionCompletionStatus();
            this.listenTo(Adapt, 'imageMapMenu:itemOpen', this.checkIfShouldClose);
        },

        postRender: function() {
            var graphic = this.model.get('_graphic');
            if (graphic && graphic.src && graphic.src.length > 0) {
                this.$el.imageready(_.bind(function() {
                    this.setReadyStatus();
                }, this));
            } else {
                this.setReadyStatus();
            }
        },

        showDetails: function(event) {
            if(event) event.preventDefault();
            var $element = $(event.currentTarget);
            this.$('.menu-item-inner').addClass('show-item');
            Adapt.trigger('imageMapMenu:itemOpen', $element.attr('data-id'));
        },

        hideDetails: function(event) {
            if(event) event.preventDefault();
            this.$('.menu-item-inner').removeClass('show-item');
            Adapt.trigger('imageMapMenu:itemClosed');
        },

        checkIfShouldClose: function(id) {
            if(this.model.get('_id') != id) {
                this.hideDetails();
            }
        }

    }, {
        template: 'imagemapmenu-item'
    });

    Adapt.on('router:menu', function(model) {

        $('#wrapper').append(new ImageMapMenuView({model: model}).$el);

    });

});
