var Door = require("./door.js");
var Lock = require("./lock.js");

//How far mouse must be dragged to completely open door
const OPEN_DIST = 25;
//Number of cycles a wheel lock must be dragged to unlock
const WHEEL_CYCLES = 2;

//Sprite resources for doors and locks
var resources = {};

//To be called when PIXI is done loading. Initializes door and lock textures
exports.createTextures = function createTextures(){
    resources.doorFrames = [
        PIXI.Texture.fromFrame("door_000.png"),
        PIXI.Texture.fromFrame("door_001.png"),
        PIXI.Texture.fromFrame("door_002.png")
    ];

    resources.hatchFrames = [
        PIXI.Texture.fromFrame("hatch_000.png"),
        PIXI.Texture.fromFrame("hatch_001.png"),
        PIXI.Texture.fromFrame("hatch_002.png")
    ];

    resources.wheelFrames = [
        PIXI.Texture.fromFrame("hatchwheel_000.png"),
        PIXI.Texture.fromFrame("hatchwheel_001.png"),
        PIXI.Texture.fromFrame("hatchwheel_002.png"),
        PIXI.Texture.fromFrame("hatchwheel_003.png")
    ];
}

//Functions which create various combinations of doors and locks and add
//them to the specified PIXI.Container

exports.PlainDoor = function PlainDoor(container){
    var door = new Door.Door(resources.doorFrames, OPEN_DIST);
    container.addChild(door.sprite);
    return {"door": door, "locks": []};
}

exports.WheelHatch = function WheelHatch(container){
    var wheel = new Lock.WheelLock(resources.wheelFrames, WHEEL_CYCLES);
    var locks = [wheel];
    var door = new Door.Door(resources.hatchFrames, 25, locks);
    wheel.setPosition(17, 25);
    container.addChild(door.sprite);
    container.addChild(wheel.sprite);
    return {"door": door, "locks": locks};
}
