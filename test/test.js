describe("uzi", function () {

  describe("Variable", function () {

    it("should not be able to set a value twice in the same digest", function () {
      var v = new uzi.Variable("name");
      var spy = jasmine.createSpy('notified');

      v.setValue(123, 0);

      // can't set a value twice in the same digest
      expect(function () {
        v.setValue(321, 0);
      }).toThrow();

      // ok to set a new value in a new digest
      v.setValue(321, 1);
      expect(v.getValue()).toEqual(321);
    });

  });

  describe("GeneratedParser", function () {

    function parseWith(input, startRule) {
      try {
        return uzi.Parser.parse(input, { startRule: startRule });
      } catch (e) {
        if (e instanceof uzi.Parser.SyntaxError) {
          throw new Error(uzi.Utils.formatParserError(e, input));
        } else {
          throw e;
        }
      }
    }

    describe("Expressions", function () {

      function parse(input) {
        return parseWith(input, "expression");
      }

      it("should parse a number", function () {
        var node = parse("100");
        expect(node.value).toEqual(100);
      });

      it("should parse a negative number", function () {
        var node = parse("-1");
        expect(node.value).toEqual(-1);
      });

      it("should parse decimal numbers", function () {
        var node = parse("1.1");
        expect(node.value).toEqual(1.1);
      });

      it("should parse negative decimal numbers", function () {
        var node = parse("-5.43");
        expect(node.value).toEqual(-5.43);
      });

      it("should parse a variable name", function () {
        var node = parse("$fo-o_");
        expect(node.value).toEqual("$fo-o_");
      });

      it("should parse basic arithmetic", function () {
        var node = parse("a + 1");
        expect(node.tag).toEqual("op");
        expect(node.op).toEqual("+");
        expect(node.left.value).toEqual("a");
        expect(node.right.value).toEqual(1);
      });

      it("should parse function calls", function () {
        var node = parse("foo(1)");
        expect(node.tag).toEqual("func_call");
        expect(node.name).toEqual("foo");
        expect(node.params[0].value).toEqual(1);
      });

      it("should parse function call with multiple parameters", function () {
        var node = parse("foo(1, 2)");
        expect(node.tag).toEqual("func_call");
        expect(node.params.length).toEqual(2);
        expect(node.params[0].value).toEqual(1);
        expect(node.params[1].value).toEqual(2);
      });

    });

    describe("StyleSheet", function () {

      function parse(input) {
        return parseWith(input, "stylesheet");
      }

      it("should parse comments", function () {
        var stylesheet = parse(" /* foo bar */ ");
        expect(stylesheet.rulesets.length).toEqual(0);
        expect(stylesheet.variables.length).toEqual(0);
      });

      it("should parse an empty commented ruleset", function () {
        var stylesheet = parse(" /* hi */ #A { /* cool */ } /* no */");
        expect(stylesheet.rulesets.length).toEqual(1);
        expect(stylesheet.variables.length).toEqual(0);
      });

    });

  });

  describe("System", function () {

    var system = new uzi.System();

    beforeEach(function () {
      system.reset();

      system.func("min", function (a, b) {
        return Math.min(a, b);
      });

      system.func("max", function (a, b) {
        return Math.max(a, b);
      });
    });

    describe("Relationships", function () {

      it("should do equality", function () {
        system.equals("A", "B");
        system.$.A = 321;
        expect(system.$.B).toEqual(321);
      });

      it("should do addition", function () {
        system.add("A", "B", "C");
        system.$.B = 1;
        system.$.C = 2;
        expect(system.$.A).toEqual(3);
      });

      it("should do subtraction", function () {
        system.subtract("A", "B", "C");
        system.$.B = 10;
        system.$.C = 5;
        expect(system.$.A).toEqual(5);
      });

      it("should do multiplication", function () {
        system.multiply("A", "B", "C");
        system.$.B = 5;
        system.$.C = 5;
        expect(system.$.A).toEqual(25);
      });

      it("should do division", function () {
        system.divide("A", "B", "C");
        system.$.B = 10;
        system.$.C = 2;
        expect(system.$.A).toEqual(5);
      });

    });

    describe("Expressions", function () {

      it("should correctly parse expressions", function () {
        system.$.A = "B + 1";
        system.$.B = 10;
        expect(system.$.A).toEqual(11);
      });

      it("should correctly parse complex expressions", function () {
        system.$.W = "R - L";
        system.$.C = "L + (W / 2)";
        system.$.L = 10;
        system.$.R = 20;
        expect(system.$.W).toEqual(10);
        expect(system.$.C).toEqual(15);
      });

      it("should correctly parse expression with negative numbers", function () {
        system.$.A = "-1 + B";
        system.$.B = 10;
        expect(system.$.A).toEqual(9);
      });

      it("should parse expressions with functions", function () {
        system.$.A = "1 + min(C, 5)";
        system.$.C = 3;
        expect(system.$.A).toEqual(4);
      });

    });

    describe("Variables", function () {

      it("should delete a variable", function () {
        system.$.A = 100;
        system.destroy("A");
        expect(system.has("A")).toBe(false);
      });

    });
    
  });

  describe("Engine", function () {

    var engine;
    var system;

    beforeEach(function () {
      engine = new uzi.Engine();
      system = engine.getSystem();

      system.func("add_five", function (x) {
        return x + 5;
      })

      engine.initialize();
      engine.updateNow();
    });

    afterEach(function () {
      engine.destroy();
    });

    it("should have applied the width style to A", function () {
      expect(system.get("A.width")).toEqual(100);
    });

    it("should have set B's height to half of A's width", function () {
      expect(system.get("B.height")).toEqual(50);
    });

    it("should work with variables", function () {
      system.set("x", 50);
      engine.updateNow();
      expect(system.get("A.height")).toEqual(100);
    });

    it("should work with basic user defined functions", function () {
      expect(system.get("B.left")).toEqual(10);
    });

    it("should destroy variables when they are not used anyore", function () {
      expect(system.has("B.top")).toBe(true);
      var bDiv = document.getElementById("B");
      engine.unmount(bDiv);
      expect(system.has("B.top")).toBe(false);
      expect(system.has("B.bottom")).toBe(false);
      expect(system.has("B.left")).toBe(false);
      expect(system.has("B.right")).toBe(false);
    });

    it("should find the actual values of B's unconstrained properties", function () {
      expect(system.get("B.width")).toEqual(10);
    });

    it("should parse inline styles", function () {
      expect(system.get("A.top")).toEqual(10);
    });

    it("should apply the correct classes", function () {
      expect(system.get("B.top")).toEqual(20);
    });

  });

});
