/*
debugRandomColors.js
├── ​PURPOSE
│   ​├── ​FOR DEBUG TESTING PURPOSES ONLY
│   ​├── ​When designing a complex document layout, it is useful to be able to easily see the size and position of each element.
│   ​└── ​This can be accomplished though modifying the `backgroundColor` css style of elements.
└── ​Implementation
    ​├── ​Waits for the `DOMContentLoaded` event to fire
    ​└── ​Modifies every element of the `<body>` to have a random `backgroundColor`
    ​        ​└── ​All elements will have their alpha value set to 100/255 (39%).
*/

window.debugRandomColors = function()
{
    var elements = document.querySelectorAll("body *");
    console.log(elements);
    for ( var element of elements )
    {
        var r = Math.round(Math.random() * 255);
        var g = Math.round(Math.random() * 255);
        var b = Math.round(Math.random() * 255);
        var a = 100;

        var newColor = `${r.toString(16)}${g.toString(16)}${b.toString(16)}${a.toString(16)}`;
        element.style.backgroundColor = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}${a.toString(16)}`;

        console.debug(`Changed color of ${element} to ${newColor}`);
    }
}