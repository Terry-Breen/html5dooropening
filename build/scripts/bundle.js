(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var createGrid = require("./uniformmesh.js").createUniformGridMesh;

var app = new PIXI.Application(200, 305);
document.body.appendChild(app.view);
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.loader.add("assets/gridmesh1x1.png").add("assets/gridmesh2x2.png").load(onLoad);

function onLoad() {
    var stage = new PIXI.Container();
    //var t1x1 = PIXI.Texture.fromFrame("assets/gridmesh1x1.png");
    var t2x2 = PIXI.Texture.fromFrame("assets/gridmesh2x2.png");

    grid = createGrid(t2x2, 2, 2);

    console.log(grid.indices);

    stage.addChild(grid);
    app.stage.addChild(stage);
}

},{"./uniformmesh.js":2}],2:[function(require,module,exports){
exports.createUniformGridMesh = function (texture, numRows, numCols){
    numRows = numRows || 1;
    numCols = numCols || 1;

    var txWidth = texture.width;
    var txHeight = texture.height;
    //Dimensions of a grid cell
    var cellWidth = txWidth / numCols;
    var cellHeight = txHeight / numRows;

    var vertices = [];
    var uvs = [];

    //Create vertices for each corner of a grid cell
    var x;
    var y;
    for(y = 0; y <= numRows; y++){
        for(x = 0; x <= numCols; x++){
            var pointX = x * cellWidth;
            var pointY = y * cellHeight;
            vertices.push(pointX);
            vertices.push(pointY);

            uvs.push(pointX / txWidth);
            uvs.push(pointY / txHeight);
        }
    }
    var numCornerPts = (numRows + 1) * (numCols + 1);

    //Create vertices for the center of each grid cell
    for(y = 0; y < numRows; y++){
        for(x = 0; x < numCols; x++){
            var pointX = x * cellWidth + cellWidth / 2;
            var pointY = y * cellHeight + cellHeight / 2;
            vertices.push(pointX);
            vertices.push(pointY);

            uvs.push(pointX / txWidth);
            uvs.push(pointY / txHeight);
        }
    }

    //Calculate the indices in order to create the grid mesh pattern.
    var indices = [];
    var leftToRight = true;
    var numColCorners = numCols + 1;
    for(y = 0; y < numRows; y++){
        var topLeft;
        var topRight;
        var center;
        var botLeft;
        var botRight;
        if(leftToRight){
            for(x = 0; x < numCols; x++){
                topLeft = y * numColCorners + x;
                topRight = y * numColCorners + x + 1;
                center = y * numCols + x + numCornerPts;
                botLeft = (y + 1) * numColCorners + x;
                botRight = (y + 1) * numColCorners + x + 1;
                indices.push(topLeft);
                indices.push(topRight);
                indices.push(center);
                indices.push(topLeft);
                indices.push(botLeft);
                indices.push(center);
                indices.push(botRight);
            }
            indices.push(topRight);
            indices.push(botRight);
        }else{
            for(x = numCols - 1; x >= 0; x--){
                topLeft = y * numColCorners + x;
                topRight = y * numColCorners + x + 1;
                center = y * numCols + x + numCornerPts;
                botLeft = (y + 1) * numColCorners + x;
                botRight = (y + 1) * numColCorners + x + 1;
                indices.push(topRight);
                indices.push(topLeft);
                indices.push(center);
                indices.push(topRight);
                indices.push(botRight);
                indices.push(center);
                indices.push(botLeft);
            }
            indices.push(topLeft);
            indices.push(botLeft);
        }

        leftToRight = !leftToRight;
    }

    //Create and return the mesh
    vertices = new Float32Array(vertices);
    uvs = new Float32Array(uvs);
    indices = new Uint16Array(indices);

    var mesh = new PIXI.mesh.Mesh(texture, vertices, uvs, indices);

    //--- For debugging ---
    mesh.interactive = true;
    mesh.on("pointerdown", onDown)
        .on("pointermove", onDrag)
        .on("pointerup", onUp)
        .on("pointerupoutside", onUp);

    //---------------------

    return mesh;
}

//Following functions are for interacting with the grid by dragging points on it

//Returns the index of the vertex in mesh closest to point (x,y)
function getIndexOfClosestVertex(mesh, x, y){
    var closestIdx;
    var closestSqrdDist;

    var vertices = mesh.vertices;
    var count;
    for(count = 0; count < vertices.length; count += 2){
        var vertX = vertices[count];
        var vertY = vertices[count + 1];
        var xDiff = x - vertX;
        var yDiff = y - vertY;
        var sqrdDist = xDiff * xDiff + yDiff * yDiff;

        if(closestSqrdDist === undefined || closestSqrdDist > sqrdDist){
            closestIdx = count / 2;
            closestSqrdDist = sqrdDist;
        }
    }

    return closestIdx;
}

function onDown(e){
    this.dragging = true;
    var pos = e.data.getLocalPosition(this.parent);
    this.dragVertIdx = getIndexOfClosestVertex(this, pos.x, pos.y);
}

function onDrag(e){
    if(this.dragging){
        var pos = e.data.getLocalPosition(this.parent);
        var vertXIdx = this.dragVertIdx * 2;
        this.vertices[vertXIdx] = pos.x;
        this.vertices[vertXIdx + 1] = pos.y;
    }
}

function onUp(){
    this.dragging = false;
}

},{}]},{},[1]);
