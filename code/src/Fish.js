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
    newFish.style.marginLeft = `${(Math.random() * window.innerWidth).toFixed(2)}%`;
    newFish.setAttribute("swimSpeed", speed + (Math.random()-0.5));
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
    newFish.setAttribute("swimDirection", direction);

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

    window.setInterval(() => { window.moveFish() }, 50);
}

window.moveFish = function () {
    Array.from(document.querySelectorAll(".fish")).forEach((element, index) => {
        var currentOffset = Number.parseFloat(element.style.marginLeft);
        var swimSpeed = Number.parseFloat(element.getAttribute("swimSpeed"));
        var swimDirection = element.getAttribute("swimDirection") == "right" ? 1 : -1;

        var newOffset = !isNaN(currentOffset) ? currentOffset + (swimSpeed * swimDirection) : 0.5;

        if(newOffset > 1.2 * window.innerWidth)
        {
            newOffset -= 1.39 * window.innerWidth;
        }
        if(newOffset < -0.2 * window.innerWidth)
        {
            newOffset += 1.39 * window.innerWidth;
        }

        element.style.marginLeft = `${newOffset}px`;
    });
}