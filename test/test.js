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

  describe("Parser", function () {

    var parser = new Robin.Parser();

    function tokensToString(tokens) {
      return tokens.map(function (token) {
        return token.value;
      }).join(" ");
    }

    describe("Tokenizer", function () {

      var testCases = [
        { input: "1 + 1",       output: "1 + 1"         },
        { input: "1/1",         output: "1 / 1"         },
        { input: "1*1+    10",  output: "1 * 1 + 10"    },
        { input: "A+1",         output: "A + 1"         },
        { input: "L + (W / 2)", output: "L + ( W / 2 )" },
        { input: "foo-bar + 1", output: "foo-bar + 1"   },
        { input: "-1 + -2",     output: "-1 + -2"       }
      ];

      testCases.forEach(function (testCase) {
        it("should tokenize " + testCase.input, function () {
          var tokens = parser.tokenize(testCase.input);
          expect(tokensToString(tokens)).toEqual(testCase.output);
        });
      });

    });

    describe("RPN", function () {

      var testCases = [
        { input: "1 + 1",          output: "1 1 +"          },
        { input: "1 + 1 * 3",      output: "1 1 3 * +"      },
        { input: "4 / 5 + 10 / 3", output: "4 5 / 10 3 / +" },
        { input: "(1 + 2) /2",     output: "1 2 + 2 /"      },
        { input: "A / 5 + 10 / X", output: "A 5 / 10 X / +" },
        { input: "L + (W / 2)",    output: "L W 2 / +"      }
      ];

      testCases.forEach(function (testCase) {
        it("should convert " + testCase.input + " to RPN", function () {
          var tokens = parser.tokenize(testCase.input);
          var rpn = parser.infixToRPN(tokens);
          expect(tokensToString(rpn)).toEqual(testCase.output);
        });
      });

    });

  });

});
