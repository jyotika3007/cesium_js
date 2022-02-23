function toggleInspector() {
    if ($(".cesium-viewer-cesiumInspectorContainer").css("display") == "none") {
        $(".cesium-viewer-cesiumInspectorContainer")
            .css({
                "top": 'unset',
                "bottom": "65px",
                "display": "block"
            });
    } else {
        $(".cesium-viewer-cesiumInspectorContainer").css("display", "none");
    }
}

/* DOWNLOAD SNAPSHOT*/
function downloadSnapshot() {
    // configure settings
    var targetResolutionScale = 1.0; // for screenshots with higher resolution set to 2.0 or even 3.0
    var timeout = 500; // in ms

    var scene = viewer.scene;
    if (!scene) {
        console.error("No scene");
    }

    // define callback functions
    var prepareScreenshot = function () {
        var canvas = scene.canvas;
        viewer.resolutionScale = targetResolutionScale;
        scene.preRender.removeEventListener(prepareScreenshot);
        // take snapshot after defined timeout to allow scene update (ie. loading data)
        setTimeout(function () {
            scene.postRender.addEventListener(takeScreenshot);
        }, timeout);
    }

    var takeScreenshot = function () {
        scene.postRender.removeEventListener(takeScreenshot);
        var canvas = scene.canvas;
        canvas.toBlob(function (blob) {
            var url = URL.createObjectURL(blob);
            downloadURI(url, "snapshot-" + targetResolutionScale.toString() + "x.png");
            // reset resolutionScale
            viewer.resolutionScale = 1.0;
        });
    }

    scene.preRender.addEventListener(prepareScreenshot);

    function downloadURI(uri, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        // mimic click on "download button"
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        delete link;
    }
}
/* END */

function profileChartLoader() {
    $("#profileChart").remove();
    $(document.body).append($(`<div id="profileChart" style="display: none;
    width: calc(98% - 45px);
    height: 200px;
    position: absolute;
    bottom: 30px;
    background: #000000c9;
    border: 2px solid #00fffaa1;
    margin: 8px;
    margin-left: 45px;
    padding: 4px;
    border-radius: 4px;"></div>`));
}

function topToolbarLoader() {
    $(document.body).append($(`<div id="topToolbar">
    <div class="button" title="Download Snapshot" style="width: 30px;" onclick="downloadSnapshot();">
        <img src="./img/snapshot.png">
    </div>
    </div>`));
}

function bottomToolbarLoader() {
    $(document.body).append($(`<div class="bottomToolbar">
    <div class="leftpan"></div>
    <!-- <div class="rightpan"></div> -->
    </div>`));
}

function showLatLonMoving(event) {
    var ray = viewer.camera.getPickRay(event.endPosition);
    var mousePosition = viewer.scene.globe.pick(ray, viewer.scene);
    if (Cesium.defined(mousePosition)) {
        var cartographic = Cesium.Cartographic.fromCartesian(mousePosition);
        var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(3);
        var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(3);
        var heightString = cartographic.height.toFixed(2);
        var MGRSvalue = MGRSString(cartographic.latitude, cartographic.longitude);
        var IMGRSvalue = IMGRSString(cartographic.latitude, cartographic.longitude);
        var lhtext =
            `<span style="color:lightcoral;">Lat:</span> ${(latitudeString).slice(-8)}\u00B0
            <span style="color:lightcoral;">Lon:</span> ${(longitudeString).slice(-8)}\u00B0
            <span style="color:lightcoral;">Alt:</span> ${(heightString).slice(-7)}m\u00B0
            <span style="color:lightcoral;">IMGRS:</span> ${IMGRSvalue}
            <span style="color:lightcoral;">MGRS:</span> ${MGRSvalue}`;

        $(".bottomToolbar>.leftpan").html(lhtext);
        // document.getElementById("bottomToolbar").innerHTML = lhtext;
    }
}

function leftToolbarLoader() {
    $("#cesiumContainer").append($(`<div id="infobarPanel" onmousedown="_makeMeDragabble(this);"></div><div id="toolbarPanel"></div>`));
    $(document.body).append($(`<div id="toolbar2" style="width: fit-content;margin-top:2px; margin-left: -2px;max-height: 90%;overflow-y: auto;">
        <div style="width: fit-content;">
            <table>
                <tbody>
                    <tr>
                        <td style="padding:0px;">
                            <div class="toolbarnew">
                                    <div class="button _layerToggler" title="Toggle Layers Pannel"
                                        onclick="$('#_layerPanel').toggleClass('hideme'); $(this).toggleClass('highlightme',!$('#_layerPanel').hasClass('hideme'));">
                                        <span><img src="./img/layers.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0px;">
                            <div class="toolbarnew">
                                <div class="button" title="Toggle Drawing Tools"
                                    onclick="$('#drawingtools').toggleClass('hideme'); $(this).toggleClass('highlightme',!$('#drawingtools').hasClass('hideme'));">
                                    <span><img src="./img/paint.png" style="width: 24px;height: 24px;"></span>
                                </div>
                                <div class="toolbargroup hideme" id="drawingtools">
                                    <div class="divider"></div>    
                                    <div class="input-group myColorPicker">
                                        <div class="input-group-addon myColorPicker-preview">&nbsp;</div>
                                        <input type="text" class="form-control" style="display: none;">
                                    </div>
                                    <div class="divider"></div>
                                    <div class="button" id="drawPolyline" title="Draw Polyline">
                                        <span><img src="./img/map-location.png"
                                                style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" id="drawPolygon" title="Draw Polygon">
                                        <span><img src="./img/vector.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" id="drawRectangle" title="Draw Rectangle">
                                        <span><img src="./img/rectangle.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" id="drawCircle" title="Draw Circle">
                                        <span><img src="./img/rec.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="divider"></div>
                                    <div class="button" id="drawText" title="Draw Text">
                                        <span><img src="./img/text.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" id="drawPoint" title="Draw Point">
                                        <span><img src="./img/office-push-pin.png"
                                                style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" id="drawWall" title="Draw Wall">
                                        <span><img src="./img/brickwall.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="divider"></div>
                                    <div class="button" id="drawAddWeapon" title="Deploy Weapons">
                                        <span><img src="./img/weapons.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="divider"></div>
                                    <div class="button" id="drawBufferLine" title="Draw Buffer Line">
                                        <span><img src="./img/doodle.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" id="straightArrow" title="Draw Straight Arrow">
                                        <span><img src="./img/right-arrow.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" id="attackArrow" title="Draw Curved Arrow">
                                        <span><img src="./img/right.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" id="pincerArrow" title="Draw Double Sided Arrow">
                                        <span><img src="./img/double-arrow.png"
                                                style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="divider"></div>
                                    <div class="button" id="editShape" title="Edit Shape">
                                        <span><img src="./img/edit.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" id="deleteShape" title="Delete Shape">
                                        <span><img src="./img/delete2.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0px;">
                            <div class="toolbarnew">
                                <div class="button" title="Toggle Meassurement Tools"
                                    onclick="$('#measurementstools').toggleClass('hideme'); $(this).toggleClass('highlightme',!$('#measurementstools').hasClass('hideme'));">
                                    <span><img src="./img/measurements.png" style="width: 24px;height: 24px;"></span>
                                </div>
                                <div class="toolbargroup hideme" id="measurementstools">
                                    <div class="button" title="Stick To Ground"><span><input type="checkbox" checked
                                                class="myinput large" onchange="clampToGround=this.checked;" /></span>
                                    </div>
                                    <div class="button" style="display: none;" title="Measure Height"><span><img
                                                src="./img/vertical-lines.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" title="Meassure Distance"
                                        onclick="meassureThings('Space distance',this);">
                                        <span><img src="./img/area.png"></span>
                                    </div>
                                    <div class="button" title="Meassure Area"
                                        onclick="meassureThings('Space area',this);">
                                        <span><img src="./img/hexagon.png"></span>
                                    </div>
                                    <div class="button" title="Triangulation Measurement"
                                        onclick="meassureThings('Triangulation',this);"><span><img
                                                src="./img/triangle.png"></span>
                                    </div>
                                    <div class="button" title="Volume Measurement"
                                        onclick="toggleVolumeMeasurement(this);">
                                        <span><img src="./img/cylinder.png"></span>
                                    </div>
                                    <div class="divider"></div>
                                    <div class="button deleter" data-type="deleteall" title="Clear all measurements"
                                        onclick="meassureThings('Clear',this);">
                                        <span><img src="./img/delete2.png"></span>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0px;">
                            <div class="toolbarnew">
                                <div class="button" title="Toggle Terrain Analytics Tools"
                                    onclick="$('#terrainanalyticstools').toggleClass('hideme'); $(this).toggleClass('highlightme',!$('#terrainanalyticstools').hasClass('hideme'));">
                                    <span><img src="./img/terrain.png" style="width: 24px;height: 24px;"></span>
                                </div>
                                <div class="toolbargroup hideme" id="terrainanalyticstools">
                                    <div class="button" title="Visibility Analysis"
                                        onclick="toggleVisibilityAnalysis(this);">
                                        <span><img src="./img/cone1.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" title="Line Of Sight"
                                        onclick="toggleLos(this);">
                                        <span><img src="./img/view.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" title="Contour Analysis"
                                        onclick="toggleCounterAnalysis1(this);">
                                        <span><img src="./img/contour-step-barrel.png"
                                                style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" title="Elevation/Slope Analysis"
                                        onclick="toggleCounterAnalysis2(this);">
                                        <span><img src="./img/contour-step-barrel2.png"
                                                style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" title="Area Submerged Analysis"
                                        onclick="toggleWatershed(this);">
                                        <span><img src="./img/waterfall.png"></span>
                                    </div>
                                    <div class="button" title="Height Depth Analysis"
                                        onclick="toggleheightDepthCalc(this);">
                                        <span><img src="./img/heightdepth.png"></span>
                                    </div>
                                    <div class="button" title="Terrain Profile Analysis"
                                        onclick="toggleTerrainProfile(this);">
                                        <span><img src="./img/terrain_profile.png"></span>
                                    </div>
                                    <div class="button" title="CRN"
                                        onclick="">
                                        <span><img src="./img/weapons.png"></span>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0px;">
                            <div class="toolbarnew">
                                <div class="button" title="Toggle Adjustment Settings"
                                    onclick="$('#adjustmentsettings').toggleClass('hideme'); $(this).toggleClass('highlightme',!$('#adjustmentsettings').hasClass('hideme'));">
                                    <span><img src="./img/settings.png" style="width: 24px;height: 24px;"></span>
                                </div>
                                <div class="toolbargroup hideme" id="adjustmentsettings">
                                    <div class="button" title="Imagery Adjustment" onclick="toggleImageryAdjustment(this);">
                                        <span><img src="./img/sun.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" title="Weather Settings" onclick="toggleConfigurations();">
                                        <span><img src="./img/cloudy.png" style="width: 24px;height: 24px;"></span>
                                    </div>
                                    <div class="button" title="Cesium Inspector" onclick="toggleInspector();"><span><img
                                                src="./img/coding.png" style="width: 24px;height: 24px;"></span></div>
                                    <div class="divider"></div>
                                    <div class="button"
                                        title="First Person View (use 'W/A/S/D' keys for movement & Mouse for direction)"
                                        onclick="toggleFPP(this);"><span><img src="./img/360.png"></span>
                                    </div>
                                    <div class="button"
                                        title="Toggle Virtual Reality Mode"
                                        onclick="toggleVRmode(this);"><span><img src="./img/virtual-reality.png"></span>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0px;">
                            <div class="toolbarnew">
                                <div class="button" title="Query Calculator"
                                    onclick="">
                                    <span><img src="./img/dragIcon.png" style="width: 24px;height: 24px;"></span>
                                </div>                                
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>`));
    $("#toolbarPanel").draggable({
        containment: "parent"
    });
    $("#infobarPanel").draggable({
        containment: "parent"
    });
}

function watershedPanelLoader(_cb) {
    $("#toolbarPanel").empty();
    $("#toolbarPanel").append($(`<div id="toolbarPanelTitle"><span style="margin-left: 4px;">Area Submerged Analysis</span><span
    id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#toolbarPanel').empty();"></span>
    </div>
    <div id="toolbarPanelContent">
    <div id="watershed_toolbar">
        <table>
            <tbody>
                <tr>
                    <td>Water Height</td>
                    <td>
                        <input type="range" min="0" max="9000" step="1"
                            data-bind="value: waterHeight, valueUpdate: 'input'">
                        <input style="width:54px;" type="number" min="0" max="9000" step="1" data-bind="value: waterHeight"> m
                    </td>
                </tr>
                <tr>
                    <td>Transparency</td>
                    <td>
                        <input class="slider" type="range" min="0" max="255" step="1"
                            data-bind="value: waterAlpha, valueUpdate: 'input'">
                        <input style="width:54px;" type="number" min="0" max="255" step="1" data-bind="value: waterAlpha">
                    </td>
                </tr>
            <!-- <tr>
                    <td>Max Terrain Height</td>
                    <td>
                        <input type="range" min="0" max="9000" step="1"
                            data-bind="value: maxTerrainHeight, valueUpdate: 'input'">
                        <input type="number" min="0" max="9000" step="1"
                            data-bind="value: maxTerrainHeight"> m
                    </td>
                </tr> -->
            </tbody>
        </table>
        <hr>
        <button type="button" class="ui-button ui-corner-all ui-widget" onclick="waterShed.drawWaterShed({isEnabled: true});">Add</button>
        <button type="button" class="ui-button ui-corner-all ui-widget" onclick="waterShed.clearAll();">Clear</button>
    </div>
    </div>`));
    _cb();
}

function heightDepthCalcPanelLoader(_cb) {
    $("#toolbarPanel").empty();
    $("#toolbarPanel").append($(`<div id="toolbarPanelTitle"><span style="margin-left: 4px;">Height Depth Analysis</span><span
    id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#toolbarPanel').empty();"></span>
    </div>
    <div id="toolbarPanelContent">
    <div id="heightDepthCalc_toolbar">
        <button type="button" class="ui-button ui-corner-all ui-widget" onclick="heightDepthCalc.drawHeightDepthCalc({isEnabled: true});">Add</button>
        <button type="button" class="ui-button ui-corner-all ui-widget" onclick="heightDepthCalc.clearAll();">Clear</button>
    </div>
    </div>`));
    _cb();
}


function terrainProfilerPanelLoader(_cb) {
    $("#toolbarPanel").empty();
    $("#toolbarPanel").append($(`<div id="toolbarPanelTitle"><span style="margin-left: 4px;">Terrain Height Profile Analysis</span><span
    id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#toolbarPanel').empty();"></span>
    </div>
    <div id="toolbarPanelContent">
        <div id="terrainprofile_toolbar">
            <button type="button" class="ui-button ui-corner-all ui-widget" onclick='profileChartLoader(); terrainProfiler.start();'>Add</button>
            <button type="button" class="ui-button ui-corner-all ui-widget" onclick='terrainProfiler.clearAll();$("#profileChart").remove();'>Clear</button>
        </div>
    </div>`));
    _cb();
}

/* ColorPicker Section */
var selected_color = {
    r: 163,
    g: 0,
    b: 255,
    a: 0.5
};
var selected_outline_color = {
    r: 173,
    g: 255,
    b: 0,
    a: 0.5
};
var color_elem_type = 0;

//******************START**************************************** */
function color_elem_type_changed(el) {
    color_elem_type = Number(el.value);
    if (typeof (dynamic_cosmetic_change) === "function") dynamic_cosmetic_change();
}

function color_changed(color) {
    if (color_elem_type === 0) {
        selected_color = color;
    } else {
        selected_outline_color = color;
    }
    if (typeof (dynamic_cosmetic_change) === "function") dynamic_cosmetic_change();
}

function linestypes_changed(el) {
    default_draw_line_type = Number(el.value);
    if (typeof (dynamic_cosmetic_change) === "function") dynamic_cosmetic_change();
}

function default_draw_line_width_changed(el) {
    default_draw_line_width = Number(el.value);
    $("span#widm").text(default_draw_line_width + 'm');
    if (typeof (dynamic_cosmetic_change) === "function") dynamic_cosmetic_change();
}

function dynamic_cosmetic_change() {
    let temporary_selected_Entity_array = viewer.entities.values.filter(v => { return v.istemporary });
    let temporary_selected_Entity = temporary_selected_Entity_array !== undefined && temporary_selected_Entity_array.length > 0 ? temporary_selected_Entity_array[0] : undefined;
    if (temporary_selected_Entity !== undefined) {
        var outlineMaterial = null;
        var material = Cesium.Color.fromCssColorString(`rgb(${selected_color.r},${selected_color.g},${selected_color.b})`).withAlpha(selected_color.a);
        if (default_draw_line_type === 1) { //dashed
            outlineMaterial = new Cesium.PolylineDashMaterialProperty({
                dashLength: 16,
                color: Cesium.Color.fromCssColorString(`rgb(${selected_outline_color.r},${selected_outline_color.g},${selected_outline_color.b})`).withAlpha(selected_outline_color.a)
            });
        } else if (default_draw_line_type === 2) { //glow
            outlineMaterial = new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.25,
                color: Cesium.Color.fromCssColorString(`rgb(${selected_outline_color.r},${selected_outline_color.g},${selected_outline_color.b})`).withAlpha(selected_outline_color.a) //;Cesium.Color.fromCssColorString('#00f').withAlpha(0.9)
            });
        } else { //solid
            outlineMaterial = Cesium.Color.fromCssColorString(`rgb(${selected_outline_color.r},${selected_outline_color.g},${selected_outline_color.b})`).withAlpha(selected_outline_color.a);
        }
        if (temporary_selected_Entity.polygon !== undefined) {
            temporary_selected_Entity.polygon.material = material;
        }

        if (temporary_selected_Entity.polyline !== undefined) {
            temporary_selected_Entity.polyline.width = default_draw_line_width;
            temporary_selected_Entity.polyline.material = outlineMaterial;
        }
    }
}

//******************END**************************************** */

function colorPickerLoader() {
    $('.myColorPicker').colorPickerByGiro({
        preview: '.myColorPicker-preview',
        format: 'rgb'
    });
    $(".cpBG").prepend($(`<div style="width: 100%;
        margin-top: 6px;
        text-align: left;
        font-family: sans-serif;
        font-size: small;">
        <span>Stroke Type: </span>
        <label><input type="radio" checked name="linetypes" onchange="linestypes_changed(this);" value="0">&nbsp;Solid</label>
        <label><input type="radio" name="linetypes" onchange="linestypes_changed(this);" value="1">&nbsp;Dashed</label>
        <label><input type="radio" name="linetypes" onchange="linestypes_changed(this);" value="2">&nbsp;Glow</label>
        <br>
        <span>Color Element: </span>
        <label><input type="radio" checked name="colortypes" onchange="color_elem_type_changed(this);" value="0">&nbsp;Fill</label>
        <label><input type="radio" name="colortypes" onchange="color_elem_type_changed(this);" value="1">&nbsp;Stroke</label>
        <br>
        <label>Stroke Width:<input type="range" min="1" max="1000" value="${default_draw_line_width}" step="1" onchange="default_draw_line_width_changed(this);"><span id="widm">${default_draw_line_width}m</span></label>
        <hr>
        </div>`));

    $(".cpBG .cp-buttons div.btn").addClass("ui-button ui-corner-all ui-widget");
}
/* END */

function elevationAnalysisPanelLoader(_cb) {
    $("#toolbarPanel").empty();
    $("#toolbarPanel").append($(`<div id="toolbarPanelTitle"><span style="margin-left: 4px;">Contour Analysis</span><span
    id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#toolbarPanel').empty();"></span>
    </div>
    <div id="toolbarPanelContent">
        <div id="contour1_toolbar">
            <table>
                <tbody>
                <tr>
                    <td>Background Transparency</td>
                    <td>
                        <input type="range" min="0.0" max="1.0" step="0.01"
                            data-bind="value: backgroundTransparency, valueUpdate: 'input'">
                        <input type="text" size="4" data-bind="value: backgroundTransparency">
                    </td>
                </tr>
                <tr>
                    <td>Band Transparency</td>
                    <td>
                        <input type="range" min="0.0" max="1.0" step="0.01"
                            data-bind="value: bandTransparency, valueUpdate: 'input'">
                        <input type="text" size="4" data-bind="value: bandTransparency">
                    </td>
                </tr>
                <tr>
                    <td>Band Thickness</td>
                    <td>
                        <input type="range" min="10" max="1000" step="1"
                            data-bind="value: bandThickness, valueUpdate: 'input'">
                        <input type="text" size="4" data-bind="value: bandThickness">
                    </td>
                </tr>
                <tr>
                    <td>Band 1 Position</td>
                    <td>
                        <input type="range" min="4000" max="8848" step="1"
                            data-bind="value: band1Position, valueUpdate: 'input'">
                        <input type="text" size="4" data-bind="value: band1Position">m
                    </td>
                </tr>
                <tr>
                    <td>Band 2 Position</td>
                    <td>
                        <input type="range" min="4000" max="8848" step="1"
                            data-bind="value: band2Position, valueUpdate: 'input'">
                        <input type="text" size="4" data-bind="value: band2Position">m
                    </td>
                </tr>
                <tr>
                    <td>Band 3 Position</td>
                    <td>
                        <input type="range" min="4000" max="8848" step="1"
                            data-bind="value: band3Position, valueUpdate: 'input'">
                        <input type="text" size="4" data-bind="value: band3Position">m
                    </td>
                </tr>
                <tr>
                    <td>Gradient</td>
                    <td>
                        <input type="checkbox" data-bind="checked: gradient">
                    </td>
                </tr>
            </tbody>
        </table>
        <hr>
        <button type="button" class="ui-button ui-corner-all ui-widget" onclick="elevationAnalysis.updateMaterial({ enabled: true });"
            style="cursor: pointer;">Add</button>
        <button type="button" class="ui-button ui-corner-all ui-widget" onclick="elevationAnalysis.updateMaterial({ enabled: false });"
            style="cursor: pointer;">Clear</button>
        </div>
    </div>`));
    _cb();
}

function elevationAnalysis2PanelLoader(_cb) {
    $("#toolbarPanel").empty();
    $("#toolbarPanel").append($(`<div id="toolbarPanelTitle"><span style="margin-left: 4px;">Elevation/Slope Analysis</span><span
    id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#toolbarPanel').empty();"></span>
    </div>
    <div id="toolbarPanelContent">
        <div id="contour2_toolbar">
            <table>
            <tbody>
                <tr>
                    <td>
                        <div class="demo-container">
                            <label><input type="radio" name="shadingMaterials" value="none"
                                    data-bind="checked: selectedShading">
                                No shading</label>
                            <label><input type="radio" name="shadingMaterials" value="elevation"
                                    data-bind="checked: selectedShading">
                                Elevation</label>
                            <label><input type="radio" name="shadingMaterials" value="slope"
                                    data-bind="checked: selectedShading">
                                Slope</label>
                            <label><input type="radio" name="shadingMaterials" value="aspect"
                                    data-bind="checked: selectedShading">
                                Aspect</label>
                        </div>
                        <div class="demo-container">
                            <div>
                                <label><input type="checkbox" data-bind="checked: enableContour"> Enable
                                    Contour Lines</label>
                            </div>
                            <div>
                                Spacing
                                <input style="width: 136px" type="range" min="1.0" max="500.0" step="1.0"
                                    data-bind="value: contourSpacing, valueUpdate: 'input', enable: enableContour">
                                <input type="text" size="4" data-bind="value: contourSpacing">m
                            </div>
                            <div>
                                Line Width
                                <input style="width: 125px" type="range" min="1.0" max="10.0" step="1.0"
                                    data-bind="value: contourWidth, valueUpdate: 'input', enable: enableContour">
                                <span data-bind="text: contourWidth"></span>px
                            </div>
                            <hr>
                            <div>
                                <button type="button" class="ui-button ui-corner-all ui-widget" data-bind="click: changeColor, enable: enableContour">
                                    Change contour color
                                </button>
                                <button type="button" class="ui-button ui-corner-all ui-widget" onclick="elevationAnalysis2.updateMaterial({ enabled: true });"
                                style="cursor: pointer;">Add</button>
                                <button type="button" class="ui-button ui-corner-all ui-widget" onclick="elevationAnalysis2.updateMaterial({ enabled: false });"
                                    style="cursor: pointer;">Clear</button>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
    </div>`));
    _cb();
}

function imageryAdjustmentPanelLoader(_cb) {
    $("#toolbarPanel").empty();
    $("#toolbarPanel").append($(`<div id="toolbarPanelTitle"><span style="margin-left: 4px;">Imagery Adjustment</span><span
    id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#toolbarPanel').empty();"></span>
    </div>
    <div id="toolbarPanelContent">
        <div id="imageryAdjustment_toolbar">
            <table>
            <tbody>
                <tr>
                    <td>Brightness</td>
                    <td>
                        <input type="range" min="0" max="3" step="0.02"
                            data-bind="value: brightness, valueUpdate: 'input'">
                        <input type="text" size="5" data-bind="value: brightness">
                    </td>
                </tr>
                <tr>
                    <td>Contrast</td>
                    <td>
                        <input type="range" min="0" max="3" step="0.02"
                            data-bind="value: contrast, valueUpdate: 'input'">
                        <input type="text" size="5" data-bind="value: contrast">
                    </td>
                </tr>
                <tr>
                    <td>Hue</td>
                    <td>
                        <input type="range" min="0" max="3" step="0.02" data-bind="value: hue, valueUpdate: 'input'">
                        <input type="text" size="5" data-bind="value: hue">
                    </td>
                </tr>
                <tr>
                    <td>Saturation</td>
                    <td>
                        <input type="range" min="0" max="3" step="0.02"
                            data-bind="value: saturation, valueUpdate: 'input'">
                        <input type="text" size="5" data-bind="value: saturation">
                    </td>
                </tr>
                <tr>
                    <td>Gamma</td>
                    <td>
                        <input type="range" min="0" max="3" step="0.02" data-bind="value: gamma, valueUpdate: 'input'">
                        <input type="text" size="5" data-bind="value: gamma">
                    </td>
                </tr>
            </tbody>
        </table>
        <hr>
        <button type="button" class="ui-button ui-corner-all ui-widget" onclick="imageryAdjustment.updateMaterial({ enabled: false });">Reset</button>
        </div>
    </div>`));
    _cb();
}

function weatherPanelLoader(_cb) {
    $("#toolbarPanel").empty();
    $("#toolbarPanel").append($(`<div id="toolbarPanelTitle"><span style="margin-left: 4px;">Weather Settings</span><span
    id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#toolbarPanel').empty();"></span>
    </div>
    <div id="toolbarPanelContent">
        <div id="config_toolbar">
            <table>
            <tbody>
                <tr>
                    <td>
                        <label><input type="checkbox" data-bind="checked: globelightening_enabled">
                            Day/Night Lightening</label>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p class="collapsible">Sky Settings</p>
                        <div class="content" style="margin-top:5px;">
                            <label><input type="checkbox" data-bind="checked: sky_settings_enabled">
                                Enable</label><br>
                            <table><tbody>
                            <tr>
                                <td>Density</td>
                                <td>
                                    <input type="range" min="0" max="0.002" step="0.0001"
                                        data-bind="value: fog_density, valueUpdate: 'input'">
                                </td>
                                <td>
                                    <input type="number" style="width:80px;" min="0" max="0.002" step="0.0001"
                                        data-bind="value: fog_density">
                                </td>
                            </tr>
                            <tr>
                                <td>Brightness</td>
                                <td>
                                    <input type="range" min="0" max="1" step="0.1"
                                        data-bind="value: fog_minimumBrightness, valueUpdate: 'input'">
                                </td>
                                <td>
                                    <input type="number" style="width:80px;" min="0" max="1" step="0.1"
                                        data-bind="value: fog_minimumBrightness">
                                </td>
                            </tr>
                            <tr>
                                <td>Brightness Shift</td>
                                <td>
                                    <input type="range" min="0" max="1" step="0.1"
                                        data-bind="value: skyAtmosphere_brightnessShift, valueUpdate: 'input'">
                                </td>
                                <td>
                                    <input type="number" style="width:80px;" min="0" max="1" step="0.1"
                                        data-bind="value: skyAtmosphere_brightnessShift">
                                </td>
                            </tr>
                            <tr>
                                <td>Saturation Shift</td>
                                <td>
                                    <input type="range" min="0" max="1" step="0.1"
                                        data-bind="value: skyAtmosphere_saturationShift, valueUpdate: 'input'">
                                </td>
                                <td>
                                    <input type="number" style="width:80px;" min="0" max="1" step="0.1"
                                        data-bind="value: skyAtmosphere_saturationShift">
                                </td>
                            </tr>
                            <tr>
                                <td>Hue Shift</td>
                                <td>
                                    <input type="range" min="0" max="1" step="0.1"
                                        data-bind="value: skyAtmosphere_hueShift, valueUpdate: 'input'">
                                </td>
                                <td>
                                    <input type="number" style="width:80px;" min="0" max="1" step="0.1"
                                        data-bind="value: skyAtmosphere_hueShift">
                                </td>
                            </tr>
                            </tbody></table> 
                            <hr>
                            <table><tbody>
                            <tr>
                                <td>Effective Height</td>
                                <td>
                                    <input type="range" min="500" max="12000" step="50"
                                        data-bind="value: effective_height, valueUpdate: 'input'">
                                </td>
                                <td>
                                    <input type="number" style="width:80px;" min="500" max="12000" step="50"
                                        data-bind="value: effective_height">
                                </td>
                            </tr>
                            </tbody></table>
                            <label><input type="radio" name="skyType" value="default"
                                    data-bind="checked: sky_type">
                                Default</label>
                            <label><input type="radio" name="skyType" value="clouds"
                                data-bind="checked: sky_type">
                                Clouds</label>
                            <label><input type="radio" name="skyType" value="dark"
                                    data-bind="checked: sky_type">
                                Dark</label>
                            <label><input type="radio" name="skyType" value="dusk"
                                data-bind="checked: sky_type">
                                Dusk</label>
                            <label><input type="radio" name="skyType" value="stars"
                                data-bind="checked: sky_type">
                                Stars</label><br>
                            <label><input type="radio" name="skyType" value="sunny"
                                data-bind="checked: sky_type">
                                Sunny</label>
                            <label><input type="radio" name="skyType" value="sunset"
                                data-bind="checked: sky_type">
                                Sunset</label>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p class="collapsible">Clouds Settings</p>
                        <div class="content" style="margin-top:5px;">
                            <label><input type="checkbox" data-bind="checked: show_clouds">
                                Enable</label><br>
                            <label>Counts: <input type="range" min="100" max="1000" step="10"
                                    data-bind="value: ncloud, valueUpdate: 'input'">
                                <input type="number" style="width:80px;" min="100" max="1000" step="10"
                                    data-bind="value: ncloud"></label><br>
                            <label>Height: <input type="range" min="100" max="1000" step="50"
                                    data-bind="value: cloudZ, valueUpdate: 'input'">
                                <input type="number" style="width:80px;" min="100" max="1000" step="50"
                                    data-bind="value: cloudZ"></label><br>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p class="collapsible">Fog Settings</p>
                        <div class="content" style="margin-top:5px;">
                            <label><input type="checkbox" data-bind="checked: fog_enabled">
                                Enable</label><br>
                            <input type="checkbox" data-bind="checked: fog_blackshed">
                            Blackshed</label><br>
                            <label>Transparancy: <input type="range" min="0" max="1.0" step="0.1"
                                    data-bind="value: fog_transparancy, valueUpdate: 'input'">
                                <input type="number" style="width:80px;" min="0" max="1.0" step="0.1"
                                    data-bind="value: fog_transparancy"></label><br>
                            <!-- <label>Density: <input type="range" min="0" max="0.002" step="0.0001"
                                    data-bind="value: fog_density, valueUpdate: 'input'">
                                <input type="number" style="width:80px;" min="0" max="0.002" step="0.0001"
                                    data-bind="value: fog_density"></label><br>
                            <label>Brightness: <input type="range" min="0" max="1" step="0.1"
                                    data-bind="value: fog_minimumBrightness, valueUpdate: 'input'">
                                <input type="number" style="width:80px;" min="0" max="1" step="0.1"
                                    data-bind="value: fog_minimumBrightness"></label><br>
                            <label>Brightness Shift: <input type="range" min="0" max="1" step="0.1"
                                    data-bind="value: skyAtmosphere_brightnessShift, valueUpdate: 'input'">
                                <input type="number" style="width:80px;" min="0" max="1" step="0.1"
                                    data-bind="value: skyAtmosphere_brightnessShift"></label><br>

                            <label>Saturation Shift: <input type="range" min="0" max="1" step="0.1"
                                    data-bind="value: skyAtmosphere_saturationShift, valueUpdate: 'input'">
                                <input type="number" style="width:80px;" min="0" max="1" step="0.1"
                                    data-bind="value: skyAtmosphere_saturationShift"></label><br>

                            <label>Hue Shift: <input type="range" min="0" max="1" step="0.1"
                                    data-bind="value: skyAtmosphere_hueShift, valueUpdate: 'input'">
                                <input type="number" style="width:80px;" min="0" max="1" step="0.1"
                                    data-bind="value: skyAtmosphere_hueShift"></label><br> -->
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p class="collapsible">Snow Settings</p>
                        <div class="content" style="margin-top:5px;">
                            <label><input type="checkbox" data-bind="checked: snow_enabled">
                                Enable</label><br>
                            <label><input type="checkbox" data-bind="checked: snow_sound">
                                Sound</label>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p class="collapsible">Rain Settings</p>
                        <div class="content" style="margin-top:5px;">
                            <label><input type="checkbox" data-bind="checked: rain_enabled">
                                Enable</label><br>
                            <label><input type="checkbox" data-bind="checked: rain_sound">
                                Sound</label>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
    </div>`));
    $(document).on("click", ".collapsible", function (event) {
        event.preventDefault();
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
    _cb();
}

var firstPersonCameraController = undefined;

function fppPanelLoader(_cb) {
    $("#toolbarPanel").empty();
    $("#toolbarPanel").append($(`<div id="toolbarPanelTitle"><span style="margin-left: 4px;">First Person 360 view</span><span
    id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#toolbarPanel').empty();"></span>
    </div>
    <div id="toolbarPanelContent">
        <div id="fpp_toolbar">
            <button type="button" class="ui-button ui-corner-all ui-widget" onclick="firstPersonCameraController.start();">Start</button>
            <button type="button" class="ui-button ui-corner-all ui-widget" onclick="firstPersonCameraController.stop();">Stop</button>
        </div>
    </div>`));
    if (firstPersonCameraController === undefined) {
        firstPersonCameraController = new Cesium.FirstPersonCameraController({
            cesiumViewer: viewer
        });
    }
    _cb();
}

function vrPanelLoader(_cb) {
    $("#toolbarPanel").empty();
    $("#toolbarPanel").append($(`<div id="toolbarPanelTitle"><span style="margin-left: 4px;">Virtual Reality Mode</span><span
    id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#toolbarPanel').empty();"></span>
    </div>
    <div id="toolbarPanelContent">
        <div id="vr_toolbar">
            <button type="button" class="ui-button ui-corner-all ui-widget" onclick="scene.useWebVR = true;">Start</button>
            <button type="button" class="ui-button ui-corner-all ui-widget" onclick="scene.useWebVR = false;">Stop</button>
        </div>
    </div>`));
    _cb();
}

function weaponDeployPanelLoader(_cb) {
    $("#toolbarPanel").empty();
    $("#toolbarPanel").append($(`<div id="toolbarPanelTitle"><span style="margin-left: 4px;">Select Weapons To Deploy</span><span
    id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#toolbarPanel').empty();"></span>
    </div>
    <div id="toolbarPanelContent">
        <div id="weapons_toolbar" style="width:95%;">
            <table>
                <tbody>
                    <tr>
                        <td>Weapons</td>
                        <td>
                            <select id="weaponDataDropdown" data-bind="value: layerDataType"
                                onchange="weaponDataDropdownOnchange()">
                                <!-- <option value="" disabled selected hidden>--select a weapon--</option>
                                <option value="a" data-velocity="827" data-maxrange="100000"
                                    data-type="indirect">A</option>
                                <option value="b" data-velocity="475" data-maxrange="50000"
                                    data-type="direct">B</option>
                                <option value="r" data-velocity="820" data-maxrange="100000"
                                    data-type="radar">R</option>
                                <option value="l" data-velocity="820" data-maxrange="100000"
                                    data-type="los">L
                                </option> -->
                                <!-- <option value="155mm-bofors" data-velocity="827">155mm BoFoRs</option>
                                <option value="sample-weapon" data-velocity="200">Sample Weapon</option> -->
                            </select>
                        </td>
                    </tr>
                    <tr id="eangle">
                        <td>Angle</td>
                        <td>
                            <input type="range" min="1" max="90" value="50" class="slider" id="angle">

                        </td>
                        <td>
                            <input id="input-angle" name="price" value="50" style="width:50px;" readonly>
                        </td>
                    </tr>
                    <tr>
                        <td>Direction</td>
                        <td>
                            <input type="range" min="1" max="360" value="60" class="slider" id="direction">

                        </td>
                        <td>
                            <input id="input-direction" name="price" value="60" style="width:50px;" readonly>
                        </td>
                    </tr>
                </tbody>
            </table>
            <hr>
            <button type="button" class="ui-button ui-corner-all ui-widget" onclick="expanded = true;">Add</button>
        </div>
    </div>`));
    loadWeapons(weaponsList);
    _cb();
}

function _flytoSymbolByObjId(el) {
    let objId = $(el).attr("objId");
    if (objId) {
        let vf = viewer.entities.values.filter(e => {
            return e.objId && Number(e.objId) == Number(objId);
        });
        if (vf.length > 0) {
            viewer.flyTo(vf[0], {
                duration: 6.0
            });
        }
    }

}

function volumeMeassurementPanelLoader(_cb) {
    $("#toolbarPanel").empty();
    $("#toolbarPanel").append($(`<div id="toolbarPanelTitle"><span style="margin-left: 4px;">Volume Meassurement</span><span
        id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#toolbarPanel').empty();"></span>
        </div>
        <div id="toolbarPanelContent">
            <div id="vm_toolbar">
                <button type="button" class="ui-button ui-corner-all ui-widget" onclick="cesiumMeasurer.startDrawing({});">Start</button>
                <button type="button" class="ui-button ui-corner-all ui-widget" onclick="cesiumMeasurer.stopMeassure();">Stop</button>
                <button type="button" class="ui-button ui-corner-all ui-widget" onclick="cesiumMeasurer.cleanUp()">Clear</button>
            </div>
        </div>`));
    _cb();
}

function viewshedAnalysisPanelLoader(_cb) {
    $("#toolbarPanel").empty();
    $("#toolbarPanel").append($(`<div id="toolbarPanelTitle"><span style="margin-left: 4px;">Viewshed Analysis</span><span
    id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#toolbarPanel').empty();"></span>
    </div>
    <div id="toolbarPanelContent">
        <div id="viewshad3d_toolbar">
            <table>
            <tbody>
                <tr>
                    <td>Horizontal Angle</td>
                    <td>
                        <input type="range" min="1" max="180" step="1"
                            data-bind="value: horizontalViewAngle, valueUpdate: 'input'">
                        <input type="number" step="1" style="max-width:100px;" size="4" data-bind="value: horizontalViewAngle">
                    </td>
                </tr>
                <tr>
                    <td>Vertical Angle</td>
                    <td>
                        <input type="range" min="1" max="180" step="1"
                            data-bind="value: verticalViewAngle, valueUpdate: 'input'">
                        <input type="number" step="1" style="max-width:100px;" size="4" data-bind="value: verticalViewAngle">
                    </td>
                </tr>
                <tr>
                    <td>View Distance</td>
                    <td>
                        <input type="range" min="1" step="1"
                            data-bind="value: viewDistance, valueUpdate: 'input', attr: { max: maxSliderDistance }">
                        <input type="number" step="1" style="max-width:100px;" size="4" data-bind="value: viewDistance"> m
                    </td>
                </tr>
                <tr>
                    <td>Horizontal Direction</td>
                    <td>
                        <input type="range" min="-180" max="180" step="0.5"
                            data-bind="value: direction_angle, valueUpdate: 'input'">
                        <input type="number" min="-180" max="180" step="0.5" style="max-width:100px;width:100%;" size="4" data-bind="value: direction_angle">&nbsp;\u00B0
                    </td>
                </tr>
                <tr>
                    <td>Vertical Direction</td>
                    <td>
                        <input type="range" min="-180" max="180" step="0.5"
                            data-bind="value: vdirection_angle, valueUpdate: 'input'">
                        <input type="number" min="-180" max="180" step="0.5" style="max-width:100px;width:100%;" size="4" data-bind="value: vdirection_angle">&nbsp;\u00B0
                    </td>
                </tr>
                <tr>
                    <td><label><input type="checkbox" data-bind="checked: is3d">&nbsp;3D</label></td>
                </tr>
            </tbody>
        </table>
        <hr>
        <button type="button" class="ui-button ui-corner-all ui-widget" onclick="create_new_vs();">Add</button>
        <button type="button" class="ui-button ui-corner-all ui-widget" onclick="clear_one_vs();">Delete</button>
        <button type="button" class="ui-button ui-corner-all ui-widget" onclick="clear_all_vs();">Delete All</button>
        </div>
    </div>`));
    _cb();
}

function losPanelLoader(_cb) {
    $("#toolbarPanel").empty();
    $("#toolbarPanel").append($(`<div id="toolbarPanelTitle"><span style="margin-left: 4px;">Line Of Sight Analysis</span><span
    id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#toolbarPanel').empty();"></span>
    </div>
    <div id="toolbarPanelContent">
        <div id="losa_toolbar">
            <button type="button" class="ui-button ui-corner-all ui-widget" onclick="sight.drawLineSight({isEnabled: true});">Start</button>
            <button type="button" class="ui-button ui-corner-all ui-widget" onclick="sight.drawLineSight({isEnabled: false});">Stop</button>
            <button type="button" class="ui-button ui-corner-all ui-widget" onclick="sight.clearAll();">Clear</button>
        </div>
    </div>`));
    _cb();
}


//*********** START ************************* */
function infoToolbarLoader(objId, _symbolData, _cb) {
    $("#infobarPanel").empty();
    $("#infobarPanel").draggable({
        containment: "parent"
    });
    if (!objId && !_symbolData) return;
    let _ignoreKeys = ["isanim", "title", "img", "category", "id", "flat", "imgTranslucency", "scale", "position", "shapeType", "data"];

    if (objId && _symbolData && !_symbolData["displayInfo"]) {
        let infoHtml = `<div id="infobarPanelTitle" class="mydivheader"><span style="margin-left: 4px;">${(_symbolData.shapeType ? _symbolData.shapeType : "") + (_symbolData.Layer ? ' (' + _symbolData.Layer + ')' : "")}</span><span
        id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#infobarPanel').empty();"></span>
        </div>
        <div id="infobarPanelContent">
            <div style="display:inline-flex;width:100%;">
                <div style="width:100%;min-height: 35px;">
                    <table>
                        <tbody>`;

        Object.keys(_symbolData).forEach(k => {
            if (!_ignoreKeys.includes(k)) {
                if (_symbolData[k] && _symbolData[k] !== "") {
                    infoHtml += `<tr>
                    <td>
                        ${k}
                    </td>
                    <td>
                        ${_symbolData[k]}
                    </td>
                </tr>`;
                }

            }
        });

        if (_symbolData["position"]) {
            infoHtml += `       <tr><td style="color:lightcoral">Location</td><td style="color:lightcoral">Lat&nbsp;</td><td>${(Number(_symbolData["position"]["lat"])).toFixed(3)}\u00B0</td></tr>
            <tr><td></td><td style="color:lightcoral">Lon&nbsp;</td><td>${(Number(_symbolData["position"]["lon"])).toFixed(3)}\u00B0</td></tr>`
        }

        if (!_symbolData["img"]) {
            _symbolData["img"] = "img/go.png";
        }



        infoHtml += `</tbody>
                    </table>`;
        if (_symbolData.shapeType && selected_Entity && _symbolData.shapeType.toLowerCase() == "weapon" && _symbolData["WPN_EQPT"]) {
            switch (_symbolData["WPN_EQPT"].toLowerCase()) {
                case "arty gun":
                    if (selected_Entity.viewModel) {
                        infoHtml += `<hr><table><tbody><tr><td>Elevation</td><td>
                                            <input class="slider" type="range" min="1" max="360" step="1"
                                                data-bind="value: _elevation_angle, valueUpdate: 'input'"></td><td><input style="width:54px;" type="number" min="1" max="360" step="1" data-bind="value: _elevation_angle">
                                            </td></tr>
                                            <tr><td>Direction</td><td>
                                            <input class="slider" type="range" min="1" max="360" step="1"
                                                data-bind="value: _direction_angle, valueUpdate: 'input'"></td><td><input style="width:54px;" type="number" min="1" max="360" step="1" data-bind="value: _direction_angle">
                                            </td></tr></tbody></table>`;

                        setTimeout(() => {
                            bindToolbar(selected_Entity.viewModel, "infobarPanel",
                                "_indirect_weapon_dev(selected_Entity,true,function(w){})");
                        }, 500);
                    }
                    break;
                case "direct firing weapon":
                    if (selected_Entity.viewModel) {
                        infoHtml += `<hr><table><tbody><tr><td>Horizontal Direction</td><td>
                                            <input class="slider" type="range" min="1" max="360" step="1"
                                                data-bind="value: _direction_angle, valueUpdate: 'input'"></td><td><input style="width:54px;" type="number" min="1" max="360" step="1" data-bind="value: _direction_angle">
                                            </td></tr>
                                            <tr><td>Vertical Direction</td><td>
                                            <input class="slider" type="range" min="-90" max="90" step="1"
                                                data-bind="value: _vdirection_angle, valueUpdate: 'input'"></td><td><input style="width:54px;" type="number" min="-90" max="90" step="1" data-bind="value: _vdirection_angle">
                                            </td></tr></tbody></table>`;

                        setTimeout(() => {
                            bindToolbar(selected_Entity.viewModel, "infobarPanel",
                                "_direct_weapon_dev(selected_Entity,true,function(w){})");
                        }, 500);

                    }
                    break;
                case "radar":
                    //if (selected_Entity.viewModel) {
                    infoHtml +=
                        `<hr><table>
                                <tbody>
                                <tr>
                                    <td>Horizontal Angle</td>
                                    <td>
                                        <input type="range" min="1" max="180" step="1"
                                            data-bind="value: horizontalViewAngle, valueUpdate: 'input'">
                                        </td><td><input type="number" step="1" style="max-width:100px;" size="4" data-bind="value: horizontalViewAngle">
                                    </td>
                                </tr>
                                <tr>
                                    <td>Vertical Angle</td>
                                    <td>
                                        <input type="range" min="1" max="180" step="1"
                                            data-bind="value: verticalViewAngle, valueUpdate: 'input'">
                                            </td><td><input type="number" step="1" style="max-width:100px;" size="4" data-bind="value: verticalViewAngle">
                                    </td>
                                </tr>
                                <tr>
                                    <td>View Distance</td>
                                    <td>
                                        <input type="range" min="1" step="1"
                                            data-bind="value: viewDistance, valueUpdate: 'input', attr: { max: maxviewDistance }">
                                            </td><td><input type="number" step="1" style="max-width:100px;" size="4" data-bind="value: viewDistance"> m
                                    </td>
                                </tr>
                                <tr>
                                    <td>Horizontal Direction</td>
                                    <td>
                                        <input type="range" min="-180" max="180" step="0.5"
                                            data-bind="value: direction_angle, valueUpdate: 'input'">
                                            </td><td><input type="number" min="-180" max="180" step="0.5" style="max-width:100px;width:100%;" size="4" data-bind="value: direction_angle">&nbsp;\u00B0
                                    </td>
                                </tr>
                                <tr>
                                    <td>Vertical Direction</td>
                                    <td>
                                        <input type="range" min="-180" max="180" step="0.5"
                                            data-bind="value: vdirection_angle, valueUpdate: 'input'">
                                            </td><td><input type="number" min="-180" max="180" step="0.5" style="max-width:100px;width:100%;" size="4" data-bind="value: vdirection_angle">&nbsp;\u00B0
                                    </td>
                                </tr>
                                <tr>
                                    <td><label><input type="checkbox" data-bind="checked: is3d">&nbsp;3D</label></td>
                                </tr>
                            </tbody>
                        </table>`;

                    setTimeout(() => {
                        // bindToolbar(selected_Entity.viewModel, "infobarPanel",
                        //     "_radar_weapon_dev(selected_Entity,true,function(w){})");
                        bindToolbar(_radarsheds[_rsobjId].viewModel, "infobarPanel",
                            `_radarsheds['${_rsobjId}'].update()`);
                    }, 500);
                    //}
                    break;
            }
        }

        infoHtml += `</div>
                <div style="padding-left: 5px;right:2px;">
                    <img title="Click to zoom" objId="${objId}" onclick="_flytoSymbolByObjId(this);" style="cursor:pointer;width:24px;height:24px;padding:5px;border:1px solid #ffffff40;" src="${_symbolData["img"]}"/>
                </div>
                </div>
            </div>`;
        $("#infobarPanel").append($(infoHtml));

        // if (_symbolData.shapeType && selected_Entity && _symbolData.shapeType.toLowerCase() == "weapon" && _symbolData["WPN_EQPT"]) {
        //     switch (_symbolData["WPN_EQPT"].toLowerCase()) {
        //         case "arty gun":

        //             break;
        //         case "direct firing weapon":
        //             if (selected_Entity.viewModel) {
        //                 bindToolbar(selected_Entity.viewModel, "infobarPanel",
        //                     "_direct_weapon_dev(selected_Entity,function(w){})");
        //             }
        //             break;
        //     }
        //     console.log(_symbolData);
        // }

    } else {
        let infoHtml = `<div id="infobarPanelTitle" class="mydivheader"><span style="margin-left: 4px;">${_symbolData["displayInfo"]["title"] + (_symbolData.Layer ? ' (' + _symbolData.Layer + ')' : "")}</span><span
        id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#infobarPanel').empty();"></span>
        </div>
        <div id="infobarPanelContent">
            <div style="display:inline-flex;width:100%;">
                <div style="width:100%;min-height: 35px;">
                    <table>
                        <tbody>
                            <tr>
                                <td><b>${_symbolData["category"]}</b></td>
                            </tr>`;

        Object.keys(_symbolData["displayInfo"]).forEach(k => {
            if (!_ignoreKeys.includes(k)) {
                infoHtml += `<tr>
                    <td>
                        ${_symbolData["displayInfo"][k]}
                    </td>
                </tr>`;
            }
        });
        if (_symbolData["position"] !== undefined) {
            infoHtml += `       <tr><td style="color:lightcoral">Location</td><td style="color:lightcoral">Lat&nbsp;</td><td>${(Number(_symbolData["position"]["lat"])).toFixed(3)}\u00B0</td></tr>
                            <tr><td></td><td style="color:lightcoral">Lon&nbsp;</td><td>${(Number(_symbolData["position"]["lon"])).toFixed(3)}\u00B0</td></tr>`;
        }

        if (!_symbolData["img"]) {
            _symbolData["img"] = "img/go.png";
        }

        if ((_symbolData.shapeType == "Point" || _symbolData.shapeType == "Text") && selected_Entity.viewModel) {
            infoHtml += `<tr>
            <td>Flat</td>
            <td>
                <input type="checkbox" data-bind="checked: flat">
            </td>
            </tr>
            <tr>
            <td>Scale</td>
            <td>
                <input type="range" min="1" step="1"
                    data-bind="value: scale, valueUpdate: 'input'">
                    </td><td><input type="number" min="1" step="1" style="width:100%;max-width:100px;" size="4" data-bind="value: scale">
            </td>
        </tr>
        <tr>
            <td>XRotate</td>
            <td>
                <input type="range" min="0" max="360" step="1"
                    data-bind="value: xrotate, valueUpdate: 'input'">
                    </td><td><input type="number" min="0" max="360" step="1" style="width:100%;max-width:100px;" size="4" data-bind="value: xrotate">
            </td>
        </tr>
        <tr>
            <td>YRotate</td>
            <td>
                <input type="range" min="1" step="1"
                    data-bind="value: yrotate, valueUpdate: 'input'">
                    </td><td><input type="number" step="1" style="max-width:100px;" size="4" data-bind="value: yrotate">
            </td>
        </tr>`;

            setTimeout(() => {
                // bindToolbar(selected_Entity.viewModel, "infobarPanel",
                //     "_radar_weapon_dev(selected_Entity,true,function(w){})");
                if (_symbolData.shapeType == "Point") {
                    bindToolbar(selected_Entity.viewModel, "infobarPanel",
                        `updatePoint()`);
                }
                if(_symbolData.shapeType == "Text"){
                    bindToolbar(selected_Entity.viewModel, "infobarPanel",
                        `updateText()`);
                }
            }, 600);

        }
        infoHtml += `   </tbody>
                    </table>
                </div>
                <div style="padding-left: 5px;right:2px;">
                    <img title="Click to zoom" objId="${objId}" onclick="_flytoSymbolByObjId(this);" style="cursor:pointer;width:24px;height:24px;padding:5px;border:1px solid #ffffff40;" src="${_symbolData["img"]}"/>
                </div>
            </div>
        </div>`;
        $("#infobarPanel").append($(infoHtml));
    }

    // $('#infobarPanel').dragon({
    //     'within': $('#cesiumContainer')
    // });

    // if (typeof (dragElement) === "function") {
    //     dragElement($("#infobarPanel")[0]);
    // }

    setTimeout(() => {
        $("#infobarPanel").draggable({
            containment: "parent"
        });
    }, 200);

    _cb();
}

//*********** END ************************* */
function _makeMeDragabble(el) {
    $(el).draggable({
        containment: "parent"
    });

}

$(document).ready(function () {
    leftToolbarLoader();
    topToolbarLoader();
    bottomToolbarLoader();
    colorPickerLoader();
    //camFlyPanelLoader(()=>{})
    // infoToolbarLoader("INFO BAR",function(){

    // });
    // weaponDeployPanelLoader(function(){});
});


function camFlyPanelLoader(_cb) {
    $("#toolbarPanel").empty();
    $("#toolbarPanel").append($(`<div id="toolbarPanelTitle"><span style="margin-left: 4px;">Waypoint Analysis</span><span
    id="spclose" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('#toolbarPanel').empty();"></span>
    </div>
    <div id="toolbarPanelContent">
        <div id="waypoint_toolbar">
            <table><tbody>
                <tr><td><span>Latitude:</span></td>
                <td><input id="_waypoint_lat" step="0.1" type="number"></td>
                </tr>
                <tr><td><span>Longitude:</span></td>
                <td><input id="_waypoint_lon" step="0.1" type="number"></td>
                </tr>
                <tr><td><span>Altitude:</span></td>
                <td><input id="_waypoint_alt" step="0.1" type="number"></td>
                </tr>
            </tbody></table>
            <table><tbody>
                <tr>
                    <td>Path Interpolation:</td>
                </tr>
                <hr>
                <tr>
                    <td>
                        <label><input type="radio" checked name="interpoltype" onchange="linestypes_changed(this);" value="0">&nbsp;Straight</label>
                        <label><input type="radio" name="interpoltype" onchange="linestypes_changed(this);" value="1">&nbsp;Smooth</label>
                    </td>
                </tr>
            </tbody></table>
            <div style="text-align:center;">
                <hr>
                <button id="_drawWayPoint" type="button" class="ui-button ui-corner-all ui-widget">Add</button>
                <button type="button" class="ui-button ui-corner-all ui-widget" onclick='terrainProfiler.clearAll();$("#profileChart").remove();'>Clear</button>
                <button type="button" class="ui-button ui-corner-all ui-widget" onclick='terrainProfiler.clearAll();$("#profileChart").remove();'>Clear All</button>
                <hr>
                <button type="button" class="ui-button ui-corner-all ui-widget" onclick='profileChartLoader(); terrainProfiler.start();'>Start</button>
                <button type="button" class="ui-button ui-corner-all ui-widget" onclick='terrainProfiler.clearAll();$("#profileChart").remove();'>Stop</button>
            </div>
        </div>
    </div>`));
    _cb();
}