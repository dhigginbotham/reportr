'use strict';

// Models
window.Models = Backbone.Model.extend();

window.ModelsCollection = Backbone.Collection.extend({
    model:Models
});

window.Model = new ModelsCollection({
  base: "/api/apps" 
});

Backbone.history.start();