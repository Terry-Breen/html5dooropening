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
     * @param {array} textures --- Textures of the animation in order.
     * @param {number} openDist --- How far pointer dragged to completely open door.
     *                              Animation is interpolated.
     * @param {boolean} [locked=false] --- Whether door starts locked.
     */
    constructor(textures, openDist, locked){
        if(typeof(locked) === "undefined"){
            locked = false;
        }

        this.textures = textures;
        //Distance will be negative since doors open by dragging to the left
        this.openDist = -openDist;
        this.opened = false;
        this.locked = locked;
        this.dist = 0;
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
}

function onDown(e){
    this.lastPos = e.data.getLocalPosition(this.parent);
    this.dragging = true;
}

function onDrag(e){
    var door = this.door;
    if(this.dragging && !door.locked){
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
    }
}

function onUp(e){
    this.dragging = false;
    console.log("Door opened: " + this.door.opened);
}
