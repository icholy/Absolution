
module uzi.Angular {

  /**
   * AngularContext intercepts variable/function lookups and
   * injects items from the angular $scope.
   */
  class AngularContext implements Context {

    private variables: { [name: string]: Variable; };
    private functions: { [name: string]: FuncEntry; };

    constructor(
      private engine:     Engine,
      private $scope:     ng.IScope,
      private parentCtrl: Controller
    ) {
      this.variables = Object.create(null);
      this.functions = Object.create(null);
    }

    /**
     * Creates a Variable bound to a value on the $scope.
     */
    private makeVariable(name: string): Variable {
      let v = new Variable(name);
      v.assignValue(this.$scope[name]);
      this.$scope.$watch<number>(name, (newVal, oldVal) => {
        if (newVal !== oldVal) {
          v.assignValue(newVal);
          this.engine.update();
        }
      });
      return v;
    }

    /**
     * Checks if there's a numeric value on the scope with the specified name.
     */
    hasVariable(name: string): boolean {
      return name in this.variables
          || typeof this.$scope[name] === "number";
    }

    /**
     * Get a variable by name. This method should only be called if `hasVariable` returns true.
     */
    getVariable(name: string): Variable {
      if (!(name in this.variables)) {
        this.variables[name] = this.makeVariable(name);
      }
      return this.variables[name];
    }

    /**
     * Lookup a function from the $scope by name, and create an entry for it.
     */
    private makeFunction(name: string): FuncEntry {
      return {
        name:  name,
        func:  this.$scope[name]
      };
    }

    /**
     * Checks if there's a function on the scope with the specified name.
     */
    hasFunction(name: string): boolean {
      return name in this.functions
          || typeof this.$scope[name] === "function";
    }

    /**
     * Get a function by name. This should only be called if `hasFunction` returns true.
     */
    getFunction(name: string): FuncEntry {
      if (!(name in this.functions)) {
        this.functions[name] = this.makeFunction(name);
      }
      return this.functions[name];
    }

    /**
     * Used to intercept and rewrite the ident name when "parent" is used.
     */
    identToName(node: IdentNode): string {
      if (this.parentCtrl) {
        if (node.tag === "property" && node.object === "parent") {
          return `${this.parentCtrl.getRectId()}.${node.key}`;
        }
        if (node.tag === "ident" && node.value === "parent") {
          return this.parentCtrl.getRectId();
        }
      }
      return node.value;
    }
  }

  /**
   * The Controller is used to pass information context beetween pre and post link function.
   * It's also used to get the parent rect's id.
   */
  class Controller {

    private options: RectOptions;

    /**
     * Set the rect options (from the pre link function).
     */
    setOptions(options: RectOptions): void {
      this.options = options;
    }

    /**
     * Get the rect options (from the post link function).
     */
    getOptionsWithContext(context: AngularContext): RectOptions {
      let container = context.identToName({
        tag:   "ident",
        value: this.options.container
      });
      return {
        id:        this.options.id,
        watcher:   this.options.watcher,
        rules:     this.options.rules,
        container: container,
        context:   context
      };
    }

    /**
     * Get the rects id (used by child rects).
     */
    getRectId(): string {
      return this.options.id;
    }
  }

  /**
   * The Directive manages the lifecycle of the rect.
   * To improve performance, parsing is done once in the pre-link function
   * and then used in the post-link.
   */
  function Directive(engine: Engine): ng.IDirective {
    return {
      restrict: "A",
      require: [ "uzRect", "?^^uzRect" ],
      controller: Controller,
      scope: false,
      link: {
        pre(
          scope:       ng.IScope,
          element:     ng.IAugmentedJQuery,
          attr:        ng.IAttributes,
          controllers: Controller[]
        ): void {
          
          let el = element[0];
          let options = engine.getEnv().getRectOptions(el, true);
          let [ctrl, parentCtrl] = controllers;

          // automatically set the container
          if (!options.container && parentCtrl) {
            options.container = parentCtrl.getRectId();
          }

          ctrl.setOptions(options);
        },
        post(
          scope:       ng.IScope,
          element:     ng.IAugmentedJQuery,
          attr:        ng.IAttributes,
          controllers: Controller[]
        ): void {
          let [ctrl, parentCtrl] = controllers;
          let context = new AngularContext(engine, scope, parentCtrl);
          let options = ctrl.getOptionsWithContext(context)
          let el = element[0];
          engine.register(el, options);
          element.on("$destroy", () => engine.unregister(el));
        }
      }
    }
  }

  /**
   * The Factory injects an instance of uzi.Engine as "uzi".
   */
  function EngineFactory(): Engine {
    let engine = new Engine();
    engine.initialize({ findStyleSheets: true });
    return engine;
  }

  if (typeof angular !== "undefined") {
    angular.module("uzi", []);
    angular.module("uzi").factory("uzi", EngineFactory);
    angular.module("uzi").directive("uzRect", ["uzi", Directive]);
  }
}
