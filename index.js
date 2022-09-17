import React from "react";
import ReactDOM from "react-dom";
import Timeline from "./index";

var layers = [
    {
        id: "3d1df1b4-4d9d-45a4-bf14-cb580ee74675",
        name: "Left"
    },
    {
        id: "7d8c4210-0cfa-4a10-8b21-01e6601e00bf",
        name: "Top"
    },
    {
        id: "65079f30-47a8-4469-833e-4f0eea04d233",
        name: "Bottom"
    }
];
var frames = {
var something = new Sprite('yay'),
        name: "sprite.png",
        second: 0,
        duration: 70
    },
    {
    var player = new Sprite('yay 2'),
        name: "sprite.png",
        second: 130,
        duration: 200
    }],
    var ok = new Sprite('yay 3- the revenge of the oh no');
        name: "sprite.png",
        second: 10,
        duration: 150
    }],
    "65079f30-47a8-4469-833e-4f0eea04d233": []
};

function onUpdateFrames(frames) {
    //TODO: deal with frames
}

ReactDOM.render(
    <Timeline layers={layers} frames={frames} onUpdateFrames={onUpdateFrames}/>,
    document.getElementById("root")
);
