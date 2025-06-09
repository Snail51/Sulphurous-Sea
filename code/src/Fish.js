// initialization requires async steps so do a big `.then()` tree of this file

window.addEventListener("DOMContentLoaded", () => {
    console.log("setting up fish now");
    window.setupFish();
});

window.createFish = function (sprite, depth, speed=1.0, direction="right")
{
    var newFish = document.createElement("img");
    newFish.src = sprite;
    newFish.className = "fish";
    newFish.style.marginTop = `${(Number.parseFloat(depth)).toFixed(2)}vh`;
    newFish.setAttribute("swimSpeed", Number.parseFloat((speed + ((Math.random()-0.5)*speed)).toFixed(2))); // fish may go 50% faster or slower than the target speed
    newFish.setAttribute("swimOffset", `${(Math.random() * Date.now()).toFixed(2)}px`)
    if(direction == "random")
    {
        var rand = Math.round(Math.random());
        if( rand == 0 )
        {
            direction = "right";
        }
        else
        {
            direction = "left";
        }
    }
    if(direction == "left")
    {
        newFish.style.transform = "scaleX(-1)";
    }
    newFish.setAttribute("swimDirection", direction);

    var vmin = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
    newFish.style.transform += ` scale(${(vmin/360)}, ${vmin/360})`;

    return newFish;
}

/**
 * Parse the DOM and consume all custom <AudioTile> elements
 * The DOM elements of the <AudioTile> are populated, and an internal `AudioNode` is setup
 */
window.setupFish = function () {
    var fishes = document.querySelectorAll("Fish");
    for (var fish of fishes) {

        // capture DOM element attributes
        const sprite = fish.getAttribute("src");
        const depth = fish.getAttribute("depth");
        const speed = fish.getAttribute("speed");
        const direction = fish.getAttribute("direction");

        // generate the AudioTile element
        var newFish = window.createFish(sprite, depth, speed, direction);

        console.log(newFish);

        // place the new div structure onto the DOM
        fish.insertAdjacentElement("afterend", newFish);

        // remove placeholder node of type <AudioTile>
        fish.remove();
    }
}

window.moveFish = function () {
    const now = Date.now(); // calc just once to improve efficiency
    const width = window.innerWidth; // calc just once to improve efficiency

    Array.from(document.querySelectorAll(".fish")).forEach((element, index) => {
        var swimOffset = Number.parseFloat(element.getAttribute("swimOffset"));
        var swimSpeed = Number.parseFloat(element.getAttribute("swimSpeed"));
        var swimDirection = element.getAttribute("swimDirection") == "right" ? 1 : -1;

        var newOffset = (((now+swimOffset)/(1000/swimSpeed)) % (width * 1.4)) - (width * 0.2);

        // if swimming to the left (-1), take the difference from width*1 to invert it
        if(swimDirection === -1)
        {
            newOffset = (width * 1) - newOffset;
        }

        element.style.marginLeft = `${newOffset}px`;
    });
}