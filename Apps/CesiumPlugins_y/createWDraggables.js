var WdraggablesEnabled = false;
if (typeof Cesium !== 'undefined')
    /**
     * @author descrip
     * @param viewer {object} three-dimensional object
     * @param options {object} initialization parameters
     * @constructor
     */
    Cesium.WDraggable = (function (Cesium) {

        /**
         * Drawing objects
         * @param viewer
         * @param options
         * @constructor
         */

        function _(viewer, options = {}) {
            if (viewer && viewer instanceof Cesium.Viewer && options.drawLayer) {
                // this._drawLayer = options.drawLayer;
                // viewer && viewer.dataSources.add(this._drawLayer);
                this._basePath = options.basePath || '';
                this._viewer = viewer;
                this.handler = new Cesium.ScreenSpaceEventHandler(this._viewer.canvas);
                this.isCreated = false;

                this.pickedEntity;
                this.lastLatLon = {
                    lat: 0,
                    lon: 0
                };
                //this.waypointPosition;
                this.routeEntity;
                this.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                this.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
                this.imgpath = "";
                this.poschanger = false;
                this.toolbar = options && options.toolbar !== undefined ? options.toolbar : "";
                this.viewModal = {
                    verticalOrigin: "bottom",
                    horizontalOrigin: "center",
                    heading: 135,
                    pitch: 0,
                    roll: 0,
                    clampToGround: true,
                    latitude: "",
                    longitude: "",
                    scale: 1.0,
                    description: "",
                    width: 48,
                    height: 48,
                    lat: 0,
                    lon: 0,
                    sizeInMeters: false,
                    imgpath: undefined,
                    isPin: true,
                    pinColor: "#4169E1",
                    rotation: 0.0

                };
                // this.pickedObject = null;
                // this.picked = false;
                //this.waypointPosition = null;
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
            },
            hideLayer: function () {
                // need to code here
            },
            disableCameraMotion: function (state, viewer) {
                viewer.scene.screenSpaceCameraController.enableRotate = state;
                viewer.scene.screenSpaceCameraController.enableZoom = state;
                viewer.scene.screenSpaceCameraController.enableLook = state;
                viewer.scene.screenSpaceCameraController.enableTilt = state;
                viewer.scene.screenSpaceCameraController.enableTranslate = state;
            },
            getPointCoordinates: function (event) {
                let clickPosition = this._viewer.camera.pickEllipsoid(event.position);
                return clickPosition;
            },
            createCesiumPoint: function (coordinates) {
                $this = this;

                //var hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(Number($this.viewModal.heading)), Number($this.viewModal.pitch), Number($this.viewModal.roll));
                // var orientation = Cesium.Transforms.headingPitchRollQuaternion(
                //     coordinates,
                //     hpr
                // );

                var orientation = {
                    heading: Cesium.Math.toRadians(Number($this.viewModal.heading) || 0),
                    pitch: Cesium.Math.toRadians(Number($this.viewModal.pitch) || 0),
                    roll: Number($this.viewModal.roll)
                }

                let pinColor = Cesium.Color.fromCssColorString($this.viewModal.pinColor ? $this.viewModal.pinColor : "#4169E1");
                let entity = new Cesium.Entity({
                    position: coordinates,
                    orientation: orientation,
                    description: $this.viewModal.description,
                    searchableProperties: $this.searchableProperties,
                    billboard: {
                        image: $this.viewModal.isPin ? (new Cesium.PinBuilder()).fromUrl($this.imgpath, pinColor, $this.viewModal.width) : $this.imgpath, //'../Apps/img/cylinder.png',
                        verticalOrigin: $this.verticalOrigin,
                        horizontalOrigin: $this.horizontalOrigin,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        //alignedAxis : Cesium.Cartesian3.UNIT_Z,
                        //heightReference: (typeof $this.viewModal.clampToGround === "boolean" && $this.viewModal.clampToGround === true) ? Cesium.HeightReference.CLAMP_TO_GROUND : false,
                        clampToGround: (typeof $this.viewModal.clampToGround === "boolean") ? $this.viewModal.clampToGround : true,
                        scale: $this.viewModal.scale,
                        // pixelOffset: new Cesium.Cartesian2(0, 0), // default: (0, 0)
                        // eyeOffset: new Cesium.Cartesian3(10.0, 10.0, 0.0), // default
                        width: $this.viewModal.width,
                        height: $this.viewModal.height,
                        // show: true,
                        showBackground: true,
                        sizeInMeters: (typeof $this.viewModal.sizeInMeters === "boolean") ? $this.viewModal.sizeInMeters : false,
                        rotation: $this.viewModal.rotation, // default: 0.0
                        alignedAxis: Cesium.Cartesian3.UNIT_Z, // default
                        //scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
                    },
                });

                if (typeof $this.viewModal.clampToGround === "boolean" && $this.viewModal.clampToGround === true) {
                    entity.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                } else {
                    entity.billboard.heightReference = Cesium.HeightReference.NONE;
                }
                return entity;
            },
            createWDraggableWaypoint: function (waypointPosition, options = {}) {
                var $this = this;
                let picked = false;

                let positionCallback = (time, result) => {
                    if ($this.poschanger) {
                        let np = Cesium.Cartesian3.fromDegrees(Number($this.viewModal.lon), Number($this.viewModal.lat));
                        $this.poschanger = false;
                        return waypointPosition.clone(np);
                    } else {
                        return waypointPosition.clone(result);
                    }
                };
                let positionCBP = new Cesium.CallbackProperty(positionCallback, false);
                let myPoint = $this.createCesiumPoint(positionCBP);
                $this._viewer.entities.add(myPoint);

                let handler = new Cesium.ScreenSpaceEventHandler($this._viewer.canvas);
                handler.setInputAction((click) => {
                    if (!WdraggablesEnabled) return;
                    let pickedObject = $this._viewer.scene.pick(click.position);
                    if (scene.pickPositionSupported && Cesium.defined(pickedObject) && pickedObject.id === myPoint) {
                        picked = true;
                        $this.pickedEntity = pickedObject.id;
                        console.log($this.pickedEntity._id);
                        $this.disableCameraMotion(false, $this._viewer);
                        try {
                            $this.bindToolbar(false);
                            $this.bindToolbar(true);
                            layerEntityPicked($this.pickedEntity, true);
                        } catch (ex) {}
                    } else {
                        try {
                            $this.bindToolbar(false);
                            layerEntityUnPicked(true);
                        } catch (ex) {}
                    }
                    // if(Cesium.defined($this.pickedEntity))
                    // {
                    //     picked = true;
                    //     console.log($this.pickedEntity._id);
                    //     $this.disableCameraMotion(false, $this._viewer);
                    // }

                }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

                handler.setInputAction((movement) => {
                    // let pickedObject = $this._viewer.scene.pick(movement.endPosition);
                    // if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
                    //     $this.pickedEntity  = pickedObject.id;
                    //     console.log("two", $this.pickedEntity._id);
                    // }

                    if (!picked) {
                        let pickedobj = $this._viewer.scene.pick(movement.endPosition);
                        if (Cesium.defined(pickedobj)) {
                            if (pickedobj.id.description && pickedobj.id.description._value && pickedobj.id.description._value !== "") {
                                $this.tooltip.showAt(movement.endPosition, pickedobj.id.description._value);
                            }
                        } else {
                            $this.tooltip.setVisible(false);
                        }
                        return;
                    }
                    if (!WdraggablesEnabled) return;
                    waypointPosition = $this._viewer.camera.pickEllipsoid(movement.endPosition, $this._viewer.scene.globe.ellipsoid);
                    let deg = toDegrees(waypointPosition)
                    if (deg === undefined) deg = {
                        lat: 0,
                        lon: 0
                    };
                    $this.viewModal.lat = deg.lat;
                    $this.viewModal.lon = deg.lon;
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

                handler.setInputAction((movement) => {
                    picked = false;
                    //$this.pickedEntity = undefined;
                    $this.disableCameraMotion(true, $this._viewer);
                }, Cesium.ScreenSpaceEventType.LEFT_UP);

                return myPoint;
            },
            drawEntity: function (options = {}) {
                let $this = this;
                this.tooltip = this.createTooltip(this._viewer.container);
                if (this._viewer && options) {
                    if (options.description) {
                        $this.viewModal.description = options.description;
                    }
                    if (options.imgpath) {
                        $this.imgpath = options.imgpath;
                        $this.viewModal.imgpath = options.imgpath;
                    }
                    $this.searchableProperties = options.searchableProperties;
                    /*
                    this.tooltip = this.createTooltip(this._viewer.container);
                    $this.handler.setInputAction(function (movement) {
                        var position = movement.endPosition;
                        $this.tooltip.showAt(position, "<p>Double-Click to add entity</p>");
                        let pickedObject = $this._viewer.scene.pick(movement.endPosition);
                        if (Cesium.defined(pickedObject)) {
                            //$this.pickedEntity = pickedObject[0].id;
                            console.log("one", pickedObject.id);
                        }

                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    */
                    //initial point
                    $this.handler.setInputAction(function (movement) {
                        if (!WdraggablesEnabled) return;
                        if (!$this.isCreated) {
                            $this.waypointPosition = $this.getPointCoordinates(movement);
                            $this.routeEntity = $this.createWDraggableWaypoint($this.waypointPosition, options);
                            $this.isCreated = true;
                        }
                    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                    //$this.bindToolbar(true);
                }
            },
            bindToolbar: function (enabled) {
                let $this = this;
                if ($this.toolbar !== "" && enabled) {
                    Cesium.knockout.track($this.viewModal);
                    Cesium.knockout.applyBindings($this.viewModal, document.getElementById($this.toolbar));
                    for (var name in $this.viewModal) {
                        if ($this.viewModal.hasOwnProperty(name)) {
                            Cesium.knockout
                                .getObservable($this.viewModal, name)
                                .subscribe(function () {
                                    eval($this.updateEntity());
                                });
                        }
                    }
                } else {
                    Cesium.knockout.cleanNode(document.getElementById($this.toolbar));
                }
            },
            updateEntity: function () {
                let $this = this;
                //console.log($this.viewModal);
                switch ($this.viewModal.verticalOrigin) {
                    case "bottom":
                        $this.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                        break;
                    case "top":
                        $this.verticalOrigin = Cesium.VerticalOrigin.TOP;
                        break;
                    case "center":
                        $this.verticalOrigin = Cesium.VerticalOrigin.CENTER;
                        break;
                    default:
                        $this.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                }

                switch ($this.viewModal.horizontalOrigin) {
                    case "left":
                        $this.horizontalOrigin = Cesium.HorizontalOrigin.LEFT;
                        break;
                    case "right":
                        $this.horizontalOrigin = Cesium.HorizontalOrigin.RIGHT;
                        break;
                    case "center":
                        $this.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
                        break;
                    default:
                        $this.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
                }

                //let orientation = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(Number($this.viewModal.heading)), Number($this.viewModal.pitch), Number($this.viewModal.roll));

                //var hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(Number($this.viewModal.heading)), Number($this.viewModal.pitch), Number($this.viewModal.roll));
                // var orientation = Cesium.Transforms.headingPitchRollQuaternion(
                //     $this.waypointPosition,
                //     hpr
                // );

                var orientation = {
                    heading: Cesium.Math.toRadians(Number($this.viewModal.heading) || 0),
                    pitch: Cesium.Math.toRadians(Number($this.viewModal.pitch) || 0),
                    roll: Number($this.viewModal.roll)
                }

                $this.pickedEntity.orientation = orientation;
                $this.pickedEntity.billboard.scale = Number($this.viewModal.scale);
                $this.pickedEntity.billboard.verticalOrigin = $this.verticalOrigin;
                $this.pickedEntity.billboard.horizontalOrigin = $this.horizontalOrigin;
                $this.pickedEntity.billboard.width = $this.viewModal.width;
                $this.pickedEntity.billboard.height = $this.viewModal.height;
                $this.pickedEntity.billboard.rotation = $this.viewModal.rotation;
                $this.pickedEntity.description = $this.viewModal.description;

                let pinColor = Cesium.Color.fromCssColorString($this.viewModal.pinColor ? $this.viewModal.pinColor : "#4169E1");
                $this.pickedEntity.billboard.image = $this.viewModal.isPin ? (new Cesium.PinBuilder()).fromUrl($this.imgpath, pinColor, $this.viewModal.width) : $this.imgpath,
                    $this.viewModal.imgpath = $this.imgpath;

                $this.pickedEntity.billboard.sizeInMeters = (typeof $this.viewModal.sizeInMeters === "boolean") ? $this.viewModal.sizeInMeters : false
                $this.poschanger = true;
                //$this.waypointPosition = Cesium.Cartesian3.fromDegrees(Number($this.viewModal.lon), Number($this.viewModal.lat));
                //$this.pickedEntity.position = Cesium.Cartesian3.fromDegrees($this.viewModal.lon, $this.viewModal.lat);

                if (typeof $this.viewModal.clampToGround === "boolean" && $this.viewModal.clampToGround === true) {
                    $this.pickedEntity.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                    $this.pickedEntity.billboard.clampToGround = true;
                } else {
                    $this.pickedEntity.billboard.heightReference = Cesium.HeightReference.NONE;
                    $this.pickedEntity.billboard.clampToGround = false;
                }

                Cesium.Cartesian3.fromDegrees($this.viewModal.lat, $this.viewModal.lon, 0);
                // let entity = new Cesium.Entity({
                //     position: coordinates,
                //     orientation: orientation,
                //     description: $this.viewModal.description,
                //     billboard: {
                //         image: $this.imgpath,//'../Apps/img/cylinder.png',
                //         verticalOrigin: $this.verticalOrigin,
                //         horizontalOrigin: $this.horizontalOrigin,
                //         disableDepthTestDistance: Number.POSITIVE_INFINITY,
                //         // alignedAxis : Cesium.Cartesian3.UNIT_Z,
                //         heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,//(typeof options.clampToGround === "boolean" && options.clampToGround === true) ? Cesium.HeightReference.CLAMP_TO_GROUND : false,
                //         clampToGround: true,//(typeof options.clampToGround === "boolean") ? options.clampToGround : true,
                //         scale: $this.viewModal.scale
                //     },
                //});

            }

        }
        return _
    })(Cesium);