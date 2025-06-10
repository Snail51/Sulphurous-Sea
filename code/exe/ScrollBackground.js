// MINIFIED VERSION OF THE FILE OF THE SAME NAME IN THE `src` FOLDER
// MINIFIED WITH https://www.toptal.com/developers/javascript-minifier
// MINIFIED AT Tue Jun 10 14:39:23 CDT 2025

const updateBackground=()=>{let e=window.scrollY,t=window.innerHeight,c=e/t;document.querySelectorAll(".background-layer").forEach((e,t)=>{.5>Math.abs(t-c)?e.classList.add("active"):e.classList.remove("active")})};let ticking=!1;window.addEventListener("scroll",()=>{ticking||(requestAnimationFrame(()=>{updateBackground(),ticking=!1}),ticking=!0)});