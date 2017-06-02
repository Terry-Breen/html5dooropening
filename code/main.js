var DoorCreators = require("./doorcreators.js");

var app = new PIXI.Application(200, 305);
document.body.appendChild(app.view);
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.loader.add("assets/sprites.json").load(onLoad);

function onLoad() {
    DoorCreators.createTextures();
    var stage = new PIXI.Container();
    DoorCreators.PlainDoor(stage);
    stage.scale.set(5,5);
    app.stage.addChild(stage);
}
