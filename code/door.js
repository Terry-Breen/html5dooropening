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
