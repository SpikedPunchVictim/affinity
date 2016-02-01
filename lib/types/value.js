'use strict';

class Value {
    get type() {
        throw new Error('Not Implemented');
    }
    
    requestForChange(context) {
        
    }
    
    equals() {
        throw new Error('Unimplemented');
    }
    
    clone() {
        throw new Error('Unimplememnted');
    }
}