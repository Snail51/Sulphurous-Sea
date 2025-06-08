window.shouldConfirmNavigation = function()
{
    if(window.audioNodes ? window.audioNodes.some(node => node.playing === true) : false)
    {
        return true;
    }
    else
    {
        return false;
    }
}

window.addEventListener("beforeunload", (event) => {
    if(window.shouldConfirmNavigation())
    {
        event.preventDefault();
        return;
    }
    else
    {
        return;
    }
});