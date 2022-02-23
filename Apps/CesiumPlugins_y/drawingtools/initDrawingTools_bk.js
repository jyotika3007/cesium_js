var selected_Entity = undefined;

/* DRAWING TOOLS */

var tracker = null;
//Layer name
var layerId = "globeDrawerDemoLayer";
//Global variables, used to record shape coordinate information
var shapeDic = {};

var shapePropsDic = {};

var wallAnimPropsDic = {};

//Edit or delete flag, 1 is edit, 2 is delete
var flag = 0;

var default_draw_line_width = 2;
var default_draw_line_type = 0; //1 = dashed, 0= plane, 2=glow

function initDrawHelper() {
    tracker = new GlobeTracker(viewer);

    $(document).on('click', "#drawPolygon", function () {
        flag = 0;
        tracker.trackPolygon(function (positions) {
            var objId = (new Date()).getTime();
            shapeDic[objId] = positions;
            _promptNameDescription("Enter Detail", function (_success) {
                if (_success) {
                    wallAnimPropsDic[objId] = {};
                    wallAnimPropsDic[objId]["name"] = _nameDescription_name;
                    wallAnimPropsDic[objId]["description"] = _nameDescription_description;
                    showPolygon(objId, positions);
                }
            });
        });
    });

    $(document).on('click', "#drawPolyline", function () {
        flag = 0;
        tracker.trackPolyline(function (positions) {
            var objId = (new Date()).getTime();
            shapeDic[objId] = positions;
            _promptNameDescription("Enter Detail", function (_success) {
                if (_success) {
                    wallAnimPropsDic[objId] = {};
                    wallAnimPropsDic[objId]["name"] = _nameDescription_name;
                    wallAnimPropsDic[objId]["description"] = _nameDescription_description;
                    showPolyline(objId, positions);
                }
            });
        });
    });
    $(document).on('click', "#drawRectangle", function () {
        flag = 0;
        tracker.trackRectangle(function (positions) {
            var objId = (new Date()).getTime();
            shapeDic[objId] = positions;
            _promptNameDescription("Enter Detail", function (_success) {
                if (_success) {
                    wallAnimPropsDic[objId] = {};
                    wallAnimPropsDic[objId]["name"] = _nameDescription_name;
                    wallAnimPropsDic[objId]["description"] = _nameDescription_description;
                    showRectangle(objId, positions);
                }
            });
        });
    });
    $(document).on('click', "#drawCircle", function () {
        flag = 0;
        tracker.trackCircle(function (positions) {
            var objId = (new Date()).getTime();
            shapeDic[objId] = positions;
            _promptNameDescription("Enter Detail", function (_success) {
                if (_success) {
                    wallAnimPropsDic[objId] = {};
                    wallAnimPropsDic[objId]["name"] = _nameDescription_name;
                    wallAnimPropsDic[objId]["description"] = _nameDescription_description;
                    showCircle(objId, positions);
                }
            });
        });
    });
    $(document).on('click', "#drawPoint", function () {
        var _htmlcontent = `<style>
            #dropiconslist img{
                width:32px;height:32px;border:1px solid grey;border-radius:4px;padding:4px;margin:2px;cursor:pointer;
            }
            #dropiconslist img:hover{
                border:1px solid white;
            }
            #dropiconslist img.selected{
                border:2px solid #56ea56;
            }
        </style>
        <div id="searchiconbar" style="display:block">
        <input type="text" oninput="searchdrawicons(this);" style="border:1px solid black;border-radius:4px;padding:2px;font-family:sans-serif;font-size:small;width:100%;" placeholder="Search..." />
        </div>
        <div id="dropiconslist" style="display:flex;flex-direction:column;overflow-y:auto;max-height:306px;margin-top: 5px;"></div>
        <hr>
        <div style="font-family: sans-serif;font-size: small;color:white;">
        <table>
            <tbody>
                <tr>
                    <td>
                        Image Scale
                    </td>
                    <td>
                        <input type="range" min="1" max="10" value="1" step="0.5" onchange="default_image_scale_changed(this);">
                    </td>
                    <td>
                        <span id="iscale"></span>
                    </td>
                </tr>
                <tr>
                    <td>
                        Flattened
                    </td>
                    <td style="padding-left: 4px;">
                        <input type="checkbox" onchange="default_image_flat_changed(this);">
                    </td>
                </tr>
                <tr>
                    <td>
                        Translucency By Distance
                    </td>
                    <td style="padding-left: 4px;">
                        <input type="checkbox" onchange="default_image_translucency_changed(this);">
                    </td>
                </tr>
                <tr>
                    <td>
                        Size in Meters
                    </td>
                    <td style="padding-left: 4px;">
                        <input type="checkbox" onchange="default_image_sizeinmeters_changed(this);">
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
        <script>
            var imgScale = 1.0;
            var isFlat = false;
            var imgTranslucency = false;

            var imgSizeInMeters = false;

            function default_image_sizeinmeters_changed(el)
            {
                imgSizeInMeters = el.checked;
            }

            function default_image_translucency_changed(el)
            {
                imgTranslucency = el.checked;
            }

            function default_image_flat_changed(el)
            {
                isFlat = el.checked;
            }

            $("span#iscale").text(imgScale);
            function default_image_scale_changed(el)
            {
                imgScale = Number(el.value);
                $("span#iscale").text(imgScale);
            }
            var _selSymobInfo = null;

            $(document).on('click','#dropiconslist img',function(){
                $('#dropiconslist img').removeClass('selected');
                $(this).toggleClass('selected',true);
                let dataid = $(this).attr('dataid');
                _selSymobInfo = plotIconsList[dataid];
                _selSymobInfo["dataid"] = dataid;
            });

            function arrangeSymbolIcons()
            {
                var drawnCats = {};
                let dropiconslistelem =  $('#dropiconslist');
                dropiconslistelem.empty();
                Object.keys(plotIconsList).forEach(p=>{
                    if(!Array.isArray(drawnCats[plotIconsList[p]["category"]]))
                    {
                        drawnCats[plotIconsList[p]["category"]] = [];
                    }
                    let _imstr = '<img dataid="' + p + '" title="' + plotIconsList[p]["displayInfo"]["title"] + '" src="' + plotIconsList[p]["img"] + '">';
                    drawnCats[plotIconsList[p]["category"]].push(_imstr);
                });
                let iconsStrs = "";
                Object.keys(drawnCats).forEach(p=>{
                    iconsStrs += '<div style="display: inline-block;border: 1px solid gray;margin-top: 4px;border-radius: 5px;background: #00000038;margin-right: 4px;">';
                    iconsStrs += '<span style="margin-left: 4px;font-family: sans-serif;font-size: small;color: lightgray;">' + p + '</span><br>';
                    drawnCats[p].forEach(d=>{
                        iconsStrs += d;
                    });
                    
                    iconsStrs += '</div>';
                });
                dropiconslistelem.append($(iconsStrs));
            }
            function searchdrawicons(elm)
            {
                $('#dropiconslist img').css("display","inline-block");
                $('#dropiconslist img').filter((i,el)=>{
                    return !$(el).attr("title").toLowerCase().includes(elm.value.toLowerCase());
                }).css("display","none") ;
            }
            arrangeSymbolIcons();
        </script> `;

        showConfirmation(_htmlcontent, "Select any symbol", function (success) {
            if (success) {
                if (_selSymobInfo !== undefined && _selSymobInfo["img"] !== undefined && _selSymobInfo["img"] !== "") {
                    flag = 0;
                    let wd = JSON.parse(JSON.stringify(_selSymobInfo));
                    wd["scale"] = imgScale;
                    wd["flat"] = isFlat;
                    wd["imgTranslucency"] = imgTranslucency;
                    wd["imgSizeInMeters"] = imgSizeInMeters;
                    var objId = (new Date()).getTime();
                    wallAnimPropsDic[objId] = wd;
                    tracker.trackPoint(wallAnimPropsDic[objId], function (position, latLon) {
                        shapeDic[objId] = position;
                        showPoint(objId, position, latLon);
                    });
                }
            }
        });
    });

    $(document).on('click', "#drawText", function () {
        flag = 0;
        layer.prompt({
            title: 'Please enter the text'
        }, function (value, index, elem) {
            layer.close(index);
            tracker.trackText(function (position) {
                var objId = (new Date()).getTime();
                shapeDic[objId] = position;
                shapePropsDic[objId] = value;
                showText(objId, position, shapePropsDic[objId]);
            });
        });
        $(".layui-layer-btn>a").addClass("ui-button ui-corner-all ui-widget");
    });

    $(document).on('click', "#drawAddWeapon", function () {
        var _htmlcontent = `<style>
            #dropiconslistWP img{
                width:32px;height:32px;border:1px solid grey;border-radius:4px;padding:4px;margin:2px;cursor:pointer;
            }
            #dropiconslistWP img:hover{
                border:1px solid white;
            }
            #dropiconslistWP img.selected{
                border:2px solid #56ea56;
            }

            #dropiconslistWP div._weapN {
                display: flex;
                flex-direction: column;
                border: 1px solid gray;
                border-radius: 4px;
                margin: 3px;
                padding: 3px;
            }
            #dropiconslistWP div._selectedWeap{
                box-shadow: 0 0 3px #56ea56, 0 0 3px #56ea56, 0 0 3px #56ea56;
                -webkit-box-shadow: 0 0 3px #56ea56, 0 0 3px #56ea56, 0 0 3px #56ea56;
                -moz-box-shadow: 0 0 3px #56ea56, 0 0 3px #56ea56, 0 0 3px #56ea56;
                background: #00000091;
                background-image:linear-gradient(to right, #56ea56,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent,transparent);
            }

            #dropiconslistWP img._weapNimg{
                width:32px;
                height:32px;
                float:right;
            }
        </style>
        <div id="searchiconbarWP" style="display:block">
        <input type="text" oninput="searchdrawiconsWP(this);" style="border:1px solid black;border-radius:4px;padding:2px;font-family:sans-serif;font-size:small;width:100%;" placeholder="Search..." />
        </div>
        <div id="dropiconslistWP" style="display:flex;flex-direction:column;overflow-y:auto;max-height:306px;margin-top: 5px;"></div>
        <hr>
        <div style="font-family: sans-serif;font-size: small;color:white;">
        <table>
            <tbody>
                <tr>
                    <td>
                        Image Scale
                    </td>
                    <td style="padding-left: 4px;">
                        <input type="range" min="1" max="10" value="1" step="0.5" onchange="default_image_scale_changedWP(this);">
                    </td>
                    <td>
                        <span id="iscaleWP"></span>
                    </td>
                </tr>
                <tr>
                    <td>
                        Flattened
                    </td>
                    <td style="padding-left: 4px;">
                        <input type="checkbox" onchange="default_image_flat_changedWP(this);">
                    </td>
                </tr>
                <tr>
                    <td>
                        Translucency By Distance
                    </td>
                    <td style="padding-left: 4px;">
                        <input type="checkbox" checked onchange="default_image_translucency_changedWP(this);">
                    </td>
                </tr>
                <tr>
                    <td>
                        Size in Meters
                    </td>
                    <td style="padding-left: 4px;">
                        <input type="checkbox" onchange="default_image_sizeinmeters_changedWP(this);">
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
        <script>
            var imgScaleWP = 1.0;
            var isFlatWP = false;
            var imgTranslucencyWP = true;
            var imgSizeInMetersWP = false;

            function default_image_sizeinmeters_changedWP(el)
            {
                imgSizeInMetersWP = el.checked;
            }

            function default_image_translucency_changedWP(el)
            {
                imgTranslucencyWP = el.checked;
            }

            function default_image_flat_changedWP(el)
            {
                isFlatWP = el.checked;
            }

            $("span#iscaleWP").text(imgScaleWP);
            function default_image_scale_changedWP(el)
            {
                imgScaleWP = Number(el.value);
                $("span#iscaleWP").text(imgScaleWP);
            }
            var _selSymobInfoWP = null;

            $(document).on('click','#dropiconslistWP ._weapN',function(){
                $('#dropiconslistWP ._weapN').removeClass('_selectedWeap');
                $(this).toggleClass('_selectedWeap',true);
                let datapkey = $(this).attr('data-pkey');
                let datackey = $(this).attr('data-ckey');

                _selSymobInfoWP = _weaponsList[datapkey].filter(d=>{ return d.id == datackey });

                if(Array.isArray(_selSymobInfoWP) && _selSymobInfoWP.length > 0)
                {
                    _selSymobInfoWP = _selSymobInfoWP[0];
                }
            });

            function arrangeSymbolIconsWP()
            {
                let dropiconslistWPelem =  $('#dropiconslistWP');
                dropiconslistWPelem.empty();
                let iconsStrs = "";
                let drawnedDivs = {};
                Object.keys(_weaponsList).forEach(p=>{
                    let _created = false;
                    if(Array.isArray(_weaponsList[p])){
                        _weaponsList[p].forEach(w => {
                            if(p && !drawnedDivs[p]){
                                _created = true;
                                drawnedDivs[p] = true;
                                iconsStrs += '<div style="display: flex;flex-direction: column;border: 1px solid gray;margin-top: 4px;border-radius: 5px;background: #00000038;margin-right: 4px;">';
                                iconsStrs += '<span style="font-family: sans-serif;font-size: small; padding: 6px;border-bottom: 1px solid white;background: cadetblue;font-weight: bold;">' + w["WPN_EQPT"] + '</span>';
                            }
                            if(Object.keys(w).length > 0)
                            {
                                w["id"] = w["id"] + "";
                                iconsStrs += '<div data-pkey="' + p + '" data-ckey="' + w["id"] + '" class="_weapN hoverHighlighter hoverHighlighter2">';
                                iconsStrs += '<table style="width:100%;"><tbody><tr><td style="display: flex;flex-direction: column;">';
                                Object.keys(w).forEach((k,i) => {
                                    //if(w[k] !== null)w[k] = w[k].toString().trim();
                                    w[k] = w[k] + "";
                                    if(k !== "WPN_EQPT" && k !== "img")
                                    {
                                        iconsStrs += '<span style="margin-left: 10px;font-family: sans-serif;font-size: small;color: lightgray;"><strong style="color: darksalmon;">' + k + ' :</strong> ' + w[k] + '</span>';
                                    }
                                });
                                if(w["img"] && w["img"] !== ""){
                                    iconsStrs += '</td><td><img class="_weapNimg" src="' + w["img"] +'"> </td></tr></tbody></table></div>';
                                }else{
                                    iconsStrs += '</td><td></td></tr></tbody></table></div>';
                                }
                            }
                        });
                    }
                    if(_created)
                    {
                        iconsStrs += '</div>';
                    }
                });
                dropiconslistWPelem.append($(iconsStrs));
            }
            function searchdrawiconsWP(elm)
            {
                $('#dropiconslistWP div._weapN').css("display","inline-block");
                $('#dropiconslistWP div._weapN').filter((i,el)=>{
                    return !$(el)[0].outerText.toLowerCase().includes(elm.value.toLowerCase());
                }).css("display","none") ;
            }
            arrangeSymbolIconsWP();
        </script> `;

        showConfirmation(_htmlcontent, "Select Weapon", function (success) {
            if (success) {
                if (_selSymobInfoWP !== undefined) {
                    flag = 0;
                    let wd = JSON.parse(JSON.stringify(_selSymobInfoWP));
                    if (!wd) return;
                    wd["scale"] = imgScaleWP;
                    wd["flat"] = isFlatWP;
                    wd["imgTranslucency"] = imgTranslucencyWP;
                    wd["imgSizeInMetersWP"] = imgSizeInMetersWP;
                    if (wd["img"] === undefined || wd["img"] === "") {
                        wd["img"] = "CesiumPlugins/drawingtools/images/circle_center.png";
                    }
                    var objId = (new Date()).getTime();
                    wallAnimPropsDic[objId] = wd;
                    tracker.trackWeapon(wallAnimPropsDic[objId], function (position, latLon) {
                        shapeDic[objId] = position;
                        showWeapon(objId, position, latLon);
                    });
                }
            }
        });
    });

    function _promptNameDescription(title, _cb) {
        var _htmlcontent = `<style>
        #dropiconslist img{
            width:32px;height:32px;border:1px solid grey;border-radius:4px;padding:4px;margin:2px;cursor:pointer;
        }
        #dropiconslist img:hover{
            border:1px solid white;
        }
        #dropiconslist img.selected{
            border:2px solid #56ea56;
        }
        </style>
        
        <table>
            <tbody>
                <tr><td>Name:</td></tr>
                <tr>
                    <td>
                        <input type="text" oninput="default_nameDescription_name_changed(this);">
                    </td>
                </tr>
                <tr><td style="padding-top: 5px;">Description:</td></tr>
                <tr>
                    <td>
                        <input type="text" oninput="default_nameDescription_description_changed(this);">
                    </td>
                </tr>
            </tbody>
        </table>

        <script>
            var _nameDescription_name = "";
            var _nameDescription_description = "";

            function default_nameDescription_name_changed(el)
            {
                _nameDescription_name = el.value;
            }

            function default_nameDescription_description_changed(el)
            {
                _nameDescription_description = el.value;
            }
        </script> `;
        showConfirmation(_htmlcontent, title, function (success) {
            _cb(success);
        });
    }

    $(document).on('click', "#drawWall", function () {
        var _htmlcontent = `<style>
        #dropWiconslist img{
            width:32px;height:32px;border:1px solid grey;border-radius:4px;padding:4px;margin:2px;cursor:pointer;
        }
        #dropWiconslist img:hover{
            border:1px solid white;
        }
        #dropWiconslist img.selected{
            border:2px solid #56ea56;
        }
    </style>
    <div id="searchiconbar" style="display:block">
    <input type="text" oninput="searchdrawWicons(this);" style="border:1px solid black;border-radius:4px;padding:2px;font-family:sans-serif;font-size:small;width:100%;" placeholder="Search..." />
    </div>
    <div id="dropWiconslist" style="display:inline-block;max-height: 140px;overflow-y: auto;"></div>
    <hr>
    <div style="font-family: sans-serif;font-size: small;">
    <label>Wall Width: <input style="width:40%;" type="range" min="1" max="200" value="10" step="0.5" onchange="default_wall_width_changed(this);"><span id="wwidm"></span></label><br>
    <label>Wall Height: <input style="width:40%;" type="range" min="1" max="2000" value="20" step="0.5" onchange="default_wall_height_changed(this);"><span id="whidm"></span></label>
    </div>

    <hr>
    <div style="font-family: sans-serif;font-size: small;">
    Wall Corners type:
    <label><input type="radio" value="sharp" name="wallcornertype" checked onchange="default_wall_corner_changed(this);"> Sharp</label>
    <label><input type="radio" value="bevel" name="wallcornertype" onchange="default_wall_corner_changed(this);"> Bevel</label>
    <label><input type="radio" value="rounded" name="wallcornertype" onchange="default_wall_corner_changed(this);"> Rounded</label>
    </div>

    <script>
        var wimgfile = "";
        var animWall = false;
        var wallWidth = 10;
        var wallHeight = 200;
        var wallCorner = "sharp";

        function default_wall_corner_changed(el)
        {
            wallCorner = el.value;
        }

        $("span#wwidm").text(wallWidth + 'm');
        function default_wall_width_changed(el)
        {
            wallWidth = Number(el.value);
            $("span#wwidm").text(wallWidth + 'm');
        }

        $("span#whidm").text(wallHeight + 'm');
        function default_wall_height_changed(el)
        {
            wallHeight = Number(el.value);
            $("span#whidm").text(wallHeight + 'm');
        }

        $(document).on('click','#dropWiconslist>img',function(){
            $('#dropWiconslist>img').removeClass('selected');
            $(this).toggleClass('selected',true);
            wimgfile = $(this).attr('src');
            animWall = $(this).attr('anim') == "true";
        });

        function arrangeWSymbolIcons()
        {
            let dropWiconslistelem =  $('#dropWiconslist');
            dropWiconslistelem.empty();
            let iconsStrs = ""; 

            Object.keys(wallpapersList).forEach(p=>{
                let t = p.replace("anim-","");
                let isanim = p.includes("anim-");
                iconsStrs += '<img anim="' + isanim + '" title="' + t + '" src="' + wallpapersList[p] + '">';
            });
            dropWiconslistelem.append($(iconsStrs));
        }

        function searchdrawWicons(elm)
        {
            $('#dropWiconslist>img').css("display","inline-block");
            $('#dropWiconslist>img').filter((i,el)=>{
                return !$(el).attr("title").toLowerCase().includes(elm.value.toLowerCase());
            }).css("display","none") ;
        }
        arrangeWSymbolIcons();
    </script> `;

        showConfirmation(_htmlcontent, "Select wall type", function (success) {
            if (success) {
                //var wimgfile = "CesiumPlugins/drawingtools/images/circle_center.png";
                if (wimgfile !== undefined && wimgfile !== "") {
                    flag = 0;
                    tracker.trackWall(function (position) {
                        var objId = (new Date()).getTime();
                        shapeDic[objId] = position;
                        let wd = {
                            "data": wimgfile,
                            "isanim": animWall,
                            "height": wallHeight,
                            "width": wallWidth,
                            "corner": wallCorner
                        };
                        wallAnimPropsDic[objId] = wd;
                        _promptNameDescription("Enter Detail", function (_success) {
                            if (_success) {
                                wallAnimPropsDic[objId]["name"] = _nameDescription_name;
                                wallAnimPropsDic[objId]["description"] = _nameDescription_description;
                                showWall(objId, position);
                            }
                        });

                    });
                }
            }
        });
    });

    $(document).on('click', "#drawBufferLine", function () {
        flag = 0;
        tracker.trackBufferLine(function (positions, radius) {
            var objId = (new Date()).getTime();
            shapeDic[objId] = {
                positions: positions,
                radius: radius
            };
            _promptNameDescription("Enter Detail", function (_success) {
                if (_success) {
                    wallAnimPropsDic[objId] = {};
                    wallAnimPropsDic[objId]["name"] = _nameDescription_name;
                    wallAnimPropsDic[objId]["description"] = _nameDescription_description;
                    showBufferLine(objId, positions, radius);
                }
            });
        });
    });

    $(document).on('click', "#posMeasure", function () {
        flag = 0;
        tracker.pickPosition(function (position, lonLat) {});
    });
    $(document).on('click', "#spaceDisMeasure", function () {
        flag = 0;
        tracker.pickSpaceDistance(function (positions, rlt) {});
    });
    $(document).on('click', "#stickDisMeasure", function () {
        flag = 0;
        tracker.pickStickDistance(function (positions, rlt) {});
    });
    $(document).on('click', "#areaMeasure", function () {
        flag = 0;
        tracker.pickArea(function (positions, rlt) {});
    });

    $(document).on('click', "#straightArrow", function () {
        flag = 0;
        tracker.trackStraightArrow(function (positions) {
            var objId = (new Date()).getTime();
            shapeDic[objId] = positions;
            _promptNameDescription("Enter Detail", function (_success) {
                if (_success) {
                    wallAnimPropsDic[objId] = {};
                    wallAnimPropsDic[objId]["name"] = _nameDescription_name;
                    wallAnimPropsDic[objId]["description"] = _nameDescription_description;
                    showStraightArrow(objId, positions);
                }
            });
        });
    });
    $(document).on('click', "#attackArrow", function () {
        flag = 0;
        tracker.trackAttackArrow(function (positions, custom) {
            var objId = (new Date()).getTime();
            shapeDic[objId] = {
                custom: custom,
                positions: positions
            };
            _promptNameDescription("Enter Detail", function (_success) {
                if (_success) {
                    wallAnimPropsDic[objId] = {};
                    wallAnimPropsDic[objId]["name"] = _nameDescription_name;
                    wallAnimPropsDic[objId]["description"] = _nameDescription_description;
                    showAttackArrow(objId, positions);
                }
            });
        });
    });
    $(document).on('click', "#pincerArrow", function () {
        flag = 0;
        tracker.trackPincerArrow(function (positions, custom) {
            var objId = (new Date()).getTime();
            shapeDic[objId] = {
                custom: custom,
                positions: positions
            };
            _promptNameDescription("Enter Detail", function (_success) {
                if (_success) {
                    wallAnimPropsDic[objId] = {};
                    wallAnimPropsDic[objId]["name"] = _nameDescription_name;
                    wallAnimPropsDic[objId]["description"] = _nameDescription_description;
                    showPincerArrow(objId, positions);
                }
            });
        });
    });

    $(document).on('click', "#editShape", function () {
        layer.msg("Click the element to edit!");
        flag = 1;
        //Clear plot status
        tracker.clear();
    });
    $(document).on('click', "#deleteShape", function () {
        layer.msg("Click the element to delete!");
        flag = 2;
        //Clear plot status
        tracker.clear();
    });
}

//Bind Cesium Events
function bindGloveEvent() {
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event) {
        showLatLonMoving(event);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(function (movement) {
        var pick = viewer.scene.pick(movement.position);
        if (!pick) {
            selected_Entity = undefined;
            infoToolbarLoader(undefined, undefined, function () {});
            return;
        }
        var obj = pick.id;
        if (obj && obj.vsobjId && typeof (_clicked_vs) == "function") {
            _clicked_vs(obj.vsobjId);
        }
        if (!obj || !obj.layerId) {
            infoToolbarLoader(undefined, undefined, function () {});
            return;
        }
        var objId = obj.objId;
        //To edit or delete flag, 1 is edit, 2 is delete
        if (flag == 1) {
            switch (obj.shapeType) {
                case "Polygon":
                    flag = 0;
                    editPolygon(objId);
                    break;
                case "Polyline":
                    flag = 0;
                    editPolyline(objId);
                    break;
                case "Wall":
                    flag = 0;
                    editWall(objId);
                    break;
                case "Rectangle":
                    flag = 0;
                    editRectangle(objId);
                    break;
                case "Circle":
                    flag = 0;
                    editCircle(objId);
                    break;
                case "Point":
                    flag = 0;
                    editPoint(objId);
                    break;
                case "Text":
                    flag = 0;
                    editText(objId);
                    break;
                case "BufferLine":
                    flag = 0;
                    editBufferLine(objId);
                    break;
                case "StraightArrow":
                    flag = 0;
                    editStraightArrow(objId);
                    break;
                case "AttackArrow":
                    flag = 0;
                    editAttackArrow(objId);
                    break;
                case "PincerArrow":
                    flag = 0;
                    editPincerArrow(objId);
                    break;
                case "Weapon":
                    flag = 0;
                    editWeapon(objId);
                    break;
                default:
                    break;
            }
        } else if (flag == 2) {
            selected_Entity = undefined;
            clearEntityById(objId, true);
        } else {
            //show entity info here
            selected_Entity = obj;
            if (obj.shapeType && wallAnimPropsDic[objId] !== undefined) {
                wallAnimPropsDic[objId]["shapeType"] = obj.shapeType;
            }
            if (obj._groupLayerName && wallAnimPropsDic[objId] !== undefined) {
                wallAnimPropsDic[objId]["Layer"] = obj._groupLayerName;
            }
            if (wallAnimPropsDic[objId] !== undefined) {
                infoToolbarLoader(objId, wallAnimPropsDic[objId], function () {

                });
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

function showPolygon(objId, positions) {
    var material = Cesium.Color.fromCssColorString(`rgb(${selected_color.r},${selected_color.g},${selected_color.b})`).withAlpha(selected_color.a);
    // var outlineMaterial = Cesium.Material.fromType("PolylineOutline", {
    //     outlineWidth:  2.0,
    //     color: Cesium.Color.fromCssColorString(`rgb(${selected_outline_color.r},${selected_outline_color.g},${selected_outline_color.b})`).withAlpha(selected_outline_color.a),
    //     outlineColor: Cesium.Color.fromCssColorString(`rgb(${selected_outline_color.r},${selected_outline_color.g},${selected_outline_color.b})`).withAlpha(selected_outline_color.a)
    // });
    var outlineMaterial = null;
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
    var outlinePositions = [].concat(positions);
    outlinePositions.push(positions[0]);
    var bData = {
        layerId: layerId,
        objId: objId,
        shapeType: "Polygon",
        polyline: {
            positions: outlinePositions,
            clampToGround: true,
            width: default_draw_line_width,
            material: outlineMaterial
        },
        polygon: new Cesium.PolygonGraphics({
            hierarchy: positions,
            asynchronous: false,
            material: material
        }),
        displayInfo: {
            "name": wallAnimPropsDic[objId]["name"],
            "description": wallAnimPropsDic[objId]["description"]
        }
    };
    var entity = viewer.entities.add(bData);
    if (typeof (_getShapeGeometryData) == "function") {
        var _gdata = {
            "type": "Polygon",
            "positions": positions
        };
        _getShapeGeometryData(_gdata);
    }
}

function showPolyline(objId, positions) {
    var outlineMaterial = null;
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
    var bData = {
        layerId: layerId,
        objId: objId,
        shapeType: "Polyline",
        polyline: {
            positions: positions,
            clampToGround: true,
            width: default_draw_line_width,
            material: outlineMaterial
        },
        displayInfo: {
            "name": wallAnimPropsDic[objId]["name"],
            "description": wallAnimPropsDic[objId]["description"]
        }
    };
    var entity = viewer.entities.add(bData);
    if (typeof (_getShapeGeometryData) == "function") {
        var _gdata = {
            "type": "Polyline",
            "positions": positions
        };
        _getShapeGeometryData(_gdata);
    }
}

function showWall(objId, positions) {
    var wallMaterial = null; //Cesium.Color.fromCssColorString(`rgb(${selected_outline_color.r},${selected_outline_color.g},${selected_outline_color.b})`).withAlpha(selected_outline_color.a);;

    if (wallAnimPropsDic[objId]["isanim"] === true) {
        var alp = 1;
        var num = 0;
        wallMaterial = new Cesium.ImageMaterialProperty({
            image: wallAnimPropsDic[objId]["data"],
            transparent: true,
            color: new Cesium.CallbackProperty(function () {
                if (num > 10000) {
                    num = 0;
                }
                if ((num % 2) === 0) {
                    alp -= 0.005;
                } else {
                    alp += 0.005;
                }
                if (alp <= 0.3) {
                    num++;
                } else if (alp >= 1) {
                    num++;
                }
                return Cesium.Color.WHITE.withAlpha(alp)
            }, false)
        })
    } else {
        wallMaterial = new WallPaperMaterialProperty(wallAnimPropsDic[objId]["data"]);
    }

    let cornerType = Cesium.CornerType.MITERED;
    switch (wallAnimPropsDic[objId]["corner"]) {
        case "sharp":
            cornerType = Cesium.CornerType.MITERED;
            break;
        case "bevel":
            cornerType = Cesium.CornerType.BEVELED;
            break;
        case "rounded":
            cornerType = Cesium.CornerType.ROUNDED;
            break;
    }
    var bData = {
        layerId: layerId,
        objId: objId,
        shapeType: "Wall",
        corridor: {
            positions: positions,
            extrudedHeight: wallAnimPropsDic[objId]["height"],
            width: wallAnimPropsDic[objId]["width"],
            cornerType: cornerType,
            height: 0.0,
            //material: outlineMaterial //new WallPaperMaterialProperty(wd)
            material: wallMaterial,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            clampToGround: true,
        },
        displayInfo: {
            "name": wallAnimPropsDic[objId]["name"],
            "description": wallAnimPropsDic[objId]["description"]
        }
    };
    var entity = viewer.entities.add(bData);
    if (typeof (_getShapeGeometryData) == "function") {
        var _gdata = {
            "type": "Wall",
            "positions": positions
        };
        _getShapeGeometryData(_gdata);
    }
}

function showRectangle(objId, positions) {
    var material = Cesium.Color.fromCssColorString(`rgb(${selected_color.r},${selected_color.g},${selected_color.b})`).withAlpha(selected_color.a); //Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
    var outlineMaterial = null;
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
    var rect = Cesium.Rectangle.fromCartesianArray(positions);
    var arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect
        .west, rect.north
    ];
    var outlinePositions = Cesium.Cartesian3.fromRadiansArray(arr);
    var bData = {
        layerId: layerId,
        objId: objId,
        shapeType: "Rectangle",
        polyline: {
            positions: outlinePositions,
            clampToGround: true,
            width: default_draw_line_width,
            material: outlineMaterial
        },
        rectangle: {
            coordinates: rect,
            material: material
        },
        displayInfo: {
            "name": wallAnimPropsDic[objId]["name"],
            "description": wallAnimPropsDic[objId]["description"]
        }
    };
    var entity = viewer.entities.add(bData);
    if (typeof (_getShapeGeometryData) == "function") {
        var _gdata = {
            "type": "Rectangle",
            "positions": positions,
            "rect": rect
        };
        _getShapeGeometryData(_gdata);
    }
}

function showCircle(objId, positions) {
    var material = Cesium.Color.fromCssColorString(`rgb(${selected_color.r},${selected_color.g},${selected_color.b})`).withAlpha(selected_color.a); //Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
    var outlineMaterial = null;
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
    // var radiusMaterial = new Cesium.PolylineDashMaterialProperty({
    //     dashLength: 16,
    //     color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
    // });
    var pnts = tracker.circleDrawer._computeCirclePolygon(positions);
    var dis = tracker.circleDrawer._computeCircleRadius3D(positions);
    // dis = (dis / 1000).toFixed(3);
    // var text = dis + " km";
    var bData = {
        layerId: layerId,
        objId: objId,
        shapeType: "Circle",
        position: positions[0],
        /*
        label: {
            text: text,
            font: '14px sans-serif',
            fillColor: Cesium.Color.SKYBLUE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 1,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -9000)),
            pixelOffset: new Cesium.Cartesian2(16, 16)
        },
        billboard: {
            image: "CesiumPlugins/drawingtools/images/circle_center.png",
            eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500)),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        polyline: {
            positions: positions,
            clampToGround: true,
            width: default_draw_line_width,
            material: radiusMaterial
        },
        */
        polygon: new Cesium.PolygonGraphics({
            hierarchy: pnts,
            asynchronous: false,
            material: material
        }),
        polyline: {
            positions: pnts,
            clampToGround: true,
            width: default_draw_line_width,
            material: outlineMaterial
        },
        displayInfo: {
            "name": wallAnimPropsDic[objId]["name"],
            "description": wallAnimPropsDic[objId]["description"]
        }
    };
    var entity = viewer.entities.add(bData);

    if (typeof (_getShapeGeometryData) == "function") {
        var _gdata = {
            "type": "Circle",
            "positions": positions,
            "pnts": pnts,
            "dis": dis
        };
        _getShapeGeometryData(_gdata);
    }
}

function showPoint(objId, position, latLon) {
    var bData = {
        layerId: layerId,
        objId: objId,
        shapeType: "Point",
        position: position,
    };

    if (latLon) {
        wallAnimPropsDic[objId]["position"] = latLon;
    }

    if (wallAnimPropsDic[objId]["flat"]) {
        var positions = [];
        positions.push({
            x: position.x - (4 * wallAnimPropsDic[objId]["scale"]),
            y: position.y - (4 * wallAnimPropsDic[objId]["scale"]),
            z: position.z
        });
        positions.push({
            x: position.x + (4 * wallAnimPropsDic[objId]["scale"]),
            y: position.y + (4 * wallAnimPropsDic[objId]["scale"]),
            z: position.z
        });
        bData.rectangle = {
            coordinates: Cesium.Rectangle.fromCartesianArray(positions),
            material: wallAnimPropsDic[objId]["img"],
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            clampToGround: true
        };
    } else {
        let transculency = undefined;
        if (wallAnimPropsDic[objId]["imgTranslucency"]) {
            transculency = new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e5, 0);
        }

        bData.billboard = {
            image: wallAnimPropsDic[objId]["img"],
            scale: wallAnimPropsDic[objId]["scale"],
            translucencyByDistance: transculency,
            pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.5e6, 0.0),
            disableDepthTestDistance: 1000000000,
            //eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500)),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            clampToGround: true,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // default
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
            sizeInMeters: wallAnimPropsDic[objId]["imgSizeInMeters"],
            show: true
        };
    }
    if (wallAnimPropsDic[objId]["displayInfo"] !== undefined) {
        bData.displayInfo = wallAnimPropsDic[objId]["displayInfo"];
        bData.displayInfo["category"] = wallAnimPropsDic[objId]["category"];
    }
    var entity = viewer.entities.add(bData);
    if (typeof (_getShapeGeometryData) == "function") {
        var _gdata = {
            "type": "Point",
            "position": position
        };
        _getShapeGeometryData(_gdata);
    }
}

function showWeapon(objId, position, latLon) {
    var bData = {
        layerId: layerId,
        objId: objId,
        shapeType: "Weapon",
        position: position,
        position_copy: position,
        latlonPostition: latLon
    };

    if (latLon) {
        wallAnimPropsDic[objId]["position"] = latLon;
    }

    if (wallAnimPropsDic[objId]["flat"]) {
        var positions = [];
        positions.push({
            x: position.x - (4 * wallAnimPropsDic[objId]["scale"]),
            y: position.y - (4 * wallAnimPropsDic[objId]["scale"]),
            z: position.z
        });
        positions.push({
            x: position.x + (4 * wallAnimPropsDic[objId]["scale"]),
            y: position.y + (4 * wallAnimPropsDic[objId]["scale"]),
            z: position.z
        });
        bData.rectangle = {
            coordinates: Cesium.Rectangle.fromCartesianArray(positions),
            material: wallAnimPropsDic[objId]["img"],
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            clampToGround: true
        };
    } else {
        let transculency = undefined;
        if (wallAnimPropsDic[objId]["imgTranslucency"]) {
            transculency = new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e5, 0);
        }

        bData.billboard = {
            image: wallAnimPropsDic[objId]["img"],
            scale: wallAnimPropsDic[objId]["scale"],
            // translucencyByDistance: transculency,
            // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.5e6, 0.0),
            disableDepthTestDistance: 1000000000,
            //eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500)),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            clampToGround: true,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // default
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
            sizeInMeters: wallAnimPropsDic[objId]["imgSizeInMetersWP"],
            show: true
        };
    }
    if (wallAnimPropsDic[objId]["displayInfo"] !== undefined) {
        bData.displayInfo = wallAnimPropsDic[objId]["displayInfo"];
        bData.displayInfo["category"] = wallAnimPropsDic[objId]["category"];
    }

    _drawWeaponByCategory(objId, wallAnimPropsDic[objId], bData, function (wbData) {
        wbData.displayInfo = wallAnimPropsDic[objId];
        console.log(wbData);
        let entity = viewer.entities.add(wbData);
    });
}

function showText(objId, position, text) {
    var entity = viewer.entities.add({
        layerId: layerId,
        objId: objId,
        shapeType: "Text",
        position: position,
        label: {
            text: text, //_this.text,
            translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
            pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.0e3, 1.0, 1.5e6, 0.0),
            disableDepthTestDistance: 1000000000,
            font: '16px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            //pixelOffset: new Cesium.Cartesian2(0, -30),
            backgroundColor: new Cesium.Color.fromCssColorString("rgba(0.8, 0.6, 0.8, 0.8)"),
            backgroundPadding: new Cesium.Cartesian2(10, 10),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            clampToGround: true,
            show: true,
            showBackground: true
        }
    });
}

function showBufferLine(objId, positions, radius) {
    var buffer = tracker.bufferLineDrawer.computeBufferLine(positions, radius);
    var material = Cesium.Color.fromCssColorString(`rgb(${selected_color.r},${selected_color.g},${selected_color.b})`).withAlpha(selected_color.a); //Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
    var outlineMaterial = null;
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
    var bData = {
        layerId: layerId,
        objId: objId,
        shapeType: "BufferLine",
        polygon: new Cesium.PolygonGraphics({
            hierarchy: buffer,
            asynchronous: false,
            material: material
        }),
        polyline: {
            positions: positions,
            clampToGround: true,
            width: default_draw_line_width,
            material: outlineMaterial
        },
        displayInfo: {
            "name": wallAnimPropsDic[objId]["name"],
            "description": wallAnimPropsDic[objId]["description"]
        }
    };
    var entity = viewer.entities.add(bData);
}

function showStraightArrow(objId, positions) {
    var material = Cesium.Color.fromCssColorString(`rgb(${selected_color.r},${selected_color.g},${selected_color.b})`).withAlpha(selected_color.a); //Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
    var outlineMaterial = null;
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
    var outlinePositions = [].concat(positions);
    outlinePositions.push(positions[0]);
    var bData = {
        layerId: layerId,
        objId: objId,
        shapeType: "StraightArrow",
        polyline: {
            positions: outlinePositions,
            clampToGround: true,
            width: default_draw_line_width,
            material: outlineMaterial
        },
        polygon: new Cesium.PolygonGraphics({
            hierarchy: positions,
            asynchronous: false,
            material: material
        }),
        displayInfo: {
            "name": wallAnimPropsDic[objId]["name"],
            "description": wallAnimPropsDic[objId]["description"]
        }
    };
    var entity = viewer.entities.add(bData);
}

function showAttackArrow(objId, positions) {
    var material = Cesium.Color.fromCssColorString(`rgb(${selected_color.r},${selected_color.g},${selected_color.b})`).withAlpha(selected_color.a); //Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
    var outlineMaterial = null;
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
    var outlinePositions = [].concat(positions);
    outlinePositions.push(positions[0]);
    var bData = {
        layerId: layerId,
        objId: objId,
        shapeType: "AttackArrow",
        polyline: {
            positions: outlinePositions,
            clampToGround: true,
            width: default_draw_line_width,
            material: outlineMaterial
        },
        polygon: new Cesium.PolygonGraphics({
            hierarchy: positions,
            asynchronous: false,
            material: material
        }),
        displayInfo: {
            "name": wallAnimPropsDic[objId]["name"],
            "description": wallAnimPropsDic[objId]["description"]
        }
    };
    var entity = viewer.entities.add(bData);
}

function showPincerArrow(objId, positions) {
    var material = Cesium.Color.fromCssColorString(`rgb(${selected_color.r},${selected_color.g},${selected_color.b})`).withAlpha(selected_color.a); //Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
    var outlineMaterial = null;
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
    var outlinePositions = [].concat(positions);
    outlinePositions.push(positions[0]);
    var bData = {
        layerId: layerId,
        objId: objId,
        shapeType: "PincerArrow",
        polyline: {
            positions: outlinePositions,
            clampToGround: true,
            width: default_draw_line_width,
            material: outlineMaterial
        },
        polygon: new Cesium.PolygonGraphics({
            hierarchy: positions,
            asynchronous: false,
            material: material
        }),
        displayInfo: {
            "name": wallAnimPropsDic[objId]["name"],
            "description": wallAnimPropsDic[objId]["description"]
        }
    };
    var entity = viewer.entities.add(bData);
}

function editPolygon(objId) {
    var oldPositions = shapeDic[objId];

    //Remove entity
    clearEntityById(objId);

    //Editing
    tracker.polygonDrawer.showModifyPolygon(oldPositions, function (positions) {
        shapeDic[objId] = positions;
        showPolygon(objId, positions);
    }, function () {
        showPolygon(objId, oldPositions);
    });
}

function editPolyline(objId) {
    var oldPositions = shapeDic[objId];

    //Remove entity
    clearEntityById(objId);

    //Editing  
    tracker.polylineDrawer.showModifyPolyline(oldPositions, function (positions) {
        shapeDic[objId] = positions;
        showPolyline(objId, positions);
    }, function () {
        showPolyline(objId, oldPositions);
    });
}

function editWall(objId) {
    var oldPositions = shapeDic[objId];

    //Remove entity
    clearEntityById(objId);

    //Editing  
    tracker.wallDrawer.showModifyWall(oldPositions, function (positions) {
        shapeDic[objId] = positions;
        showWall(objId, positions);
    }, function () {
        showWall(objId, oldPositions);
    });
}

function editRectangle(objId) {
    var oldPositions = shapeDic[objId];

    //Remove entity
    clearEntityById(objId);

    //Editing 
    tracker.rectDrawer.showModifyRectangle(oldPositions, function (positions) {
        shapeDic[objId] = positions;
        showRectangle(objId, positions);
    }, function () {
        showRectangle(objId, oldPositions);
    });
}

function editCircle(objId) {
    var oldPositions = shapeDic[objId];

    //Remove entity
    clearEntityById(objId);

    //Editing 
    tracker.circleDrawer.showModifyCircle(oldPositions, function (positions) {
        shapeDic[objId] = positions;
        showCircle(objId, positions);
    }, function () {
        showCircle(objId, oldPositions);
    });
}

function editPoint(objId) {
    var oldPosition = shapeDic[objId];
    //Remove entity
    clearEntityById(objId);

    //Editing 
    tracker.pointDrawer.showModifyPoint(wallAnimPropsDic[objId], oldPosition, function (position, latLon) {
        shapeDic[objId] = position;
        showPoint(objId, position, latLon);
    }, function () {
        showPoint(objId, oldPosition, undefined);
    });
}

function editWeapon(objId) {
    var oldPosition = shapeDic[objId];

    //Remove entity
    clearEntityById(objId);

    //Editing 
    tracker.weaponDrawer.showModifyWeapon(wallAnimPropsDic[objId], oldPosition, function (position, latLon) {
        shapeDic[objId] = position;
        showWeapon(objId, position, latLon);
    }, function () {
        showWeapon(objId, oldPosition, undefined);
    });
}

function editText(objId) {
    var oldPosition = shapeDic[objId];

    //Remove entity
    clearEntityById(objId);

    //Editing 
    tracker.textDrawer.showModifyText(oldPosition, function (position) {
        shapeDic[objId] = position;
        showText(objId, position, shapePropsDic[objId]);
    }, function () {
        showText(objId, oldPosition, shapePropsDic[objId]);
    });
}

function editBufferLine(objId) {
    var old = shapeDic[objId];

    //Remove entity
    clearEntityById(objId);

    //Editing 
    tracker.bufferLineDrawer.showModifyBufferLine(old.positions, old.radius, function (positions, radius) {
        shapeDic[objId] = {
            positions: positions,
            radius: radius
        };
        showBufferLine(objId, positions, radius);
    }, function () {
        showBufferLine(old.positions, old.radius, oldPositions);
    });
}

function editStraightArrow(objId) {
    var oldPositions = shapeDic[objId];

    //Remove entity
    clearEntityById(objId);

    //Editing 
    tracker.straightArrowDrawer.showModifyStraightArrow(oldPositions, function (positions) {
        shapeDic[objId] = positions;
        showStraightArrow(objId, positions);
    }, function () {
        showStraightArrow(objId, oldPositions);
    });
}

function editAttackArrow(objId) {
    var old = shapeDic[objId];

    //Remove entity
    clearEntityById(objId);

    tracker.attackArrowDrawer.showModifyAttackArrow(old.custom, function (positions, custom) {
        //Save Editing Results
        shapeDic[objId] = {
            custom: custom,
            positions: positions
        };
        showAttackArrow(objId, positions);
    }, function () {
        showAttackArrow(objId, old.positions);
    });
}

function editPincerArrow(objId) {
    var old = shapeDic[objId];

    //Remove entity
    clearEntityById(objId);

    tracker.pincerArrowDrawer.showModifyPincerArrow(old.custom, function (positions, custom) {
        //Save editing results
        shapeDic[objId] = {
            custom: custom,
            positions: positions
        };
        showPincerArrow(objId, positions);
    }, function () {
        showPincerArrow(objId, old.positions);
    });
}

function clearEntityByKeyValue(objKey, objValue) {
    var entityList = viewer.entities.values;
    if (entityList == null || entityList.length < 1) {
        return;
    }
    for (var i = 0; i < entityList.length; i++) {
        var entity = entityList[i];
        if (objValue == "*") {

            if (entity[objKey]) {
                viewer.entities.remove(entity);
                i--;
            }
        } else {
            if (entity[objKey] && entity[objKey] == objValue) {
                viewer.entities.remove(entity);
                i--;
            }
        }
    }
}

function clearEntityById(objId, _rsdel = false) {
    var entityList = viewer.entities.values;
    if (entityList == null || entityList.length < 1) {
        return;
    }
    for (var i = 0; i < entityList.length; i++) {
        var entity = entityList[i];
        if (_rsdel && entity.rsobjId !== undefined && entity.rsobjId == objId && _radarsheds[objId] !== undefined) {
            _radarsheds[objId].clearAll();
            delete _radarsheds[objId];
            i--;
        }
        if (entity.layerId == layerId && entity.objId == objId) {
            if(entity.supportEntity){
                viewer.entities.remove(entity.supportEntity);
            }
            viewer.entities.remove(entity);
            i--;
        }
    }
}

function initDrawingTools(_default_cam_location) {
    if (_default_cam_location !== undefined) {
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(_default_cam_location.lon, _default_cam_location.lat, _default_cam_location.alt)
        });

        viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
            function (e) {
                e.cancel = true;
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(_default_cam_location.lon, _default_cam_location.lat, _default_cam_location.alt)
                });
            });
    }
    initDrawHelper();
    bindGloveEvent();
}

function _promptPositionConfirmation(cart3Pos, _cb) {
    if (!cart3Pos) return;
    var _newLatLan = toDegrees(cart3Pos);
    var _htmlcontent = `<style>
    #_confirmNewLat,#_confirmNewLon{
        font-family: sans-serif;
        font-weight: bold;
    }
    </style>   
    <table>
        <tbody>
            <tr><td>Latitude:</td></tr>
            <tr>
                <td>
                    <input id="_confirmNewLat" type="text" value="${_newLatLan.lat}">
                </td>
            </tr>
            <tr><td style="padding-top: 5px;">Longitude:</td></tr>
            <tr>
                <td>
                    <input id="_confirmNewLon" type="text" value="${_newLatLan.lon}">
                </td>
            </tr>
        </tbody>
    </table>

    <script>
        var _newLatPos = "";
        var _newLonPos = "";
        var _newCart3Pos = undefined;

        function _getCartFromDegress()
        {
            _newLatPos= $("#_confirmNewLat").val();
            _newLonPos= $("#_confirmNewLon").val();
            if(_newLatPos !== "" && _newLonPos !==""){
                _newCart3Pos = fromDegreesToCartesian3(Number(_newLonPos),Number(_newLatPos))
            }
        }
    </script> `;
    showConfirmation(_htmlcontent, "Confirm Location", function (success) {
        _getCartFromDegress();
        _cb(success);
    });
}