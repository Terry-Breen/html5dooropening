var Door = require("./door.js").Door;
var WheelLock = require("./lock.js").WheelLock;

var app = new PIXI.Application(200, 305);
document.body.appendChild(app.view);
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.loader.add("assets/sprites.json").load(onLoad);

function onLoad() {
    var stage = new PIXI.Container();
    var hatchFrames = [
        PIXI.Texture.fromFrame("hatch_000.png"),
        PIXI.Texture.fromFrame("hatch_001.png"),
        PIXI.Texture.fromFrame("hatch_002.png")
    ];

    var hatch = new Door(hatchFrames, 25);

    var wheelFrames = [
        PIXI.Texture.fromFrame("hatchwheel_000.png"),
        PIXI.Texture.fromFrame("hatchwheel_001.png"),
        PIXI.Texture.fromFrame("hatchwheel_002.png"),
        PIXI.Texture.fromFrame("hatchwheel_003.png")
    ];

    var wheel = new WheelLock(hatch, wheelFrames, 2);

    stage.addChild(hatch.sprite);

    wheel.setPosition(21,30);
    stage.addChild(wheel.sprite);

    stage.scale.set(5,5);
    app.stage.addChild(stage);
}
