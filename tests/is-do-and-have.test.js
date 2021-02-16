
const IsDoAndHave = require("../src");

class Class {
    constructor() {

        this.member1 = "A";
        this.member2 = "B";
    }

    action1() {}
    action2() {}
}

class SubClass extends Class {
    constructor() {
        
        super();
        
        this.member1 = "AA",
        this.member3 = 100;
    }

    action3() { }        
}

IsDoAndHave(Class);

class OtherClass {
    constructor(is = [], do_ = {}, have = {}) {
        this._is = is;
        this._do = do_;
        this._have = have;
    }
}

IsDoAndHave(OtherClass, {
    is: (Class, instance, a) => instance._is.includes(a),
    do: (Class, instance, a, b) => typeof instance._do[a] !== "undefined" && (b ? instance._do[a] === b : true),
    have: (Class, instance, a) => typeof instance._have[a] !== "undefined",
    properties: (Class, instance) => instance._have,
    before: (Class, instance) => instance
});

describe("Testing the API", () => {
 
    test("all sorts default", () => {

        const class1 = new Class();

        expect(class1.is_("Class").true()).toBe(true);
        expect(class1.is_("Class").have("member1").do("action1").not.do("action3").not.have("member3").true()).toBe(true);
        expect(class1.do_("action2").and("action3").false()).toBe(true);        
        expect(class1.do_("action2").and("action3").or("action1").true()).toBe(true);
        expect(class1.not_().do("action3").and.do("action2").or("action3").true()).toBe(true);        
        expect(class1.have_("member1").and("member2").or("action3").true()).toBe(true);
        expect(class1.have_(o => o === "C").or.have(o => o === "D").true()).toBe(false);
        expect(class1.have_(o => o === "A").or.have(o => o === "D").true()).toBe(true);
        expect(class1.have_(o => o === "C").or.have(o => o === "A").true()).toBe(true);
        expect(class1.have_(o => o === "C").or(o => o.have("member3")).or.have(o => o === "D").true()).toBe(false);
        expect(class1.have_(o => o === "C").or(o => o.have("member3")).or.have(o => o === "D").true()).toBe(false);        
        expect(class1.have_(o => o === "A").or(o => o.have("member3")).or.have(o => o === "D").true()).toBe(true);                        
        expect(class1.have_(o => o === "C").or(o => o.have("member2")).or.have(o => o === "D").true()).toBe(true);
        expect(class1.have_(o => o === "C").not.or(o => o.have("member3")).or.have(o => o === "D").true()).toBe(true);
        expect(class1.have_(o => o === "C").or(o => o.have("member3")).not.or.have(o => o === "D").true()).toBe(true);                      

        const class2 = new SubClass();
        
        expect(class2.is_("SubClass").true()).toBe(true);
        expect(class2.is_("SubClass").have("member1").do("action1").not.do("action3").not.have("member3").true()).toBe(false);
        expect(class2.is_("SubClass").have("member1").do("action1").do("action3").have("member3").true()).toBe(true);
        
        expect(class2.do_("action2").and("action3").false()).toBe(false);        
        expect(class2.do_("action2").and("action3").or("action1").true()).toBe(true);
        expect(class2.not_().do("action3").and.do("action2").true()).toBe(false);
        expect(class2.not_().do("action4").and.do("action2").true()).toBe(true);
        
        expect(class2.have_("member1").and("member4").or("action4").true()).toBe(false);
        expect(class2.have_(o => o === "A").or.have(o => o === "D").true()).toBe(false);
        expect(class2.have_(o => o === "AA").or.have(o => o === "D").true()).toBe(true);
    });

    test("all sorts customized", () => {
        const o = new OtherClass([ "a", "b", "c" ], { x: 1, y: 2, z: 3 }, { p1: "x1", p2: "x2", p3: "x3" });

        expect(o.is_("a").not("d").true()).toBe(true);
        expect(o.is_("a").not("d").do("x").true()).toBe(true);        
        expect(o.is_("a").not("d").do("x").and("y", 2).not("w").have("p1").not("p4").true()).toBe(true);
        expect(o.is_("a").and("d").do("x").and("y", 2).not("w").have("p1").not("p4").true()).toBe(false);        
        expect(o.is_("a").not("d").do("x").and("y", 3).not("w").have("p1").not("p4").true()).toBe(false);
        expect(o.is_("a").not("d").do("x").and("y", 2).not("w").have("p1").not("p3").true()).toBe(false);

        expect(o.is_("a").not("d").or.do("x").and("y", 3).not("w").or.have("p1").not("p2").true()).toBe(true);
        expect(o.is_("e").not("d").or.do("x").and("y", 3).not("w").or.have("p1").not("p2").true()).toBe(false);
        expect(o.is_("e").not("d").or.do("x").and("y", 3).not("w").or.have(value => value === "x1").true()).toBe(true);
        expect(o.is_("e").not("d").or.do("x").and("y", 3).not("w").or.have(value => value === "x4").true()).toBe(false);                
    });
});
