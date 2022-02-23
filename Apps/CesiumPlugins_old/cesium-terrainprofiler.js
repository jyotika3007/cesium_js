if (typeof Cesium !== 'undefined')
    /**
     * @author descrip
     * @param viewer {object} three-dimensional object
     * @param options {object} initialization parameters
     * @constructor
     */
    Cesium.TerrainProfiler = (function (Cesium) {

        /**
         * Drawing objects
         * @param viewer
         * @param options
         * @constructor
         */

        var positions = [];
        var positionsCartographic = [];
        var positions_Inter = [];
        var poly = null;
        var distance = 0;
        var cartesian = null;
        var DistanceArray = [];
        var profileItem = [];
        var _viewer;

        function createProfileChart(Positions) {
            // console.log(Positions);
            //var x_Range = parseInt(Positions[Positions.length - 1].distance);
            // console.log(x_Range);
            var ProfileData = [];
            var ProfileData_Lon = [];

            var y_Min = 100000000;
            for (let index = 0; index < Positions.length; index++) {
                const element = Positions[index];
                var m_distance = element.distance.toFixed(2);
                var m_Lon = element.point[0].toFixed(5);
                var m_Lat = element.point[1].toFixed(5);
                var m_height = element.point[2].toFixed(2);
                if (m_height < y_Min) {
                    y_Min = m_height;
                }
                var m_data = [m_distance, m_height];
                ProfileData.push(m_data);
                ProfileData_Lon.push([m_Lon, m_Lat]);
            }
            // console.log(ProfileData);
            document.getElementById("profileChart").innerHTML = "";
            document.getElementById("profileChart").style.display = 'block';
            var lineChart = echarts.init(document.getElementById("profileChart"));
            // background: rgba(255, 255, 255, 1);
            var lineoption = {
                title: {
                    text: 'Terrain Profile Analysis',
                    textStyle: {
                        color: '#8FDAEB'
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter(params) {
                        // console.log(params['data']);
                        return "Current height:" + params[0]['data'][1];
                    },
                },
                // legend: {
                //     data: ['hatching']
                // },
                grid: {
                    x: 40,
                    x2: 40,
                    y2: 24
                },
                calculable: true,
                xAxis: [{
                    type: 'value',
                    name: 'Distance',
                    max: 'dataMax',
                    scale: true,
                    splitLine: {
                        lineStyle: {
                            color: '#8FDAEB'
                        }
                    },
                    axisLabel: {
                        interval: '0',
                        textStyle: {
                            color: '#fff',
                        }
                    }
                }],
                yAxis: [{
                    type: 'value',
                    name: 'Height',
                    min: y_Min,
                    scale: true,
                    splitLine: {
                        lineStyle: {
                            color: '#8FDAEB'
                        }
                    },
                    axisLabel: {
                        interval: '0',
                        textStyle: {
                            color: '#fff',
                        }
                    },
                    nameTextStyle: {
                        color: '#fff'
                    }
                }],
                series: [{
                    // name: 'hatching',
                    type: 'bar',
                    data: ProfileData,
                    markPoint: {
                        data: [{
                                type: 'max',
                                name: 'highest point'
                            },
                            {
                                type: 'min',
                                name: 'lowest point'
                            }
                        ],
                        // itemStyle: { //Bubbles color
                        //     color: '#4EC43E'
                        //   }
                    }
                }]
            };
            lineChart.setOption(lineoption);

            //document.getElementById("profileChart").style.backgroundColor = 'rgba(255, 255, 255, 1)';

            $(window).resize(lineChart.resize);
        }

        function cartesian3ToDegrees(cartesian3) {
            var ellipsoid = _viewer.scene.globe.ellipsoid;
            var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var alt = cartographic.height;
            var pos = [lng, lat, alt];
            return pos;
        }

        function getSpaceDistance(positions) {
            profileItem = [{
                point: cartesian3ToDegrees(positions[0]),
                distance: 0
            }];
            var distance = 0;
            for (var i = 0; i < positions.length - 1; i++) {

                var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
                var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
                /**Calculate distance based on latitude and longitude**/
                var geodesic = new Cesium.EllipsoidGeodesic();
                geodesic.setEndPoints(point1cartographic, point2cartographic);
                var s = geodesic.surfaceDistance;
                //Return the distance between two points
                s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
                distance = distance + s;
                var m_Item = {
                    point: cartesian3ToDegrees(positions[i + 1]),
                    distance: distance
                };
                profileItem.push(m_Item);
            }
            return distance.toFixed(2);
        }

        function interPoints(positions) {
            positionsCartographic = [];
            var terrainSamplePositions = [];
            for (let index = 0; index < positions.length - 1; index++) {
                const element = positions[index];
                var ellipsoid = _viewer.scene.globe.ellipsoid;
                var cartographic = ellipsoid.cartesianToCartographic(element);
                positionsCartographic.push(cartographic);
            }
            for (let i = 0; i < positionsCartographic.length; i++) {
                const m_Cartographic0 = positionsCartographic[i];
                const m_Cartographic1 = positionsCartographic[i + 1];
                if (m_Cartographic1) {
                    var a = Math.abs(m_Cartographic0.longitude - m_Cartographic1.longitude) * 10000000;
                    var b = Math.abs(m_Cartographic0.latitude - m_Cartographic1.latitude) * 10000000;
                    //Isometric sampling
                    if (a > b) b = a;
                    var length = parseInt(b / 2);
                    if (length > 1000) length = 1000;
                    if (length < 2) length = 2;
                    // var length = 4;//Equally divided sampling
                    for (var j = 0; j < length; j++) {
                        terrainSamplePositions.push(
                            new Cesium.Cartographic(
                                Cesium.Math.lerp(m_Cartographic0.longitude, m_Cartographic1.longitude, j / (length - 1)),
                                Cesium.Math.lerp(m_Cartographic0.latitude, m_Cartographic1.latitude, j / (length - 1))
                            )
                        );
                    }
                    terrainSamplePositions.pop();
                } else {
                    terrainSamplePositions.push(m_Cartographic0);
                }
            }
            positions_Inter = [];
            for (var n = 0; n < terrainSamplePositions.length; n++) {
                //Geographical coordinates (radians) to latitude and longitude coordinates
                var m_cartographic = terrainSamplePositions[n];
                var height = _viewer.scene.globe.getHeight(m_cartographic);
                var point = Cesium.Cartesian3.fromDegrees(m_cartographic.longitude / Math.PI * 180, m_cartographic.latitude / Math.PI * 180, height);
                positions_Inter.push(point);
            }
        }

        function _(viewer, options = {}) {
            if (viewer && viewer instanceof Cesium.Viewer) {
                _viewer = viewer;
                this._terrainProfileLayer = new Cesium.CustomDataSource("terrainProfileLayer");
                viewer && viewer.dataSources.add(this._terrainProfileLayer);
                this.enabled = false;
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
                $this._terrainProfileLayer.entities.removeAll();
                if ($this.tooltip) $this.tooltip.remove();
                $this.enabled = false;
                positions = [];
                positionsCartographic = [];
                positions_Inter = [];
                poly = null;
                distance = 0;
                cartesian = null;
                DistanceArray = [];
                profileItem = [];
                if (this.handler) {
                    this.handler.destroy();
                }
                document.getElementById("profileChart").innerHTML = "";
                document.getElementById("profileChart").style.display = 'none';
            },
            start: function () {
                let $this = this;
                $this.clearAll();
                this.enabled = true;
                this.handler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas);
                this.tooltip = this.createTooltip(_viewer.container);
                var PolyLinePrimitive = (function () {
                    function _(positions) {
                        this.options = {
                            polyline: {
                                show: true,
                                positions: [],
                                material: Cesium.Color.CHARTREUSE,
                                width: 2,
                                clampToGround: true
                            }
                        };
                        this.positions = positions;
                        this._init();
                    }
                    _.prototype._init = function () {
                        var _self = this;
                        var _update = function () {
                            return _self.positions;
                        };
                        //Update polyline.positions in real time
                        this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
                        $this._terrainProfileLayer.entities.add(this.options);
                    };
                    return _;
                })();
                this.handler.setInputAction(function (movement) {
                    if (!$this.enabled) return;
                    movement.endPosition.x = movement.endPosition.x;
                    cartesian = _viewer.scene.pickPosition(movement.endPosition);
                    if (positions.length >= 2) {
                        if (!Cesium.defined(poly)) {
                            poly = new PolyLinePrimitive(positions);
                        } else {
                            positions.pop();
                            positions.push(cartesian);
                        }
                    }
                    if (positions.length == 0) {
                        $this.tooltip.showAt(movement.endPosition, "<p>Left-Click to start</p><p>Right-Click to end</p>");
                    }
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

                this.handler.setInputAction(function (movement) {
                    if (!$this.enabled) return;
                    movement.position.x = movement.position.x;
                    cartesian = _viewer.scene.pickPosition(movement.position);
                    if (!Cesium.defined(cartesian)) {
                        return;
                    }
                    $this.tooltip.remove();
                    if (positions.length == 0) {
                        positions.push(cartesian.clone());
                    }
                    positions.push(cartesian);
                    if (poly) {
                        //Perform interpolation calculation
                        interPoints(poly.positions);
                        distance = getSpaceDistance(positions_Inter);
                    } else {
                        distance = getSpaceDistance(positions);
                    }
                    var textDisance = " ";
                    if (distance / 1000 < 1) {
                        textDisance += Number(distance).toFixed(4) + " m";
                    } else {
                        textDisance += (Number(distance) / 1000).toFixed(4) + " Km";
                    }
                    DistanceArray.push(distance);
                    floatingPoint = $this._terrainProfileLayer.entities.add({
                        position: positions[positions.length - 1],
                        point: {
                            pixelSize: 5,
                            color: Cesium.Color.RED,
                            outlineColor: Cesium.Color.WHITE,
                            outlineWidth: 2,
                            heightReference: Cesium.HeightReference.NONE
                        },
                        label: {
                            text: textDisance,
                            show: true,
                            showBackground: true,
                            font: '14px sans-serif',
                            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            pixelOffset: new Cesium.Cartesian2(-20, -20)
                        }
                    });
                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

                this.handler.setInputAction(function (movement) {
                    $this.handler.destroy(); //Close the event handle
                    if (!$this.enabled) return;
                    positions.pop(); //The last point is invalid
                    createProfileChart(profileItem);
                }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            },

        }
        return _
    })(Cesium);