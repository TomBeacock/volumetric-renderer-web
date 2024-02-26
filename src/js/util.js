/**
 * Clamps a value to the range [min-max]
 * @param {number} value The value to clamp
 * @param {number} min The range minimum
 * @param {number} max The range maximum
 * @returns {number} The clamped value
 */
export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

/**
 * Calculates a position relative to an elements position and size.
 * Value can be clamped withing the bounds of the rect [0, 1]
 * Returns x, y relative coordinates
 *
 * @param {HTMLElement} element The relative element
 * @param {number} posX The global X position
 * @param {number} posY The global Y position
 * @param {bool} clampResult Should the resulting position be clamped
 * @return {x: number, y: number} The relative X, Y position
 */
export function calculateRelativePosition(element, posX, posY, clampResult = true) {
    const rect = element.getBoundingClientRect();
    let percentX = (posX - rect.left) / rect.width;
    let percentY = (posY - rect.top) / rect.height;
    if(clampResult) {
        percentX = clamp(percentX, 0.0, 1.0);
        percentY = clamp(percentY, 0.0, 1.0);
    }
    return {x: percentX, y: percentY};
}

/**
 * Converts an RGB color value to HSV.
 * Assumes r, g, and b [0, 255].
 * Returns h [0-360], s [0-100], and v [0-100].
 *
 * @param {number} r The red color value
 * @param {number} g The green color value
 * @param {number} b The blue color value
 * @return {h: number, s: number: v: number} The HSV representation
 */
export function rgbToHsv(r, g, b) {
    r /= 255, g /= 255, b /= 255;
  
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
  
    let d = max - min;
    s = max == 0 ? 0 : d / max;
  
    if (max == min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
  
      h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
  }

/**
 * Converts an HSV color value to RGB.
 * Assumes h [0, 360], s [0, 100], and v [0, 100].
 * Returns r, g, and b [0, 255].
 *
 * @param {number} h The hue
 * @param {number} s The saturation
 * @param {number} v The value
 * @return {{r: number, g: number, b: number}} The RGB representation
 */
export function hsvToRgb(h, s, v) {
    h /= 360;
    s /= 100;
    v /= 100;
    let r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * Converts byte [0-255] into two digit hex string
 * @param {number} b The byte value
 * @returns {string} Two digit hex string
 */
export function byteToHex(b) {
    let hex = b.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

/**
 * Converts r, g, and b value [0-255] to hex string
 * @param {number} r The r value
 * @param {number} g The g value
 * @param {number} b The b value
 * @returns {string}
 */
export function rgbToHex(r, g, b) {
    return byteToHex(r) + byteToHex(g) + byteToHex(b);
}

/**
 * Converts hex string into rgb values
 * @param {number} hex The hex value
 * @returns {r: number, g: number, b: number}
 */
export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Parse rgb string "rgb(r, g, b)" into 
 * component parts
 * @param {string} rgb 
 * @returns {r: number, g: number, b: number}
 */
export function parseRgb(rgb) {
    const split = rgb.match(/\d+/g);
    return {r: parseInt(split[0]), g: parseInt(split[1]), b: parseInt(split[2])};
}