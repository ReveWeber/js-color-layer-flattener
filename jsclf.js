/* JavaScript Color Layer Flattener 
   by Rebecca Weber, rweber.net 
   see also github.com/ReveWeber */

/* Use: place a div with id="jsclf-container" in your page and call jsclf.js after it. If jsclf.html is not at the root of your site, e.g. it is at example.com/gadgets/color/jsclf.html, give the container div a data-path attribute with the intermediate part of the address; in the example, it would be data-path="gadgets/color". */

/* HELPER FUNCTIONS */

function opacify(color) {
    var exploded = color.split(',');
    exploded[3] = '1';
    return exploded.toString();
}

// from MDN by way of http://stackoverflow.com/a/18358056/3708520
function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
}

function roundColor(color) {
    var exploded = color.split(',');
    for (var i = 0; i < 3; i++) {
        exploded[i] = Math.round(exploded[i]);
    }
    exploded[3] = roundToTwo(exploded[3]);
    return exploded.toString();
}

function backToHex(color) {
    var exploded = color.split(',');
    var hexColor = '';
    for (var i = 0; i < 3; i++) {
        hexColor += parseInt(exploded[i], 10).toString(16);
    }
    return hexColor;
}

function realityCheck(color) {
    var exploded = color.split(',');
    for (var i = 0; i < 3; i++) {
        exploded[i] = Math.max(0, Math.min(255, exploded[i]));
    }
    exploded[3] = Math.max(0, Math.min(1, exploded[3]));
    return exploded.toString();
}

/* PRIMARY FUNCTIONS */

function convertToRGB(inputColor, defaultColor) {
    // set default according to parameters
    var convertedColor = (defaultColor == 'white' ? '255,255,255,1' : '255,255,255,0'),
        decimalValue, matches = [];
    // if color starts with a digit, A-F, a-f, or pound, assumes it is hex RGB/RGBA. Converts to decimal RGBA.
    if (/[#a-f\d]/i.test(inputColor.charAt(0))) {
        if (inputColor.length <= 5) {
            // 3 or 4 digit syntax
            matches = inputColor.match(/([a-f\d])([a-f\d])([a-f\d])([a-f\d])?/i);
            if (matches) {
                convertedColor = '';
                decimalValue = 0;
                for (var i = 1; i <= 3; i++) {
                    decimalValue = parseInt(matches[i], 16) + 16 * parseInt(matches[i], 16);
                    convertedColor += decimalValue.toString() + ',';
                }
                if (matches[4]) {
                    decimalValue = roundToTwo((parseInt(matches[4], 16) + 16 * parseInt(matches[4], 16)) / 255);
                    convertedColor += decimalValue.toString();
                } else {
                    convertedColor += '1';
                }
            }
        } else {
            // 6 or 8 digit syntax
            matches = inputColor.match(/([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?/i);
            if (matches) {
                convertedColor = '';
                for (var i = 1; i <= 3; i++) {
                    convertedColor += parseInt(matches[i], 16).toString() + ',';
                }
                if (matches[4]) {
                    convertedColor += roundToTwo((parseInt(matches[4], 16)) / 255).toString();
                } else {
                    convertedColor += '1';
                }
            }
        }
    }
    // if color starts with r or R, assumes it is rgb()/rgba(). Allows whole numbers and percentages for RBG; percentages or values 0-1 for A; converts to decimal, rounding as needed.
    if (/r/i.test(inputColor.charAt(0))) {
        matches = inputColor.match(/(\d*\.?\d*%|\d{1,3})[,\s]+(\d*\.?\d*%|\d{1,3})[,\s]+(\d*\.?\d*%|\d{1,3})(?:[,\s]+)?(\d*\.?\d*%|\d\.?\d*|\d?\.\d+)?/);
        if (matches) {
            convertedColor = '';
            for (var i = 1; i <= 3; i++) {
                if ('%' == matches[i].charAt(matches[i].length - 1)) {
                    matches[i] = Math.round(parseFloat(matches[i].slice(0, -1)) * 2.55);
                }
                convertedColor += matches[i].toString() + ',';
            }
            if (matches[4]) {
                if ('%' == matches[4].charAt(matches[4].length - 1)) {
                    matches[4] = parseFloat(matches[4].slice(0, -1)) / 100;
                }
                convertedColor += roundToTwo(parseFloat(matches[4]));
            } else {
                convertedColor += '1';
            }
        }
    }
    // if color starts with h or H, assumes it is hsl()/hsla() and extracts accordingly. Requires whole number for H, percent for SL, percent or 0-1 value for A. Converts to decimal RGBA, rounding as needed.
    if (/h/i.test(inputColor.charAt(0))) {
        matches = inputColor.match(/(\d{1,3})[,\s]+(\d*\.?\d*%)[,\s]+(\d*\.?\d*%)(?:[,\s]+)?(\d*\.?\d*%|\d\.?\d*|\d?\.\d+)?/);
        if (matches) {
            // ensure H is in [0, 360] & make percentage for RGB conversion
            matches[1] = (matches[1] % 360) / 360;
            // ensure SLA are in [0,1]
            var lastValue = (matches[4] ? 4 : 3);
            for (var i = 2; i <= lastValue; i++) {
                if ('%' == matches[i].toString().charAt(matches[i].length - 1)) {
                    matches[i] = parseFloat(matches[i].slice(0, -1)) / 100;
                }
                matches[i] = Math.max(0, Math.min(1, matches[i]));
            }
            matches[4] = (lastValue == 4 ? matches[4] : 1);
            // convert to RGBA and create correct format string
            // essence of following comes from Garry Tan via http://stackoverflow.com/a/9493060/3708520
            var h = matches[1],
                s = matches[2],
                l = matches[3],
                r, g, b;
            if (s === 0) {
                r = g = b = l; // achromatic
                console.log("in the s equals 0 case; l is " + l);
            } else {
                var hue2rgb = function hue2rgb(p, q, t) {
                    if (t < 0) {
                        t += 1;
                    }
                    if (t > 1) {
                        t -= 1;
                    }
                    if (t < 1 / 6) {
                        return p + (q - p) * 6 * t;
                    }
                    if (t < 1 / 2) {
                        return q;
                    }
                    if (t < 2 / 3) {
                        return p + (q - p) * (2 / 3 - t) * 6;
                    }
                    return p;
                };
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + (1 / 3));
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - (1 / 3));
            }
            convertedColor = Math.round(r * 255).toString() + ',' + Math.round(g * 255).toString() + ',' + Math.round(b * 255).toString() + ',' + matches[4].toString();
        }
    }
    // return a string of the form "r,g,b,a" where 0<=r,g,b<=255 and 0<=a<=1.
    return convertedColor;
}

function blendDownOne(upperColor, lowerColor) {
    // takes two strings of the form "r,g,b,a" and blends the colors. Assumes the alpha of the lower color is 1, so must be called in appropriate order: lower two layers and then that result with top layer.
    var upperExploded = upperColor.split(','),
        lowerExploded = lowerColor.split(','),
        mergedExploded = [];
    // premultiply the alpha of the upper color and merge with the lower
    for (var i = 0; i < 3; i++) {
        upperExploded[i] = upperExploded[i] * upperExploded[3];
        mergedExploded[i] = (1 - upperExploded[3]) * lowerExploded[i] + upperExploded[i];
    }
    // returns string of the form "r,g,b,1" where 0<=r,g,b<=255 (if either alpha is 1, the merge is, and lower alpha is 1 by assumption).
    mergedExploded[3] = 1;
    return mergedExploded.toString();
}

function computeAndPreview() {
    // convert and blend input colors, making sure they're in 0-255 bounds
    var upperColor = realityCheck(convertToRGB(document.getElementById('jsclf-top-input').value, 'clear')),
        middleColor = realityCheck(convertToRGB(document.getElementById('jsclf-middle-input').value, 'clear')),
        baseColor = realityCheck(convertToRGB(document.getElementById('jsclf-bg-input').value, 'white')),
        lowerBlended = blendDownOne(middleColor, baseColor),
        totalBlended = backToHex(roundColor(blendDownOne(upperColor, lowerBlended)));
    // have to round off or the CSS can't deal with it.
    // apply colors to preview boxes and give final color code
    var bgBox = document.getElementById('jsclf-background'),
        midBox = document.getElementById('jsclf-middle'),
        topBox = document.getElementById('jsclf-top'),
        blended = document.getElementById('jsclf-blended'),
        output = document.getElementById('jsclf-output');
    // opacify base color before applying
    bgBox.style.background = "rgba(" + opacify(baseColor) + ")";
    midBox.style.background = "rgba(" + middleColor + ")";
    topBox.style.background = "rgba(" + upperColor + ")";
    blended.style.background = "#" + totalBlended;
    output.value = "#" + totalBlended;
}

/* THE MAIN EVENT */

(function () {
    // create div with form, preview boxes, "flatten" button, output code.
    // thanks to bobince http://stackoverflow.com/a/3535356/3708520
    var container = document.getElementById('jsclf-container'),
        path,
        xhr = new XMLHttpRequest();
    if (container.hasAttribute('data-path')) {
        path = container.getAttribute('data-path');
    } else {
        path = '';
    }
    if ('/' != path.charAt(0)) {
        path = '/' + path;
    }
    if ('/' != path.charAt(path.length - 1)) {
        path = path + '/';
    }
    if ('//' == path) {
        path = '';
    }
    var ajaxUrl = path + 'jsclf-form.html';
    xhr.open('GET', ajaxUrl, true);
    xhr.onreadystatechange = function () {
        if (this.readyState !== 4) {
            return;
        }
        if (this.status !== 200) {
            return;
        }
        container.innerHTML = this.responseText;
        // watch div for leaving focus of input elements or click of "flatten" button; call computeAndPreview upon change.
        document.getElementById('jsclf-bg-input').addEventListener("blur", computeAndPreview, false);
        document.getElementById('jsclf-middle-input').addEventListener("blur", computeAndPreview, false);
        document.getElementById('jsclf-top-input').addEventListener("blur", computeAndPreview, false);
        document.getElementById('jsclf-flattener').addEventListener("click", computeAndPreview, false);
    };
    xhr.send();
})();
