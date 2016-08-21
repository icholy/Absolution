
module Absolution.Angular {

  class ScopeContext implements Context {

    private variables: { [name: string]: Variable; };
    private functions: { [name: string]: FuncEntry; };

    constructor(
      private layout: Layout,
      private $scope: ng.IScope
    ) {
      this.variables = Object.create(null);
      this.functions = Object.create(null);
    }

    private makeVariable(name: string): Variable {
      let v = new Variable(name);
      v.assignValue(this.$scope[name]);
      this.$scope.$watch<number>(name, (newVal, oldVal) => {
        if (newVal !== oldVal) {
          v.assignValue(newVal);
          this.layout.update();
        }
      });
      return v;
    }

    hasVariable(name: string): boolean {
      return name in this.variables
          || typeof this.$scope[name] === "number";
    }

    getVariable(name: string): Variable {
      if (!(name in this.variables)) {
        this.variables[name] = this.makeVariable(name);
      }
      return this.variables[name];
    }

    private makeFunction(name: string): FuncEntry {
      return {
        name:  name,
        func:  this.$scope[name]
      };
    }

    hasFunction(name: string): boolean {
      return name in this.functions
          || typeof this.$scope[name] === "function";
    }

    getFunction(name: string): FuncEntry {
      if (!(name in this.functions)) {
        this.functions[name] = this.makeFunction(name);
      }
      return this.functions[name];
    }
  }

  class Controller {
    private options: RectOptions;

    setOptions(options: RectOptions): void {
      this.options = options;
    }

    getOptionsWithContext(context: ScopeContext): RectOptions {
      return {
        id:        this.options.id,
        container: this.options.container,
        watcher:   this.options.watcher,
        rules:     this.options.rules,
        context:   context
      };
    }
  }

  function Directive(layout: Layout): ng.IDirective {
    return {
      restrict: "A",
      scope: false,
      controller: Controller,
      link: {
        pre(scope: ng.IScope, element: ng.IAugmentedJQuery, attr: ng.IAttributes, ctrl: Controller): void {
          let el = element[0];
          let options = layout.getRectOptions(el, true);
          ctrl.setOptions(options);
        },
        post(scope: ng.IScope, element: ng.IAugmentedJQuery, attr: ng.IAttributes, ctrl: Controller): void {
          let el = element[0];
          let context = new ScopeContext(layout, scope);
          let options = ctrl.getOptionsWithContext(context)
          let rect = new ElementRect(el, layout, options);
          element.on("$destroy", () => rect.destroy());
        }
      }
    }
  }

  function LayoutFactory(): Layout {
    let layout = new Layout();
    layout.attachTo(document.body, { findStyleSheets: true });
    return layout;
  }

  angular.module("absolution", []);
  angular.module("absolution").factory("layout", LayoutFactory);
  angular.module("absolution").directive("aRect", ["layout", Directive]);
}
