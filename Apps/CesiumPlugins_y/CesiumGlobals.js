/* JQuery-UI Confirmation Dialogue Box */
function showConfirmation(htmlcontent, title = "", _cb) {
    $("#dialog-confirm").remove();
    var dialogBody = $(`<div id="dialog-confirm" title="${title}">${htmlcontent}</div>`);
    $("body").append(dialogBody);
    let _alClosed = false;
    $(dialogBody).dialog({
        resizable: false,
        height: "auto",
        width: 410,
        modal: true,
        close: function () {
            dialogBody.remove();
            $("div.ui-dialog").remove();
            _cb(false);
        },
        buttons: {
            "Confirm": function () {
                _cb(true);
                dialogBody.remove();
                $("div.ui-dialog").remove();

            },
            "Cancel": function () {
                $(this).dialog("close");
                dialogBody.remove();
                $("div.ui-dialog").remove();
                _cb(false);
            }
        }
    });
}

function showAlert(htmlcontent, title = "", _cb) {
    $("#dialog-confirm").remove();
    var dialogBody = $(`<div id="dialog-confirm" title="${title}">${htmlcontent}</div>`);
    $("body").append(dialogBody);
    $(dialogBody).dialog({
        resizable: false,
        height: "auto",
        width: "auto",
        modal: true,
        close: function () {
            dialogBody.remove();
            $("div.ui-dialog").remove();
            _cb(false);
        },
        buttons: {
            "Ok": function () {
                _cb(true);
                dialogBody.remove();
                $("div.ui-dialog").remove();

            }
        }
    });
}
/* END */

function dragElement(elmnt) {
    let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;

    if ($(elmnt).find(".mydivheader").length > 0) {
        $(elmnt).find(".mydivheader")[0].onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        let leftPos = elmnt.offsetLeft - pos1;
        let topPos = elmnt.offsetTop - pos2;
        let conrect = document.getElementById("cesiumContainer").getBoundingClientRect();
        let elemrect = elmnt.getBoundingClientRect();

        if (leftPos > 0 && leftPos < conrect.width - elemrect.width) {
            elmnt.style.left = leftPos + "px";
        }

        if (topPos > 0 && topPos < conrect.height - elemrect.height - 33) {
            elmnt.style.top = topPos + "px";
        }
        elmnt.style.right = "initial";
        elmnt.style.bottom = "initial";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function httpGetAsync(theUrl, callback) {
    try {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        }
        xmlHttp.timeout = 10000;
        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    } catch (e) {
        callback("");
    }
}

//* */
function chunkArray(array, chunk_size) {
    return Array(Math.ceil(array.length / chunk_size)).fill().map((_, index) => index * chunk_size).map(begin => array.slice(begin, begin + chunk_size));
}

const getUpdatedCoordinates = function (cc, chunk_size = 100, _cb) { //cc must be in array of [[lon,lat],[lon,lat]]
    var positionsc = cc.map(p => Cesium.Cartographic.fromDegrees(p[0], p[1]));
    //chunks here
    var chunks = chunkArray(positionsc, chunk_size);
    var updatedchunksColl = [];
    var promiseArr = [];
    chunks.forEach((c, i) => {
        promiseArr.push(new Promise((resolve, reject) => {
            setTimeout(() => {
                var promiset = Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, c);
                Cesium.when(promiset, function (updatedchunkArr) {
                    resolve(updatedchunkArr);
                });
            }, 200 * i + 1);
        }))
    });
    Promise.all(promiseArr)
        .then(a => {
            a.forEach(ar => {
                updatedchunksColl = [...updatedchunksColl, ...ar];
            });
            //NOTE: updatedPositions height can be undefined if terrain not properly loaded
            return _cb(updatedchunksColl);
        });
}

const _getUpdatedCoordinates = function (cc, _cb) { //cc must be in array of [[lon,lat],[lon,lat]]
    var positionsc = cc.map(p => Cesium.Cartographic.fromDegrees(p[0], p[1]));
    var promise = Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, positionsc);
    Cesium.when(promise, function (updatedPositions) {
        return _cb(updatedPositions);
        //NOTE: updatedPositions height can be undefined if terrain not properly loaded
    });
}

const getPolygonInsideCoordinates = (polygonArrayInDegress, _cb) => {
    //polygonArrayInDegress =
    //     [
    //         [-72.37353086471558, 42.32481709325035],
    //         [-72.3738956451416, 42.324594989789134],
    //         [-72.3735523223877, 42.324436343979656],
    //     ];
    if (!turf || Array.isArray(polygonArrayInDegress) == false || polygonArrayInDegress.length < 3) return _cb(null);
    if (polygonArrayInDegress[0] !== polygonArrayInDegress[polygonArrayInDegress.length - 1]) {
        polygonArrayInDegress.push(polygonArrayInDegress[0]);
    }
    const polygon = turf.polygon([polygonArrayInDegress]);
    const bbox = turf.bbox(polygon);
    const options = {
        units: 'meters',
        mask: polygon
    };
    let parea = turf.area(polygon);
    let pareasqkm = Math.ceil(Math.sqrt(parea) / 1000);


    console.log(`Polygon area: ${pareasqkm} and distancer: ${pareasqkm * 6}`);
    const pointGrid = turf.pointGrid(bbox, pareasqkm * 6, options);
    const pointGridCoordinates = pointGrid.features.map(f => f.geometry.coordinates);
    return _cb(pointGridCoordinates);
}

function testfunc() {
    polygonArrayInDegress = [
        [-72.37353086471558, 42.32481709325035],
        [-72.3738956451416, 42.324594989789134],
        [-72.3735523223877, 42.324436343979656],
    ]; // this may cause undefined heights, it's a sample polygon coordinates and can be wrong //
    getPolygonInsideCoordinates(polygonArrayInDegress, function (pointGridCoordinates) {
        getUpdatedCoordinates(pointGridCoordinates, function (updatedPositions) {
            //get max heighted location
            console.log("MaxHeightLocation:", Math.max(...updatedPositions.map(o => o.height), 0.0))
        })
    });
}

// USAGE: 
// getPolygonInsideCoordinates(polygonArrayInDegress,1.0,function(pointGridCoordinates){
//  getUpdatedCoordinates(pointGridCoordinates, function(updatedPositions){
//    //get max heighted location
//    console.log(Math.max(...updatedPositions.map(o => o.height), 0.0);) 
//  })
// });

//** */

const calculateBearing = (startPoint, endPoint) => {
    const start = Cesium.Cartographic.fromCartesian(startPoint);
    const end = Cesium.Cartographic.fromCartesian(endPoint);

    const y = Math.sin(end.longitude - start.longitude) * Math.cos(end.latitude);
    const x =
        Math.cos(start.latitude) * Math.sin(end.latitude) -
        Math.sin(start.latitude) * Math.cos(end.latitude) *
        Math.cos(end.longitude - start.longitude);

    const bearing = Math.atan2(y, x);
    return Cesium.Math.toDegrees(bearing);
}

function waitForViewerLoad(_cb) {
    const viewerDetectorST = setTimeout(() => {
        try {
            if (Cesium !== undefined && viewer !== undefined) {
                clearTimeout(viewerDetectorST);
                _cb();
            }
        } catch (ex) {}
    }, 200);
}

function toDegrees(cartesian3Pos) {
    let pos = Cesium.Cartographic.fromCartesian(cartesian3Pos)
    if (pos !== undefined) {
        return {
            lon: pos.longitude / Math.PI * 180,
            lat: pos.latitude / Math.PI * 180
        }
    } else {
        return pos
    }
}

function fromDegreesToCartesian3(lon, lat, alt = 0) {
    return Cesium.Cartesian3.fromDegrees(lon, lat, alt)
}

function getHeading(fromPosition, toPosition) {
    let finalPosition = new Cesium.Cartesian3();
    let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition);
    Cesium.Matrix4.inverse(matrix4, matrix4);
    Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
    Cesium.Cartesian3.normalize(finalPosition, finalPosition);
    return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y));
}

function getPitch(fromPosition, toPosition) {
    let finalPosition = new Cesium.Cartesian3();
    let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition);
    Cesium.Matrix4.inverse(matrix4, matrix4);
    Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
    Cesium.Cartesian3.normalize(finalPosition, finalPosition);
    return Cesium.Math.toDegrees(Math.asin(finalPosition.z));
}

function generateCurve(startPoint, endPoint) {
    var addPointCartesian = new Cesium.Cartesian3();
    Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian);
    var midPointCartesian = new Cesium.Cartesian3();
    Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian);
    var midPointCartographic = Cesium.Cartographic.fromCartesian(midPointCartesian);
    midPointCartographic.height = Cesium.Cartesian3.distance(startPoint, endPoint) / 10;
    var midPoint = new Cesium.Cartesian3();
    Cesium.Ellipiancartographic.WGS84.cartesianToCartographic(midPointCartographic, midPoint);
    varspline = new Cesium.LinearSpline({
        times: [0.0, 1.0],
        points: [startPoint, endPoint]
    });
    var curvePointsArr = [];
    for (var i = 0, len = 300; i < len; i++) {
        curvePointsArr.push(spline.evaluate(i / len));
    }
    return curvePointsArr;
}

function tarInfo(tarentity) {
    viewer.clock.onTick.addEventListener(function (clock) {
        var curtime = viewer.clock.currentTime;
        var pos = tarentity.position.getValue(curtime, result);
        var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(pos);
        var lon = Cesium.Math.toDegrees(cartographic.longitude);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var height = cartographic.height;
        var pmpos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, pos);
        var info = '<h4>' + tarentity.name + '</h4>' +
            '<p>經度：<span class="text-color-blue-light">' + lon.toFixed(8) + '</span></p>' +
            ' <p>維度：<span class="text-color-blue-light">' + lat.toFixed(8) + '</span></p>' +
            ' <p>高度：<span class="text-color-blue-light">' + height.toFixed(8) + '</span></p>';
        tipDiv.showAt(pmpos, info);

    });
}
// function getHeadingByAngle(fromPosition, toPosition) {
//     var enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition);

//     let directionX = this.viewModel.viewDistance * Math.cos(Cesium.Math.toRadians(this.viewModel.direction_angle));
//     let directionY = this.viewModel.viewDistance * Math.sin(Cesium.Math.toRadians(this.viewModel.direction_angle));
//     let limitENU = new Cesium.Cartesian4(directionX, directionY, 0.0, 1.0);

//     var limitECF = new Cesium.Cartesian4();
//     limitECF = Cesium.Matrix4.multiplyByVector(enuTransform, limitENU, limitECF);
//     this.viewPositionEnd = {
//         x: limitECF.x,
//         y: limitECF.y,
//         z: limitECF.z
//     };

// }