if (typeof Cesium !== 'undefined')
    /**
     * @author descrip
     * @param viewer {object} three-dimensional object
     * @param options {object} initialization parameters
     * @constructor
     */
    Cesium.Sight = (function (Cesium) {

        /**
          * Drawing objects
          * @param viewer
          * @param options
          * @constructor
          */




        function _(viewer, options = {}) {

            if (viewer && viewer instanceof Cesium.Viewer) {

                this._drawLayer = new Cesium.CustomDataSource('measureLayer')

                viewer && viewer.dataSources.add(this._drawLayer)
                this._viewer = viewer;
                this.handler = new Cesium.ScreenSpaceEventHandler(this._viewer.canvas);
                this._basePath = options.basePath || '';
                this.position1 = null;
                this.position2 = null;

                this.lng_start, this.lat_start, this.height_start, this.lng_stop, this.lat_stop, this.height_stop;
                this.lng_lerp = [], this.lat_lerp = [], this.height_lerp = [];
                this.cartographic = [];
                this.cartographic_lerp = [];
                this.height_terrain = [];
                this.isSeen = true;
                this.visiableOrNot;
                this.inPoint = [];
                this.outPoint = [];
                this.m = 0;
                this.n = 0;
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
                this._drawLayer.entities.removeAll();
                this.lng_start, this.lat_start, this.height_start, this.lng_stop, this.lat_stop, this.height_stop;
                this.lng_lerp = [], this.lat_lerp = [], this.height_lerp = [];
                this.cartographic = [];
                this.cartographic_lerp = [];
                this.height_terrain = [];
                this.isSeen = true;
                this.visiableOrNot;
                this.inPoint = [];
                this.outPoint = [];
                this.m = 0;
                this.n = 0;
            },
            drawLineSight: function (options = {}) {
                let $this = this;
                $this.clearAll();
                if (this._viewer && options && options.isEnabled === true) {
                    this.handler = new Cesium.ScreenSpaceEventHandler(this._viewer.canvas);
                    this.tooltip = this.createTooltip(this._viewer.container);
                    this.handler.setInputAction(function (movement) {
                        var position = movement.endPosition;
                        if(options.isEnabled === false)
                        {
                            return;
                        }
                        if ($this.position1 !== null && $this.position1 !== undefined && $this.position2 !== null && $this.position2 !== undefined ) {
                            $this.tooltip.remove();
                        } else if ($this.position1 === null || $this.position1 === undefined) {
                            $this.tooltip.showAt(position, "<p>Left-Click to add start point</p>");
                        } else {
                            $this.tooltip.showAt(position, "<p>Right-Click to add end point</p>");
                        }

                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    //initial point
                    this.handler.setInputAction(function (movement) {
                        $this.clearAll();
                        if(options.isEnabled === false)
                        {
                            return;
                        }
                        var adaptivePosition = $this._viewer.scene.pickPosition(movement.position);

                        var positionCarto = Cesium.Cartographic.fromCartesian(adaptivePosition);
                        $this.lng_start = Cesium.Math.toDegrees(positionCarto.longitude).toFixed(8);
                        $this.lat_start = Cesium.Math.toDegrees(positionCarto.latitude).toFixed(8);
                        $this.height_start = positionCarto.height;
                        $this.position1 = positionCarto;

                        // var billboards = this._viewer.scene.primitives.add(new Cesium.BillboardCollection());
                        // billboards.add({
                        //   position : new Cesium.Cartesian3.fromDegrees(parseFloat($this.lng_start),parseFloat(lat_start),parseFloat($this.height_start)),
                        //   image : 'marker.png',
                        //   eyeOffset : new Cesium.Cartesian3(0.0,0.0,-100.0), // Negative Z will make it closer to the camera
                        //   pixelOffset : new Cesium.Cartesian2(0.0,-32.0), // Optional offset in pixels relative to center
                        //   scale : 0.2
                        // });

                        $this._drawLayer.entities.add({
                            position: new Cesium.Cartesian3.fromDegrees(parseFloat($this.lng_start), parseFloat($this.lat_start), parseFloat($this.height_start)),
                            point: {
                                pixelSize: 10,
                                outlineColor: Cesium.Color.BLUE,
                                outlineWidth: 5,
                                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                                clampToGround: true,
                            }
                        });
                    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

                    //final point
                    this.handler.setInputAction(function (movement) {
                        if(options.isEnabled === false)
                        {
                            return;
                        }
                        var adaptivePosition = $this._viewer.scene.pickPosition(movement.position);

                        var positionCarto = Cesium.Cartographic.fromCartesian(adaptivePosition);
                        $this.lng_stop = Cesium.Math.toDegrees(positionCarto.longitude).toFixed(8);
                        $this.lat_stop = Cesium.Math.toDegrees(positionCarto.latitude).toFixed(8);
                        $this.height_stop = positionCarto.height;
                        $this.position2 = positionCarto;

                        $this._drawLayer.entities.add({
                            position: new Cesium.Cartesian3.fromDegrees(parseFloat($this.lng_stop), parseFloat($this.lat_stop), parseFloat($this.height_stop)),
                            point: {
                                pixelSize: 10,
                                outlineColor: Cesium.Color.BLUE,
                                outlineWidth: 5,
                                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                                clampToGround: true,
                            }
                        });
                        visiableAnalysis();
                    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

                    function visiableAnalysis() {
                        for (var i = 0; i <= 1000; i++) {
                            $this.lng_lerp[i] = parseFloat($this.lng_start) + parseFloat(i * ($this.lng_stop - $this.lng_start) / 1000);
                            $this.lat_lerp[i] = parseFloat($this.lat_start) + parseFloat(i * ($this.lat_stop - $this.lat_start) / 1000);
                            $this.height_lerp[i] = parseFloat($this.height_start) + parseFloat(i * ($this.height_stop - $this.height_start) / 1000);

                            $this.cartographic.push(Cesium.Cartographic.fromDegrees($this.lng_lerp[i], $this.lat_lerp[i], $this.height_lerp[i]));
                            $this.cartographic_lerp.push(Cesium.Cartographic.fromDegrees($this.lng_lerp[i], $this.lat_lerp[i], $this.height_lerp[i]));
                        }


                        Cesium.sampleTerrainMostDetailed($this._viewer.terrainProvider, $this.cartographic).then((raisedPositionsCartograhpic) => {
                            //var raisedPositions = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(raisedPositionsCartograhpic);
                            //var a = raisedPositionsCartograhpic;
                            // console.log(raisedPositionsCartograhpic.length);
                            for (i = 0; i < raisedPositionsCartograhpic.length; i++) {
                                $this.height_terrain.push(raisedPositionsCartograhpic[i].height);
                            }
                            for (var i = 10; i <= 1001; i++) {
                                var forward_hl = $this.height_lerp[i - 1];
                                var forward_ht = $this.height_terrain[i - 1];

                                if (forward_ht - forward_hl >= 2) {
                                    $this.isSeen = false;
                                }

                            }
                            if ($this.isSeen == true) {
                                var visiableLine_Positions = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray($this.cartographic_lerp);
                                var visiableLine = $this._drawLayer.entities.add({
                                    name: 'polyline',
                                    polyline: {
                                        positions: visiableLine_Positions,
                                        width: 10,
                                        material: new Cesium.PolylineGlowMaterialProperty({
                                            glowPower: 0.2,
                                            taperPower: 1,
                                            color: Cesium.Color.GREEN,
                                        })
                                    }
                                });
                                $this.visiableOrNot = "Visible";
                            }
                            else {
                                for (var i = 1; i <= 1001; i++) {
                                    var forward_hl2 = $this.height_lerp[i - 1];
                                    var forward_ht2 = $this.height_terrain[i - 1];
                                    var backward_ht2 = $this.height_terrain[i];
                                    var backward_hl2 = $this.height_lerp[i];
                                    if (forward_hl2 >= forward_ht2) {
                                        if (backward_hl2 < backward_ht2) {
                                            $this.inPoint[$this.m] = i;
                                            $this.m++;
                                        }
                                    }
                                    else {
                                        if (backward_hl2 > backward_ht2) {
                                            $this.outPoint[$this.n] = i;
                                            $this.n++;
                                        }
                                    }
                                }
                                var inLine = $this.cartographic_lerp.slice(0, $this.inPoint[0]);
                                var outLine = $this.cartographic_lerp.slice($this.inPoint[0]);
                                var inLine_Positions = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(inLine);

                                var partvisiableLine = $this._drawLayer.entities.add({
                                    name: 'polyline',
                                    polyline: {
                                        positions: inLine_Positions,
                                        width: 10,
                                        material: new Cesium.PolylineGlowMaterialProperty({
                                            glowPower: 0.2,
                                            taperPower: 1,
                                            color: Cesium.Color.GREEN,
                                        })
                                    }
                                });
                                var outLine_Positions = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(outLine);
                                var invisiableLine = $this._drawLayer.entities.add({
                                    name: 'polyline',
                                    polyline: {
                                        positions: outLine_Positions,
                                        width: 10,
                                        material: new Cesium.PolylineGlowMaterialProperty({
                                            glowPower: 0.2,
                                            taperPower: 1,
                                            color: Cesium.Color.RED,
                                        })
                                    }
                                });
                                $this.visiableOrNot = "Not Visible";
                            }
                        });
                    }
                }else{
                    this.handler.destroy();
                }

            }
        }
        return _
    })(Cesium);

