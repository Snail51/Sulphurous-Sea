import { AudioNode } from "./AudioNode.js";

// initialization requires async steps so do a big `.then()` tree of this file
setupGlobalAudioContext().then(() => window.setupAudioTiles());

/**
 * Initialize a global AudioContext to `window.audioCTX`
 */
async function setupGlobalAudioContext() {
    window.audioCTX = new window.AudioContext();
    window.audioNodes = new Array();
}

window.createAudioTile = async function (name, src, icon, metaLeft, metaRight)
{
    // create new div object to hold the button grid and slider
    var newDiv = document.createElement("div");
    newDiv.className = "audioContainer";

    // create new AudioNode object
    var alreadyExists = null;
    for (var i = 0; i < window.audioNodes.length; i++) {
        if (window.audioNodes[i].src == src) {
            alreadyExists = i;
        }
    }
    var nodeIndex = -1;
    if (alreadyExists == null) //only create if does'nt already exist
    {
        var newNode = new AudioNode(src, window.audioCTX, newDiv);
        window.audioNodes.push(newNode);
        nodeIndex = window.audioNodes.length - 1;
    }
    else // if it does exist, just use it's index
    {
        nodeIndex = alreadyExists;
        window.audioNodes[nodeIndex].addPointer(newDiv);
    }
    const constIndex = nodeIndex;

    newDiv.audioNode = window.audioNodes[constIndex]; // attach a reference to the DOM element for duplication

    // create new button object
    var newButton = document.createElement("button");
    newButton.className = "audioButton";
    newButton.addEventListener("click", (event) => { window.audioNodes[constIndex].toggle(event); });

    // create new <p> for LEFT metadata
    var newMetaLeft = document.createElement("div");
    newMetaLeft.className = "META-L";
    newMetaLeft.title = metaLeft.split(/ ?\| ?/)[1]; // use the second group of the metadata
    newMetaLeft.innerHTML = metaLeft.split(/ ?\| ?/)[0]; // use the first group of the metadata

    // create new <i> for ICON
    var newIcon = document.createElement("div");
    newIcon.className = "ICON";
    newIcon.innerHTML = `<i class="fa-solid ${icon}"></i>`

    // create new <p> for RIGHT metadata
    var newMetaRight = document.createElement("div");
    newMetaRight.className = "META-R";
    newMetaRight.title = metaRight.split(/ ?\| ?/)[1]; // use the second group of the metadata
    newMetaRight.innerHTML = metaRight.split(/ ?\| ?/)[0]; // use the first group of the metadata

    // create new <input> of type `range`
    var newRange = document.createElement("input");
    newRange.type = "range";
    newRange.className = "SLIDER";
    newRange.addEventListener("input", (event) => window.audioNodes[constIndex].adjustVolume(2 * ((event.target.value / 100) ** 3), event.target.value));

    // create new <p> for LABEL
    var newLabel = document.createElement("div");
    newLabel.className = "LABEL";
    newLabel.innerHTML = name;

    // insert the elements into the div
    newButton.appendChild(newMetaLeft);
    newButton.appendChild(newIcon);
    newButton.appendChild(newMetaRight);
    newButton.appendChild(newLabel);

    newDiv.appendChild(newButton);
    newDiv.appendChild(newRange);

    return newDiv;
}

/**
 * Parse the DOM and consume all custom <AudioTile> elements
 * The DOM elements of the <AudioTile> are populated, and an internal `AudioNode` is setup
 */
window.setupAudioTiles = async function () {
    var AudioTileDOMs = document.querySelectorAll("AudioTile");
    for (var node of AudioTileDOMs) {

        // capture DOM element attributes
        const name = node.getAttribute("name");
        const src = node.getAttribute("src");
        const icon = node.getAttribute("icon");
        const metaLeft = node.getAttribute("metaLeft");
        const metaRight = node.getAttribute("metaRight");

        // generate the AudioTile element
        var newNode = await window.createAudioTile(name, src, icon, metaLeft, metaRight);

        //console.log(newNode);

        // place the new div structure onto the DOM
        node.insertAdjacentElement("afterend", newNode);

        // remove placeholder node of type <AudioTile>
        node.remove();
    }
}