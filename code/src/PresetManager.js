export class Loader
{
    constructor()
    {
        this.activeList = new Array();
        this.compressor = new URIManager();
    }

    async load()
    {
        this.activeList = this.compressor.pull().split(",");
        document.getElementById("printout_loadparams").innerHTML = this.activeList.join("\n");
        var nodes = window.audioNodes;
        for ( var node of nodes )
        {
            if(this.activeList.some(item => item.startsWith(node.src)))
            {
                var relevant = this.activeList.find(item => item.startsWith(node.src));
                await node.adjustVolume(relevant.split(";")[1], ((Math.cbrt(parseFloat(relevant.split(";")[1])/2))*100));
                node.elements[0].querySelectorAll("button")[0].click(); // I don't know why, but we have to click() to get loading to work. calling what this maps to programmatically doesn't work
            }
        }
    }
}

export class Saver
{
    constructor()
    {
        this.activeList = new Array();
        this.compressor = new URIManager();
        this.oldDigest = "";
    }

    async save()
    {
        this.activeList = window.audioNodes.filter(node => node.playing == true).map(node => node.src + ";" + ((Math.round(node.volume*100))/100));
        var payload = this.activeList.join(",");
        //console.log(payload);

        // this is not cryptographically secure! but we are just using it to ease comparison
        window.simpleHash = function(str) {
            let hash = 0;

            if (!str || typeof str !== 'string') {
                return hash;
            }

            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash + char);
            }

            return Math.abs(hash >>> 0).toString(16); // Convert to positive number
        }

        var newDigest = simpleHash(payload);
        //console.debug(newDigest, this.oldDigest);
        if(newDigest !== this.oldDigest)
        {
            this.compressor.push(payload);
            this.oldDigest = newDigest;
            console.debug(this);
        }
    }
}

export class URIManager
{
    constructor()
    {
        this.maxURILength = 8192;
        this.defaultCompression = "BEST";
        this.defaultEncoding = "URI-B64";
        this.lastAlert = new Date(0); // start as never
    }

    alertNoSpam()
    {
        if(new Date().getTime() - this.lastAlert >= 30000)
        {
            alert("Maxium URL Length Reached!\n\nShorten your document or prepare to save the raw text content!");
        }
        this.lastAlert = new Date().getTime();
    }

    pull(URL) //turn URL into data
    {
        // collect URI object from current URL
        var URI = this.getURL(URL);

        // decompress everything to a single string
        var data = window.URICompressor.pull(URI.data, URI.compressor, URI.encoding).data;

        // data validation
        if(data == "" || data == null)
        {
            console.error("Couldn't decode the provided link.\nCould not parse Data Parameter.");
        }

        // trim trailing
        data = data.replace(/\s+$/gm, "");

        return data;
    }

    push(string) //turn data into URL
    {
        // generate the compression object and do the compression operation
        var compressed = window.URICompressor.push(string, this.defaultCompression, this.defaultEncoding);
        
        // modify the page URL to reflect the operands of the the compression operation
        this.setURL(compressed.data, compressed.compression, compressed.encoding);

        return null;
    }

    setURL(encodedData, compressionType, encoding) //set the url given the 3 URI params
    {
        var baseURL = window.location.href.split("?")[0];
        var URL = baseURL + "?enc=" + encoding + "&cmpr=" + compressionType + "&data=" + encodedData;
        window.link_full = URL;

        if(URL.length + 512 > this.maxURILength)
        {
            URL = baseURL + "?enc=" + encoding + "&cmpr=" + compressionType + "&data=" + "MAXIMUM-LINK-LENGTH-EXCEEDED";
            this.alertNoSpam();
        }

        history.replaceState({}, "", URL);
    }

    getURL() //extract URI components
    {
        var data = /(?:data=)([^\&\=\?]*)/gm;
        var compressor = /(?:cmpr=)([^\&\=\?]*)/gm;
        var encoding = /(?:enc=)([^\&\=\?]*)/gm;

        var uriData = data.exec(window.location.href);
        if(uriData == null || uriData[1] == "")
        {
            uriData = "";
        }
        else
        {
            uriData = uriData[1];
        }

        var uriCompressor = compressor.exec(window.location.href);
        if(uriCompressor == null || uriCompressor[1] == "")
        {
            uriCompressor = "ZLIB"; //fallback to old
        }
        else
        {
            uriCompressor = uriCompressor[1];
        }

        var uriEncoding = encoding.exec(window.location.href);
        if(uriEncoding == null || uriEncoding[1] == "")
        {
            uriEncoding = "URI-B64"; //fallback to old
        }
        else
        {
            uriEncoding = uriEncoding[1];
        }
        
        var URI = ({});
        URI.encoding = uriEncoding;
        URI.compressor = uriCompressor;
        URI.data = uriData;
        return URI;
    }
}
