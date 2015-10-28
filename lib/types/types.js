var _ = require('lodash');

var Type = {
    create: function create(options, ext) {
        var obj = {
            name: options.name
        };
        
        obj.equals = _.bind(options.equals, obj);
        
        // Note: May have to write a custom extender
        _.extend(obj, ext);
        return obj;
    },
    equals: function equals(other) {
        return 'name' in other &&
                other.name === this.name &&
               'equals' in other;
    }
}

module.exports = Type;