var Door = require("./door.js").Door;
var Lock = require("./lock.js");
var WheelLock = Lock.WheelLock;
var ButtonLock = Lock.ButtonLock;

var app = new PIXI.Application(200, 305);
document.body.appendChild(app.view);
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.loader.add("assets/sprites.json").load(onLoad);

function onLoad() {
    var stage = new PIXI.Container();

    //Create locks
    //Wheel lock
    var wheelFrames = [
        PIXI.Texture.fromFrame("hatchwheel_000.png"),
        PIXI.Texture.fromFrame("hatchwheel_001.png"),
        PIXI.Texture.fromFrame("hatchwheel_002.png"),
        PIXI.Texture.fromFrame("hatchwheel_003.png")
    ];

    var wheel = new WheelLock(wheelFrames, 2);

    //Button lock
    var butOn = PIXI.Texture.fromFrame("buttons_000.png");
    var butOff = PIXI.Texture.fromFrame("buttons_001.png");
    var button = new ButtonLock(butOff, butOn, true)

    var locks = [wheel, button];

    //Create door
    var hatchFrames = [
        PIXI.Texture.fromFrame("hatch_000.png"),
        PIXI.Texture.fromFrame("hatch_001.png"),
        PIXI.Texture.fromFrame("hatch_002.png")
    ];

    var hatch = new Door(hatchFrames, 25, locks);

    stage.addChild(hatch.sprite);

    wheel.setPosition(17, 25);
    stage.addChild(wheel.sprite);

    button.setPosition(10,7);
    stage.addChild(button.sprite);

    stage.scale.set(5,5);
    app.stage.addChild(stage);
}
