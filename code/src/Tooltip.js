document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[title].META-L, [title].META-R").forEach((element, index) => {
        element.addEventListener("click", (event) => {
            alert(event.srcElement.title);
        }, true);
    });
});