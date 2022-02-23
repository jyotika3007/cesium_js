var _allLayersList = [{
    "name": "Default",
    "show": true,
    "selected": true
}];

function _initDefaultLayersAddition() {
    $("#_layerPanel ul.reorderableList").empty();
    let _lyList = "";
    _allLayersList.forEach(a => {
        _lyList += `<li class="_layerLi ${a.selected?"_layerSelected":""}" onclick="_layerSelected_clicked(this);">
        <div class="_layerItem">
            <input readonly class="_layerNamer" onkeyup="_layerNamerKeyup(this,event);" onfocusout="_layerNamerOutFocus(this, false);" type="text" placeholder="Layer name" value="${a.name}"><img
            onclick="_layerClear_click(this);" class="_layerClear"
            src="CesiumPlugins/layerBoxImages/delete.png" title="Clear"><img
                onclick="_layerDeactive_click(this);" class="_layerEye ${a.show?"":"deactivated"}"
                src="CesiumPlugins/layerBoxImages/view.png" title="Hide/Unhide">
        </div>
    </li>`;
    });
    $("#_layerPanel ul.reorderableList").append($(_lyList));
    $('.reorderableList').awesomereorder({
        stop: _layersReSorted
    });
}

function _selectLayerUIByName(lName) {
    _allLayersList.map(a => {
        if (a.name == lName) {
            a.selected = true
        } else {
            a.selected = false
        }
    });
    $("#_layerPanel li._layerLi").each((i, l) => {
        $(l).removeClass("_layerSelected");
        if ($(l).find("._layerNamer").attr("value") == lName) {
            $(l).addClass("_layerSelected");
        }
    });
}

$(document).ready(function () {
    $(document.body).append($(`<div id="_layerPanel" class="myDraggableDiv hideme">
    <div class="mydivheader">Layers<span style="float:right;margin:2px auto;cursor:pointer;" class="customglowbtn ui-button-icon ui-icon ui-icon-closethick" onclick="$('._layerToggler').trigger('click');"></span></div>
        <div class="contentwrapper">
            <ul class="reorderableList heightLimited">
            </ul>
        </div>
        <div class="mydivfooter" style="padding: 2px;background: #000000d1;">
            <div style="display: inline-flex;padding: 2px; width:100%;">
                <div><input class="_layerSearchbox" oninput="_searchLayerByName(this);" style="float:left;" type="text"
                        placeholder="Search Layer..."> </div>
                <div class="_layerBoxBtn" title="Add Layer"
                    onclick="typeof(add_newlayer)=='function'?add_newlayer():''"><img
                        src="CesiumPlugins/layerBoxImages/add.png" style="width:16px;height:16px;"></div>
                <div class="_layerBoxBtn" title="Remove Selected Layer"
                    onclick="typeof(remove_sellayer)=='function'?remove_sellayer():''"><img
                        src="CesiumPlugins/layerBoxImages/minus.png" style="width:16px;height:16px;"></div>
            </div>
        </div>
    </div>`));

    // if (typeof (dragElement) === "function") {
    //     dragElement($(".myDraggableDiv")[0]);
    // }

    $(".myDraggableDiv").draggable({containment: "#container"});

    // $('.myDraggableDiv').dragon({
    //     'within': $('#container')
    // });
    _initDefaultLayersAddition();

});

$(document).on("dblclick", "._layerNamer", function () {
    $(this).removeAttr("readonly");
});

function _layerDeactive_click(el) {
    $(el).toggleClass("deactivated");
}

function _layerClear_click(el) {
    let _li = $(el).parents("li._layerLi");
    $(_li).siblings().removeClass("_layerSelected");
    $(_li).addClass("_layerSelected");
    remove_sellayer();
}

function _layerSelected_clicked(el) {
    $(el).siblings().removeClass("_layerSelected");
    $(el).addClass("_layerSelected");
    _layersReSorted();
}

function _layerNamerKeyup(el, event) {
    if (event.keyCode === 13) {
        _layerNamerOutFocus(el, false);
    } else if (event.keyCode === 27) {
        _layerNamerOutFocus(el, true);
    } else {

    }
};

function _layerNamerOutFocus(el, isCancel = false) {
    $(el).attr("readonly", "readonly");
    let lFounded = $("#_layerPanel input._layerNamer").filter((i, l) => {
        return $(l).attr("value").toString().toLowerCase() == $(el).val().toString().toLowerCase()
    });

    if (!isCancel) {
        if (lFounded.length == 0) {
            let oName = $(el).attr("value");
            $(el).attr("value", $(el).val());
            _renameEntitiesByName(oName, $(el).val());
        } else {
            $(el).val($(el).attr("value"));
        }
    } else {
        $(el).val($(el).attr("value"));
    }
}

function _searchLayerByName(el) {
    let _searchLayerVal = $(el).val();
    $("#_layerPanel li._layerLi").map((i, l) => {
        if ($(l).find("input._layerNamer").attr("value").toString().toLowerCase().includes(
                _searchLayerVal.toLowerCase())) {
            $(l).css("display", "block");
        } else {
            $(l).css("display", "none");
        }
    });
}

function add_newlayer() {
    $("#_layerPanel li._layerLi").removeClass("_layerSelected");
    let newLayerName = `Layer ${$("#_layerPanel ul.reorderableList li").length}`;
    $("#_layerPanel ul.reorderableList").prepend($(`<li class="_layerLi _layerSelected" onclick="_layerSelected_clicked(this);">
            <div class="_layerItem">
                <input readonly class="_layerNamer" onkeyup="_layerNamerKeyup(this,event);" onfocusout="_layerNamerOutFocus(this, false);" type="text" placeholder="Layer name" value="${newLayerName}"><img
            onclick="_layerClear_click(this);" class="_layerClear"
            src="CesiumPlugins/layerBoxImages/delete.png" title="Clear"><img
                    onclick="_layerDeactive_click(this);" class="_layerEye"
                    src="CesiumPlugins/layerBoxImages/view.png" title="Hide/Unhide">
            </div>
        </li>`));
    $('.reorderableList').awesomereorder({
        stop: _layersReSorted
    });
    _layersReSorted();
}

function remove_sellayer() {
    function _removeLayerOperation() {
        let _layerLen = $("#_layerPanel ul.reorderableList li").length;
        if (_layerLen > 0) {
            let rEn = $("#_layerPanel ul.reorderableList li._layerSelected")
            let renEntName = rEn.find("._layerNamer").attr("value");
            if (_layerLen > 1) {
                rEn.remove();
            }
            $($("#_layerPanel ul.reorderableList li")[0]).addClass("_layerSelected");
            $('.reorderableList').awesomereorder({
                stop: _layersReSorted
            });
            _removeEntitiesByName(renEntName);
        }
        _layersReSorted();
    }

    let _htmlcontent = `<p>Are you sure want to permanently remove all elements of the selected layer?</p>`;
    showConfirmation(_htmlcontent, "Clear Layer Confirmation", function (success) {
        if (success) {
            _removeLayerOperation();
        }
    });
}

function _layersReSorted() {
    _allLayersList = [];
    $("#_layerPanel li._layerLi").each((i, l) => {
        let _lLitem = {};
        _lLitem["name"] = $(l).find("input._layerNamer").attr("value").toString();
        _lLitem["selected"] = $(l).hasClass("_layerSelected");
        _lLitem["show"] = !$(l).find("._layerEye").hasClass("deactivated");
        if (!_allLayersList.some(s => {
                return s.name == _lLitem.name
            })) {
            _allLayersList.push(_lLitem);
        }
    });
    if (_allLayersList.length == 1) {
        _allLayersList[0]["selected"] = true;
        $("#_layerPanel li._layerLi").addClass("_layerSelected");
    }
    _processLayersStacking();
}

function _processLayersStacking() {
    let _effectedEntitiesType = ["_billboard",
        "_box",
        "_corridor",
        "_cylinder",
        "_ellipse",
        "_ellipsoid",
        "_label",
        "_path",
        "_plane",
        "_point",
        "_polygon",
        "_polyline",
        "_polylineVolume",
        "_rectangle",
        "_tileset",
        "_viewFrom",
        "_wall"
    ];

    if (!viewer) return;
    viewer.entities.values.forEach(en => {
        if (en._groupLayerName === undefined || en._groupLayerName === "" || en._groupLayerName === null) {
            var _al = _allLayersList.filter(a => {
                return a["selected"] === true
            });
            if (Array.isArray(_al) && _al.length > 0) {
                en._groupLayerName = _al[0]["name"];
            } else {
                en._groupLayerName = "Default";
            }
        }
        var gIndex = _allLayersList.map(function (x) {
            return x.name;
        }).indexOf(en._groupLayerName);
        var gProp = _allLayersList[gIndex];

        if (gIndex > -1 && gProp) {
            en.show = gProp["show"];
            Object.keys(en).forEach(eno => {
                if (_effectedEntitiesType.includes(eno) && en[eno] !== undefined) {
                    en[eno]["zIndex"] = -gIndex
                }
            });
        }
    });
}

function _initLayerSelectorHandler() {
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (movement) {
        var pick = viewer.scene.pick(movement.position);
        if (pick) {
            if (pick.id._groupLayerName !== undefined) {
                //select layer list here
                _selectLayerUIByName(pick.id._groupLayerName);
            } else {
                _processLayersStacking();
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    function onChanged(collection, added, removed, changed) {
        if (added.length > 0) {
            _processLayersStacking();
        }
    }
    viewer.entities.collectionChanged.addEventListener(onChanged);
}

function _renameEntitiesByName(oName, lName) {
    if (!viewer) return;
    viewer.entities.values.forEach(en => {
        if (en._groupLayerName !== undefined && en._groupLayerName == oName) {
            en._groupLayerName = lName
        }
    });
    _processLayersStacking();
}

function _removeEntitiesByName(lName) {
    var entityList = viewer.entities.values;
    if (entityList == null || entityList.length < 1) {
        return;
    }
    for (var i = 0; i < entityList.length; i++) {
        var entity = entityList[i];
        if (entity._groupLayerName !== undefined && entity._groupLayerName == lName) {
            viewer.entities.remove(entity);
            i--;
        }
    }
    _processLayersStacking();
}

if (typeof (waitForViewerLoad) === "function") {
    waitForViewerLoad(function () {
        _initLayerSelectorHandler();
    });
}