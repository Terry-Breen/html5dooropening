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
