# JavaScript Color Layer Flattener

This little app follows the algebra set by the W3C for SVG and CSS color mixing to take up to 3 layers of color: base, background, and foreground (base is required to be opaque; the other two may be translucent) and calculate the hex value for the resulting displayed opaque color.

To use: place a div with id="jsclf-container" in your page. If the file jcslf-form.html is not at the root of your webpage, assign the container div a data-path attribute with the URL between the domain and jsclf.html. For example, for example.com/gadgets/color/jsclf.html you would use data-path="gadgets/color". Including or excluding slashes on each end is okay. Call jsclf.js sometime after the container div.

The more complicated part of the program is taking all allowed formats and syntax for colors: 3, 4, 6, and 8-digit hex values, RGB, RGBA, HSL, HSLA, percentages and raw numbers. Any of those is allowed for any of the three colors, though opacity will be converted to 100% in the base color. This is more input manipulation than I'd ever done in probably any language; I got to stretch my regex muscles.

I also set a goal of pure vanilla JavaScript for this program, with no jQuery. It was a learning experience!