# Robin

> Position elements the way you've always wanted to.


### Center in another element.

``` html
<div id="A" r-register>A</div>
<div r-center-in="A">B</div>
```

### Anchor the element to another

``` html
<div r-id="A">A</div>
<div r-left="A.right">B</div>
```

### Use expressions

``` html
<div r-id="A">A</div>
<div id="B" r-left="A.right + B.width / 2">B</div>
```

### Use JavaScript variables inside expressions

``` html
<div id="A" r-width="x * A.height">A</div>
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
<script type="text/robin">
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
* `container`
* `align-x`
* `align-y`
* `fill`
* `size`
* `watch`

# Special Attributes

* `r-id`
* `r-register`

# Special Rects

* `viewport`
* `body`
* `document`
