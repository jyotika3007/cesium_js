var _allLayersList = [
    // {
    //     "name": "Default2",
    //     "show": true,
    //     "selected": true,
    //     "items": [{
    //             "name": "Layer 1",
    //             "show": true,
    //             "selected": false,
    //             "id": "aaaa"
    //         },
    //         {
    //             "name": "Layer B",
    //             "show": false,
    //             "selected": false,
    //             "id": "bbbb"
    //         }
    //     ]
    // },
    {
        "name": "Default",
        "show": true,
        "selected": true,
        "collapsed": false,
        "items": [
            // {
            //     "name": "Layer 3",
            //     "show": true,
            //     "unlock": true,
            //     "selected": false,
            //     "id": "cccc"
            // },
            // {
            //     "name": "Layer 4",
            //     "show": false,
            //     "unlock": true,
            //     "selected": false,
            //     "id": "dddd"
            // }
        ]
    }
];

function _toggleLayerExpansion(el) {
    if ($(el).hasClass("ui-icon-triangle-1-e")) {
        $(el).addClass("ui-icon-triangle-1-s");
        $(el).removeClass("ui-icon-triangle-1-e");
        $(el).parents("._layerLi").find("._chul").removeClass("hideme");
        let selLayer = $(el).parents("._layerLi").find("._layerNamer").attr("value");
        _allLayersList.map(l => {
            if (l.name && l.name == selLayer) {
                l.collapsed = false
            }
        });
    } else {
        $(el).addClass("ui-icon-triangle-1-e");
        $(el).removeClass("ui-icon-triangle-1-s");
        $(el).parents("._layerLi").find("._chul").addClass("hideme");
        let selLayer = $(el).parents("._layerLi").find("._layerNamer").attr("value");
        _allLayersList.map(l => {
            if (l.name && l.name == selLayer) {
                l.collapsed = true
            }
        });
    }

}

function _initDefaultLayersAddition() {
    $("#_layerPanel ul._mainul").empty();
    let _lyList = "";
    if (_allLayersList.length > 0) {
        let aa = _allLayersList.some(a => {
            return a.selected
        });
        if (aa === false) {
            _allLayersList[0].selected = true;
        }
    }
    _allLayersList.forEach(a => {
        _lyList += `<li class="_layerLi ${a.selected?"_layerSelected":""}" onclick="_layerSelected_clicked(this);">
        <div class="_layerItem">
            <span class="_expanDer ui-accordion-header-icon ui-icon ${a.collapsed?'ui-icon-triangle-1-e':'ui-icon-triangle-1-s'}" onclick="_toggleLayerExpansion(this);"></span>
            <input readonly class="_layerNamer" ondblclick="$(this).removeAttr('readonly');" onkeyup="_layerNamerKeyup(this,event);" onfocusout="_layerNamerOutFocus(this, false);" type="text" placeholder="Layer name" value="${a.name}"><img
            onclick="_layerClear_click(this);" class="_layerClear"
            src="./CesiumPlugins/layerBoxImages/delete.png" title="Clear">
            <img
                onclick="_layerUnlock_click(this);" class="_layerLock"
                src="./CesiumPlugins/layerBoxImages/camlock.png" title="Unlock View">
            <img
                onclick="_layerDeactive_click(this);" class="_layerEye ${a.show?"":"deactivated"}"
                src="./CesiumPlugins/layerBoxImages/view.png" title="Hide/Unhide">
        </div>
        <ul class="_chul reorderableList heightLimited ${a.collapsed?'hideme':''}">`;

        a.items.forEach(b => {
            if (!a.selected) b.selected = false;
            _lyList += `<li lId="${b.id}" class="_sublayerLi ${b.selected?"_layerSelected":""}" onclick="_sublayerSelected_clicked(this);">
                <div class="_sublayerItem">
                    <span class="_sublayerFlyer" title="Fly to" onclick="_gotoSelectedSubLayerSymbol(this);">&#10148;</span><span class="_sublayerNamer">${b.name}</span><img
                    onclick="_sublayerClear_click(this);" class="_sublayerClear"
                    src="./CesiumPlugins/layerBoxImages/delete.png" title="Clear">
                    <img
                        onclick="_sublayerUnlock_click(this);" class="_sublayerLock ${b.unlock?"":"deactivated"}"
                        src="./CesiumPlugins/layerBoxImages/camlock.png" title="Lock/Unlock View">
                    <img
                        onclick="_sublayerDeactive_click(this);" class="_sublayerEye ${b.show?"":"deactivated"}"
                        src="./CesiumPlugins/layerBoxImages/view.png" title="Hide/Unhide">
                </div>
            </li>`;
        });
        _lyList += `</ul></li>`;
    });
    $("#_layerPanel ul._mainul").append($(_lyList));
    $('.reorderableList').awesomereorder({
        stop: _layersReSorted
    });
}

function _selectLayerUIByName(lName, lId) {
    _allLayersList.map(a => {
        if (a.name == lName) {
            a.selected = true;
            a.items.forEach(b => {
                if (b.id == lId) {
                    b.selected = true;
                } else {
                    b.selected = false;
                }
            });
        } else {
            a.selected = false
        }
    });

    _initDefaultLayersAddition();
}

$(document).ready(function () {
    $("#cesiumContainer").append($(`<div id="_layerPanel" class="myDraggableDiv hideme">
    <div class="mydivheader">Layers<span style="float:right;margin:2px auto;cursor:pointer;" class="ui-button-icon ui-icon ui-icon-closethick" onclick="$('._layerToggler').trigger('click');"></span></div>
        <div class="contentwrapper">
            <ul class="_mainul reorderableList heightLimited">
            </ul>
        </div>
        <div class="mydivfooter" style="padding: 2px;background: #000000d1;">
            <div style="display: inline-flex;padding: 2px; width:100%;">
                <div><input class="_layerSearchbox" oninput="_searchLayerByName(this);" style="float:left;" type="text"
                        placeholder="Search Layer..."> </div>
                <div class="_layerBoxBtn" title="Add Layer"
                    onclick="typeof(add_newlayer)=='function'?add_newlayer():''"><img
                        src="./CesiumPlugins/layerBoxImages/add.png" style="width:16px;height:16px;"></div>
            </div>
        </div>
    </div>`));

    $(".myDraggableDiv").draggable({
        containment: "parent"
    });

    _initDefaultLayersAddition();
});

function _layerUnlock_click(el) {
    $("._chul>._sublayerLi ._sublayerLock").removeClass("deactivated");
    _layersReSorted();
    viewer.trackedEntity = undefined;
}

function _sublayerUnlock_click(el) {
    if ($(el).hasClass("deactivated")) {
        $("._layerLi ._chul>._sublayerLi ._sublayerLock").removeClass("deactivated");
        viewer.trackedEntity = undefined;
    } else {
        $("._layerLi ._chul>._sublayerLi ._sublayerLock").removeClass("deactivated");
        $(el).addClass("deactivated");
    }
    _layersReSorted();
}

function _layerDeactive_click(el) {
    $(el).toggleClass("deactivated");
    $(el).parents("._layerLi").find("._chul>._sublayerLi ._sublayerEye").toggleClass("deactivated", $(el).hasClass("deactivated"));
    _layersReSorted();
}

function _sublayerDeactive_click(el) {
    $(el).toggleClass("deactivated");
    _layersReSorted();
}

function _layerClear_click(el) {
    let _li = $(el).parents("li._layerLi");
    $(_li).siblings().removeClass("_layerSelected");
    $(_li).addClass("_layerSelected");
    remove_sellayer();
}

function _sublayerClear_click(el) {
    let _li = $(el).parents("li._layerLi");
    $(_li).siblings().removeClass("_layerSelected");
    $(_li).addClass("_layerSelected");
    let eId = $(el).parents("._sublayerLi").attr("lid");
    remove_selsublayer(eId);
}

function _layerSelected_clicked(el) {
    $(el).siblings().removeClass("_layerSelected");
    $(el).addClass("_layerSelected");
    let selLayr = $(el).find("._layerNamer").attr("value");
    _allLayersList.forEach(a => {
        if (a.name == selLayr) {
            a.selected = true;
        } else {
            a.selected = false;
            a.items.map(i => i.selected = false);
        }
    });
}

function _sublayerSelected_clicked(el) {
    $(el).parents("._mainul").find("._layerSelected").removeClass("_layerSelected");
    $(el).addClass("_layerSelected");
    let selLayr = $(el).parents("._layerLi").find("._layerNamer").attr("value");
    let selCLayr = $(el).attr("lid");
    _allLayersList.forEach(a => {
        if (a.name == selLayr) {
            a.selected = true;
            a.items.forEach(i => {
                if (i.id == selCLayr) {
                    i.selected = true;
                } else {
                    i.selected = false;
                }
            })
        } else {
            a.selected = false;
            a.items.map(i => i.selected = false);
        }
    });

}

function _layerNamerKeyup(el, event) {
    if (event.keyCode === 13) {
        _layerNamerOutFocus(el, false);
    } else if (event.keyCode === 27) {
        _layerNamerOutFocus(el, true);
    } else {

    }
}

function _layerNamerOutFocus(el, isCancel = false) {
    $(el).attr("readonly", "readonly");
    if (!isCancel) {
        let lFounded = $("#_layerPanel input._layerNamer").filter((i, l) => {
            return $(l).attr("value").toString().toLowerCase() == $(el).val().toString().toLowerCase()
        });

        if (lFounded.length == 0) {
            let oName = $(el).attr("value");
            let nName = $(el).val();
            $(el).attr("value", nName);
            _allLayersList.forEach(a => {
                if (a.name == oName) {
                    a.name = nName
                }
            });
            _renameEntitiesByName(oName, nName);
        } else {
            $(el).val($(el).attr("value"));
        }
    } else {
        $(el).val($(el).attr("value"));
    }
}

function _gotoSelectedSubLayerSymbol(el) {
    let _id = $(el).parents("._sublayerLi").attr("lid");
    let vf = viewer.entities.values.filter(e => {
        return e._id == _id;
    });
    viewer.flyTo(vf[0], {
        duration: 6.0
    });
}

function _searchLayerByName(el) {
    let _searchLayerVal = $(el).val();
    $("#_layerPanel ._mainul>li._layerLi").map((i, l) => {
        if ($(l).find("input._layerNamer").attr("value").toString().toLowerCase().includes(
                _searchLayerVal.toLowerCase())) {
            $(l).css("display", "block");
        } else {
            $(l).css("display", "none");
        }
    });
}

function add_newlayer() {
    _allLayersList.forEach(a => {
        a.selected = false;
        a.items.forEach(b => {
            b.selected = false;
        })
    });

    let s = _allLayersList.length - 1;

    function _getNewLayerName() {
        s += 1;
        let tempName = `Layer ${s}`;
        if (_allLayersList.some(a => {
                return a.name == tempName
            }) === false) {
            return tempName;
        } else {
            return _getNewLayerName();
        }
    }

    _allLayersList.unshift({
        "name": _getNewLayerName(),
        "show": true,
        "selected": true,
        "items": []
    });
    _initDefaultLayersAddition();
}

function remove_sellayer() {
    function _removeLayerOperation() {
        _allLayersList = _allLayersList.filter(a => {
            if (a.selected) {
                _removeEntitiesByName(a.name);
                if (_allLayersList.length == 1) {
                    return true;
                }
            } else {
                return true;
            }
        });
        // if (_allLayersList.length == 1) {
        //     _allLayersList[0].items = [];
        // }
        _initDefaultLayersAddition();
    }
    let _htmlcontent = `<p>Are you sure want to permanently remove all objects of the selected layer?</p>`;
    showConfirmation(_htmlcontent, "Clear Layer Confirmation", function (success) {
        if (success) {
            _removeLayerOperation();
        }
    });
}

function remove_selsublayer(eId) {
    function _removeSubLayerOperation() {
        _allLayersList.forEach(a => {
            a.items = a.items.filter(b => {
                if (b.id == eId) {
                    _removeEntitiesById(b.id);
                } else {
                    return true;
                }
            });
        });
        // if (_allLayersList.length == 1) {
        //     _allLayersList[0].items = [];
        // }
        _initDefaultLayersAddition();
    }
    let _htmlcontent = `<p>Are you sure want to permanently remove this object?</p>`;
    showConfirmation(_htmlcontent, "Clear Layer Confirmation", function (success) {
        if (success) {
            _removeSubLayerOperation();
        }
    });
}

function _layersReSorted() {
    setTimeout(() => {
        _allLayersList = [];
        $("#_layerPanel ._mainul>li._layerLi").each((i, l) => {
            let _lLitem = {};
            _lLitem["name"] = $(l).find("input._layerNamer").attr("value").toString();
            _lLitem["selected"] = $(l).hasClass("_layerSelected");
            _lLitem["show"] = !$(l).find("._layerEye").hasClass("deactivated");
            _lLitem["collapsed"] = $(l).find("ul._chul").hasClass("hideme");
            _lLitem["items"] = [];
            $(l).find("ul._chul>li._sublayerLi").each((j, z) => {
                let p = {};
                p["name"] = $(z).find("span._sublayerNamer").text();
                p["selected"] = $(z).hasClass("_layerSelected");
                p["show"] = !$(z).find("._sublayerEye").hasClass("deactivated");
                p["unlock"] = !$(z).find("._sublayerLock").hasClass("deactivated");
                p["id"] = $(z).attr("lid");
                _lLitem["items"].push(p);
            });

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
    }, 100);
}

function _getMatchingsOnly(a, b, matchkeyA, matchkeyB) {
    return a.filter(function (objFromA) {
        return b.find(function (objFromB) {
            return objFromA[matchkeyA] === objFromB[matchkeyB]
        })
    })
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

    let vEnts = viewer.entities.values.filter(v => {
        let validated = true;
        if (v._vsobjId !== undefined) {
            validated = false;
        }
        return validated
    });

    _allLayersList.forEach(al => {
        al.items = _getMatchingsOnly(al.items, vEnts, "id", "id")
    });

    vEnts.forEach(en => {
        if (en._groupLayerName === undefined || en._groupLayerName === "" || en._groupLayerName === null) {
            var _al = _allLayersList.filter(a => {
                return a["selected"] === true
            });
            if (Array.isArray(_al) && _al.length > 0) {
                en._groupLayerName = _al[0]["name"];
                let fi = _al[0]["items"].some(s => {
                    return s["id"] == en.id
                });
                if (!fi) {
                    let ln = en.displayInfo && en.displayInfo.name ? en.displayInfo.name : (en.displayInfo && en.displayInfo.title ? en.displayInfo.title : (en.shapeType ? en.shapeType : "Object"));
                    _al[0]["items"].push({
                        "name": ln,
                        "show": true,
                        "unlock": true,
                        "selected": false,
                        "id": en.id
                    });
                }
            } else { //Will execute Rarely on Exceptions
                en._groupLayerName = "Default";
            }
        }

        var _concatedArrs = [].concat.apply([], _allLayersList.map(a => {
            return a.items
        }));
        var gIndex = _concatedArrs.map(function (x) {
            return x.id;
        }).indexOf(en.id);

        var gProp = _concatedArrs[gIndex];

        if (gIndex > -1 && gProp) {
            en.show = gProp["show"];
            if (gProp["unlock"] == false) {
                viewer.trackedEntity = en;
            }
            Object.keys(en).forEach(eno => {
                if (_effectedEntitiesType.includes(eno) && en[eno] !== undefined) {
                    en[eno]["zIndex"] = -gIndex
                }
            });
        }
    });

    _initDefaultLayersAddition();
}

function _initLayerSelectorHandler() {
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (movement) {
        var pick = viewer.scene.pick(movement.position);
        if (pick) {
            if (pick.id !== undefined && pick.id._groupLayerName !== undefined) {
                //select layer list here
                _selectLayerUIByName(pick.id._groupLayerName, pick.id.id);
            } else {
                _processLayersStacking();
            }
        }else{
            _allLayersList.map(a => {
                a.items.forEach(b => {
                    b.selected = false;
                });
            });
            _initDefaultLayersAddition();
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    function onChanged(collection, added, removed, changed) {
        if (added.length > 0) {
            _processLayersStacking();
        }
        if (removed.length > 0) {
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

function _removeEntitiesById(eId) {
    var entityList = viewer.entities.values;
    if (entityList == null || entityList.length < 1) {
        return;
    }
    for (var i = 0; i < entityList.length; i++) {
        var entity = entityList[i];
        if (entity.id !== undefined && entity.id == eId) {
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