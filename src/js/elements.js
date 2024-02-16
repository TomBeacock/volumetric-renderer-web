// Setup custom elements

// Setup slider behavior
const sliders = document.getElementsByClassName("slider");
for(let i = 0; i < sliders.length; i++) {
    const slider = sliders.item(i);      

    const progress = (slider.value / slider.max) * 100;
    slider.style.background = `linear-gradient(to right, var(--color-accent-0) ${progress}%, var(--color-slider-track) ${progress}%)`;

    slider.addEventListener("input", (event) => {
        const progress = (event.target.value / slider.max) * 100;
        slider.style.background = `linear-gradient(to right, var(--color-accent-0) ${progress}%, var(--color-slider-track) ${progress}%)`;
      });
}

// Setup range slider behavior
const rangeSliders = document.getElementsByClassName("range-slider");
for(let i = 0; i < rangeSliders.length; i++) {
    const rangeSlider = rangeSliders.item(i);
    const slider1 = rangeSlider.children[0];
    const slider2 = rangeSlider.children[1];

    const min = Math.min(slider1.value, slider2.value);
    const max = Math.max(slider1.value, slider2.value);
    const minProgress = (min / slider1.max) * 100;
    const maxProgress = (max / slider1.max) * 100;
    slider1.style.background = `linear-gradient(to right, var(--color-slider-track) ${minProgress}%, var(--color-accent-0) ${minProgress}%, var(--color-accent-0) ${maxProgress}%, var(--color-slider-track) ${maxProgress}%)`;
    
    let sliderEventListener = (event) => {
        const min = Math.min(slider1.value, slider2.value);
        const max = Math.max(slider1.value, slider2.value);
        const minProgress = (min / slider1.max) * 100;
        const maxProgress = (max / slider1.max) * 100;
        slider1.style.background = `linear-gradient(to right, var(--color-slider-track) ${minProgress}%, var(--color-accent-0) ${minProgress}%, var(--color-accent-0) ${maxProgress}%, var(--color-slider-track) ${maxProgress}%)`;;
        const inputEvent = new CustomEvent("valueChanged", {detail: {min: min, max: max}});
        rangeSlider.dispatchEvent(inputEvent);
    };
    slider1.addEventListener("input", sliderEventListener);
    slider2.addEventListener("input", sliderEventListener);
}

// Setup toggle button group behavior
const toggleButtonGroups = document.getElementsByClassName("toggle-button-group");
for (let groupIndex = 0; groupIndex < toggleButtonGroups.length; groupIndex++) {
    const group = toggleButtonGroups.item(groupIndex);

    const buttons = group.children;
    for (let buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
        const button = buttons[buttonIndex];
        button.addEventListener("click", (event) => {
            if(!button.classList.contains("selected")) {
                const event = new CustomEvent("item-selected", {detail: button.dataset.name})
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
const sliderFields = document.getElementsByClassName("field-slider");
for(let i = 0; i < sliderFields.length; i++) {
    const sliderField = sliderFields[i];
    const slider = sliderField.getElementsByClassName("slider")[0];
    const label = sliderField.getElementsByClassName("label")[0];
    label.innerHTML = slider.value;
    slider.addEventListener("input", (event) => {
        label.innerHTML = slider.value;
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

    rangeSlider.addEventListener("valueChanged", (event) => {
        labels[0].innerHTML = event.detail.min;
        labels[1].innerHTML = event.detail.max;
    });
}