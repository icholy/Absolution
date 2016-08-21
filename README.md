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

# Attributes

* `r-id`
* `r-register`
* `r-left`
* `r-right`
* `r-top`
* `r-bottom`
* `r-width`
* `r-height`
* `r-center-x`
* `r-center-y`
* `r-center-in`
* `r-container`
* `r-align-x`
* `r-align-y`
* `r-fill`
* `r-size`


