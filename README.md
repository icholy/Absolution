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

### Use expressions

``` css
#B {
	left: A.right + B.width / 2;
}
```

### Use JavaScript variables inside expressions

``` css
#B {
	width: x * A.height;
}
```

``` js
manager.assign("x", 100);
```

### Use JavaScript functions inside expressions

``` js
manager.funcs(Math, "Math");
```

``` css
#foo {
  left:  B.right + Math.sin(x) * 100px;
  width: C.height - Math.min(A.height, 200px);
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

# Setup

The `Absolution.Manager` is how the user interacts with the system.

```
let manager = new Absolution.Manager();

// assign variables and attach functions

manager.initialize();
```

By default, the manager will walk the entire DOM and `register` Elements which have an `a-rect` or `a-style` attribute.
This behaviour is configured via an options object passed into the `initialize` method.

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

``` json
{
  findStyleSheets: true,
  findElements:    true
}
```

## Manually managing Element life-cycle

Element life-cycle can be manually managed using the `register` and `unregister` methods on the `Manager`.

``` js
manager.register(element);
manager.unregister(element);
```
