import * as Util from "./util.js";

// Slider
export function setSliderValue(slider, value) {
    value = Util.clamp(value, slider.min, slider.max);
    slider.value = value;
    const progress = ((value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(to right,
        var(--color-primary) ${progress}%,
        var(--color-slider-track) ${progress}%)`;
}

// Slider field
export function setSliderFieldValue(sliderField, value) {
    const slider = sliderField.querySelector(".slider");
    setSliderValue(slider, value);
    const label = sliderField.querySelector(".label");
    label.innerHTML = slider.value;
}

export function setSliderFieldRange(sliderField, min, max) {
    const slider = sliderField.querySelector(".slider");
    slider.min = min;
    slider.max = max;
    setSliderFieldValue(sliderField, slider.value);
    const label = sliderField.querySelector(".label");
    const maxLength = Math.max(min.length, max.length);
    label.style.width = `${maxLength}ch`
}

// Toggle button
export function setToggleButtonOn(toggleButton, on) {
    if(on) {
        toggleButton.classList.add("on");
    } else {
        toggleButton.classList.remove("on");
    }
}

// Progress Bar
export function setProgressBarProgress(progressBar, progress) {
    const bar = progressBar.querySelector(".bar");
    bar.style.width = `${progress}%`;
}

// Gradient field
export function getMarkerData(gradient) {
    const markers = gradient.querySelectorAll(".marker");
    const markerData = [];
    for(let markerIndex = 0; markerIndex < markers.length; markerIndex++) {
        const marker = markers[markerIndex];
        markerData.push({percent: parseFloat(marker.style.left), color: marker.style.backgroundColor});
    }
    markerData.sort((a, b) => {return a.percent - b.percent});
    return markerData;
}

export function sampleGradient(gradient, percent) {
    const markers = getMarkerData(gradient);
    let i = 0;
    while(i < markers.length) {
        if(markers[i].percent > percent) {
            break;
        }
        i++;
    }
    const c1 = Util.parseRgb(markers[i - 1].color);
    const c2 = Util.parseRgb(markers[i].color);
    const t2 = (percent - markers[i - 1].percent) / 100;
    return {
        r: Math.round(c1.r + (c2.r - c1.r) * t2),
        g: Math.round(c1.g + (c2.g - c1.g) * t2),
        b: Math.round(c1.b + (c2.b - c1.b) * t2),
    }
}

// Model
export function showModel(model) {
    const modelContainer = document.getElementById("model-container");
    modelContainer.style.display = "";
    for(let i = 0; i < modelContainer.children; i++) {
        const child = modelContainer.children[i];
        child.style.display = "none";
    }
    model.style.display = "";
}

export function closeModel(model) {
    const modelContainer = document.getElementById("model-container");
    modelContainer.style.display = "none";
    model.style.display = "none";
}

// Player progress field
export function setPlayerProgressFieldValue(playerProgressField, value) {
    const frameLabel = playerProgressField.querySelector(".label");
    const progressSlider = playerProgressField.querySelector(".slider");
    frameLabel.innerHTML = parseInt(value) + 1;
    setSliderValue(progressSlider, value);
}

export function setPlayerProgressFieldCount(playerProgressField, count) {
    const labels = playerProgressField.querySelectorAll(".label");
    labels[1].innerHTML = count;
    const chars = count.toString().length;
    labels[0].style.width = `${chars}ch`;
    labels[1].style.width = `${chars}ch`;
    const progressSlider = playerProgressField.querySelector(".slider");
    progressSlider.max = parseInt(count) - 1;
    setSliderValue(progressSlider, progressSlider.value);
}

// Player
export function getPlayerFrame(player) {
    return parseInt(player.dataset["frame"]);
}

export function getPlayerFrameCount(player) {
    return parseInt(player.dataset["frameCount"]);
}

export function isPlayerPlaying(player) {
    return player.dataset.playing === "true";
}

export function isPlayerReversed(player) {
    return player.dataset.reverse === "true";
}

export function isPlayerRepeating(player) {
    return player.dataset.repeat === "true";
}

export function setPlayerPlaying(player, playing) {
    player.dataset["playing"] = playing;
    const playPauseButton = document.getElementById("play-pause-button");
    setToggleButtonOn(playPauseButton, playing);
}

export function setPlayerFrame(player, frame) {
    player.dataset["frame"] = frame;
    const playerProgressField = player.querySelector(".field-player-progress");
    setPlayerProgressFieldValue(playerProgressField, frame);
}

export function setPlayerFrameCount(player, frameCount) {
    player.dataset["frameCount"] = frameCount;
    const playerProgressField = player.querySelector(".field-player-progress");
    setPlayerProgressFieldCount(playerProgressField, frameCount);
}