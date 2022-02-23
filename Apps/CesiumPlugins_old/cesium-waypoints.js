if (typeof Cesium !== 'undefined')
    /**
     * @author descrip
     * @param viewer {object} three-dimensional object
     * @param options {object} initialization parameters
     * @constructor
     */
    Cesium.WayPoints = (function (Cesium) {

        /**
          * Drawing objects
          * @param viewer
          * @param options
          * @constructor
          */

        function _(viewer, options = {}) {

            if (viewer && viewer instanceof Cesium.Viewer) {
                this._viewer = viewer;
                this._drawLayer = new Cesium.CustomDataSource("WayPointsLayer");
                viewer && viewer.dataSources.add(this._drawLayer);
                this.handler = new Cesium.ScreenSpaceEventHandler(this._viewer.canvas);
                this.positions = [];
                this.viewModel = {
                    waterHeight: 2000,
                    maxTerrainHeight: 9000,
                    waterAlpha: 100,
                    isEnabled: false
                };
            }
        }
        _.prototype = {
            createTooltip: function (frameDiv) {

                let dt = document.getElementById("divtoolbar");
                if (dt) dt.remove();
                var tooltip = function (frameDiv) {

                    var div = document.createElement('DIV');
                    div.setAttribute("id", "divtoolbar");
                    div.className = "twipsy right";

                    var arrow = document.createElement('DIV');
                    arrow.className = "twipsy-arrow";
                    div.appendChild(arrow);

                    var title = document.createElement('DIV');
                    title.className = "twipsy-inner";
                    div.appendChild(title);

                    this._div = div;
                    this._title = title;

                    // add to frame div and display coordinates
                    frameDiv.appendChild(div);
                };

                tooltip.prototype.setVisible = function (visible) {
                    this._div.style.display = visible ? 'block' : 'none';
                };

                tooltip.prototype.showAt = function (position, message) {
                    if (position && message) {
                        this.setVisible(true);
                        this._title.innerHTML = message;
                        this._div.style.left = position.x + 10 + "px";
                        this._div.style.top = (position.y - this._div.clientHeight / 2) + "px";
                    }
                };

                tooltip.prototype.remove = function () {
                    let dt = document.getElementById("divtoolbar");
                    if (dt) dt.remove();
                };
                return new tooltip(frameDiv);
            },
            clearAll: function () {
                let $this = this;
                $this.positions = [];
                $this.C3positions = [];
                $this.handler.destroy();
                $this._drawLayer.entities.removeAll();
                if ($this.tooltip) $this.tooltip.remove();
            },
            drawWayPoints: function (options = {}) {
                let $this = this;

                $this.viewModel.isEnabled = typeof (options.isEnabled) == "boolean" ? options.isEnabled : false;
                if (this._viewer && options && $this.viewModel.isEnabled) {
                    $this.positions = [];
                    $this.C3positions = [];
                    //$this.clearAll();
                    this.handler = new Cesium.ScreenSpaceEventHandler(this._viewer.canvas);
                    this.tooltip = this.createTooltip(this._viewer.container);
                    this.handler.setInputAction(function (movement) {
                        var position = movement.endPosition;
                        if ($this.viewModel.isEnabled === false) {
                            $this.tooltip.remove();
                            return;
                        }

                        if (Cesium.defined(position)) {
                            if ($this.positions.length > 1) {
                                $this.tooltip.showAt(position, "<p>Right-Click to end</p>");
                            }
                            else {
                                $this.tooltip.showAt(position, "<p>Left-Click to add point</p>");
                            }
                            
                            if ($this.C3positions.length > 0) {
                                position = $this._viewer.scene.pickPosition(movement.endPosition);
                                let tempPos = [...$this.C3positions,...[position]];
                                $this.ent.position = tempPos;
                                $this.ent.path = {
                                    
                                    width: 4,
                                    material: new Cesium.PolylineGlowMaterialProperty({
                                        glowPower: 0.2,
                                        taperPower: 1,
                                        color: Cesium.Color.VIOLET,
                                    }),
                                    // clampToGround: true
                                }
                            }

                        } else {
                            $this.tooltip.remove();
                        }

                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    //initial point
                    this.handler.setInputAction(function (movement) {
                        if ($this.viewModel.isEnabled === false) {
                            return;
                        }
                        var adaptivePosition = $this._viewer.scene.pickPosition(movement.position);

                        var positionCarto = Cesium.Cartographic.fromCartesian(adaptivePosition);
                        let lng_start = Cesium.Math.toDegrees(positionCarto.longitude).toFixed(8);
                        let lat_start = Cesium.Math.toDegrees(positionCarto.latitude).toFixed(8);
                        let height_start = positionCarto.height;

                        $this.positions.push(Number(lng_start));
                        $this.positions.push(Number(lat_start));
                        $this.positions.push(0);

                        $this.C3positions.push(adaptivePosition);

                        // console.log($this.positions);

                        $this.ent = {
                            position: $this.C3positions,//new Cesium.Cartesian3.fromDegrees(parseFloat(lng_start), parseFloat(lat_start), parseFloat(height_start)),
                        }
                        //     point: {
                        //         pixelSize: 3,
                        //         outlineColor: Cesium.Color.RED,
                        //         outlineWidth: 2,
                        //         // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        //         // clampToGround: true,
                        //     }
                        // };


                        if ($this.C3positions.length > 1) {
                            $this.ent.path = {
                                
                                resolution: 1,
                                width: 4,
                                material: new Cesium.PolylineGlowMaterialProperty({
                                    glowPower: 0.2,
                                    taperPower: 1,
                                    color: Cesium.Color.VIOLET,
                                }),
                                // clampToGround: true
                            }
                        }
                        $this.ent = $this._drawLayer.entities.add($this.ent);

                    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

                    //final point
                    this.handler.setInputAction(function (movement) {
                        $this.tooltip.remove();
                        $this.handler.destroy();
                    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                }
            },
            /*
            updateWater: function () {
                let $this = this;
                $this.wColor = Cesium.Color.fromBytes(0, 191, 255, Number($this.viewModel.waterAlpha));
                if ($this.entity) this.entity.polygon.material = $this.wColor;
            },
            drawWater: function () { // $this.viewModel.maxTerrainHeight target height range of the coordinate $this.positions [109.2039, 35.6042, 0, 109.2774, 35.6025, 0,109.2766,35.5738, 0] waterHeight current height of water
                let $this = this;
                $this.wColor = Cesium.Color.fromBytes(0, 191, 255, Number($this.viewModel.waterAlpha));
                $this.entity = $this._drawLayer.entities.add({
                    polygon: {
                        hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights($this.positions)),
                        height: 0,
                        perPositionHeight: true,
                        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
                        extrudedHeight: new Cesium.CallbackProperty(function () { // attributes callback function used here, provided directly extrudedHeight cause flicker.
                            //$this.viewModel.waterHeight += 3;
                            if ($this.viewModel.waterHeight > $this.viewModel.maxTerrainHeight) {
                                $this.viewModel.waterHeight = $this.viewModel.maxTerrainHeight; // to maxima
                            }
                            return $this.viewModel.waterHeight
                        }, false),
                        material: $this.wColor
                    }
                });

            }
            */
        }
        return _
    })(Cesium);


/*
/  WORKING /

var viewer = new Cesium.Viewer('cesiumContainer', {

  terrainProvider: Cesium.createWorldTerrain(),

    navigationInstructionsInitiallyVisible: false, animation: false, timeline: false,

    // The next line is the important option for this demo.

    // Test how this looks with both "true" and "false" here.

    orderIndependentTranslucency: false

});
var scene = viewer.scene;

var positions = [
    77.9,30.4,0,
    78.9,30.5,0,
    78.7,30.8,0,
    78.0,30.8,0
];

var waterHeight = 1000;
var wColor = Cesium.Color.fromBytes(0, 191, 255, 100);
var entity = null;
function drawWater($this.viewModel.maxTerrainHeight, $this.positions) { // $this.viewModel.maxTerrainHeight target height range of the coordinate $this.positions [109.2039, 35.6042, 0, 109.2774, 35.6025, 0,109.2766,35.5738, 0] waterHeight current height of water
        entity = viewer.entities.add({
            polygon: {
                hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights($this.positions)),
                height:0,
                perPositionHeight: true,
                vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
                extrudedHeight: new Cesium.CallbackProperty(function () { // attributes callback function used here, provided directly extrudedHeight cause flicker.
                    waterHeight += 3;
                    if (waterHeight > $this.viewModel.maxTerrainHeight) {
                        waterHeight = $this.viewModel.maxTerrainHeight; // to maxima
                    }
                    return waterHeight
                }, false),
                material: wColor

            }
        });

    }

drawWater(10000, positions);

setInterval(function(){
  waterHeight += 100;
   entity.polygon.material = Cesium.Color.fromRandom({alpha: 0.4});
},2000);


/ END /
*/