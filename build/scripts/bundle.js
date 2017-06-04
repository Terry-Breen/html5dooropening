(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * A Door has an animation which gradually plays as the Door is opened
 * by dragging a pointer a distance specified by openDist.
 *
 * Door.opened can be queried to determine if the door is entirely open.
 * The Door can be set to start locked, which prevents the animation from
 * proceeding and prevents the Door reaching the opened state.
 */
exports.Door = class Door{
    /**
     * @param {PIXI.Texture[]} textures --- Textures of the animation in order.
     * @param {number} openDist --- How far pointer dragged to completely open door.
     *                              Animation is interpolated.
     * @param {Lock[]} [locks=[]] --- Locks which must all be unlocked for the door to open.
     */
    constructor(textures, openDist, locks){
        this.textures = textures;
        //Distance will be negative since doors open by dragging to the left
        this.openDist = -openDist;
        this.dist = 0;
        this.opened = false;
        this.locks = locks || [];
        this.sprite = new PIXI.Sprite(textures[0]);
        this.sprite.door = this;

        //Add input listening
        this.sprite.interactive = true;
        this.sprite
            .on("pointerdown", onDown)
            .on("pointermove", onDrag)
            .on("pointerup", onUp)
            .on("pointerupoutside", onUp);
    }

    setPosition(x, y){
        this.sprite.x = x;
        this.sprite.y = y;
    }

    /**
     * Returns true if all locks are unlocked.
     */
    isLocked(){
        var locked = false;
        var count;
        for(count = 0; count < this.locks.length; count++){
            locked = this.locks[count].isLocked() || locked;
        }
        return locked;
    }

    /**
     * Set visibility of all locks (such as hiding them when door is not fully closed)
     */
    setLockVisibility(visible){
        var count;
        for(count = 0; count < this.locks.length; count++){
            this.locks[count].setVisible(visible);
        }
    }

    /**
     * Resets the door and its locks to their starting configuration
     */
     reset(){
         var count;
         for(count = 0; count < this.locks.length; count++){
             var lock = this.locks[count];
             lock.reset();
             lock.setVisible(true);
         }
         this.opened = false;
         this.dist = 0;
         this.sprite.texture = this.textures[0];
     }
}

function onDown(e){
    this.lastPos = e.data.getLocalPosition(this.parent);
    this.dragging = true;
}

function onDrag(e){
    var door = this.door;
    if(this.dragging && !door.isLocked()){
        //Update total distance dragged so far
        var newPos = e.data.getLocalPosition(this.parent);
        var deltaX = newPos.x - this.lastPos.x;
        door.dist += deltaX;
        door.dist = Math.min(door.dist, 0);
        door.dist = Math.max(door.dist, door.openDist);
        this.lastPos = newPos;

        //Update the sprite's texture based on the distance
        //Also set whether door is completely opened or not
        var newIdx = Math.floor(door.textures.length * (door.dist / door.openDist));
        if(newIdx === door.textures.length){
            newIdx -= 1;
        }
        door.opened = newIdx === door.textures.length - 1;
        this.texture = door.textures[newIdx];

        //Hide locks if door not fully closed, or show if fully closed
        var locksVisible = newIdx === 0;
        door.setLockVisibility(locksVisible);
    }
}

function onUp(e){
    this.dragging = false;
    console.log("Door opened: " + this.door.opened);
}

},{}],2:[function(require,module,exports){
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

},{"./door.js":1,"./lock.js":3}],3:[function(require,module,exports){
/**
 * A lock gets unlocked after some condition is met.
 */
class Lock{
    /**
     * Sets the visibility of the lock.
     */
    setVisible(visible){}

    /**
     * Resets lock to starting configuration
     */
     reset(){}

    /**
     * Returns true if lock is locked.
     */
     isLocked(){return false;}
}


/**
 * Sprite lock is a lock that displays using a sprite.
 */
class SpriteLock extends Lock{
    constructor(sprite){
        super();

        this.sprite = sprite;
    }

    setPosition(x, y){
        this.sprite.x = x;
        this.sprite.y = y;
    }

    setVisible(visible){
        this.sprite.visible = visible;
    }
}

/**
 * Wheel lock is a type of lock that is opened by clicking on a wheel
 * and rotating the wheel by dragging the pointer in a circle.
 */
exports.WheelLock = class WheelLock extends SpriteLock{
    /**
     * @param {array} textures --- Textures of the animation in order.
     * @param {number} cycles --- How many complete rotations of wheel unlocks
     *                            the lock. Animation is interpolated.
     */
    constructor(textures, cycles){
        super(new PIXI.Sprite(textures[0]));
        this.sprite.wheel = this;

        this.textures = textures;
        this.cyclesComplete = 0;
        this.cycles = cycles;

        //Add sprite interactivity
        this.sprite.interactive = true;
        this.sprite
            .on("pointerdown", wheelOnDown)
            .on("pointermove", wheelOnDrag)
            .on("pointerup", wheelOnUp)
            .on("pointerupoutside", wheelOnUp);
    }

    reset(){
        this.cyclesComplete = 0;
        this.sprite.texture = this.textures[0];
    }

    isLocked(){
        return !(this.cyclesComplete >= this.cycles);
    }
}

function wheelOnDown(e){
    this.lastPos = e.data.getLocalPosition(this.parent);
    this.dragging = true;
}

//Helper for wheelOnDrag. Returns center of sprite assuming sprite has the
//default anchor and pivot.
function getCenterPt(sprite){
    var ptX = sprite.x + sprite.width / 2;
    var ptY = sprite.y + sprite.height / 2;
    return new PIXI.Point(ptX, ptY);
}

function wheelOnDrag(e){
    if(this.dragging){
        //Use dot product to get the angle around the wheel which the mouse
        //was dragged
        var center = getCenterPt(this);
        var pos = e.data.getLocalPosition(this.parent);
        var newVecX = pos.x - center.x;
        var newVecY = pos.y - center.y;
        var lastVecX = this.lastPos.x - center.x;
        var lastVecY = this.lastPos.y - center.y;

        var newVecLength = Math.sqrt(newVecX * newVecX + newVecY * newVecY);
        var lastVecLength = Math.sqrt(lastVecX * lastVecX + lastVecY * lastVecY);
        var dotProd = newVecX * lastVecX + newVecY * lastVecY;
        var angle = Math.acos(dotProd / (newVecLength * lastVecLength));

        //angle might be NaN due to floating point error. Default to 0
        if(isNaN(angle)){
            angle = 0;
        }

        var numCycles = angle / (2 * Math.PI);

        //Use cross product newVec x lastVec to get the direction
        //(clockwise or counter-clockwise) which the mouse was dragged
        var crossZ = newVecX * lastVecY - lastVecX * newVecY;
        var sign = Math.sign(crossZ);

        var wheel = this.wheel;

        //Update number of completed cycles. Won't go over max number of cycles
        //needed for opening lock.
        wheel.cyclesComplete += numCycles * sign;
        wheel.cyclesComplete = Math.min(wheel.cycles, wheel.cyclesComplete);
        wheel.cyclesComplete = Math.max(0, wheel.cyclesComplete);

        //Update animation frame of wheel turning
        var numFrames = wheel.textures.length;
        var quarterCyclesComplete = wheel.cyclesComplete * 4;
        var newFrame = Math.floor(quarterCyclesComplete * numFrames) % numFrames;
        this.texture = wheel.textures[newFrame];

        //Update last position of the mouse
        this.lastPos = pos;
    }
}

function wheelOnUp(){
    this.dragging = false;
}


/**
 * Button lock alternates between the unpressed locked state and pressed
 * unlocked state when clicked on.
 */
 exports.ButtonLock = class ButtonLock extends SpriteLock{
     constructor(offTexture, onTexture, startsOff){
         super(createButtonSprite(offTexture, onTexture, startsOff));
         this.sprite.button = this;

         this.offTexture = offTexture;
         this.onTexture = onTexture;
         this.off = startsOff;
         this.startsOff = startsOff;

         //Add interactivity
         this.sprite.interactive = true;
         this.sprite.on("pointertap", buttonOnTap);
     }

     reset(){
         this.off = this.startsOff;
         if(this.startsOff){
             this.sprite.texture = this.offTexture;
         }else{
             this.sprite.texture = this.onTexture;
         }
     }

     isLocked(){
         return this.off;
     }
 }

//Helper for ButtonLock constructor
function createButtonSprite(offTexture, onTexture, startsOff){
    if(startsOff){
        return new PIXI.Sprite(offTexture);
    }else{
        return new PIXI.Sprite(onTexture);
    }
}

function buttonOnTap(){
    if(this.button.off){
        this.texture = this.button.onTexture;
    }else{
        this.texture = this.button.offTexture;
    }

    this.button.off = !this.button.off;
}

},{}],4:[function(require,module,exports){
var DoorCreators = require("./doorcreators.js");

var app = new PIXI.Application(200, 305);
document.body.appendChild(app.view);
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.loader.add("assets/sprites.json").load(onLoad);

//How fast to scale up door on current stage during transition period
const OUT_TRANS_RATE = 0.1;
//How fast to scale up door on next stage during transition period
const IN_TRANS_RATE = 0.04
//When scale of exiting stage reaches OUT_TRANS_STOP, then stop transitioning
const OUT_TRANS_STOP = 15;
//Scale for current stage
const STAGE_SCALE = 5;
//What scale to set the background stage to
const NEXT_STAGE_SCALE = 1;

//Stages used for displaying the doors. When stage1 is in the forefront,
//stage2 is in the background, and they swap after a door is opened.
var stage1 = new PIXI.Container();
var stage2 = new PIXI.Container();
stage1.scale.set(STAGE_SCALE, STAGE_SCALE);
stage2.scale.set(NEXT_STAGE_SCALE, NEXT_STAGE_SCALE);
var onStage1 = true;
//Whether game is currently in process of swapping between stages
var transitioning = false;
var centerX, centerY;
//The doors of each stage
var door1, door2;

function onLoad() {
    DoorCreators.createTextures();
    door1 = DoorCreators.PlainDoor(stage1)["door"];
    door2 = DoorCreators.WheelHatch(stage2)["door"];
    app.stage.addChild(stage2);
    app.stage.addChild(stage1);

    //Initialize center point used in transitions
    centerX = stage1.width / 2;
    centerY = stage1.height / 2;

    centerContainer(stage2, centerX, centerY);

    app.ticker.add(update);
}

//Centers the container around the point
function centerContainer(container, x, y){
    container.x = x - container.width / 2;
    container.y = y - container.height / 2;
}

//Update function
function update(delta){
    if(transitioning){
        var curStage;
        var curDoor;
        var nextStage;

        if(onStage1){
            curStage = stage1;
            curDoor = door1;
            nextStage = stage2;
        }else{
            curStage = stage2;
            curDoor = door2;
            nextStage = stage1;
        }

        var done = transition(curStage, nextStage);

        //When done transitioning, prepare current stage to be next stage
        if(done){
            app.stage.swapChildren(curStage, nextStage);
            curStage.scale.set(NEXT_STAGE_SCALE, NEXT_STAGE_SCALE);
            centerContainer(curStage, centerX, centerY);
            curDoor.reset();
            transitioning = false;
            onStage1 = !onStage1;
            console.log("Done transitioning");
        }
    }else{
        //Start transitioning if door of current stage is open
        if((onStage1 && door1.opened) || (!onStage1 && door2.opened)){
            transitioning = true;
        }
    }
}

//Updates the transition of both stages by gradually scaling them up until
//the threshold. Returns true if transition is done, false if in progress.
function transition(curStage, nextStage){
    //Transition by scaling up the doors
    curStage.scale.x += OUT_TRANS_RATE;
    curStage.scale.y += OUT_TRANS_RATE;
    centerContainer(curStage, centerX, centerY);
    nextStage.scale.x += IN_TRANS_RATE;
    nextStage.scale.y += IN_TRANS_RATE;
    centerContainer(nextStage, centerX, centerY);

    var curStageDone = false;
    var nextStageDone = false;

    if(curStage.scale.x >= OUT_TRANS_STOP){
        curStage.scale.set(OUT_TRANS_STOP, OUT_TRANS_STOP);
        centerContainer(curStage, centerX, centerY);
        curStageDone = true;
    }

    if(nextStage.scale.x >= STAGE_SCALE){
        nextStage.scale.set(STAGE_SCALE, STAGE_SCALE);
        centerContainer(nextStage, centerX, centerY);
        nextStageDone = true;
    }

    return curStageDone && nextStageDone;
}

},{"./doorcreators.js":2}]},{},[4]);
