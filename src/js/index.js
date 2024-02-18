// Page behavior for index.html

// Open file input
const openFileButton = document.getElementById("open-file-button");
openFileButton.addEventListener("click", (event) => {
    const openFileInput = document.getElementById("open-file-input");
    openFileInput.click();
});

// Setup theme switching
const themeToggleButtonGroup = document.getElementById("theme-toggle-button-group");
themeToggleButtonGroup.addEventListener("item-selected", (event) => {
    switch(event.detail) {
        case "light-mode":
            document.documentElement.classList.remove("dark-theme");
            document.documentElement.classList.add("light-theme");
            break;
        case "dark-mode":
            document.documentElement.classList.remove("light-theme");
            document.documentElement.classList.add("dark-theme");
            break;
    }
});