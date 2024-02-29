import * as Util from "./util.js";
import * as ElementUtil from "./util_element.js";

// Setup custom elements

// Setup slider behavior
const sliders = document.getElementsByClassName("slider");
for(let i = 0; i < sliders.length; i++) {
    const slider = sliders[i];
    ElementUtil.setSliderValue(slider, slider.value);
    slider.addEventListener("input", (event) => ElementUtil.setSliderValue(slider, slider.value));
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

// Setup toggle button behavior
const toggleButtons = document.getElementsByClassName("toggle-button");
for(let i = 0; i < toggleButtons.length; i++) {
    const toggleButton = toggleButtons[i];
    toggleButton.addEventListener("click", (event) => {
        const on = !toggleButton.classList.contains("on");
        ElementUtil.setToggleButtonOn(toggleButton, on);
        toggleButton.dispatchEvent(new CustomEvent("toggle", {detail: {on: on}}));
    });
}

// Setup toggle button group behavior
const toggleButtonGroups = document.getElementsByClassName("toggle-button-group");
for (let i = 0; i < toggleButtonGroups.length; i++) {
    const toggleButtonGroup = toggleButtonGroups[i];

    const toggleButtons = toggleButtonGroup.querySelectorAll(".toggle-button");
    for (let j = 0; j < toggleButtons.length; j++) {
        const toggleButton = toggleButtons[j];
        toggleButton.addEventListener("toggle", (event) => {
            const on = event.detail.on;
            if(on) {
                // Turn off other
                for(let k = 0; k < toggleButtons.length; k++) {
                    const otherToggleButton = toggleButtons[k];
                    if(otherToggleButton != toggleButton && otherToggleButton.classList.contains("on")) {
                        otherToggleButton.classList.remove("on");
                        break;
                    }
                }
                toggleButtonGroup.dispatchEvent(
                    new CustomEvent("selectionchange", {detail: toggleButton.dataset.name})
                );
            } else {
                // Can't turn off self
                toggleButton.classList.add("on");
            }
        });
    }
}

// Setup slider field behavior
const sliderFields = document.getElementsByClassName("field-slider");
for(let i = 0; i < sliderFields.length; i++) {
    const sliderField = sliderFields[i];
    const slider = sliderField.querySelector(".slider");
    const label = sliderField.querySelector(".label");
    ElementUtil.setSliderFieldRange(sliderField, slider.min, slider.max);
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
        rangeSliderField.dispatchEvent(new CustomEvent("valuechange", {detail: {min: event.detail.min, max: event.detail.max}}));
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
    const hsv = Util.rgbToHsv(color.r, color.g, color.b);
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
    const color = Util.hsvToRgb(hue, saturation, value);

    colorArea.style.background =
        `linear-gradient(to top, black 0%, transparent 100%),
        linear-gradient(to right, #ffffff 0%, hsl(${hue}, 100%, 50%) 100%)`;
    colorAreaThumb.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
    
    colorPicker.dispatchEvent(new CustomEvent("valuechange", {detail: {color: color}}))
}

colorArea.addEventListener("mousedown", (event) => {
    // Jump thumb to click
    const relPos = Util.calculateRelativePosition(colorAreaThumb.parentElement, event.clientX, event.clientY);
    colorAreaThumb.style.left = `${relPos.x * 100}%`;
    colorAreaThumb.style.top = `${relPos.y * 100}%`;
    updateColorPicker();
    
    // Handle thumb drag
    let thumbMoveHandler = function(event) {
        event.preventDefault();
        const relPos = Util.calculateRelativePosition(colorAreaThumb.parentElement, event.clientX, event.clientY);
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
            const color = Util.parseRgb(event.detail.marker.style.backgroundColor);
            setColorFieldColor(colorField, color);
        });
        colorField.addEventListener("valuechange", (event) => {
            setGradientMarkerColor(gradient, event.detail.color);
        });
    } else if(gradient.dataset.format === "a") {
        const opacityField = gradientField.querySelector(".field-slider");
        gradient.addEventListener("activemarkerchange", (event) => {
            const color = Util.parseRgb(event.detail.marker.style.backgroundColor);
            const a = Math.round((color.r / 255) * 100);
            ElementUtil.setSliderFieldValue(opacityField, a);
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
    const hex = Util.rgbToHex(color.r, color.g, color.b);
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

function recalculateGradient(gradient) {
    const markers = ElementUtil.getMarkerData(gradient);
    let linearGradient = "";
    for(let i = 0; i < markers.length; i++) {
        const data = markers[i];
        linearGradient += `, ${data.color} ${data.percent}%`;
    }
    gradient.style.background = `linear-gradient(to right${linearGradient})`;
    gradient.dispatchEvent(new CustomEvent("gradientchange", {detail: {data: markers}}));
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
            color = ElementUtil.sampleGradient(gradient, percent);
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
                    const relPos = Util.calculateRelativePosition(track, event.clientX, 0);
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
        const relPos = Util.calculateRelativePosition(track, event.clientX, 0);
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
    label.innerHTML = Util.rgbToHex(color.r, color.g, color.b).toUpperCase();
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
        const color = Util.parseRgb(colorBlock.style.backgroundColor);
        showColorPicker(colorField, colorPickerChangeListener, color);
    });
}

// Setup player progress field behavior
const playerProgressFields = document.getElementsByClassName("field-player-progress");
for(let i = 0; i < playerProgressFields.length; i++) {
    const playerProgressField = playerProgressFields[i];
    const progressSlider = playerProgressField.querySelector(".slider");
    progressSlider.addEventListener("input", (event) => {
        playerProgressField.dispatchEvent(new CustomEvent("valuechange", {detail: {value: progressSlider.value}}));
    });
}

// Setup player behavior
const player = document.getElementById("player");
player.dataset["playing"] = false;
player.dataset["frame"] = 1;
player.dataset["frameCount"] = 1;
player.dataset["reverse"] = false;
player.dataset["repeat"] = false;

const playerProgressField = player.querySelector(".field-player-progress");
playerProgressField.addEventListener("valuechange", (event) => {
    ElementUtil.setPlayerFrame(player, event.detail.value);
});

const skipStartButton = document.getElementById("skip-start-button");
skipStartButton.addEventListener("click", (event) => ElementUtil.setPlayerFrame(player, 0));

const playPauseButton = document.getElementById("play-pause-button");
playPauseButton.addEventListener("toggle", (event) => ElementUtil.setPlayerPlaying(player, event.detail.on));

const skipEndButton = document.getElementById("skip-end-button");
skipEndButton.addEventListener("click", (event) => ElementUtil.setPlayerFrame(player, player.dataset["frameCount"] - 1));

const reverseButton = document.getElementById("reverse-button");
reverseButton.addEventListener("toggle", (event) => player.dataset["reverse"] = event.detail.on);

const repeatButton = document.getElementById("repeat-button");
repeatButton.addEventListener("toggle", (event) => player.dataset["repeat"] = event.detail.on);

const frameRate = 24;
const period = 1 / frameRate;
let lastTime;
function updatePlayer(time) {
    if(lastTime === undefined) {
        lastTime = time;
    }
    const delta = (time - lastTime) / 1000;
    if(ElementUtil.isPlayerPlaying(player)) {
        // Calculate how many frames have passed
        const frames = Math.floor(delta * frameRate);
        const unusedTime = delta - frames * period;
        let frame = ElementUtil.getPlayerFrame(player);

        // Update current frame
        const frameCount = ElementUtil.getPlayerFrameCount(player);
        if(ElementUtil.isPlayerReversed(player)) {
            frame -= frames;
            if(frame < 0) {
                if(ElementUtil.isPlayerRepeating(player)) {
                    frame = Util.mod(frame, frameCount);
                } else {
                    frame = 0;
                    ElementUtil.setPlayerPlaying(player, false);
                }
            }
        } else {
            frame += frames;
            if(frame >= frameCount) {
                if(ElementUtil.isPlayerRepeating(player)) {
                    frame = Util.mod(frame, frameCount);
                } else {
                    frame = frameCount - 1;
                    ElementUtil.setPlayerPlaying(player, false);
                }
            }
        }
        ElementUtil.setPlayerFrame(player, frame);

        lastTime = time - (unusedTime * 1000);
    } else {
        lastTime = time;
    }
    requestAnimationFrame(updatePlayer);
}
requestAnimationFrame(updatePlayer);