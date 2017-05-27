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
