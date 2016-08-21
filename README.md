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
