var clampToGround = true;
var measure = undefined;
var sight = undefined;
var elevationAnalysis = undefined;
var elevationAnalysis2 = undefined;
var imageryAdjustment = undefined;
var weathers = undefined;
var cesiumMeasurer = undefined;
var waterShed = undefined;
var wayPoints = undefined;
var terrainProfiler = undefined;
var scene = undefined;

function meassureThings(mType, el = null) {
    if (measure === undefined) return;
    switch (mType) {
        case 'Space distance':
            measure.drawLineMeasureGraphics({
                clampToGround: clampToGround,
                callback: () => {}
            });
            //measure.drawT_Triangle({});
            break;
        case 'Space area':
            measure.drawAreaMeasureGraphics({
                clampToGround: clampToGround,
                callback: () => {}
            });
            break;
        case 'Triangulation':
            measure.drawTrianglesMeasureGraphics({
                callback: () => {}
            });
            break;
        case 'Clear':
            measure._drawLayer.entities.removeAll();
            break;
    }
}

function toggleLos(el) {
    losPanelLoader(function () {});
}

/* FPP 360 degree view*/
function toggleFPP(el) {
    fppPanelLoader(function () {});
}

/* Contour1 Analysis*/
function toggleCounterAnalysis1(el) {
    if (elevationAnalysis === undefined) return;
    elevationAnalysisPanelLoader(function () {
        bindToolbar(elevationAnalysis.viewModel, "contour1_toolbar",
            "elevationAnalysis.updateMaterial({ enabled: true })");
    });
}

/* Contour2 Analysis*/
function toggleCounterAnalysis2(el) {
    if (elevationAnalysis2 === undefined) return;
    elevationAnalysis2PanelLoader(function () {
        bindToolbar2(elevationAnalysis2, "contour2_toolbar",
            "elevationAnalysis2.updateMaterial({ enabled: true })");
    });
}

/* Imagery Adjustment*/
function toggleImageryAdjustment(el) {
    if (imageryAdjustment === undefined) return;
    imageryAdjustmentPanelLoader(function () {
        bindToolbar3(imageryAdjustment, "imageryAdjustment_toolbar",
            "imageryAdjustment.updateMaterial({ enabled: true })");
    });
}

/* GLOBE CONFIG Toolbar*/
var configViewModel = {
    globelightening: true,
    globefog: false
};

function globeconfig_changed() {
    if(weathers === undefined) return;
    viewer.scene.globe.enableLighting = configViewModel.globelightening;
    weathers.fog({
        enabled: configViewModel.globefog
    });
}

function toggleConfigurations() {
    if(weathers === undefined) return;
    weatherPanelLoader(function () {
        bindToolbar(weathers.viewModal, "config_toolbar", "weathers.updateWeather();");
    });
}
/* END */

/* Volume Meassurement */
function toggleVolumeMeasurement(el) {
    volumeMeassurementPanelLoader(function () {});
}

/* WATERSHED ANALYSIS */
function toggleWatershed(el) {
    if(waterShed === undefined) return;
    watershedPanelLoader(function () {
        bindToolbar(waterShed.viewModel, "watershed_toolbar", "waterShed.updateWater()");
    });
}
/* END */

/* TERRAIN PROFILE */
function toggleTerrainProfile(el) {
    if(terrainProfiler === undefined) return;
    terrainProfilerPanelLoader(function () {});
}
/* END */

/* TOGGLE VR MODE*/
function toggleVRmode(el) {
    vrPanelLoader(function () {});
}
/* END */

function _initialiseBasics() {
    scene = viewer.scene;
    viewer.scene.camera.enableTerrainAdjustmentWhenLoading = true;
    viewer.scene.globe.backFaceCulling = false;
    /* Remove selection Indicator Green Box */
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

    /* Remove Cesium Credit box */
    viewer._cesiumWidget._creditContainer.style.display = "none";

    //viewer.scene.globe.showGroundAtmosphere = false;
    // var scene = viewer.scene;
    viewer.scene.camera.enableCollisionDetection = true;
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.extend(Cesium.viewerCesiumInspectorMixin);

    /* Compass Settings here */
    viewer.extend(Cesium.viewerCesiumNavigationMixin, {
        enableCompass: true,
        enableZoomControls: true,
        enableDistanceLegend: true
    });
    /* END Compass Settings */

    /* Meassurement Tools*/
    measure = new Cesium.Measure(viewer);
    sight = new Cesium.Sight(viewer);
    elevationAnalysis = new Cesium.ElevationAnalysis(viewer);
    elevationAnalysis2 = new Cesium.ElevationAnalysis2(viewer);
    imageryAdjustment = new Cesium.ImageryAdjustment(viewer);
    weathers = new Cesium.Weather(viewer);
    cesiumMeasurer = new CesiumMeasurer(viewer);
    waterShed = new Cesium.WaterShed(viewer);
    wayPoints = new Cesium.WayPoints(viewer);
    terrainProfiler = new Cesium.TerrainProfiler(viewer);

    /* NEW DRAWING TOOL */
    initDrawingTools(_default_cam_location);
    /* END */
}

if (typeof (waitForViewerLoad) === "function") {
    waitForViewerLoad(function () {
        _initialiseBasics();
    });
}

// BELOW CODES WILL BE REMOVED IN NEXT VERSION //
// /* Weapons Deploy Section Starts Here*/
// let pickedEntity;

// function deleteWeapon() {
//     viewer.entities.remove(pickedEntity);
// }

// function change_direction(positionCBP, entity, maxHeight, theta) {
//     let radius = entity.radius;
//     let centerPoint = Cesium.Cartographic.fromCartesian(positionCBP);

//     let centerXYZ = Cesium.Cartographic.toCartesian(centerPoint);
//     var enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(centerXYZ);

//     let directionX = radius * Math.cos(Cesium.Math.toRadians(theta));
//     let directionY = radius * Math.sin(Cesium.Math.toRadians(theta));

//     let limitENU = new Cesium.Cartesian4(directionX, directionY, 0.0, 1.0);

//     var limitECF = new Cesium.Cartesian4();
//     limitECF = Cesium.Matrix4.multiplyByVector(enuTransform, limitENU, limitECF);

//     console.log(centerXYZ, limitECF)

//     var startTime = viewer.clock.startTime;
//     var midTime = Cesium.JulianDate.addSeconds(startTime, 43200, new Cesium.JulianDate());
//     let stopTime = Cesium.JulianDate.addSeconds(startTime, 86400, new Cesium.JulianDate());

//     var property = new Cesium.SampledPositionProperty();
//     property.addSample(startTime, centerXYZ);
//     property.addSample(stopTime, limitECF);

//     var midPoint = Cesium.Cartographic.fromCartesian(property.getValue(midTime));
//     midPoint.height = maxHeight;
//     //property.addSample(startTime, centerXYZ);
//     if (entity.wproperties.weaponType !== "direct") {

//         var midPosition = viewer.scene.globe.ellipsoid.cartographicToCartesian(midPoint, new Cesium
//             .Cartesian4());
//         property.addSample(midTime, midPosition);
//     }
//     // property.addSample(stopTime, limitECF);

//     return {
//         property,
//         radius,
//         maxHeight,
//         theta
//     };
// }

// function change_theta(positionCBP, theta, entity) {
//     let initialVelocity = entity.initialVelocity;
//     let centerPoint = Cesium.Cartographic.fromCartesian(positionCBP);
//     let centerXYZ = Cesium.Cartographic.toCartesian(centerPoint);
//     var enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(centerXYZ);

//     /* second phase */
//     let verticalVelocity = initialVelocity * Math.sin(Cesium.Math.toRadians(theta));
//     let maxHeight = (verticalVelocity * verticalVelocity) / (2 * 9.8);
//     let range = initialVelocity * initialVelocity * 2 * Math.sin(Cesium.Math.toRadians(theta)) * Math.cos(Cesium
//         .Math.toRadians(theta)) / 9.8;

//     let directionX = range * Math.cos(Cesium.Math.toRadians(entity.directionAngle));
//     let directionY = range * Math.sin(Cesium.Math.toRadians(entity.directionAngle));

//     let limitENU = new Cesium.Cartesian4(directionX, directionY, 0.0, 1.0);
//     let height = parseInt(centerPoint.height) + parseInt(maxHeight);

//     // Transform point in local coordinate system (East-North-Up) to ECEF
//     var limitECF = new Cesium.Cartesian4();
//     limitECF = Cesium.Matrix4.multiplyByVector(enuTransform, limitENU, limitECF);

//     var startTime = viewer.clock.startTime;
//     var midTime = Cesium.JulianDate.addSeconds(startTime, 43200, new Cesium.JulianDate());
//     let stopTime = Cesium.JulianDate.addSeconds(startTime, 86400, new Cesium.JulianDate());

//     var property = new Cesium.SampledPositionProperty();
//     property.addSample(startTime, centerXYZ);
//     property.addSample(stopTime, limitECF);


//     var midPoint = Cesium.Cartographic.fromCartesian(property.getValue(midTime));
//     midPoint.height = height;
//     // property.addSample(startTime, centerXYZ);
//     if (entity.wproperties.weaponType !== "direct") {

//         var midPosition = viewer.scene.globe.ellipsoid.cartographicToCartesian(midPoint, new Cesium
//             .Cartesian4());
//         property.addSample(midTime, midPosition);
//     }
//     // property.addSample(stopTime, limitECF);

//     return {
//         property,
//         range,
//         height
//     };
// }

// var weaponsList = [{
//         displayname: "A",
//         value: "a",
//         velocity: 827,
//         maxrange: 100000,
//         type: "indirect",
//         img: ""
//     },
//     {
//         displayname: "B",
//         value: "b",
//         velocity: 475,
//         maxrange: 50000,
//         type: "direct",
//         img: ""
//     },
//     {
//         displayname: "R",
//         value: "r",
//         velocity: 820,
//         maxrange: 100000,
//         type: "radar",
//         img: ""
//     },
//     {
//         displayname: "L",
//         value: "l",
//         velocity: 820,
//         maxrange: 100000,
//         type: "los",
//         img: ""
//     }

// ];

// var angle = undefined;
// var direction = undefined;
// var inputAngle = undefined;
// var inputDirection = undefined;
// var inputRange = undefined;

// function loadWeapons(weaponsList) {
//     let wd = $("#weaponDataDropdown");
//     wd.empty();
//     wd.append($(`<option value="" disabled selected hidden>--Select Weapon--</option>`));;
//     weaponsList.forEach(w => {
//         let ss = `<option`;
//         Object.keys(w).forEach(k => {
//             ss += ` data-${k}="${w[k]}"`
//         });
//         ss += `>${w.displayname}</option>`
//         wd.append($(ss));
//     });
//     angle = document.getElementById('angle');
//     direction = document.getElementById('direction');
//     inputAngle = document.getElementById('input-angle');
//     inputDirection = document.getElementById('input-direction');
//     inputRange = document.getElementById('input-range');

//     function inputHandler(e, data) {
//         data.value = e.target.value;
//     }

//     angle.addEventListener('input', function (e) {
//         inputHandler(e, inputAngle)
//     });

//     direction.addEventListener('input', function (e) {
//         inputHandler(e, inputDirection)
//     });
// }

// let expanded = false;
// draggablesEnabled = true;
// var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

// function weaponDataDropdownOnchange() {
//     var weaponDataDropdown = document.getElementById("weaponDataDropdown");

//     let waypointPosition = '';
//     let routeEntity = '';

//     var dataVelocity = weaponDataDropdown.options[weaponDataDropdown.selectedIndex].dataset.velocity;
//     var weaponName = weaponDataDropdown.options[weaponDataDropdown.selectedIndex].value;
//     var weaponType = weaponDataDropdown.options[weaponDataDropdown.selectedIndex].dataset.type;

//     if (weaponType === "direct") {
//         document.getElementById("eangle").style.display = "none";
//     } else {
//         document.getElementById("eangle").style.display = "table-row";
//     }

//     var weaponMaxRange = weaponDataDropdown.options[weaponDataDropdown.selectedIndex].dataset.maxrange;
//     var imageOptions = {
//         src: `Sandcastle/images/${weaponName}.png`
//     }
//     handler.setInputAction((click) => {
//         if (!expanded) return;
//         angle.value = 50;
//         direction.value = 0;
//         inputAngle.value = 50;
//         inputDirection.value = 0;
//         waypointPosition = getPointCoordinates(click, viewer);
//         routeEntity = createWaypoint(imageOptions, weaponType, waypointPosition, weaponName,
//             dataVelocity,
//             weaponMaxRange, viewer);
//     }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

// }

// function createWaypoint(imageOptions, weaponType, waypointPosition, weaponName, dataVelocity, weaponMaxRange,
//     viewer) {
//     let entity = createDraggableWaypoint(imageOptions, weaponType, waypointPosition, weaponName, dataVelocity,
//         weaponMaxRange,
//         viewer);
//     return entity;
// }

// function getPointCoordinates(event, viewer) {
//     var adaptivePosition = viewer.scene.pickPosition(event.position);

//     // ?let clickPosition = viewer.camera.getPickRay(event.position);
//     //        let clickPosition = viewer.camera.pickEllipsoid(event.position);
//     //        console.log(adaptivePosition);
//     return adaptivePosition;
// }

// function disableCameraMotion(state, viewer) {
//     viewer.scene.screenSpaceCameraController.enableRotate = state;
//     viewer.scene.screenSpaceCameraController.enableZoom = state;
//     viewer.scene.screenSpaceCameraController.enableLook = state;
//     viewer.scene.screenSpaceCameraController.enableTilt = state;
//     viewer.scene.screenSpaceCameraController.enableTranslate = state;
// }

// function updateEntity(entity, radius, maxHeight, angle) {

//     entity.radius = radius;
//     entity.maxHeight = maxHeight;
//     entity.angle = angle;
//     return entity;

// }

// function updatevalues(entity, properties) {
//     entity.directionAngle = properties;
//     return entity;
// }

// function createDraggableWaypoint(imageOptions, weaponType, waypointPosition, weaponName, initialVelocity,
//     weaponMaxRange,
//     viewer) {
//     let picked = false;

//     let positionCallback = () => {
//         return waypointPosition;
//     };

//     let positionCBP = new Cesium.CallbackProperty(positionCallback, false);
//     let myPoint = createCesiumPoint(imageOptions, weaponType, positionCBP, weaponName, initialVelocity,
//         weaponMaxRange, 15,
//         Cesium.Color.BLUE, Cesium
//         .Color.WHITE);

//     viewer.entities.add(myPoint);

//     //let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);


//     handler.setInputAction((click) => {


//         let pickedObject = viewer.scene.pick(click.position);

//         if (Cesium.defined(pickedObject) &&
//             pickedObject.id === myPoint
//         ) {
//             picked = true;
//             disableCameraMotion(false, viewer);
//             pickedEntity = pickedObject.id;
//             //}
//             let value = pickedObject.id.position._property._values;
//             let newEntity = {
//                 x: value[0],
//                 y: value[1],
//                 z: value[2]
//             };
//             document.getElementById('angle').value = pickedEntity.angle;
//             document.getElementById('direction').value = pickedEntity.directionAngle;

//             // update angle 
//             let directionSlider = document.getElementById('direction');
//             let angleSlider = document.getElementById('angle');
//             let updateRadius = () => {
//                 let newEntityPropetry = change_theta(newEntity, angleSlider.value, pickedEntity);
//                 pickedEntity.position = newEntityPropetry.property;
//                 if (pickedEntity.wproperties.weaponType !== "direct") {
//                     pickedEntity.position.setInterpolationOptions({
//                         interpolationDegree: 5,
//                         interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
//                     });
//                 }
//                 pickedEntity = updateEntity(pickedEntity, newEntityPropetry.range, newEntityPropetry
//                     .height, angleSlider.value);
//             };

//             angleSlider.addEventListener('input', updateRadius);

//             // update direction /

//             let updateDirection = () => {

//                 let newEntityPropetry1 = change_direction(newEntity, pickedEntity,
//                     pickedEntity.maxHeight, directionSlider.value);
//                 pickedEntity.position = newEntityPropetry1.property;
//                 if (pickedEntity.wproperties.weaponType !== "direct") {
//                     pickedEntity.position.setInterpolationOptions({
//                         interpolationDegree: 5,
//                         interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
//                     });
//                 }

//                 pickedEntity = updatevalues(pickedEntity, directionSlider.value);
//             };
//             directionSlider.addEventListener('input', updateDirection);
//         }
//     }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

//     handler.setInputAction(function (movement) {
//         if (!picked || !expanded) {
//             return;
//         }
//         var foundPosition = false;

//         scene.globe.depthTestAgainstTerrain = true;
//         //waypointPosition = viewer.scene.drillPick(movement.endPosition);

//         waypointPosition = scene.pick(movement.endPosition);
//         if (waypointPosition) {
//             if (scene.mode === Cesium.SceneMode.SCENE3D) {
//                 var cartesian = viewer.scene.pickPosition(movement.endPosition);

//                 if (Cesium.defined(cartesian)) {
//                     var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
//                     var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(3);
//                     var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(3);
//                     var heightString = cartographic.height.toFixed(2);

//                     waypointPosition = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene
//                         .globe.ellipsoid);

//                     let centerPoint = Cesium.Cartographic.fromCartesian(cartesian);


//                     let centerXYZ = Cesium.Cartographic.toCartesian(centerPoint);

//                     let initialVelocity = pickedEntity.initialVelocity;

//                     let verticalVelocity = initialVelocity * Math.sin(Cesium.Math.toRadians(pickedEntity
//                         .angle));
//                     let maxHeight = (verticalVelocity * verticalVelocity) / (2 * 9.8);
//                     let range = initialVelocity * initialVelocity * 2 * Math.sin(Cesium.Math.toRadians(
//                             pickedEntity.angle)) * Math.cos(Cesium.Math.toRadians(pickedEntity.angle)) /
//                         9.8;

//                     let directionX = range * Math.cos(Cesium.Math.toRadians(pickedEntity
//                         .directionAngle));
//                     let directionY = range * Math.sin(Cesium.Math.toRadians(pickedEntity
//                         .directionAngle));

//                     let limitENU = new Cesium.Cartesian4(directionX, directionY, 0.0, 1.0);
//                     var total = maxHeight + parseInt(heightString);
//                     if (pickedEntity.wproperties.weaponType === "direct") {
//                         total = 0;
//                     }

//                     pickedEntity.position = getPositionProperty(centerXYZ, limitENU, total);
//                     if (pickedEntity.wproperties.weaponType !== "direct") {
//                         pickedEntity.position.setInterpolationOptions({
//                             interpolationDegree: 5,
//                             interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
//                         });
//                     }
//                     // var camera = scene.camera;
//                     // pickedEntity.label.eyeOffset = new Cesium.Cartesian3(0.0, 0.0, camera.frustum.near *
//                     //     1.5 - Cesium.Cartesian3.distance(cartesian, camera.position));

//                     foundPosition = true;
//                 }
//             } else if (!sceneModeWarningPosted) {
//                 sceneModeWarningPosted = true;
//                 console.log("pickPosition is currently only supported in 3D mode.");
//             }
//         }

//         if (!foundPosition) {
//             pickedEntity.label.show = false;
//         }
//     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


//     handler.setInputAction((movement) => {
//         picked = false;
//         disableCameraMotion(true, viewer);
//         // console.log('leftup')
//     }, Cesium.ScreenSpaceEventType.LEFT_UP);

//     return myPoint;
// }

// function createCesiumPoint(imageOptions, weaponType, coordinates, weaponName, initialVelocity, weaponMaxRange,
//     size, color) {
//     // get all points /
//     let centerPoint = Cesium.Cartographic.fromCartesian(coordinates.getValue()); //get lat lon height from cart3


//     var centerXYZ = Cesium.Cartographic.toCartesian(centerPoint); // convert lat lon h to cart3 xyz

//     // first phase /

//     let theta = 45;
//     // second phase /
//     let verticalVelocity = initialVelocity * Math.sin(Cesium.Math.toRadians(theta));
//     let maxHeight = (verticalVelocity * verticalVelocity) / (2 * 9.8);
//     let range = initialVelocity * initialVelocity * 2 * Math.sin(Cesium.Math.toRadians(theta)) * Math.cos(Cesium
//         .Math.toRadians(theta)) / 9.8;
//     let height = weaponType === "direct" ? 0 : parseInt(maxHeight) + parseInt(centerPoint.height);


//     let limitENU = new Cesium.Cartesian4(range, 0.0, 0.0, 1.0);

//     //        document.getElementById("radius").value = range;
//     //        document.getElementById('height').value = maxHeight;


//     var iconmame = `${weaponName}.png`;
//     var epos = getPositionProperty(centerXYZ, limitENU, height);
//     // var polypoints = [];
//     // if (epos._property._values.length % 3 == 0) {

//     //     for (var q = 0; q < epos._property._values.length; q = q + 3) {
//     //         let vv = (epos._property._values.slice(q, q + 3))
//     //         polypoints.push(new Cesium.Cartesian3(vv[0], vv[1], vv[2]));
//     //         console.log(new Cesium.Cartesian3(vv[0], vv[1], vv[2]))
//     //     }
//     //     console.log(polypoints);
//     // }
//     // console.log(epos);
//     // creating entity /
//     var colors = [Cesium.Color.RED, Cesium.Color.YELLOW, Cesium.Color.AQUA];
//     var color = colors[Math.floor(Math.random() * colors.length)];

//     let entity = new Cesium.Entity({
//         //name: weaponName,
//         position: epos,
//         // point: {
//         //     pixelSize: size,
//         //     color: color,
//         //     outlineColor: Cesium.Color.fromRandom({
//         //         alpha: 1.0
//         //     }),
//         //     outlineWidth: 3
//         // },
//         billboard: {
//             image: imageOptions
//                 .src, //(new Cesium.PinBuilder()).fromUrl(imageOptions.src, Cesium.Color.fromCssColorString("#8DA399"), 48),
//             heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//             disableDepthTestDistance: Number.POSITIVE_INFINITY,
//             //alignedAxis: Cesium.Cartesian3.UNIT_Z,
//             sizeInMeters: true,
//             width: imageOptions.width === undefined ? 50 : imageOptions.width,
//             height: imageOptions.height === undefined ? 50 : imageOptions.height
//         },

//         // ellipse: {
//         //     //                height: Cesium.HeightReference.CLAMP_TO_GROUND,
//         //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//         //     semiMinorAxis: Number(weaponMaxRange),
//         //     semiMajorAxis: Number(weaponMaxRange),
//         //     outline: true,
//         //     fill: true,
//         //     //material: new Cesium.Color(0, 0, 0, 0.5),
//         //     outlineColor: Cesium.Color.DEEPSKYBLUE,
//         //     outlineWidth: 5.0,
//         //     material: new Cesium.Color(0, 0, 0, 0.5),
//         // },
//         ellipse: {
//             // height: Cesium.HeightReference.CLAMP_TO_GROUND,
//             heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//             semiMinorAxis: Number(weaponMaxRange), //range,
//             semiMajorAxis: Number(weaponMaxRange), //range,
//             outline: true,
//             fill: true,
//             //material: new Cesium.Color(0, 0, 0, 0.5),
//             outlineColor: Cesium.Color.DEEPSKYBLUE,
//             outlineWidth: 5.0,
//             material: new Cesium.CircleWaveMaterialProperty({
//                 duration: 5000,
//                 gradient: 0,
//                 color: Cesium.Color.fromCssColorString("#4169E1").withAlpha(
//                     0.5), //new Cesium.Color(1.0, 0.0, 0.0, 0.1),
//                 count: 1
//             })
//         },
//         label: {
//             text: weaponName.toUpperCase(),
//             font: '14pt monospace',
//             style: Cesium.LabelStyle.FILL_AND_OUTLINE,
//             outlineWidth: 2,
//             verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
//             pixelOffset: new Cesium.Cartesian2(0, -50),
//             heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//         },
//         path: {
//             resolution: 1200,
//             material: new Cesium.PolylineTrailMaterialProperty({
//                 color: Cesium.Color.RED,
//                 duration: 3000,
//                 trailImage: "img/colors.png"
//             }),
//             // material: new Cesium.PolylineGlowMaterialProperty({
//             //     glowPower: 0.16,
//             //     color: color
//             // }),
//             width: 5,
//             leadTime: 1e10,
//             trailTime: 1e10,
//         },
//         // polyline:{
//         //     positions: polypoints,
//         //     width: 10,
//         //     material: Cesium.Color.GREEN
//         // },
//         showBackground: true,
//         horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
//         verticalOrigin: Cesium.VerticalOrigin.TOP,
//         pixelOffset: new Cesium.Cartesian2(15, -100),
//         heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//         angle: theta,
//         initialVelocity: initialVelocity,
//         maxHeight: height,
//         radius: range,
//         directionAngle: 0,
//         wproperties: {
//             weaponType: weaponType,
//             weaponMaxRange: weaponMaxRange
//         }
//     });

//     if (weaponName == "r") {
//         entity.path.show = false;
//         entity.ellipse.show = false;
//     }

//     if (weaponType !== "direct") {
//         entity.position.setInterpolationOptions({
//             interpolationDegree: 5,
//             interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
//         });
//     }

//     return entity;
// }

// function getPositionProperty(centerXYZ, limitENU, maxHeight) {
//     //maxHeight = -100;
//     // We'll need the transformation from local coordinates to Earth-Centered, Earth-Fixed
//     var enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(centerXYZ);

//     viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;

//     // Transform point in local coordinate system (East-North-Up) to ECEF
//     var limitECF = new Cesium.Cartesian4();
//     limitECF = Cesium.Matrix4.multiplyByVector(enuTransform, limitENU, limitECF);


//     var startTime = viewer.clock.startTime;
//     var midTime = Cesium.JulianDate.addSeconds(startTime, 43200, new Cesium.JulianDate());
//     let stopTime = Cesium.JulianDate.addSeconds(startTime, 86400, new Cesium.JulianDate());

//     var property = new Cesium.SampledPositionProperty();
//     property.addSample(startTime, centerXYZ);
//     property.addSample(stopTime, limitECF);


//     var midPoint = Cesium.Cartographic.fromCartesian(property.getValue(midTime));
//     midPoint.height = maxHeight;


//     var midPosition = viewer.scene.globe.ellipsoid.cartographicToCartesian(midPoint, new Cesium.Cartesian4());
//     property.addSample(startTime, centerXYZ);
//     property.addSample(midTime, midPosition);
//     property.addSample(stopTime, limitECF);


//     return property;
// }

// /* Weapons Deploy Section Ended Here */