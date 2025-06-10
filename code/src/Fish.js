// runtime initialization
window.addEventListener("DOMContentLoaded", () => {

    // setup static <Fish>
    console.log("Initializing all static <Fish>");
    window.setupStaticFish();
    console.debug("All static <Fish> initialized.");

    // make sure the fish container is the size of the document
    document.querySelector(".fish-container").style.height = `${document.documentElement.scrollHeight}px`;

    // set up <Fish> dynamically from instantiation script
    window.setupDynamicFish();
});

/**
 * create the <img> that represents a fish object, set it up, and return it.
 * @param {string} sprite - URI reference to animated sprite (.gif)
 * @param {string} depth - distance down the document to place the sprite (given as `#vh`)
 * @param {float} speed - how much the object should move relative to the current time. Unit label N/A.
 * @param {string} direction - controls the direction the object will move. Available options: ["right", "left", "random"]
 * @returns {element} - <img class="fish"> with all attributes and styles set
 */
window.createFish = function (sprite, depth = "10vh", speed = 1.0, direction = "right", spin = false, rotate = 0) {
    var newFish = document.createElement("img");
    newFish.src = sprite;
    newFish.className = "fish";
    newFish.style.left = "-100vw"; // start the fish very far off screen until CSS animations can kick in
    newFish.style.top = `${(Number.parseFloat(depth)).toFixed(2)}vh`; // move the fish down to it's depth
    speed = Number.parseFloat((speed + (((Math.random()/2) - 0.25) * speed)).toFixed(2)); // fish may go 25% faster or slower than the target
    var offset = Number.parseFloat((speed * Math.random()).toFixed(2)); // offset is some amount of the speed
    if (direction == "random") // resolve "random" direction into either left or right
    {
        var rand = Math.round(Math.random());
        if (rand == 0) {
            direction = "right";
        }
        else {
            direction = "left";
        }
    }

    // apply swimming animations
    if (direction == "right") {
        newFish.style.animation = `swim-right ${speed}s linear ${offset}s infinite forwards`;
    }
    if (direction == "left") {
        newFish.style.animation = `swim-right ${speed}s linear ${offset}s infinite reverse`;
    }

    // scale the fish once loaded (based on element.naturalWidth / element.naturalHeight)
    newFish.onload = (event) =>
    {
        let vmin = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
        let scaleFactor = Number.parseFloat((vmin / 360).toFixed(2));
        let oldWidth = event.target.naturalWidth;
        let oldHeight = event.target.naturalHeight;
        console.log(scaleFactor, oldWidth, oldHeight);
        event.target.style.width = `${oldWidth * scaleFactor}px`;
        event.target.style.height = `${oldHeight * scaleFactor}px`;
    }
    

    // apply spinning animations (if requested)
    console.log(`spin = ${spin}`);
    if (spin)
    {
        newFish.style.animation += `, ${direction === "right" ? "spin-clockwise" : "spin-clockwise-while-flipped"} 8s linear ${offset}s infinite ${Math.round(Math.random()) == 0 ? "forwards" : "reverse"}`;
        console.log(newFish.style.animation);
    }
    else
    {
        if(direction === "left") // we still need to flip the fish if it is swimming left and not spinning
        {
            newFish.style.transform += " scaleX(-1)";
        }
        console.log(rotate);
        if(rotate != 0)
        {
            newFish.style.transform += ` rotate(${rotate}deg)`;
        }
    }



    return newFish;
}

/**
 * find all elements on the document with class ".fish" and move them based on the element's attribute and the current time
 */
window.moveFish = function () {
    return;

    const now = Date.now(); // calc just once to improve efficiency
    const width = window.innerWidth; // calc just once to improve efficiency

    Array.from(document.querySelectorAll(".fish")).forEach((element, index) => {
        var swimOffset = Number.parseFloat(element.getAttribute("swimOffset"));
        var swimSpeed = Number.parseFloat(element.getAttribute("swimSpeed"));
        var swimDirection = element.getAttribute("swimDirection") == "right" ? 1 : -1;

        var newOffset = (((now + (width * swimOffset)) / (1000 / swimSpeed)) % (width * 1.4)) - (width * 0.2);

        // if swimming to the left (-1), take the difference from width*1 to invert it
        if (swimDirection === -1) {
            newOffset = (width * 1) - newOffset;
        }

        element.style.marginLeft = `${newOffset}px`;
    });
}

/**
 * Parse the DOM and consume all custom <AudioTile> elements
 * The DOM elements of the <AudioTile> are populated, and an internal `AudioNode` is setup
 */
window.setupStaticFish = function () {
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

/**
 * Runtime instantiation function to populate the document with various random fish with different speeds/depths based on a dictionary of allowed values
 */
window.setupDynamicFish = function () {
    var debug = [
        { "sprite": "./sprites/exe/SulphurousSea/Trasher.gif", "mindepth": 75, "maxdepth": 100, "speed": 50.0, "direction": "right", "spin": true },
    ]

    var surface = [
        { "sprite": "./sprites/exe/SulphurousSea/Toxicatfish.gif", "mindepth": 30, "maxdepth": 100, "speed": 20.0, "direction": "random" },
        { "sprite": "./sprites/exe/SulphurousSea/AquaticUrchin.gif", "mindepth": 30, "maxdepth": 100, "speed": 40.0, "direction": "random", "spin": true },
        { "sprite": "./sprites/exe/SulphurousSea/Sulflounder.gif", "mindepth": 30, "maxdepth": 100, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/SulphurousSea/Trasher.gif", "mindepth": 30, "maxdepth": 100, "speed": 20.0, "direction": "random" },
        { "sprite": "./sprites/exe/SulphurousSea/AquaticStarMinion.gif", "mindepth": 30, "maxdepth": 100, "speed": 40.0, "direction": "random", "spin": true },
        { "sprite": "./sprites/exe/SulphurousSea/BloodwormNormal.gif", "mindepth": 30, "maxdepth": 100, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/SulphurousSea/HerringMinion.gif", "mindepth": 30, "maxdepth": 100, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/SulphurousSea/Mauler.gif", "mindepth": 30, "maxdepth": 100, "speed": 35.0, "direction": "random" },
        { "sprite": "./sprites/exe/SulphurousSea/MutatedTruffleMinion.gif", "mindepth": 30, "maxdepth": 100, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/SulphurousSea/Orthocera.gif", "mindepth": 30, "maxdepth": 100, "speed": 30.0, "direction": "random", "rotate": -30 },
        { "sprite": "./sprites/exe/SulphurousSea/Skyfin.gif", "mindepth": 30, "maxdepth": 100, "speed": 25.0, "direction": "random" },
        { "sprite": "./sprites/exe/SulphurousSea/SlitheringEel.gif", "mindepth": 30, "maxdepth": 100, "speed": 20.0, "direction": "random" },
        { "sprite": "./sprites/exe/SulphurousSea/SulphurousSharkron.gif", "mindepth": 30, "maxdepth": 100, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/SulphurousSea/Trilobite.gif", "mindepth": 30, "maxdepth": 100, "speed": 40.0, "direction": "random" },
    ];

    var abyss1 = [
        { "sprite": "./sprites/exe/Abyss1/AquaticUrchin.gif", "mindepth": 100, "maxdepth": 200, "speed": 40.0, "direction": "random", "spin": true },
        { "sprite": "./sprites/exe/Abyss1/BabyCannonballJellyfish.gif", "mindepth": 100, "maxdepth": 200, "speed": 40.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss1/BoxJellyfish.gif", "mindepth": 100, "maxdepth": 200, "speed": 40.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss1/MorayEel.gif", "mindepth": 100, "maxdepth": 200, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss1/Sulflounder.gif", "mindepth": 100, "maxdepth": 200, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss1/ToxicMinnow.gif", "mindepth": 100, "maxdepth": 200, "speed": 30.0, "direction": "random" },
    ];

    var abyss2 = [
        { "sprite": "./sprites/exe/Abyss2/ToxicMinnow.gif", "mindepth": 200, "maxdepth": 300, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss2/Cuttlefish.gif", "mindepth": 200, "maxdepth": 300, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss2/Laserfish.gif", "mindepth": 200, "maxdepth": 300, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss2/LuminousCorvina.gif", "mindepth": 200, "maxdepth": 300, "speed": 20.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss2/Viperfish.gif", "mindepth": 200, "maxdepth": 300, "speed": 20.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss2/Oarfish.gif", "mindepth": 200, "maxdepth": 300, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss2/BlackAnurianPlankton.gif", "mindepth": 200, "maxdepth": 300, "speed": 40.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss2/HerringMinion.gif", "mindepth": 200, "maxdepth": 300, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss2/Lionfish.gif", "mindepth": 200, "maxdepth": 300, "speed": 30.0, "direction": "random", "rotate": -30 },
        { "sprite": "./sprites/exe/Abyss2/OceanSpirit.gif", "mindepth": 200, "maxdepth": 300, "speed": 20.0, "direction": "random" },
    ];

    var abyss3 = [
        { "sprite": "./sprites/exe/Abyss3/ChaoticPuffer.gif", "mindepth": 300, "maxdepth": 400, "speed": 40.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss3/DevilFish.gif", "mindepth": 300, "maxdepth": 400, "speed": 20.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss3/GiantSquid.gif", "mindepth": 300, "maxdepth": 400, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss3/ColossalSquid.gif", "mindepth": 300, "maxdepth": 400, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss3/Laserfish.gif", "mindepth": 300, "maxdepth": 400, "speed": 20.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss3/MirageJelly.gif", "mindepth": 300, "maxdepth": 400, "speed": 40.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss3/Viperfish.gif", "mindepth": 300, "maxdepth": 400, "speed": 20.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss3/Oarfish.gif", "mindepth": 300, "maxdepth": 400, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss3/GulperEel.gif", "mindepth": 300, "maxdepth": 400, "speed": 20.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss3/CalamarisLamentMinion.gif", "mindepth": 300, "maxdepth": 400, "speed": 20.0, "direction": "random" },
    ];

    var abyss4 = [
        { "sprite": "./sprites/exe/Abyss4/Bloatfish.gif", "mindepth": 400, "maxdepth": 500, "speed": 40, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss4/ColossalSquid.gif", "mindepth": 400, "maxdepth": 500, "speed": 30.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss4/ReaperShark.gif", "mindepth": 400, "maxdepth": 500, "speed": 20.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss4/GulperEel.gif", "mindepth": 400, "maxdepth": 500, "speed": 20.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss4/EidolonWyrm.gif", "mindepth": 400, "maxdepth": 500, "speed": 20.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss4/EidolonSnail.gif", "mindepth": 400, "maxdepth": 500, "speed": 40.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss4/HadalUrnIsopod.gif", "mindepth": 400, "maxdepth": 500, "speed": 35.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss4/HadalUrnJellyfish.gif", "mindepth": 400, "maxdepth": 500, "speed": 40.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss4/HadalUrnLamprey.gif", "mindepth": 400, "maxdepth": 500, "speed": 20.0, "direction": "random" },
        { "sprite": "./sprites/exe/Abyss4/HadalUrnStarfish.gif", "mindepth": 400, "maxdepth": 500, "speed": 40.0, "direction": "random", "spin": true },
    ];

    function addRandomFishFromPool(pool, quantity) {
        for (var i = 0; i < quantity; i++) {
            var selection = pool[(Math.round(Math.random() * (pool.length - 1)))];
            console.log(selection);
            var depth = `${Math.random() * (selection.maxdepth - selection.mindepth) + selection.mindepth}vh`;
            var newFish = window.createFish(selection.sprite, depth, selection.speed, selection.direction, selection.spin, selection.rotate);
            document.querySelector(".fish-container").insertAdjacentElement("beforeend", newFish);
        }
    }

    //addRandomFishFromPool(debug, 10);
    addRandomFishFromPool(surface, 30);
    addRandomFishFromPool(abyss1, 35);
    addRandomFishFromPool(abyss2, 25);
    addRandomFishFromPool(abyss3, 17);
    addRandomFishFromPool(abyss4, 15);
}