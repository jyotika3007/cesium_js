if (typeof Cesium !== 'undefined')
    /**
     * @author descrip
     * @param viewer {object} three-dimensional object
     * @param options {object} initialization parameters
     * @constructor
     */
    Cesium.Measure = (function (Cesium) {

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

                this._basePath = options.basePath || ''

                this._viewer = viewer
            }
        }
        _.prototype = {
            /***
             * Coordinate conversion 84 to Cartesian
             *
             * @param {Object} {lng,lat,alt} geographic coordinates
             *
             * @return {Object} Cartesian3 three-dimensional position coordinates
             */
            transformWGS84ToCartesian: function (position, alt) {
                if (this._viewer) {
                    return position ?
                        Cesium.Cartesian3.fromDegrees(
                            position.lng || position.lon,
                            position.lat,
                            position.alt = alt || position.alt,
                            Cesium.Ellipsoid.WGS84
                        ) :
                        Cesium.Cartesian3.ZERO
                }
            },
            /***
             * Coordinate array conversion Cartesian to 84
             *
             * @param {Array} WSG84Arr {lng,lat,alt} geographic coordinate array
             * @param {Number} alt up
             * @return {Array} Cartesian3 three-dimensional position coordinate array
             */
            transformWGS84ArrayToCartesianArray: function (WSG84Arr, alt) {
                if (this._viewer && WSG84Arr) {
                    var $this = this
                    return WSG84Arr ?
                        WSG84Arr.map(function (item) {
                            return $this.transformWGS84ToCartesian(item, alt)
                        }) : []
                }
            },
            /***
             * Coordinate conversion Cartesian to 84
             *
             * @param {Object} Cartesian3 three-dimensional position coordinates
             *
             * @return {Object} {lng,lat,alt} geographic coordinates
             */
            transformCartesianToWGS84: function (cartesian) {
                if (this._viewer && cartesian) {
                    var ellipsoid = Cesium.Ellipsoid.WGS84
                    var cartographic = ellipsoid.cartesianToCartographic(cartesian)
                    return {
                        lng: Cesium.Math.toDegrees(cartographic.longitude),
                        lat: Cesium.Math.toDegrees(cartographic.latitude),
                        alt: cartographic.height
                    }
                }
            },
            /***
             * Coordinate array conversion Cartesian to 86
             *
             * @param {Array} cartesianArr three-dimensional position coordinate array
             *
             * @return {Array} {lng,lat,alt} geographic coordinate array
             */
            transformCartesianArrayToWGS84Array: function (cartesianArr) {
                if (this._viewer) {
                    var $this = this
                    return cartesianArr ?
                        cartesianArr.map(function (item) {
                            return $this.transformCartesianToWGS84(item)
                        }) : []
                }
            },
            /**
             * 84 coordinates to radians coordinates
             * @param {Object} position wgs84
             * @return {Object} Cartographic coordinates in radians
             *
             */
            transformWGS84ToCartographic: function (position) {
                return position ?
                    Cesium.Cartographic.fromDegrees(
                        position.lng || position.lon,
                        position.lat,
                        position.alt
                    ) :
                    Cesium.Cartographic.ZERO
            },
            /**
             * Pick up location point
             *
             * @param {Object} px screen coordinates
             *
             * @return {Object} Cartesian3 three-dimensional coordinates
             */
            getCatesian3FromPX: function (px) {

                if (this._viewer && px) {
                    var picks = this._viewer.scene.drillPick(px)
                    var cartesian = null;
                    var isOn3dtiles = false,
                        isOnTerrain = false;
                    // drillPick
                    for (let i in picks) {
                        let pick = picks[i]

                        if (pick &&
                            pick.primitive instanceof Cesium.Cesium3DTileFeature ||
                            pick && pick.primitive instanceof Cesium.Cesium3DTileset ||
                            pick && pick.primitive instanceof Cesium.Model) { //pick model
                            isOn3dtiles = true;
                        }
                        // 3dtilset
                        if (isOn3dtiles) {
                            this._viewer.scene.pick(px) // pick
                            cartesian = this._viewer.scene.pickPosition(px);
                            if (cartesian) {
                                let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                                if (cartographic.height < 0) cartographic.height = 0;
                                let lon = Cesium.Math.toDegrees(cartographic.longitude),
                                    lat = Cesium.Math.toDegrees(cartographic.latitude),
                                    height = cartographic.height;
                                cartesian = this.transformWGS84ToCartesian({
                                    lng: lon,
                                    lat: lat,
                                    alt: height
                                })

                            }
                        }
                    }
                    // Terrain
                    let boolTerrain = this._viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider;
                    // Terrain
                    if (!isOn3dtiles && !boolTerrain) {
                        var ray = this._viewer.scene.camera.getPickRay(px);
                        if (!ray) return null;
                        cartesian = this._viewer.scene.globe.pick(ray, this._viewer.scene);
                        isOnTerrain = true
                    }
                    // Earth
                    if (!isOn3dtiles && !isOnTerrain && boolTerrain) {

                        cartesian = this._viewer.scene.camera.pickEllipsoid(px, this._viewer.scene.globe.ellipsoid);
                    }
                    if (cartesian) {
                        let position = this.transformCartesianToWGS84(cartesian)
                        if (position.alt < 0) {
                            cartesian = this.transformWGS84ToCartesian(position, 0.1)
                        }
                        return cartesian;
                    }
                    return false;
                }

            },
            /**
             * Get the distance of 84 coordinates
             * @param {*} positions 
             */
            getPositionDistance: function (positions) {
                let distance = 0
                for (let i = 0; i < positions.length - 1; i++) {
                    let point1cartographic = this.transformWGS84ToCartographic(positions[i])
                    let point2cartographic = this.transformWGS84ToCartographic(positions[i + 1])
                    let geodesic = new Cesium.EllipsoidGeodesic()
                    geodesic.setEndPoints(point1cartographic, point2cartographic)
                    let s = geodesic.surfaceDistance
                    s = Math.sqrt(
                        Math.pow(s, 2) +
                        Math.pow(point2cartographic.height - point1cartographic.height, 2)
                    )
                    distance = distance + s
                }
                return distance.toFixed(3)
            },
            /**
             * Calculate the area of a polygon composed of a set of coordinates
             * @param {*} positions 
             */
            getPositionsArea: function (positions) {
                let result = 0
                if (positions) {
                    let h = 0
                    let ellipsoid = Cesium.Ellipsoid.WGS84
                    positions.push(positions[0])
                    for (let i = 1; i < positions.length; i++) {
                        let oel = ellipsoid.cartographicToCartesian(
                            this.transformWGS84ToCartographic(positions[i - 1])
                        )
                        let el = ellipsoid.cartographicToCartesian(
                            this.transformWGS84ToCartographic(positions[i])
                        )
                        h += oel.x * el.y - el.x * oel.y
                    }
                    result = Math.abs(h).toFixed(2)
                }
                return result
            },
            /**
             * Ranging
             * @param {*} options 
             */
            drawLineMeasureGraphics: function (options = {}) {

                if (this._viewer && options) {

                    var positions = [],
                        _lineEntity = new Cesium.Entity(),
                        $this = this,
                        lineObj,
                        _handlers = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
                    // left
                    _handlers.setInputAction(function (movement) {

                        var cartesian = $this.getCatesian3FromPX(movement.position);
                        if (cartesian && cartesian.x) {
                            if (positions.length == 0) {
                                positions.push(cartesian.clone());
                            }
                            // Add measurement information points
                            _addInfoPoint(cartesian)
                            positions.push(cartesian);
                        }
                    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

                    _handlers.setInputAction(function (movement) {

                        var cartesian = $this.getCatesian3FromPX(movement.endPosition);
                        if (positions.length >= 2) {
                            if (cartesian && cartesian.x) {
                                positions.pop();
                                positions.push(cartesian);
                            }
                        }
                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    // right
                    _handlers.setInputAction(function (movement) {

                        _handlers.destroy()
                        _handlers = null

                        let cartesian = $this.getCatesian3FromPX(movement.position);
                        _addInfoPoint(cartesian)

                        if (typeof options.callback === 'function') {

                            options.callback($this.transformCartesianArrayToWGS84Array(positions), lineObj);
                        }
                    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

                    _lineEntity.polyline = {
                        width: options.width || 5,
                        material: options.material || Cesium.Color.BLUE.withAlpha(0.8),
                        clampToGround: options.clampToGround || false
                    }
                    _lineEntity.polyline.positions = new Cesium.CallbackProperty(function () {
                        return positions
                    }, false)

                    lineObj = this._drawLayer.entities.add(_lineEntity)

                    //Add coordinate points
                    function _addInfoPoint(position) {
                        _labelEntity = new Cesium.Entity()
                        _labelEntity.position = position
                        _labelEntity.point = {
                            pixelSize: 7,
                            outlineColor: Cesium.Color.BLUE,
                            outlineWidth: 5
                        }

                        var last_pos_distance = "";
                        if (positions.length > 1) {
                            var last_pos = [positions[positions.length - 2], positions[positions.length - 1]];
                            last_pos_distance = ($this.getPositionDistance($this.transformCartesianArrayToWGS84Array(last_pos)) / 1000).toFixed(4) + ' Km\n';
                        }

                        var pinBuilder = new Cesium.PinBuilder();
                        _labelEntity.billboard = {
                            image: pinBuilder.fromText(positions.length, Cesium.Color.RED, 40).toDataURL(),
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            clampToGround: true
                        };
                        _labelEntity.label = {
                            text: last_pos_distance + 'Total: ' + ($this.getPositionDistance($this.transformCartesianArrayToWGS84Array(positions)) / 1000).toFixed(4) + ' Km',
                            show: true,
                            showBackground: true,
                            font: '14px sans-serif',
                            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            pixelOffset: new Cesium.Cartesian2(-20, -80) //left top
                        }
                        $this._drawLayer.entities.add(_labelEntity)
                    }
                }

            },
            /**
             * Measure area
             * @param {*} options 
             */
            drawAreaMeasureGraphics: function (options = {}) {

                if (this._viewer && options) {

                    var positions = [],
                        polygon = new Cesium.PolygonHierarchy(),
                        _polygonEntity = new Cesium.Entity(),
                        $this = this,
                        polyObj = null,
                        _label = '',
                        _handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
                    // left
                    _handler.setInputAction(function (movement) {

                        var cartesian = $this.getCatesian3FromPX(movement.position);
                        if (cartesian && cartesian.x) {
                            if (positions.length == 0) {
                                polygon.positions.push(cartesian.clone())
                                positions.push(cartesian.clone());
                            }
                            positions.push(cartesian.clone());
                            polygon.positions.push(cartesian.clone())

                            if (!polyObj) create()
                        }
                    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    // mouse
                    _handler.setInputAction(function (movement) {

                        var cartesian = $this.getCatesian3FromPX(movement.endPosition);
                        // var cartesian = $this._viewer.scene.camera.pickEllipsoid(movement.endPosition, $this._viewer.scene.globe.ellipsoid);
                        if (positions.length >= 2) {
                            if (cartesian && cartesian.x) {
                                positions.pop()
                                positions.push(cartesian);
                                polygon.positions.pop()
                                polygon.positions.push(cartesian);
                            }
                        }
                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

                    // right
                    _handler.setInputAction(function (movement) {
                        let cartesian = $this.getCatesian3FromPX(movement.endPosition);

                        _handler.destroy();

                        positions.push(positions[0]);

                        // Add information point
                        _addInfoPoint(positions[0])
                        if (typeof options.callback === 'function') {

                            options.callback($this.transformCartesianArrayToWGS84Array(positions), polyObj);
                        }
                    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

                    function create() {
                        _polygonEntity.polyline = {
                            width: 3,
                            material: Cesium.Color.BLUE.withAlpha(0.8),
                            clampToGround: options.clampToGround || false
                        }

                        _polygonEntity.polyline.positions = new Cesium.CallbackProperty(function () {
                            return positions
                        }, false)

                        _polygonEntity.polygon = {
                            hierarchy: new Cesium.CallbackProperty(function () {
                                return polygon
                            }, false),
                            material: Cesium.Color.RED.withAlpha(0.1),
                            clampToGround: options.clampToGround || false
                        }
                        polyObj = $this._drawLayer.entities.add(_polygonEntity)
                    }

                    function _addInfoPoint(position) {
                        var _labelEntity = new Cesium.Entity()
                        _labelEntity.position = position
                        _labelEntity.point = {
                            pixelSize: 7,
                            outlineColor: Cesium.Color.BLUE,
                            outlineWidth: 5
                        }
                        _labelEntity.label = {
                            text: ($this.getPositionsArea($this.transformCartesianArrayToWGS84Array(positions)) / 1000000.0).toFixed(4) + 'SqKm',
                            show: true,
                            showBackground: true,
                            font: '14px sans-serif',
                            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            pixelOffset: new Cesium.Cartesian2(-20, -50) //left top
                        }
                        $this._drawLayer.entities.add(_labelEntity)
                    }
                }

            },
            /**
             * Triangulation measurement
             * @param {*} options 
             */
            drawTrianglesMeasureGraphics: function (options = {}) {
                options.style = options.style || {
                    width: 3,
                    material: Cesium.Color.BLUE.withAlpha(0.5)
                }
                if (this._viewer && options) {

                    var _trianglesEntity = new Cesium.Entity(),
                        _tempLineEntity = new Cesium.Entity(),
                        _tempLineEntity2 = new Cesium.Entity(),
                        _positions = [],
                        _tempPoints = [],
                        _tempPoints2 = [],
                        $this = this,
                        _handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
                    // Height
                    function _getHeading(startPosition, endPosition) {
                        if (!startPosition && !endPosition) return 0
                        if (Cesium.Cartesian3.equals(startPosition, endPosition)) return 0
                        let cartographic = Cesium.Cartographic.fromCartesian(startPosition);
                        let cartographic2 = Cesium.Cartographic.fromCartesian(endPosition);
                        return (cartographic2.height - cartographic.height).toFixed(2)
                    }
                    // Offset point
                    function _computesHorizontalLine(positions) {
                        let cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
                        let cartographic2 = Cesium.Cartographic.fromCartesian(positions[1]);
                        return Cesium.Cartesian3.fromDegrees(
                            Cesium.Math.toDegrees(cartographic.longitude),
                            Cesium.Math.toDegrees(cartographic.latitude),
                            cartographic2.height
                        )
                    }
                    // left
                    _handler.setInputAction(function (movement) {

                        var position = $this.getCatesian3FromPX(movement.position);
                        if (!position && !position.z) return false
                        if (_positions.length == 0) {
                            _positions.push(position.clone())
                            _positions.push(position.clone())
                            _tempPoints.push(position.clone())
                            _tempPoints.push(position.clone())
                        } else {
                            _handler.destroy();
                            if (typeof options.callback === 'function') {

                                options.callback({
                                    e: _trianglesEntity,
                                    e2: _tempLineEntity,
                                    e3: _tempLineEntity2
                                });
                            }
                        }
                    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    // mouse
                    _handler.setInputAction(function (movement) {

                        var position = $this.getCatesian3FromPX(movement.endPosition);
                        if (position && _positions.length > 0) {
                            //Line
                            _positions.pop()
                            _positions.push(position.clone());
                            let horizontalPosition = _computesHorizontalLine(_positions)
                            //Height
                            _tempPoints.pop()
                            _tempPoints.push(horizontalPosition.clone())
                            //Horizontal Line
                            _tempPoints2.pop(), _tempPoints2.pop()
                            _tempPoints2.push(position.clone())
                            _tempPoints2.push(horizontalPosition.clone())
                        }
                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

                    // create entity

                    //Line
                    _trianglesEntity.polyline = {
                        positions: new Cesium.CallbackProperty(function () {
                            return _positions
                        }, false),
                        ...options.style
                    }
                    _trianglesEntity.position = new Cesium.CallbackProperty(function () {
                        return _positions[0]
                    }, false)
                    
                    _trianglesEntity.point = {
                        pixelSize: 7,
                        outlineColor: Cesium.Color.BLUE,
                        outlineWidth: 5
                    }
                    _trianglesEntity.label = {
                        text: new Cesium.CallbackProperty(function () {
                            return 'Diagonal Distance : ' + $this.getPositionDistance($this.transformCartesianArrayToWGS84Array(_positions)) + ' Meter'
                        }, false),
                        show: true,
                        showBackground: true,
                        font: '14px sans-serif',
                        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(50, -100) //left top
                    }
                    //Height
                    _tempLineEntity.polyline = {
                        positions: new Cesium.CallbackProperty(function () {
                            return _tempPoints
                        }, false),
                        ...options.style
                    }
                    _tempLineEntity.position = new Cesium.CallbackProperty(function () {
                        return _tempPoints2[1]
                    }, false)
                    _tempLineEntity.point = {
                        pixelSize: 7,
                        outlineColor: Cesium.Color.BLUE,
                        outlineWidth: 5
                    }
                    _tempLineEntity.label = {
                        text: new Cesium.CallbackProperty(function () {
                            return 'Height: ' + _getHeading(_tempPoints[0], _tempPoints[1]) + ' Meter'
                        }, false),
                        show: true,
                        showBackground: true,
                        font: '14px sans-serif',
                        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(-20, 100) //left top
                    }
                    //Level
                    _tempLineEntity2.polyline = {
                        positions: new Cesium.CallbackProperty(function () {
                            return _tempPoints2
                        }, false),
                        ...options.style
                    }
                    _tempLineEntity2.position = new Cesium.CallbackProperty(function () {
                        return _positions[1]
                    }, false)
                    _tempLineEntity2.point = {
                        pixelSize: 7,
                        outlineColor: Cesium.Color.BLUE,
                        outlineWidth: 5
                    }
                    _tempLineEntity2.label = {
                        text: new Cesium.CallbackProperty(function () {
                            return 'Horizontal Distance: ' + $this.getPositionDistance($this.transformCartesianArrayToWGS84Array(_tempPoints2)) + ' Meter'
                        }, false),
                        show: true,
                        showBackground: true,
                        font: '14px sans-serif',
                        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(-150, -20) //left top
                    }
                    this._drawLayer.entities.add(_tempLineEntity2)
                    this._drawLayer.entities.add(_tempLineEntity)
                    this._drawLayer.entities.add(_trianglesEntity)
                }
            },
            drawT_Triangle: function (options = {}) { //NOT WORKING
                if (this._viewer && options) {

                    let trianArr = [];
                    let distanceLineNum = 0;
                    let XLine;
                    let X, Y, H;
                    let $this = this;
                    let position = null;
                    let lon, lat, MouseHeight;
                    let handlerT = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
                    handlerT.setInputAction(function (movement) {
                        //var position = $this.getCatesian3FromPX(movement.position);
                        distanceLineNum++;
                        if (distanceLineNum === 1) {
                            trianArr.push(lon, lat, MouseHeight);
                            XLine = viewer.entities.add({
                                id: 'triangleLine',
                                polyline: {
                                    //Lazy evaluation by callback function
                                    positions: new Cesium.CallbackProperty(function () {
                                        if (MouseHeight > trianArr[2]) {
                                            return Cesium.Cartesian3.fromDegreesArrayHeights([trianArr[0], trianArr[1], trianArr[2], trianArr[0], trianArr[1], MouseHeight, A, B, MouseHeight, trianArr[0], trianArr[1], trianArr[2]]);
                                        } else {
                                            return Cesium.Cartesian3.fromDegreesArrayHeights([trianArr[0], trianArr[1], trianArr[2], A, B, trianArr[2], A, B, MouseHeight, trianArr[0], trianArr[1], trianArr[2]]);
                                        }
                                        //Return an array of Cartesian3 positions given a set of longitude, latitude, and altitude values, where longitude and latitude are given in degrees. /Cartesian3 returns Cartesian coordinates
                                        //true When the callback function returns the same value each time, if the value changes, it is false
                                    }, false),
                                    arcType: Cesium.ArcType.NONE,
                                    width: 2,
                                    material: new Cesium.PolylineOutlineMaterialProperty({
                                        color: Cesium.Color.YELLOW
                                    }),
                                    depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
                                        color: Cesium.Color.RED
                                    })
                                }
                            });
                        } else {
                            distanceLineNum = 0;
                            trianArr.push(lon, lat, MouseHeight);
                            handlerT.destroy();
                            this._viewer.entities.removeById('triangleLine');
                            XLine = viewer.entities.add({
                                id: 'triangleLine',
                                polyline: {
                                    positions: MouseHeight > trianArr[2] ? new Cesium.Cartesian3.fromDegreesArrayHeights([trianArr[0], trianArr[1], trianArr[2], trianArr[0], trianArr[1], trianArr[5], trianArr[3], trianArr[4], trianArr[5], trianArr[0], trianArr[1], trianArr[2]]) : new Cesium.Cartesian3.fromDegreesArrayHeights([trianArr[0], trianArr[1], trianArr[2], trianArr[3], trianArr[4], trianArr[5], trianArr[3], trianArr[4], trianArr[2], trianArr[0], trianArr[1], trianArr[2]]),
                                    arcType: Cesium.ArcType.NONE,
                                    width: 2,
                                    material: new Cesium.PolylineOutlineMaterialProperty({
                                        color: Cesium.Color.YELLOW
                                    }),
                                    depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
                                        color: Cesium.Color.RED
                                    })
                                }
                            });

                            // space
                            let lineDistance = Cesium.Cartesian3.distance(Cesium.Cartesian3.fromDegrees(trianArr[0], trianArr[1]), Cesium.Cartesian3.fromDegrees(trianArr[3], trianArr[4])).toFixed(2);
                            //Height
                            let height = Math.abs(trianArr[2] - trianArr[5]).toFixed(2);
                            //Straight line distance 
                            let strLine = (Math.sqrt(Math.pow(lineDistance, 2) + Math.pow(height, 2))).toFixed(2);
                            X = this._viewer.entities.add({
                                id: 'lineX',
                                position: Cesium.Cartesian3.fromDegrees((trianArr[0] + trianArr[3]) / 2, (trianArr[1] + trianArr[4]) / 2, Math.max(trianArr[2], trianArr[5])),
                                label: {
                                    text: 'Spatial distance: ' + lineDistance + ' Meter',
                                    translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
                                    font: '45px italic',
                                    fillColor: Cesium.Color.WHITE,
                                    outlineColor: Cesium.Color.BLACK,
                                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                    outlineWidth: 3,
                                    disableDepthTestDistance: 1000000000,
                                    scale: 0.5,
                                    pixelOffset: new Cesium.Cartesian2(0, -10),
                                    backgroundColor: new Cesium.Color.fromCssColorString("rgba(0, 0, 0, 0.7)"),
                                    backgroundPadding: new Cesium.Cartesian2(10, 10),
                                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                                }
                            });
                            H = this._viewer.entities.add({
                                id: 'lineZ',
                                position: MouseHeight > trianArr[2] ? Cesium.Cartesian3.fromDegrees(trianArr[0], trianArr[1], (trianArr[2] + trianArr[5]) / 2) : Cesium.Cartesian3.fromDegrees(trianArr[3], trianArr[4], (trianArr[2] + trianArr[5]) / 2),
                                label: {
                                    text: 'Height difference: ' + height + ' Meter',
                                    translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
                                    font: '45px italic',
                                    fillColor: Cesium.Color.WHITE,
                                    outlineColor: Cesium.Color.BLACK,
                                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                    outlineWidth: 3,
                                    disableDepthTestDistance: 1000000000,
                                    scale: 0.5,
                                    pixelOffset: new Cesium.Cartesian2(0, -10),
                                    backgroundColor: new Cesium.Color.fromCssColorString("rgba(0, 0, 0, 0.7)"),
                                    backgroundPadding: new Cesium.Cartesian2(10, 10),
                                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                                }
                            });
                            Y = this._viewer.entities.add({
                                id: 'lineY',
                                position: Cesium.Cartesian3.fromDegrees((trianArr[0] + trianArr[3]) / 2, (trianArr[1] + trianArr[4]) / 2, (trianArr[2] + trianArr[5]) / 2),
                                label: {
                                    text: 'Line distance: ' + strLine + ' Meter',
                                    translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
                                    font: '45px italic',
                                    fillColor: Cesium.Color.WHITE,
                                    outlineColor: Cesium.Color.BLACK,
                                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                    outlineWidth: 3,
                                    disableDepthTestDistance: 1000000000,
                                    scale: 0.5,
                                    pixelOffset: new Cesium.Cartesian2(0, -10),
                                    backgroundColor: new Cesium.Color.fromCssColorString("rgba(0, 0, 0, 0.7)"),
                                    backgroundPadding: new Cesium.Cartesian2(10, 10),
                                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                                }
                            });
                        }
                    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

                    handlerT.setInputAction(function (movement) {
                        position = $this.getCatesian3FromPX(movement.endPosition);
                        var ray = viewer.camera.getPickRay(movement.endPosition);
                        mousePosition = viewer.scene.globe.pick(ray, viewer.scene);
                        if (Cesium.defined(mousePosition)) {
                            var cartographic = Cesium.Cartographic.fromCartesian(mousePosition);
                            lat = cartographic.latitude;
                            lon = cartographic.longitude;
                        }
                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
                }

            }
        }
        return _
    })(Cesium);