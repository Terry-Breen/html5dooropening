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
