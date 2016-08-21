# Absolution.js

> Position elements the way you've always wanted to.


### Center in another element.

``` html
<div id="A" a-rect>A</div>
<div a-center-in="A">B</div>
```

### Anchor the element to another

``` html
<div a-id="A">A</div>
<div a-left="A.right">B</div>
```

### Use expressions

``` html
<div a-id="A">A</div>
<div id="B" a-left="A.right + B.width / 2">B</div>
```

### Use JavaScript variables inside expressions

``` html
<div id="A" a-width="x * A.height">A</div>
```

``` js
layout.assign("x", 100);
```

### Use JavaScript functions inside expressions

``` js
layout.system.func("cos", x => Math.cos(x));
layout.system.func("min", (a, b) => Math.min(a, b));
```

### Declare your rules separately.

``` html
<script type="text/absolution">
  #foo {
    left:  B.right + sin(x) * 100px;
    width: C.height - min(A.height, 200px);
  }
</script>
```

# Attributes

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
* `fill`
* `size`
* `watch`

# Special Attributes

* `a-id`
* `a-rect`

# Special Rects

* `viewport`
* `body`
* `document`
