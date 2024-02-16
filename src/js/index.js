// Page behavior for index.html

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