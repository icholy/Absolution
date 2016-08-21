# Absolution.js

> Element positioning system inspired by SICP.

### Center in another element.

``` html
<div id="A" a-rect>A</div>
<div a-style="center-in: A">B</div>
```

### Anchor the element to another

``` html
<div id="A">A</div>
<div a-style="left: A.right">B</div>
```

### Use expressions

``` html
<div id="A">A</div>
<div id="B" a-style="left: A.right + B.width / 2">B</div>
```

### Use JavaScript variables inside expressions

``` html
<div id="A" a-style="width: x * A.height">A</div>
```

``` js
manager.assign("x", 100);
```

### Use JavaScript functions inside expressions

``` js
manager.func("cos", x => Math.cos(x));
manager.func("min", (a, b) => Math.min(a, b));
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
* `size`
* `watch`

# Element Attributes

* `a-rect`
* `a-style`

# Special Rects

* `viewport`
* `body`
* `document`
