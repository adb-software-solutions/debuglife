export const toggleTheme = (): void => {
    const htmlElement = document.documentElement;

    if (htmlElement.getAttribute("data-theme") === "light") {
        htmlElement.setAttribute("data-theme", "dark");
    } else {
        htmlElement.setAttribute("data-theme", "light");
    }
};
