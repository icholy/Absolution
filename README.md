# Absolution.js

> Element positioning system inspired by SICP.


``` html
<div a-rect id="A"></div>
<div a-rect id="B"></div>
```

### Anchor elements to eachother

``` css
#B {
	left: A.right;
}
```

### Center in another element.

``` css
#B {
	center-in: A;	
}
```

### Basic expressions can be used.

``` css
#B {
	left: A.right + B.width / 2;
}
```

### Named variables can be set and queried from JavaScript.

``` css
#B {
	width: x * A.height;
}
```

``` js
manager.assign("x", 100);
```

### User defined functions can be added.

``` js
manager.func("fooBar", () => 200);
manager.funcs(Math, "Math");
```

``` css
#foo {
  left:  B.right + Math.sin(x) * 100px;
  width: C.height - Math.min(A.height, fooBar());
}
```

### Rules can be declared inline.

``` html
<div a-rect id="A"></div>
<div a-style="width: A.height * 3"></div>
```

### Classes are supported

``` css
.bar {
  width: B.width / A.height;
}
```

## Attributes 

* `left`
* `right`
* `top`
* `bottom`
* `width`
* `height`
* `center-x`
* `center-y`
* `center-in`
* `relative-to`
* `align-x`
* `align-y`
* `size`
* `watch`

# Element Attributes

* `a-rect`
* `a-style`

# Special Rects

* `viewport`
* `body`
* `document`

These can be used like any other rect in the system.

``` css
#item {
  center-x: viewport.center-x;
  top: 10px;
}
```

Note: user's can create custom rects by extending the `Rect` `class`.

# Setup

The `Manager` `class` is how the user interacts with the system.

``` ts
let manager = new Absolution.Manager();

// assign variables and attach functions

manager.initialize(/* options */);
```

By default, the manager will walk the entire DOM and register Elements which have an 
`a-rect` or `a-style` attribute.  This behaviour is configured via an options object passed 
into the `Manager#initialize` method.

``` ts
interface ManagerOptions {

  // Find and parser script tags with where type="text/absolution"
  findStyleSheets?: boolean;

  // Walk the dom and find elements with `a-rect` or `a-style` attributes.
  findElements?: boolean;

  // Use the selectors in the stylesheets to lookup elements in the dom.
  lookupSelectors?: boolean;

  // Provide pre-compiled rules to the env.
  envData?: EnvData;
}
```

Default Manager Options:

``` ts
{
  findStyleSheets: true,
  findElements:    true
}
```

## Manually managing Element life-cycle

Element life-cycles can be manually managed using the `Manager#register` and `Manager#unregister` methods.

``` ts
// start managing the element.
manager.register(element);

// stop managing the element.
manager.unregister(element);
```

## Pre-Compiling

> This is still a work in progress.

A cache of all source to compiled rules is kept during runtime. If you export this
data, and initialize Absolution with it, the parser doesn't need to be sent
to the client.

**Export:**
``` ts
let envData = manager.getEnv().getExportData();
```

**Import:**
``` ts
let manager = new Absolution.Manager({ envData });
```


# Angular Integration

Angular integration lets you use functions and variables from the `$scope` in your rules.

``` html
<div a-rect
     a-style="width: 100px * $index"
     ng-repeat="foo in foos">
</div>
```

# Debugging:

The simplest way to debug is to use the `System` `class`.

``` ts
window.system = manager.getSystem();
```

The `System#toString()` method will show all relationships. `toString` takes an
optional string parameters which is used to filter the resulting lines.


There is also a `System#$` property which uses a `Proxy` to provide access to
the underlying variables with support for tab completion.
