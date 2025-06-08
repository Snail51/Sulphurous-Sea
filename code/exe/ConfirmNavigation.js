// MINIFIED VERSION OF THE FILE OF THE SAME NAME IN THE `src` FOLDER
// MINIFIED WITH https://www.toptal.com/developers/javascript-minifier
// MINIFIED AT Sat May 24 17:06:58 CDT 2025

window.shouldConfirmNavigation=function(){return!!(window.audioNodes&&window.audioNodes.some(o=>!0===o.playing))},window.addEventListener("beforeunload",o=>{window.shouldConfirmNavigation()&&o.preventDefault()});