export class AudioNode {
    constructor(srcURL, audioCtx, element)
    {
        this.audioCtx = audioCtx;
        this.elements = new Array();
        this.elements.push(element); // the first element that creates this node get the first slot, additional pointers are added via `this.addPointer`

        // Modifiable (public) vars
        this.playing = false;
        this.volume = 0.25;
        this.loaded = 0; // 0 = initial, 1 = loading started, 2 = data fetch complete, 3 = audio source node created, 4 = amplified audio node created, 5 = audio playback ready
        this.error = false;
    
        // Audio Source Data
        this.src = srcURL;
        this.data = new ArrayBuffer();

        // Audio Elements
        this.source; // the source audio element that emits the sound specified at the source
        this.noise; // intermediate GainNode to control volume, connects to the window.amplifier (which connects to the destination node) to actually produce the sound

        // Event Listeners for initialization and shutdown
        window.addEventListener('beforeunload', () => this.shutdown());
    }

    async load()
    {
        // start loading, change the element color
        this.loaded = 1;
        for ( var element of this.elements )
        {
            element.style.backgroundColor = "#8800cc";
        }
        this.lock();

        // Check the file exists and is readable
        async function checkFileExists(url) {
            try {
                const response = await fetch(url, { 
                method: 'HEAD', // only do a HEAD check to reduce bandwidth usage; we only want to know if it exists
                cache: 'no-store' // Prevent caching
            });

            return response.ok; // Returns true if file exists, false otherwise
            } catch (error) {
                console.error('Error checking file:', error);
                return false;
            }
        }
        var urlok = await checkFileExists(this.src);
        if(!urlok)
        {
            this.error = true;
            console.error(`Error loading ${this.src}`);
            this.elements.forEach((element, index) => {
                element.style.backgroundColor = "#ff0000"; // make it red
            });
            return;
        }

        // once we know the file exists, do the request via xmlHTTP for progress monitoring
        var holdVolume = this.elements[0].querySelectorAll(".SLIDER")[0].value; // save the old volume level so we can return to it
        var arrayBuffer;
        var xmlHTTP = new XMLHttpRequest();
        xmlHTTP.open('GET', this.src, true);
        xmlHTTP.responseType = 'arraybuffer';
        xmlHTTP.onload = function(e) {
            arrayBuffer = this.response;
        };
        xmlHTTP.onprogress = (pr) => {
            for(var element of this.elements)
            {
                element.querySelectorAll(".SLIDER")[0].value = (pr.loaded/pr.total)*100;
            }
        };
        xmlHTTP.onloadend = (e) => {
            console.debug('ArrayBuffer loaded successfully:', arrayBuffer);
        };
        xmlHTTP.send();

        // Wait for the request to complete
        await new Promise(resolve => { console.log(xmlHTTP);
            xmlHTTP.onloadend = () => resolve();
        });
        const raw = arrayBuffer;
        for(let element of this.elements)
        {
            element.querySelectorAll(".SLIDER")[0].value = holdVolume; // restore the old volume
        }
        this.loaded = 2;

        // we now have fetched the file data as an array buffer, we need to parse it
        this.data = await this.audioCtx.decodeAudioData(raw);
        this.source = await this.audioCtx.createBufferSource();
        this.source.buffer = this.data;
        this.source.loop = true;
        this.loaded = 3;

        // create an intermediate node for controlling volume
        this.noise = await this.audioCtx.createGain();
        await this.source.connect(this.noise);
        this.noise.gain.setValueAtTime(0, this.audioCtx.currentTime); // start volume at 0, playing will slide to target
        await this.noise.connect(window.amplifier);
        this.loaded = 4;

        // start and immediately stop the node (make sure it is ready to go)
        await this.source.start(); // playback cant start until user interaction
        await this.noise.disconnect();
        this.loaded = 5;

        this.unlock();
        console.debug(`${this.src} - Finished loading data for AudioNode`);
    }

    async play()
    {
        if(this.loaded == 0)
        {
            await this.load();
        }

        if(this.loaded == 5)
        {
            for ( var element of this.elements )
            {
                element.style.backgroundColor = "#999999";
            }
            this.noise.gain.setValueAtTime(0, this.audioCtx.currentTime); // ensure immediate silence
            await this.noise.connect(window.amplifier);
            this.noise.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.183); // return to target volume over 0.5 seconds (sliding) [why 0.183? - exponentially approaches target via timestamp https://webaudio.github.io/web-audio-api/#dom-audioparam-settargetattime]
            this.playing = true;
            this.cloneToPlaying(); // add this node to the recently played list
            console.debug(`${this.src} - Started Playback of AudioNode`);
            window.URIsaver.save();
        }
    }

    async stop()
    {
        if(this.loaded == 0)
        {
            await this.load();
        }

        if(this.loaded == 5)
        {
            for ( var element of this.elements )
            {
                element.style.backgroundColor = "#555555";
            }
            this.noise.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.183); // scale to silence after 0.5 seconds [why 0.183? - exponentially approaches target via timestamp https://webaudio.github.io/web-audio-api/#dom-audioparam-settargetattime]
            this.lock(); // disallow interaction until shutdown is complete
            console.debug(`${this.src} - Started Shutdown of AudioNode`);

            // after 0.5 seconds (allow for fade out), disconnect the actual node
            window.setTimeout(() => {
                this.noise.disconnect();
                this.playing = false;
                this.unlock(); // disconnection successful, re-enable interaction
                console.debug(`${this.src} - Halted Playback of AudioNode`);
                window.URIsaver.save();
            }, 1000);
        }
    }

    async toggle(event)
    {
        // check if the event just happened. If the user experiences a metadata popup, this will not be true. ( `alert()` is blocking )
        // only do this check if this is toggle from an event... not if toggled manually
        if(event)
        {
            if(!(performance.timing.navigationStart + event.timeStamp + 250 >= Date.now()))
            {
                console.debug("Alert blocked execution for too long. Aborting.");
                return;
            }
        }

        if(this.playing == false)
        {
            await this.play();
        }
        else
        {
            await this.stop();
        }
    }

    async adjustVolume(newVolume, elementValue)
    {
        this.volume = newVolume;

        // if the gain node does not yet exist, just store that value as the volume for later initialization
        this.noise ? this.noise.gain.setValueAtTime(this.volume, this.audioCtx.currentTime) : void 0;

        if(elementValue) //propagate to other pointers
        {
            for(var element of this.elements)
            {
                element.querySelectorAll(".SLIDER")[0].value = elementValue;
            }
        }
        else //fallback if 2nd parameter is not provided
        {
            for(var element of this.elements)
            {
                element.querySelectorAll(".SLIDER")[0].value = ((Math.cbrt(newVolume)))*100;
            }
            
        }
        
        // execution of window.URIsaver.save(); done by a seperate "onchange" event listener
    }

    lock()
    {
        for(var element of this.elements)
        {
            element.querySelectorAll(".audioButton")[0].setAttribute("disabled", "");
            element.querySelectorAll(".SLIDER")[0].setAttribute("disabled", ""); // disable pointer events
        }
    }

    unlock()
    {
        for(var element of this.elements)
        {
            element.querySelectorAll(".audioButton")[0].removeAttribute("disabled");
            element.querySelectorAll(".SLIDER")[0].removeAttribute("disabled"); // disable pointer events
        }
    }

    async shutdown()
    {
        if(this.loaded > 0)
        {
            try
            {
                this.source.stop();
            }
            catch(e)
            {
                console.error(e);
            }

            try
            {
                this.noise.disconnect();
            }
            catch(e)
            {
                console.error(e);
            }
            try
            {
                this.source.disconnect();
            }
            catch(e)
            {
                console.error(e);
            }

            

            console.debug(`${this.src} - Shutdown AudioNode`);
        }
    }

    async addPointer(element)
    {
        this.elements.push(element);
    }

    async cloneToPlaying()
    {
        var sample = Array.from(document.querySelectorAll(".audioContainer")).filter(node => node.audioNode ? node.audioNode.src === this.src : false)[0];
        var alreadyRecent = Array.from(document.querySelectorAll("#recentGrid .audioContainer")).map(element => element.audioNode ? element.audioNode.src : "NULL SOURCE").some(source => source === this.src);
        if(!alreadyRecent)
        {
            var clone = sample.cloneNode(true); // clone the node (DOM elements only)
            sample.audioNode.addPointer(clone); // instantiate a pointer to the new element
            clone.audioNode = sample.audioNode; // manually copy the audioNode reference property to the new element

            // copy over event listeners
            clone.querySelector("button").addEventListener("click", (event) => { clone.audioNode.toggle(event); });
            clone.querySelector("input").addEventListener("input", (event) => clone.audioNode.adjustVolume(2 * ((event.target.value / 100) ** 3), event.target.value));
            clone.querySelector("input").addEventListener("change", (event) => window.URIsaver.save());
            
            // insert the clone into the DOM in the <div> with id="recentGrid"
            document.querySelector("#recentGrid").insertAdjacentElement("afterbegin", clone);

            // unhide the recent / currently playing section
            Array.from(document.querySelectorAll(".recentSection")).forEach((element, index) => { element.classList.remove("recentSection") });
        }
    }
}