function _getRotatedPositionOfCords(_centerPos, _distance) {
    if (this.viewPosition && this.viewPositionEnd) {
        var enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(this.viewPosition);

        let directionX = this.viewModel.viewDistance * Math.cos(Cesium.Math.toRadians(this.viewModel.direction_angle));
        let directionY = this.viewModel.viewDistance * Math.sin(Cesium.Math.toRadians(this.viewModel.direction_angle));
        let limitENU = new Cesium.Cartesian4(directionX, directionY, 0.0, 1.0);

        var limitECF = new Cesium.Cartesian4();
        limitECF = Cesium.Matrix4.multiplyByVector(enuTransform, limitENU, limitECF);
        this.viewPositionEnd = {
            x: limitECF.x,
            y: limitECF.y,
            z: limitECF.z
        };
    }
}

function _getPositionProperty(centerXYZ, limitENU, maxHeight) {
    //maxHeight = -100;
    // We'll need the transformation from local coordinates to Earth-Centered, Earth-Fixed
    var enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(centerXYZ);
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;

    // Transform point in local coordinate system (East-North-Up) to ECEF
    var limitECF = new Cesium.Cartesian4();
    limitECF = Cesium.Matrix4.multiplyByVector(enuTransform, limitENU, limitECF);

    var startTime = viewer.clock.startTime;
    var midTime = Cesium.JulianDate.addSeconds(startTime, 43200, new Cesium.JulianDate());
    let stopTime = Cesium.JulianDate.addSeconds(startTime, 86400, new Cesium.JulianDate());

    var property = new Cesium.SampledPositionProperty();
    //centerXYZ.z = 0;
    property.addSample(startTime, centerXYZ);
    property.addSample(stopTime, limitECF);

    var midPoint = Cesium.Cartographic.fromCartesian(property.getValue(midTime));
    midPoint.height = maxHeight;


    var midPosition = viewer.scene.globe.ellipsoid.cartographicToCartesian(midPoint, new Cesium.Cartesian4());
    property.addSample(startTime, centerXYZ);
    property.addSample(midTime, midPosition);
    property.addSample(stopTime, limitECF);
    return property;
}


function change_theta(positionCBP, ivelocity, vangle, hangle) {
    let initialVelocity = ivelocity;

    let centerPoint = Cesium.Cartographic.fromCartesian(positionCBP);

    let centerXYZ = Cesium.Cartographic.toCartesian(centerPoint);
    var enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(centerXYZ);

    /* second phase */
    let verticalVelocity = initialVelocity * Math.sin(Cesium.Math.toRadians(vangle));
    let maxHeight = (verticalVelocity * verticalVelocity) / (2 * 9.8);
    let range = initialVelocity * initialVelocity * 2 * Math.sin(Cesium.Math.toRadians(vangle)) * Math.cos(Cesium
        .Math.toRadians(vangle)) / 9.8;
    // range = 1500;
    let directionX = range * Math.cos(Cesium.Math.toRadians(hangle));
    let directionY = range * Math.sin(Cesium.Math.toRadians(hangle));

    let limitENU = new Cesium.Cartesian4(directionX, directionY, 0.0, 1.0);
    let height = parseInt(centerPoint.height) + parseInt(maxHeight);

    // Transform point in local coordinate system (East-North-Up) to ECEF
    var limitECF = new Cesium.Cartesian4();
    limitECF = Cesium.Matrix4.multiplyByVector(enuTransform, limitENU, limitECF);

    var startTime = viewer.clock.startTime;
    var midTime = Cesium.JulianDate.addSeconds(startTime, 43200, new Cesium.JulianDate());
    let stopTime = Cesium.JulianDate.addSeconds(startTime, 86400, new Cesium.JulianDate());

    var property = new Cesium.SampledPositionProperty();
    property.addSample(startTime, centerXYZ);
    property.addSample(stopTime, limitECF);

    var midPoint = Cesium.Cartographic.fromCartesian(property.getValue(midTime));
    midPoint.height = height;

    var midPosition = viewer.scene.globe.ellipsoid.cartographicToCartesian(midPoint, new Cesium.Cartesian4());
    property.addSample(startTime, centerXYZ);
    property.addSample(midTime, midPosition);
    property.addSample(stopTime, limitECF);

    var b = new Cesium.Cartesian3(midPosition.x, midPosition.y, midPosition.z);
    var c = new Cesium.Cartesian3(limitECF.x, limitECF.y, limitECF.z);

    return {
        property,
        range,
        height,
        newPos: {
            "a": centerXYZ,
            "b": b,
            "c": c
        }
    };
}

function _indirect_weapon_dev(bData, isUpdate, _cb) {
    // alert("Indirect Weapon Dev");
    // console.log(bData);
    // console.log("ISUPDATED" + isUpdate);
    // console.log("CB" + _cb);
    var yu = change_theta(bData.position_copy, bData.viewModel.Muzzle_Velocity, Number(bData.viewModel._elevation_angle), Number(bData.viewModel._direction_angle));
    var controls = [];
    controls.push(yu.newPos.a)
    controls.push(yu.newPos.b)
    controls.push(yu.newPos.c)
    var spline = Cesium.HermiteSpline.createNaturalCubic({
        times: [0.0, 0.5, 1],
        points: controls,
    });

    var distancer = Cesium.Cartesian3.distance(controls[0], controls[1]) / 4;
    var ppos = [];
    for (var i = 0; i <= distancer; i++) {
        let cartesian3 = spline.evaluate(i / distancer);
        ppos.push(cartesian3);
    }

    var cartographic = [];
    var cartographic_real = [];
    ppos.forEach(p => {
        let dh = Cesium.Cartographic.fromCartesian(p);
        cartographic_real.push(dh.clone());
        dh.height = 0;
        cartographic.push(dh);
    });


    var rpos = [];
    Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, cartographic).then((raisedPositionsCartograhpic) => {
        // console.log(`ppos ${ppos.length}, cartographic ${cartographic.length}, cartographic_real ${cartographic_real.length}`);
        for (var i = 0; i <= cartographic_real.length - 1; i++) {
            rpos.push(ppos[i]);
            if (i > 0 && (raisedPositionsCartograhpic[i].height - cartographic_real[i].height) > 0) {
                // console.log("Stopped at:", cartographic_real[i].height);
                break;
            }
        }
        /*
        if (!isUpdate) {
            bData.ellipse = {
                // height: Cesium.HeightReference.CLAMP_TO_GROUND,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                clampToGround: true,
                semiMinorAxis: bData.viewModel.Planning_Rg, //range,
                semiMajorAxis: bData.viewModel.Planning_Rg, //range,
                outline: true,
                fill: true,
                outlineColor: Cesium.Color.DEEPSKYBLUE,
                outlineWidth: 5.0,
                material: new Cesium.CircleWaveMaterialProperty({
                    duration: 5000,
                    gradient: 0,
                    color: Cesium.Color.fromCssColorString("#4169E1").withAlpha(
                        0.5), //new Cesium.Color(1.0, 0.0, 0.0, 0.1),
                    count: 1
                })
            };
        }
        */

        var _glowm = new Cesium.PolylineTrailMaterialProperty({
            color: Cesium.Color.RED,
            duration: 3000,
            trailImage: "img/colors.png"
        });
        bData.polyline = {
            positions: rpos,
            width: 3,
            material: _glowm,
        }

        
        /**/// 
        var heading = Cesium.Math.toRadians(Number(bData.viewModel._direction_angle) * -1);
        var pitch = Cesium.Math.toRadians(0.0);
        var roll = Cesium.Math.toRadians(0.0);
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        if(selected_Entity !== undefined){
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(
                selected_Entity.position._value,
                hpr
                );
        }
        else{
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(
                bData.position,
                hpr
                );
        }

        bData.orientation = orientation;
        if (bData.rectangle !== undefined) {
            bData.rectangle.rotation = Cesium.Math.toRadians(Number(bData.viewModel._direction_angle));
            bData.rectangle.stRotation = Cesium.Math.toRadians(Number(bData.viewModel._direction_angle));
        }
        /**/////
        _cb(bData);
    });
}

function _direct_weapon_dev(bData, isUpdate, _cb) {
    let range = Number(bData.weaponData.Eff_FRange);
    var enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(bData.position_copy);

    let directionX = range * Math.cos(Cesium.Math.toRadians(bData.viewModel._direction_angle));
    let directionY = range * Math.sin(Cesium.Math.toRadians(bData.viewModel._direction_angle));
    let directionZ = range * Math.tan(Cesium.Math.toRadians(bData.viewModel._vdirection_angle));
    let limitENU = new Cesium.Cartesian4(directionX, directionY, directionZ, 1.0);

    var limitECF = new Cesium.Cartesian4();
    limitECF = Cesium.Matrix4.multiplyByVector(enuTransform, limitENU, limitECF);
    var endPos = {
        x: limitECF.x,
        y: limitECF.y,
        z: limitECF.z
    };

    var controls = [];
    controls.push(bData.position_copy);
    controls.push(endPos);

    var spline = new Cesium.LinearSpline({
        times: [0.0, 1],
        points: controls,
    });

    var distancer = Cesium.Cartesian3.distance(controls[0], controls[1]) / 4;

    var ppos = [];
    for (var i = 0; i <= distancer; i++) {
        let cartesian3 = spline.evaluate(i / distancer);
        ppos.push(cartesian3);
    }

    var cartographic = [];
    var cartographic_real = [];
    ppos.forEach(p => {
        let dh = Cesium.Cartographic.fromCartesian(p);
        cartographic_real.push(dh.clone());
        dh.height = 0;
        cartographic.push(dh);
    });

    var rpos = [];
    Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, cartographic).then((raisedPositionsCartograhpic) => {
        // console.log(`ppos ${ppos.length}, cartographic ${cartographic.length}, cartographic_real ${cartographic_real.length}`);
        for (var i = 0; i <= cartographic_real.length - 1; i++) {
            rpos.push(ppos[i]);
            if (i > 0 && (raisedPositionsCartograhpic[i].height - cartographic_real[i].height) > 0) {
                // console.log("Stopped at:", cartographic_real[i].height);
                break;
            }
        }
        /*
        if (!isUpdate) {
            bData.ellipse = {
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                clampToGround: true,
                semiMinorAxis: Number(bData.weaponData.Eff_FRange), //range,
                semiMajorAxis: Number(bData.weaponData.Eff_FRange), //range,
                outline: true,
                fill: true,
                outlineColor: Cesium.Color.DEEPSKYBLUE,
                outlineWidth: 5.0,
                material: Cesium.Color.fromCssColorString("#E73268").withAlpha(0.3)
            };
        }
        */

        var _glowm = new Cesium.PolylineTrailMaterialProperty({
            color: Cesium.Color.RED,
            duration: 3000,
            trailImage: "img/colors.png"
        });
        bData.polyline = {
            positions: rpos,
            width: 3,
            material: _glowm,
        }
        /**/// 
        var heading = Cesium.Math.toRadians(Number(bData.viewModel._direction_angle) * -1);
        var pitch = Cesium.Math.toRadians(0.0);
        var roll = Cesium.Math.toRadians(0.0);
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        
        if(selected_Entity !== undefined){
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(
                selected_Entity.position._value,
                hpr
                );
        }
        else{
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(
                bData.position,
                hpr
                );
        }

        // var orientation = Cesium.Transforms.headingPitchRollQuaternion(
        //     selected_Entity.position._value,
        //     hpr
        //     );
        bData.orientation = orientation;
        if (bData.rectangle !== undefined) {
            bData.rectangle.rotation = Cesium.Math.toRadians(Number(bData.viewModel._direction_angle));
            bData.rectangle.stRotation = Cesium.Math.toRadians(Number(bData.viewModel._direction_angle));
        }
        /**/////
        _cb(bData);
    });

}

function _computeCirclePolygon2(center, radius) {
    try {
        if (!center || radius <= 0) {
            return null;
        }
        var cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions({
            center: center,
            semiMajorAxis: radius,
            semiMinorAxis: radius,
            rotation: 0,
            granularity: 0.005
        }, false, true);
        if (!cep || !cep.outerPositions) {
            return null;
        }
        var pnts = Cesium.Cartesian3.unpackArray(cep.outerPositions);
        var first = pnts[0];
        pnts[pnts.length] = first;
        return pnts;
    } catch (err) {
        return null;
    }
}

function _computeCircleRadius3D(positions) {
    var c1 = positions[0];
    var c2 = positions[1];
    var x = Math.pow(c1.x - c2.x, 2);
    var y = Math.pow(c1.y - c2.y, 2);
    var z = Math.pow(c1.z - c2.z, 2);
    var dis = Math.sqrt(x + y + z);
    return dis;
}

function _rlos_weapon_dev(bData, isUpdate, _cb) {
    bData.billboard.sizeInMeters = true;
    bData.billboard.height = Number(bData.weaponData.Height);
    bData.billboard.width = 200;
    bData.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM
    bData.billboard.horizontalOrigin = Cesium.HorizontalOrigin.CENTER
    bData.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND
    bData.billboard.clampToGround = true
    bData.billboard.pixelOffsetScaleByDistance = new Cesium.NearFarScalar(1.0e3, 1.0, 1.5e6, 0.0)
    bData.billboard.disableDepthTestDistance = 1000000000
    let range = Number(bData.weaponData.Max_Range);
    if (!isUpdate) {
        bData.ellipse = {
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            clampToGround: true,
            semiMinorAxis: range,
            semiMajorAxis: range,
            outline: true,
            fill: true,
            outlineColor: Cesium.Color.DEEPSKYBLUE,
            outlineWidth: 5.0,
            // material: new Cesium.CircleWaveMaterialProperty({
            //     duration: 5000,
            //     gradient: 0,
            //     color: Cesium.Color.fromCssColorString("#4169E1").withAlpha(
            //         0.5), //new Cesium.Color(1.0, 0.0, 0.0, 0.1),
            //     count: 1
            // })
            material: Cesium.Color.fromCssColorString("#E74DA9").withAlpha(0.4)
        };

        // bData.cylinder = {
        //     length: Number(bData.weaponData.Height),
        //     topRadius: 20.0,
        //     bottomRadius: 20.0,
        //     material: Cesium.Color.BLUE.withAlpha(0.7),
        //     outline: false,
        //     clampToGround: true,
        //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        // };

        bData.label = {
            text: `Height: ${bData.weaponData.Height}m`,
            show: true,
            showBackground: true,
            font: '14px sans-serif',
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            clampToGround: true,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
            pixelOffset: new Cesium.Cartesian2(-20, -100) //left top
        }
    }

    var positionCarto = Cesium.Cartographic.fromCartesian(bData.position_copy);
    var lng_start = Number(Cesium.Math.toDegrees(positionCarto.longitude).toFixed(8));
    var lat_start = Number(Cesium.Math.toDegrees(positionCarto.latitude).toFixed(8));
    var height_start = Number(positionCarto.height) + Number(bData.weaponData.Height);

    let tooltip = new GlobeTooltip(viewer.container);
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event) {
        var position = event.endPosition;
        tooltip.showAt(position, "<p>Select Receiver Location</p>");
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(function (movement) {
        tooltip.setVisible(false);
        var adaptivePosition = viewer.scene.pickPosition(movement.position);
        var positionCarto2 = Cesium.Cartographic.fromCartesian(adaptivePosition);
        var lng_stop = Number(Cesium.Math.toDegrees(positionCarto2.longitude).toFixed(8));
        var lat_stop = Number(Cesium.Math.toDegrees(positionCarto2.latitude).toFixed(8));
        var height_stop = Number(positionCarto2.height) + Number(bData.weaponData.Height);

        let lineDistance = Cesium.Cartesian3.distance(bData.position_copy, adaptivePosition);

        if (bData.objId) {
            if (bData.supportEntity) {
                viewer.entities.remove(bData.supportEntity);
            }

            draw_los(lng_stop, lat_stop, height_stop, function (iSeen, visiableLine_Positions, invisiableLine_Positions) {
                let _glowm = new Cesium.PolylineTrailMaterialProperty({
                    color: Cesium.Color.GREEN,
                    duration: 3000,
                    trailImage: "img/colors.png"
                });
                bData.supportEntity = viewer.entities.add({
                    position: adaptivePosition,
                    billboard: bData.billboard,
                    // cylinder: {
                    //     length: Number(bData.weaponData.Height),
                    //     topRadius: 20.0,
                    //     bottomRadius: 20.0,
                    //     material: Cesium.Color.BLUE.withAlpha(0.7),
                    //     outline: false,
                    //     clampToGround: true,
                    //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                    // },
                    label: {
                        text: `Length: ${(lineDistance / 1000).toFixed(2)} Km`,
                        show: true,
                        showBackground: true,
                        font: '14px sans-serif',
                        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        clampToGround: true,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
                        pixelOffset: new Cesium.Cartesian2(-20, -100) //left top
                    }
                });
                if (iSeen && visiableLine_Positions && lineDistance <= range) {
                    bData.polyline = {
                        positions: visiableLine_Positions,
                        width: 3,
                        arcType: Cesium.ArcType.NONE,
                        material: _glowm
                    }
                } else {
                    if (lineDistance <= range) {
                        bData.polyline = {
                            positions: visiableLine_Positions,
                            width: 3,
                            arcType: Cesium.ArcType.NONE,
                            material: _glowm
                        }
                        bData.supportEntity.polyline = {
                            positions: invisiableLine_Positions,
                            width: 4,
                            arcType: Cesium.ArcType.NONE,
                            material: new Cesium.PolylineGlowMaterialProperty({
                                glowPower: 0.2,
                                taperPower: 1,
                                color: Cesium.Color.RED,
                            })
                            // material: new Cesium.PolylineTrailMaterialProperty({
                            //     color: Cesium.Color.RED,
                            //     duration: 3000,
                            //     trailImage: "img/colors.png"
                            // })

                        }
                        showAlert("<p>Can't communicate</p><p>Obstacle found.</p>", "Error", function (success) {

                        });
                    } else {
                        showAlert("<p>Can't communicate</p><p>Out of range.</p>", "Error", function (success) {

                        });
                    }

                }
                _cb(bData);
            });
        }
        handler.destroy();
        handler = undefined;

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

function draw_los(lng_stop, lat_stop, height_stop, _cbb) {
    var lng_lerp = [];
    var lat_lerp = [];
    var height_lerp = [];
    var cartographic = [];
    var cartographic_lerp = [];
    var height_terrain = [];
    var inPoint = [];
    var outPoint = [];
    var m = 0;
    var n = 0;

    for (var i = 0; i <= 1000; i++) {
        lng_lerp[i] = parseFloat(lng_start) + parseFloat(i * (lng_stop - lng_start) / 1000);
        lat_lerp[i] = parseFloat(lat_start) + parseFloat(i * (lat_stop - lat_start) / 1000);
        height_lerp[i] = parseFloat(height_start) + parseFloat(i * (height_stop - height_start) / 1000);
        cartographic.push(Cesium.Cartographic.fromDegrees(lng_lerp[i], lat_lerp[i], height_lerp[i]));
        cartographic_lerp.push(Cesium.Cartographic.fromDegrees(lng_lerp[i], lat_lerp[i], height_lerp[i]));
    }
    var isSeen = true;
    Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, cartographic).then((raisedPositionsCartograhpic) => {
        for (i = 0; i < raisedPositionsCartograhpic.length; i++) {
            height_terrain.push(raisedPositionsCartograhpic[i].height);
        }

        for (var i = 10; i <= 1001; i++) {
            var forward_hl = height_lerp[i - 1];
            var forward_ht = height_terrain[i - 1];
            if (forward_ht - forward_hl >= 2) {
                isSeen = false;
                break;
            }
        }

        if (isSeen == true) {
            var visiableLine_Positions = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(cartographic_lerp);
            return _cbb(isSeen, visiableLine_Positions, false);
        } else {
            for (var i = 1; i <= 1001; i++) {
                var forward_hl2 = height_lerp[i - 1];
                var forward_ht2 = height_terrain[i - 1];
                var backward_ht2 = height_terrain[i];
                var backward_hl2 = height_lerp[i];
                if (forward_hl2 >= forward_ht2) {
                    if (backward_hl2 < backward_ht2) {
                        inPoint[m] = i;
                        m++;
                    }
                } else {
                    if (backward_hl2 > backward_ht2) {
                        outPoint[n] = i;
                        n++;
                    }
                }
            }
            var inLine = cartographic_lerp.slice(0, inPoint[0]);
            var outLine = cartographic_lerp.slice(inPoint[0]);
            var inLine_Positions = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(inLine);
            var outLine_Positions = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(outLine);
            return _cbb(isSeen, inLine_Positions, outLine_Positions)
        }
    });
}
}

function _radar_weapon_dev(bData, isUpdate, _cb) {
    _rsobjId = bData.objId;
    if (isUpdate) {

    } else {
        if (_radarsheds[_rsobjId]) {
            _radarsheds[_rsobjId].clearAll();
        }
        _radarsheds[_rsobjId] = new Cesium.RadarShed(viewer, {
            rsobjId: _rsobjId,
            viewPosition: bData.position_copy,
            viewDistance: Number(bData.weaponData.Max_Range),
            horizontalViewAngle: Number(bData.weaponData.left_azimuth) + Number(bData.weaponData.right_azimuth),
            verticalViewAngle: Number(bData.weaponData.up_elevation) + Number(bData.weaponData.down_elevation)
        });
    }
    _cb(bData);
}

function _drawWeaponByCategory(objId, weaponData, bData, _cb) {

    if (weaponData["WPN_EQPT"]) {
        switch (weaponData["WPN_EQPT"].toLowerCase()) {
            case "arty gun":
            if (!bData.viewModel) {
                // alert("Yes")
                bData.viewModel = {
                    Planning_Rg: Number(weaponData.Planning_Rg),
                    Muzzle_Velocity: Number(weaponData.Muzzle_Velocity),
                    _direction_angle: Number(weaponData.down_elevation),
                    _elevation_angle: Number(weaponData.up_elevation)
                }
            }
            _indirect_weapon_dev(bData, false, function (_d) {
                return _cb(_d)
            });
            break;
            case "direct firing weapon":
            if (!bData.viewModel) {
                bData.viewModel = {
                    _direction_angle: 45,
                    _vdirection_angle: 0
                }
            }
            bData.weaponData = weaponData;
            _direct_weapon_dev(bData, false, function (_d) {
                return _cb(_d)
            });
            break;
            case "rlos":
            if (!bData.viewModel) {
                bData.viewModel = {
                    _direction_angle: 45
                }
            }
            bData.weaponData = weaponData;
            _rlos_weapon_dev(bData, false, function (_d) {
                return _cb(_d)
            });
            break;
            case "radar":
            bData.weaponData = weaponData;
            _radar_weapon_dev(bData, false, function (_d) {
                return _cb(_d)
            });
            break;
            default:
            break;
        }
        // console.log(weaponData);
    }
}