describe("Robin", function () {

  describe("Variable", function () {

    it("should throw an error if it's already set to a different value", function () {
      var v = new Robin.Variable("name");
      var spy = jasmine.createSpy('notified');
      v.setValue(123);
      expect(function () {
        v.setValue(321);
      }).toThrow();
    });

  });

  describe("GeneratedParser", function () {

    describe("Expressions", function () {

      function parse(input) {
        return Robin.GeneratedParser.parse(input, { startRule: "expression" });
      }

      it("should parse a number", function () {
        var node = parse("1");
        expect(node.value).toEqual(1);
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
      });

    });

  });

  describe("System", function () {

    var system = new Robin.System();

    beforeEach(function () {
      system.reset();
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

    });

    describe("Variables", function () {

      it("should delete a variable", function () {
        system.$.A = 100;
        system.destroy("A");
        expect(system.has("A")).toBe(false);
      });

    });
    
  });

});
