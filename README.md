<div align="center">
  <h1>is-do-and-have</h1>
  <br>
  <p><b>Domain query DSL that makes if then else on instances look dumb <a href="https://www.keystonejs.com/">KeystoneJS</a></b></p>
  <p><code class="javascript">if(instance.is_("cute").do("meaw").and.have("fur").true()) { console.log("It is probably a cat!") }</code></p>
</div>

## What is this

JavaScript is very verbose when it comes to testing for specific properties or methods in objects. Some times we need some introspection when building an app that generalizes over some of objects pertaining to a specific domain.

Say we're implementing a virtual Zoo:

```javascript
class Animal {
    constructor(species, family, numberOfLegs, skin) {
        this.species = species;
        this.family = family;
        this.numberOfLegs = numberOfLegs;
        this.skin = skin;
    }
}

class Monkey extends Animal {
    constructor() {
        super("monkey", "mamals", 2, "fur");
    }
    
    bite() {
       	
    }
}

class Dolphin extends Animal {
    constructor() {
        super("dolphin", "mamals", 0, "soft");
    }
    
    swim() {
        
    }
}

class Eagle extends Animal {
    constructor() {
        super("eagle", "birds", 2, "feathers");
    }
    
    beaks() {
        
    }
    
    fly() {
        
    }
}

// ... more animals

```

And some part of the app draws a profile page on the animal. We will need to test for the class type, some properties and what animals can do. This is how it would go in JavaScript.

```javascript
(animal) => {
    
   	if(animal.family === "mamals" && typeof animal.layEggs === "function" && animal.haveSpikes) {
        console.log("In this particular order of mamals we can see that females lay eggs. Belonging to this family we have the marsupials and monotremes")
    }
    
    if(animal.contructor.name == "bat" || animal.family === "birds" || (typeof animal.fly === "function" && animal.skin === "feathers")) {
        console.log("This animal can fly");
    }
    
    /// ...
}
```

This is verbose and might be difficult to follow after a while. Complex cases might pop.

Would be best we could write.

```javascript
(animal) => {
    if(animal.is_("mamals").do("layEggs").and.have("haveSpikes").true()) {
        //...
    }
    
    if(animal.is_("bat").or.is("birds").or.do("fly").have(a => a.skin === "feathers").true()) {
       //...
    }
}
```

## Configure a domain

To install.

`$ npm i is-do-and-have` or `yarn add is-do-and-have `

Require and attach to your class domain.

```javascript
import IsDoAndHave from 'is-do-and-have'

class Animal {
	// ...
}

IsDoAndHave(Animal, options = {})
```

Options.

| name                                                         | description                                                  | default                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| is: Function(Class, instance, something)                     | If some `instance` can be said of being a `something`        | It checks for immediate constructor name                     |
| do: Function(Class, instance, someaction, _with = undefined) | If some `instance` might be able to do `someaction` and bounded by `_with` | Checks for the existence of some function on `instance`      |
| have: Function(Class, instance, somestuff)                   | If some `instance` might be said to possess `somestuff`. Using a function for `somestuff` will test an object properties. | It check for some `instance` property or run through all properties with a test function |
| properties: Function(Class, instance)                        | Gets all object properties used when `have`. Can be used for filtering or "virtual" properties. | Sends the whole object instance                              |
| before: Function(Class, instance)                            | Execute everytime before one of other methods and returns the `instance` they'll get as argument | Sends the whole object instance                              |

```javascript
IsDoAndHave(Animal, options = {
    is: (Class, instance, something) => instance.constructor.name === something || instance.family === something
    do: (Class, instance, someaction) => typeof instance[someaction] === "function" || someaction === "fly" && instance.skin === "feathers"
})
```

## How to conditionals

Configured class will have the following methods attached: `is_`, `do_`, `have_`, `not_`. You started the query on one of these.

Query is built from.

| method                          | description                                                  | Example                                                      | returns |
| ------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------- |
| is(things: *String)             | An object is of "something"                                  | `t.is_("hot").is("sour")`                                    | Query   |
| do(stuff: String, with_: Mixed) | And does some stuff with `with_` (or just does some stuff)   | `t.do_("smell tasty").is("tasty")`                           | Query   |
| have(stuff)                     | It does have some stuff                                      | `t.have("chillies").is("hot").do("sweat")`                   | Query   |
| not                             | It negates whatever it comes next                            | `t.have.not("chillies").is("mild").not.do("sweat")`          | Query   |
| not(whatever: Mixed)            | It negates `whatever` using the previous query               |                                                              | Query   |
| and                             | Sugar                                                        | `t.is_("hot").and("sour").and("spicy")`                      | Query   |
| and(whatever: Mixed)            | Uses the previous query in the chain                         |                                                              | Query   |
| or                              | Breaks the chain in two OR conditions                        | `t.is_("hot").and("sour").or.is("spicy")`                    | Query   |
| or(what)                        | Breaks the chain in three OR conditions starting a new chain | `t.have_("chillies").or(t => t.have("ginger")).have("chilly paste")` | Query   |
| true()                          | Gets the results                                             | `t.is(...).do(...).have(...).true()`                         | Boolean |
| false()                         | Negates the results                                          | `t.is(...).do(...).have(...).false()`                        | Boolean |

Some particulars:

* Negating an `.or` statement will negate the whole OR chain
* `not.not.is()` is `is()`
* You can `not.true()`

## Testing

`$ npm run test` and `$ yarn test`

