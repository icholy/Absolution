
module Absolution.Angular {

  class AngularContext implements Context {

    private variables: { [name: string]: Variable; };
    private functions: { [name: string]: FuncEntry; };

    constructor(
      private manager:    Manager,
      private $scope:     ng.IScope,
      private parentCtrl: Controller
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
          this.manager.update();
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

  class Controller {
    private options: RectOptions;

    setOptions(options: RectOptions): void {
      this.options = options;
    }

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

    getRectId(): string {
      return this.options.id;
    }
  }

  function Directive(manager: Manager): ng.IDirective {
    return {
      restrict: "A",
      require: [ "aRect", "?^^aRect" ],
      controller: Controller,
      scope: false,
      link: {
        pre(
          scope:       ng.IScope,
          element:     ng.IAugmentedJQuery,
          attr:        ng.IAttributes,
          controllers: Controller[]
        ): void {
          let [ctrl, parentCtrl] = controllers;
          let el = element[0];
          let options = manager.env.getRectOptions(el, true);

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
          let context = new AngularContext(manager, scope, parentCtrl);
          let options = ctrl.getOptionsWithContext(context)
          let el = element[0];
          let rect = new ElementRect(el, manager, options);
          element.on("$destroy", () => rect.destroy());
        }
      }
    }
  }

  function ManagerFactory(): Manager {
    let manager = new Manager();
    manager.attachTo(document.body, { findStyleSheets: true });
    return manager;
  }

  angular.module("absolution", []);
  angular.module("absolution").factory("absolution", ManagerFactory);
  angular.module("absolution").directive("aRect", ["absolution", Directive]);
}
