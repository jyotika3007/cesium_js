if (typeof Cesium !== 'undefined')
    /**
     * @author descrip
     * @param viewer {object} three-dimensional object
     * @param options {object} initialization parameters
     * @constructor
     */
    Cesium.Draggable = (function (Cesium) {

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
                //this.waypointPosition;
                this.routeEntity;
                this.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                this.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
                this.imgpath = "";
                this.toolbar = options && options.toolbar !== undefined ? options.toolbar : "";
                this.viewModal = {
                    verticalOrigin: "bottom",
                    horizontalOrigin: "center",
                    heading: 135,
                    pitch: 50,
                    roll: 50,
                    //clampToGround: true,
                    latitude: "",
                    longitude: "",
                    scale: 1.0,
                    description: "",
                    width: 25,
                    height: 25

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

                var hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(Number($this.viewModal.heading)), Number($this.viewModal.pitch), Number($this.viewModal.roll));
                var orientation = Cesium.Transforms.headingPitchRollQuaternion(
                    coordinates,
                    hpr
                );

                let entity = new Cesium.Entity({
                    position: coordinates,
                    orientation: orientation,
                    description: $this.viewModal.description,
                    billboard: {
                        image: $this.imgpath,//'../Apps/img/cylinder.png',
                        verticalOrigin: $this.verticalOrigin,
                        horizontalOrigin: $this.horizontalOrigin,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        // alignedAxis : Cesium.Cartesian3.UNIT_Z,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,//(typeof options.clampToGround === "boolean" && options.clampToGround === true) ? Cesium.HeightReference.CLAMP_TO_GROUND : false,
                        clampToGround: true,//(typeof options.clampToGround === "boolean") ? options.clampToGround : true,
                        scale: $this.viewModal.scale,
                        pixelOffset: new Cesium.Cartesian2(0, 0), // default: (0, 0)
                        eyeOffset: new Cesium.Cartesian3(10.0, 10.0, 0.0), // default
                        width: $this.viewModal.width,
                        height: $this.viewModal.height
                    },
                });
                return entity;
            },
            createDraggableWaypoint: function (waypointPosition, options = {}) {
                $this = this;
                let picked = false;

                let positionCallback = (time, result) => {
                    //$this.waypointPosition = waypointPosition;
                    return waypointPosition.clone(result);
                };
                let positionCBP = new Cesium.CallbackProperty(positionCallback, false);
                let myPoint = $this.createCesiumPoint(positionCBP);
                $this._viewer.entities.add(myPoint);

                let handler = new Cesium.ScreenSpaceEventHandler($this._viewer.canvas);
                handler.setInputAction((click) => {
                    let pickedObject = $this._viewer.scene.pick(click.position);
                    if (scene.pickPositionSupported && Cesium.defined(pickedObject) && pickedObject.id === myPoint) {
                        picked = true;
                        $this.pickedEntity = pickedObject.id;
                        console.log($this.pickedEntity._id);
                        $this.disableCameraMotion(false, $this._viewer);
                        try {
                            //$this.bindToolbar(true);
                            layerEntityPicked($this.pickedEntity);
                        } catch (ex) { }
                    } else {
                        try {
                            //$this.bindToolbar(false);
                            layerEntityUnPicked();
                        } catch (ex) { }
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
                            if (pickedobj.id.description._value && pickedobj.id.description._value !== "") {
                                $this.tooltip.showAt(movement.endPosition, pickedobj.id.description._value);
                            }
                        } else {
                            $this.tooltip.setVisible(false);
                        }
                        return;
                    }
                    waypointPosition = $this._viewer.camera.pickEllipsoid(movement.endPosition, $this._viewer.scene.globe.ellipsoid);
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
                    }
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
                        if (!$this.isCreated) {
                            $this.waypointPosition = $this.getPointCoordinates(movement);
                            $this.routeEntity = $this.createDraggableWaypoint($this.waypointPosition, options);
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
                }else{
                    Cesium.knockout.cleanNode(document.getElementById($this.toolbar));
                }
            },
            updateEntity: function () {
                let $this = this;
                console.log($this.viewModal);
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

                var hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(Number($this.viewModal.heading)), Number($this.viewModal.pitch), Number($this.viewModal.roll));
                var orientation = Cesium.Transforms.headingPitchRollQuaternion(
                    $this.waypointPosition,
                    hpr
                );

                $this.pickedEntity.orientation = orientation;
                $this.pickedEntity.billboard.scale = Number($this.viewModal.scale);
                $this.pickedEntity.billboard.verticalOrigin = $this.verticalOrigin;
                $this.pickedEntity.billboard.horizontalOrigin = $this.horizontalOrigin;
                $this.pickedEntity.billboard.width = $this.viewModal.width;
                $this.pickedEntity.billboard.height = $this.viewModal.height;
                $this.pickedEntity.description = $this.viewModal.description;

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

