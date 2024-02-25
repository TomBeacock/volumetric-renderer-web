// Helper functions

/**
 * Clamps a value to the range [min-max]
 * @param {number} value The value to clamp
 * @param {number} min The range minimum
 * @param {number} max The range maximum
 * @returns {number} The clamped value
 */
function clamp(value, min, max) {
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
function calculateRelativePosition(element, posX, posY, clampResult = true) {
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
function rgbToHsv(r, g, b) {
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
function hsvToRgb(h, s, v) {
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
function byteToHex(b) {
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
function rgbToHex(r, g, b) {
    return byteToHex(r) + byteToHex(g) + byteToHex(b);
}

/**
 * Converts hex string into rgb values
 * @param {number} hex The hex value
 * @returns {r: number, g: number, b: number}
 */
function hexToRgb(hex) {
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
function parseRgb(rgb) {
    const split = rgb.match(/\d+/g);
    return {r: parseInt(split[0]), g: parseInt(split[1]), b: parseInt(split[2])};
}

// Setup custom elements

// Setup slider behavior
function setSliderValue(slider, value) {
    value = clamp(value, slider.min, slider.max);
    slider.value = value;
    const progress = (value / slider.max) * 100;
    slider.style.background = `linear-gradient(to right,
        var(--color-accent-0) ${progress}%,
        var(--color-slider-track) ${progress}%)`;
}

const sliders = document.getElementsByClassName("slider");
for(let i = 0; i < sliders.length; i++) {
    const slider = sliders[i];
    setSliderValue(slider, slider.value);
    slider.addEventListener("input", (event) => setSliderValue(slider, slider.value));
}

// Setup range slider behavior
const rangeSliders = document.getElementsByClassName("range-slider");
for(let i = 0; i < rangeSliders.length; i++) {
    const rangeSlider = rangeSliders[i];
    const slider1 = rangeSlider.children[0];
    const slider2 = rangeSlider.children[1];

    const min = Math.min(slider1.value, slider2.value);
    const max = Math.max(slider1.value, slider2.value);
    const minProgress = (min / slider1.max) * 100;
    const maxProgress = (max / slider1.max) * 100;
    slider1.style.background = `linear-gradient(to right,
        var(--color-slider-track) ${minProgress}%,
        var(--color-accent-0) ${minProgress}%,
        var(--color-accent-0) ${maxProgress}%,
        var(--color-slider-track) ${maxProgress}%)`;
    
    let sliderEventListener = (event) => {
        const min = Math.min(slider1.value, slider2.value);
        const max = Math.max(slider1.value, slider2.value);
        const minProgress = (min / slider1.max) * 100;
        const maxProgress = (max / slider1.max) * 100;
        slider1.style.background = `linear-gradient(to right,
            var(--color-slider-track) ${minProgress}%,
            var(--color-accent-0) ${minProgress}%,
            var(--color-accent-0) ${maxProgress}%,
            var(--color-slider-track) ${maxProgress}%)`;
        rangeSlider.dispatchEvent(new CustomEvent("valuechange", {detail: {min: min, max: max}}));
    };
    slider1.addEventListener("input", sliderEventListener);
    slider2.addEventListener("input", sliderEventListener);
}

// Setup toggle button group behavior
const toggleButtonGroups = document.getElementsByClassName("toggle-button-group");
for (let groupIndex = 0; groupIndex < toggleButtonGroups.length; groupIndex++) {
    const group = toggleButtonGroups[groupIndex];

    const buttons = group.children;
    for (let buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
        const button = buttons[buttonIndex];
        button.addEventListener("click", (event) => {
            if(!button.classList.contains("selected")) {
                const event = new CustomEvent("selectionchange", {detail: button.dataset.name})
                group.dispatchEvent(event);
            }
            for (let i = 0; i < group.children.length; i++) {
                group.children[i].classList.remove("selected");
            }
            button.classList.add("selected");
        });
    }
}

// Setup slider field behavior
function setSliderFieldValue(sliderField, value) {
    const slider = sliderField.querySelector(".slider");
    setSliderValue(slider, value);
    const label = sliderField.querySelector(".label");
    label.innerHTML = slider.value;
}

const sliderFields = document.getElementsByClassName("field-slider");
for(let i = 0; i < sliderFields.length; i++) {
    const sliderField = sliderFields[i];
    const slider = sliderField.querySelector(".slider");
    const label = sliderField.querySelector(".label");
    label.innerHTML = slider.value;
    slider.addEventListener("input", (event) => {
        label.innerHTML = slider.value;
        sliderField.dispatchEvent(new CustomEvent("valuechange", {detail: {value: slider.value}}));
    });
}

// Setup range slider field behavior
const rangeSliderFields = document.getElementsByClassName("field-range-slider");
for(let i = 0; i < rangeSliderFields.length; i++) {
    const rangeSliderField = rangeSliderFields[i];
    const rangeSlider = rangeSliderField.getElementsByClassName("range-slider")[0];
    const sliders = rangeSlider.getElementsByTagName("input");
    const min = Math.min(sliders[0].value, sliders[1].value);
    const max = Math.max(sliders[0].value, sliders[1].value);
    const labels = rangeSliderField.getElementsByClassName("label");
    labels[0].innerHTML = min;
    labels[1].innerHTML = max;

    rangeSlider.addEventListener("valuechange", (event) => {
        labels[0].innerHTML = event.detail.min;
        labels[1].innerHTML = event.detail.max;
        rangeSliderField.dispatchEvent(new CustomEvent("valuechange", {detail: {min: min, max: max}}));
    });
}

// Setup popup behavior
function showPopup(popup) {
    const closePopupListener = (event) => {
        if(!popup.contains(event.target)){
            popup.style.display = "none";
            document.body.removeEventListener("mousedown", closePopupListener);
        }
    };
    document.body.addEventListener("mousedown", closePopupListener, {capture: true});
    popup.style.display = "";
}

// Setup color picker behaviour
const colorPicker = document.getElementById("color-picker");
const colorArea = colorPicker.querySelector(".color-area");
const colorAreaThumb = colorArea.querySelector(".thumb");
const colorHueSlider = colorPicker.querySelector(".slider-hue");

colorPicker.style.display = "none";
colorAreaThumb.style.background = "white";
colorAreaThumb.style.left = 0;
colorAreaThumb.style.top = 0;

function showColorPicker(element, changeListener, color) {
    // Set color picker position
    const rect = element.getBoundingClientRect();
    colorPicker.style.left = `${rect.right + 8}px`;
    colorPicker.style.top = `${rect.top}px`;

    // Set color
    const hsv = rgbToHsv(color.r, color.g, color.b);
    colorAreaThumb.style.left = `${hsv.s}%`;
    colorAreaThumb.style.top = `${100 - hsv.v}%`;
    colorHueSlider.value = hsv.h;
    colorArea.style.background =
        `linear-gradient(to top, black 0%, transparent 100%),
        linear-gradient(to right, #ffffff 0%, hsl(${hsv.h}, 100%, 50%) 100%)`;
    colorAreaThumb.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

    // Setup events
    colorPicker.addEventListener("valuechange", changeListener);
    colorPicker.addEventListener("mousedown", (event) => event.stopPropagation());
    document.addEventListener("mousedown", (event) => {
        colorPicker.removeEventListener("valuechange", changeListener);
        colorPicker.style.display = "none";
    });

    // Show color picker
    showPopup(colorPicker);
}

function updateColorPicker() {
    const hue = colorHueSlider.value;
    const saturation = parseFloat(colorAreaThumb.style.left);
    const value = 100.0 - parseFloat(colorAreaThumb.style.top);
    const color = hsvToRgb(hue, saturation, value);

    colorArea.style.background =
        `linear-gradient(to top, black 0%, transparent 100%),
        linear-gradient(to right, #ffffff 0%, hsl(${hue}, 100%, 50%) 100%)`;
    colorAreaThumb.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
    
    colorPicker.dispatchEvent(new CustomEvent("valuechange", {detail: {color: color}}))
}

colorArea.addEventListener("mousedown", (event) => {
    // Jump thumb to click
    const relPos = calculateRelativePosition(colorAreaThumb.parentElement, event.clientX, event.clientY);
    colorAreaThumb.style.left = `${relPos.x * 100}%`;
    colorAreaThumb.style.top = `${relPos.y * 100}%`;
    updateColorPicker();
    
    // Handle thumb drag
    let thumbMoveHandler = function(event) {
        event.preventDefault();
        const relPos = calculateRelativePosition(colorAreaThumb.parentElement, event.clientX, event.clientY);
        colorAreaThumb.style.left = `${relPos.x * 100}%`;
        colorAreaThumb.style.top = `${relPos.y * 100}%`;
        updateColorPicker();
    };

    // Handle thumb drag end
    let thumbReleasedHandler = function(event) {
        document.removeEventListener("mousemove", thumbMoveHandler);
        document.removeEventListener("mouseup", thumbReleasedHandler);
    }
    document.addEventListener("mousemove", thumbMoveHandler);
    document.addEventListener("mouseup", thumbReleasedHandler);
});

colorHueSlider.addEventListener("input", (event) => updateColorPicker());

// Setup gradient field behavior
const gradientFields = document.getElementsByClassName("field-gradient");
for(let i = 0; i < gradientFields.length; i++) {
    const gradientField = gradientFields[i];
    const gradient = gradientField.querySelector(".gradient");

    if(gradient.dataset.format === "rgb") {
        const colorField = gradientField.querySelector(".field-color");
        gradient.addEventListener("activemarkerchange", (event) => {
            const color = parseRgb(event.detail.marker.style.backgroundColor);
            setColorFieldColor(colorField, color);
        });
        colorField.addEventListener("valuechange", (event) => {
            setGradientMarkerColor(gradient, event.detail.color);
        });
    } else if(gradient.dataset.format === "a") {
        const opacityField = gradientField.querySelector(".field-slider");
        gradient.addEventListener("activemarkerchange", (event) => {
            const color = parseRgb(event.detail.marker.style.backgroundColor);
            const a = Math.round((color.r / 255) * 100);
            setSliderFieldValue(opacityField, a);
        });
        opacityField.addEventListener("valuechange", (event) => {
            const a = Math.round((event.detail.value / 100) * 255);
            setGradientMarkerColor(gradient, {r: a, g: a, b: a});
        });
    }
    gradient.addEventListener("gradientchange", (event) =>
        gradientField.dispatchEvent(new CustomEvent("valuechange", {detail: {data: event.detail.data}}))
    );
}

// Setup gradient behavior
function setGradientMarkerColor(gradient, color) {
    const hex = rgbToHex(color.r, color.g, color.b);
    const markers = gradient.querySelectorAll(".marker");
    for(let i = 0; i < markers.length; i++) {
        const marker = markers[i];
        if(marker.classList.contains("active")) {
            marker.style.backgroundColor = `#${hex}`;
            break;
        }
    }
    recalculateGradient(gradient);
}

function getMarkerData(gradient) {
    const markers = gradient.querySelectorAll(".marker");
    const markerData = [];
    for(let markerIndex = 0; markerIndex < markers.length; markerIndex++) {
        const marker = markers[markerIndex];
        markerData.push({percent: parseFloat(marker.style.left), color: marker.style.backgroundColor});
    }
    markerData.sort((a, b) => {return a.percent - b.percent});
    return markerData;
}

function recalculateGradient(gradient) {
    const markers = getMarkerData(gradient);
    let linearGradient = "";
    for(let i = 0; i < markers.length; i++) {
        const data = markers[i];
        linearGradient += `, ${data.color} ${data.percent}%`;
    }
    gradient.style.background = `linear-gradient(to right${linearGradient})`;
    gradient.dispatchEvent(new CustomEvent("gradientchange", {detail: {data: markers}}));
}

function sampleGradient(gradient, percent) {
    const markers = getMarkerData(gradient);
    let i = 0;
    while(i < markers.length) {
        if(markers[i].percent > percent) {
            break;
        }
        i++;
    }
    const c1 = parseRgb(markers[i - 1].color);
    const c2 = parseRgb(markers[i].color);
    const t2 = (percent - markers[i - 1].percent) / 100;
    return {
        r: Math.round(c1.r + (c2.r - c1.r) * t2),
        g: Math.round(c1.g + (c2.g - c1.g) * t2),
        b: Math.round(c1.b + (c2.b - c1.b) * t2),
    }
}

const gradients = document.getElementsByClassName("gradient");
for(let i = 0; i < gradients.length; i++) {
    const gradient = gradients[i];
    const track = gradient.querySelector(".track");

    function activateMarker(marker) {
        deactivateAllMarkers();
        marker.classList.add("active");
        gradient.dispatchEvent(new CustomEvent("activemarkerchange", {detail:{marker: marker}}));
    }

    function deactivateAllMarkers() {
        const markers = track.querySelectorAll(".marker");
        for(let markerIndex = 0; markerIndex < markers.length; markerIndex++) {
            const marker = markers[markerIndex];
            marker.classList.remove("active");
        }
    }

    function addMarker(percent, fixed = false, color = null) {
        const marker = document.createElement("div");

        // Setup style
        marker.classList.add("marker");
        marker.style.left = `${percent}%`
        if (color == null) {
            color = sampleGradient(gradient, percent);
        }
        marker.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
        activateMarker(marker);
        
        // Setup behavior
        marker.addEventListener("mousedown", (event) => {
            event.stopPropagation();
            activateMarker(marker);
            if(!fixed) {
                let markerMoveHandler = function(event) {
                    event.preventDefault();
                    const relPos = calculateRelativePosition(track, event.clientX, 0);
                    marker.style.left = `${relPos.x * 100}%`;
                    recalculateGradient(gradient);
                };
                let markerReleasedHandler = function(event) {
                    document.removeEventListener("mousemove", markerMoveHandler);
                    document.removeEventListener("mouseup", markerReleasedHandler);
                }
                document.addEventListener("mousemove", markerMoveHandler);
                document.addEventListener("mouseup", markerReleasedHandler);
            }
        });
        
        track.appendChild(marker);
        recalculateGradient(gradient);
    }

    // Setup track behavior
    gradient.addEventListener("mousemove", (event) => {
    });

    gradient.addEventListener("mousedown", (event) => {
        const relPos = calculateRelativePosition(track, event.clientX, 0);
        addMarker(relPos.x * 100);
    });

    // Add initial markers
    addMarker(0, true, {r: 0, g: 0, b: 0});
    addMarker(100, true, {r: 255, g: 255, b: 255});
}


// Setup color field behavior
function setColorFieldColor(colorField, color) {
    const colorBlock = colorField.querySelector(".color-block");
    colorBlock.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
    const label = colorField.querySelector(".label");
    label.innerHTML = rgbToHex(color.r, color.g, color.b).toUpperCase();
}

const colorFields = document.getElementsByClassName("field-color");
for(let i = 0; i < colorFields.length; i++) {
    const colorField = colorFields[i];
    const colorBlock = colorField.querySelector(".color-block");

    const colorPickerChangeListener = (event) => {;
        const color = event.detail.color;
        setColorFieldColor(colorField, color);
        colorField.dispatchEvent(new CustomEvent("valuechange", {detail:{color: color}}));
    };

    colorBlock.addEventListener("click", (event) => {
        const color = parseRgb(colorBlock.style.backgroundColor);
        showColorPicker(colorField, colorPickerChangeListener, color);
    });
}