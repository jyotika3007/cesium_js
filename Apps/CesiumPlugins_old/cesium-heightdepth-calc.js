if (typeof Cesium !== 'undefined')
    /**
     * @author descrip
     * @param viewer {object} three-dimensional object
     * @param options {object} initialization parameters
     * @constructor
     */
    Cesium.HeightDepthCalc = (function (Cesium) {

        /**
         * Drawing objects
         * @param viewer
         * @param options
         * @constructor
         */

        function _(viewer, options = {}) {

            if (viewer && viewer instanceof Cesium.Viewer) {
                this._viewer = viewer;
                this._drawLayer = new Cesium.CustomDataSource("HeightDepthCalcLayer");
                viewer && viewer.dataSources.add(this._drawLayer);
                this.handler = new Cesium.ScreenSpaceEventHandler(this._viewer.canvas);
                this.positions = [];
                this.viewModel = {
                    waterAlpha: 100,
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
                $this.positionsST = [];
                $this.C3positions = [];
                $this.handler.destroy();
                $this._drawLayer.entities.removeAll();
                if ($this.tooltip) $this.tooltip.remove();
            },
            drawHeightDepthCalc: function (options = {}) {
                let $this = this;
                if (this._viewer && options) {
                    $this.positions = [];
                    $this.positionsST = [];
                    $this.C3positions = [];
                    //$this.clearAll();
                    this.handler = new Cesium.ScreenSpaceEventHandler(this._viewer.canvas);
                    this.tooltip = this.createTooltip(this._viewer.container);
                    this.handler.setInputAction(function (movement) {
                        var position = movement.endPosition;
                        if (Cesium.defined(position)) {
                            if ($this.positions.length > 3) {
                                $this.tooltip.showAt(position, "<p>Right-Click to end</p>");
                            } else {
                                $this.tooltip.showAt(position, "<p>Left-Click to add point</p>");
                            }
                            //
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
                        $this.positionsST.push([Number(lng_start), Number(lat_start)]);

                        $this.C3positions.push(adaptivePosition);

                        $this.ent = {
                            position: new Cesium.Cartesian3.fromDegrees(parseFloat(lng_start), parseFloat(lat_start), parseFloat(height_start)),
                            point: {
                                pixelSize: 3,
                                outlineColor: Cesium.Color.WHITE,
                                outlineWidth: 2,
                                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                                clampToGround: true,
                            }
                        };


                        if ($this.C3positions.length > 1) {
                            $this.ent.polyline = {
                                positions: $this.C3positions,
                                width: 4,
                                material: new Cesium.PolylineGlowMaterialProperty({
                                    glowPower: 0.2,
                                    taperPower: 1,
                                    color: Cesium.Color.GREEN,
                                }),
                                clampToGround: true
                            }
                        }
                        $this._drawLayer.entities.add($this.ent);

                    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

                    //final point
                    this.handler.setInputAction(function (movement) {
                        var adaptivePosition = $this._viewer.scene.pickPosition(movement.position);

                        var positionCarto = Cesium.Cartographic.fromCartesian(adaptivePosition);
                        let lng_stop = Cesium.Math.toDegrees(positionCarto.longitude).toFixed(8);
                        let lat_stop = Cesium.Math.toDegrees(positionCarto.latitude).toFixed(8);
                        let height_stop = positionCarto.height;


                        $this.positions.push(Number(lng_stop));
                        $this.positions.push(Number(lat_stop));
                        $this.positions.push(0);
                        $this.positionsST.push([Number(lng_stop), Number(lat_stop)]);

                        $this.C3positions.push(adaptivePosition);
                        $this.C3positions.push($this.C3positions[0]);

                        if ($this.C3positions.length > 1) {
                            $this.ent = {
                                position: new Cesium.Cartesian3.fromDegrees(parseFloat(lng_stop), parseFloat(lat_stop), parseFloat(height_stop)),
                                point: {
                                    pixelSize: 3,
                                    outlineColor: Cesium.Color.WHITE,
                                    outlineWidth: 2,
                                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                                    clampToGround: true,
                                }
                            };

                            $this.ent.polyline = {
                                positions: $this.C3positions,
                                width: 10,
                                material: new Cesium.PolylineGlowMaterialProperty({
                                    glowPower: 0.2,
                                    taperPower: 1,
                                    color: Cesium.Color.GREEN,
                                }),
                                clampToGround: true
                            }
                        }
                        $this._drawLayer.entities.add($this.ent);
                        $this.tooltip.remove();
                        $this.handler.destroy();
                        $this.drawHeightDepth();
                    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                }
            },
            drawHeightDepth: function () {
                let $this = this;
                $this.entity = $this._drawLayer.entities.add({
                    polygon: {
                        hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights($this.positions)),
                        // perPositionHeight: true,
                        // vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
                        material: Cesium.Color.fromCssColorString(`#F0EAD6`).withAlpha(0.2),
                        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        clampToGround: true
                    }
                });
                if ($this.positionsST) {
                    // if (isShowProgressbar !== undefined) isShowProgressbar = true;
                    setTimeout(() => {
                        $this.calcHeightDepth();
                    }, 500);

                }
            },
            calcHeightDepth: function () {
                let $this = this;
                getPolygonInsideCoordinates($this.positionsST, 100.0, function (pointGridCoordinates) {
                    getUpdatedCoordinates(pointGridCoordinates, function (updatedPositions) {
                        //get max heighted location
                        let updatedCoordsHeight = [];
                        pointGridCoordinates.forEach((p, i) => {
                            updatedCoordsHeight.push({
                                lan: p[0],
                                lat: p[1],
                                height: updatedPositions[i].height
                            })
                        });
                        if (updatedCoordsHeight.length > 0 && updatedCoordsHeight[0].height !== undefined) {
                            let maxHeightLocation = updatedCoordsHeight.reduce((a, b) => a.height > b.height ? a : b);
                            let minHeightLocation = updatedCoordsHeight.reduce((a, b) => a.height < b.height ? a : b);
                            var pinBuilder = new Cesium.PinBuilder();
                            let Mxent = {
                                position: new Cesium.Cartesian3.fromDegrees(parseFloat(maxHeightLocation.lan), parseFloat(maxHeightLocation.lat), parseFloat(maxHeightLocation.height)),
                                billboard: {
                                    image: pinBuilder.fromUrl("./img/up-arrow.png", Cesium.Color.RED, 48),
                                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                                    clampToGround: true,
                                    translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 2.5e5, 0)
                                },
                                label: {
                                    text: `Height: ${maxHeightLocation.height.toFixed(2)}m`,
                                    font: '14px sans-serif',
                                    showBackground: true,
                                    font: '14px sans-serif',
                                    horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                    pixelOffset: new Cesium.Cartesian2(-20, -80),
                                    translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 2.5e5, 0)
                                }
                            };
                            $this._drawLayer.entities.add(Mxent);
                            let Mnent = {
                                position: new Cesium.Cartesian3.fromDegrees(parseFloat(minHeightLocation.lan), parseFloat(minHeightLocation.lat), parseFloat(minHeightLocation.height)),
                                billboard: {
                                    image: pinBuilder.fromUrl("./img/down-arrow.png", Cesium.Color.RED, 48),
                                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                                    clampToGround: true,
                                    translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 2.5e5, 0)
                                },
                                label: {
                                    text: `Height: ${minHeightLocation.height.toFixed(2)}m`,
                                    font: '14px sans-serif',
                                    showBackground: true,
                                    font: '14px sans-serif',
                                    horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                    pixelOffset: new Cesium.Cartesian2(-20, -80),
                                    translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 2.5e5, 0)
                                }
                            };
                            $this._drawLayer.entities.add(Mnent);
                            console.log("MaxHeightLocation:", maxHeightLocation);
                            console.log("MinHeightLocation:", minHeightLocation)
                        } else {
                            console.error(`Height not captured...`);
                        }
                        // if (isShowProgressbar !== undefined) isShowProgressbar = false;
                    });
                });
            }
        }
        return _
    })(Cesium);