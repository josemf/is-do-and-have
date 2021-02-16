
// Those should be the reasonable defaults for a class without any setup

const DEFAULTS = {

    // instance `is` of type classObject
    is: (Class, instance, something) => {
        return instance instanceof Class && instance.constructor.name === something;
    },

    // instance can be invoked some method
    do: (Class, instance, someaction) => {
        return typeof instance[someaction] === "function";
    },

    // instance have some property
    have: (Class, instance, someproperty) => {
        return typeof instance[someproperty] !== "function"
            && typeof instance[someproperty] !== "undefined";
    },

    before: (Class, instance, method) => instance,    
    properties: (Class, instance) => instance
};

class Query {
    constructor(Class, instance, options) {

        this._Class = Class;
        this._instance = instance;
        this._options = options;
        
        this._is   = options.is;
        this._do   = options.do;
        this._have = options.have;

        this._before = options.before || ((Class, instance) => instance); 
        this._properties = options.properties || instance;

        this._andState = { negate: false, method: 'is' };
        this._states = [ undefined ];
        this._orNegateStates = [ false ];
        
        this._negate = false;
    }
    
    _evalQueryState(method, outcome) {

        const result = (true === this._negate ? !outcome : outcome);        
        
        if(typeof this._states[this._states.length - 1] === "undefined") {            
            this._states[this._states.length - 1] = result;            
        } else {        
            this._states[this._states.length - 1] &= result;
        }

        this._andState.method = method;
        this._andState.negate = this._negate;
        
        this._negate = false;
    }
    
    is(... somethings) {        
        this._evalQueryState("is", somethings.every(something => this._is(this._Class, this._before(this._Class, this._instance, "is"), something)));        
        return this;
    } 
    
    do(someaction, withArgs = undefined) {
        
        this._evalQueryState("do", this._do(this._Class, this._before(this._Class, this._instance, "do"), someaction, withArgs));
        return this;        
    }

    have(somestuffOrCallback) {
        if(typeof somestuffOrCallback === "function") {

            const properties = this._properties(this._Class, this._instance);
            
            this._evalQueryState("have",
                Object.keys(properties)
                    .some(k => {
                                                 
                        const key = properties instanceof Array ? Number(k) : k;
                        const propertyInstance = properties[key];

                        // We iterate in properties and send a query if the interface
                        // is set--otherwise just send the instance
                        
                        const query = typeof propertyInstance.is_ !== "undefined" ? propertyInstance.is_() : propertyInstance;
                        const value = somestuffOrCallback.call(propertyInstance, query, key, propertyInstance);

                        if(value instanceof Query) {
                            return value.true();
                        }

                        return value;
                    }));
        } else {          
            this._evalQueryState("have", this._have(this._Class, this._before(this._Class, this._instance, "have"), somestuffOrCallback));
        }
        
        return this;        
    }

    true() { 
        const result = this._states.some((s, i) => true === this._orNegateStates[i] ? !s : s);
        
        return true === this._negate ? !result : result;
    }

    false() {
        return !this.true();
    }

    _resolveOuterQueryInstance(that) {
        do {
            that = that.__instance;
        } while(that.__instance && that)

        return that;
    }
    
    _proxiedAction(method, callback) {

        const Fn = ( ) => { };
        
        return new Proxy(Fn, {
            apply: (target, thisArg, argumentsList) => {
                return callback(... argumentsList);
            },

            get: (target, prop, receiver) => {

                if(prop === "__instance") {
                    return this;
                }
  
                const queryAction = this[prop];

                if(queryAction instanceof Function) {

                    if(this instanceof Query) {

                        if(!queryAction.__instance) {
                            return queryAction.bind(this);                            
                        }
                        
                    } 
                } 
                 
                return queryAction;
            }        
        });
    } 
    
    get not() { 
        this._negate = !this._negate;// true;
        
        return this._proxiedAction("not", (... args) => {

            if(args.length === 0) {
                return this;
            }

            const method = this._andState.method;
                
            return this[method](... args);
        });
    }

    get and() {

        return this._proxiedAction("and", (... args) => {

            if(args.length === 0) {
                return this;
            }
            
            const method = this._andState.method;
            this._negate = this._andState.negate;
            
            return this[method](... args);
        });
    }

    get or() {

        this._states.push(undefined);
        this._orNegateStates.push(this._negate);
        
        this._andState.negate = false;
        this._negate = false;

        return this._proxiedAction("or", (... args) => {
                
            if(args.length === 0) {
                return this;
            }

            if(typeof args[0] === "function") {
                
                // Start a new query and run on a inner chain
                const query = new Query(this._Class, this._instance, this._options);
                
                let result = args[0](query);

                if(result instanceof Query) {                    
                    result = result.true();
                }

                this._evalQueryState("or", result);                
                
                return this;
            }
            
            const method = this._andState.method;                 
            return this[method](... args);
        }); 
    }
} 

const start  = (instance, method, args, Class, options) => {
    const query = new Query(Class, instance, options);    
    return query[method](... args);
}; 
 
const extend = (Class, options) => {
    
    if(typeof options.is !== "function") {
        options.is = () => {
            throw Error("`is` not implemented.");
        };
    }
    
    if(typeof options.do !== "function") {
        options.do = () => {
            throw Error("`do` not implemented.");
        };        
    }

    if(typeof options.have !== "function" || (typeof options.properties !== "function" && !(options.properties instanceof Array))) {
        options.have = () => {
            throw Error("`have` not implemented.");
        };        
    }

    ["is", "do", "have", "not"].forEach(method => {
        Class.prototype[`${method}_`] = function (...args) {
            return start(this, method, args, Class, options);
        }; 
    });  
};

const configure = (Class, options = { }) => {
    return extend(Class, Object.assign({}, DEFAULTS, options));
};

configure.IsDoAndHaveQuery = Query;

module.exports = configure; 
 
