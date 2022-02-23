var _totalGlobalSearchTypeList = ["Any", "Symbol", "Location", "Shape", "Text", "Weapon"];
var _globalSearchTypeItem = _totalGlobalSearchTypeList[0];
var _globalSearchTypeText = "";
$(document).on("change", ".globalSearchItemType", function () {
    $(".globalSearchItemType:checked").map((i, g) => {
        _globalSearchTypeItem = g.value;
    });
    _globalSearchChangePlaceholder();
});

function _globalSearchTypeClear(el, event) {
    $(".globalSearchTextbox").val("");
    $(".globalSearchType").removeClass("_expanded");
    $(".globalSearchResultUl").empty();
    $(".globalSearchResult").removeClass("_expanded");
    $("._globalSearchTypeExtensionBtn").html("&#9660;");
}

function _globalSearchTypeExtension(el, event) {
    event.preventDefault();
    $(".globalSearchType").toggleClass("_expanded");
    if ($(".globalSearchType").hasClass("_expanded")) {
        //$(this).toggleClass("down", true);
        $(el).html("&#9650;");
    } else {
        //$(this).toggleClass("down", false);
        $(el).html("&#9660;");
    }
}

function globalSearchTextbox_changed(el) {
    $(".globalSearchType").removeClass("_expanded");
    _globalSearchTypeText = el.value;
}

function _globalSearchChangePlaceholder() {
    switch (_globalSearchTypeItem.toLowerCase()) {
        case "location":
            $(".globalSearchTextbox").attr("placeholder", "Latitude, Longitude");
            break;
        case "symbol":
            $(".globalSearchTextbox").attr("placeholder", "Symbol name");
            break;
        case "shape":
            $(".globalSearchTextbox").attr("placeholder", "Shape name");
            break;
        case "text":
            $(".globalSearchTextbox").attr("placeholder", "Text here");
            break;
        default:
            $(".globalSearchTextbox").attr("placeholder", "Search...");

    }
}

$(document).on("keyup", ".globalSearchTextbox", function (event) {
    if (event.keyCode === 13) {
        _globalSearchStart(this, event);
    } else if (event.keyCode === 27) {
        _globalSearchTypeClear(this, event);
    } else {

    }
});

function _markString(str, find) {
    var reg = new RegExp('(' + find + ')', 'gi');
    return str.replace(reg, '<mark>$1</mark>');
}

function _gotoSelectedSymbol(_id) {
    let vf = viewer.entities.values.filter(e => {
        return e._id == _id;
    });
    viewer.flyTo(vf[0], {
        duration: 6.0
    });
}

function _symbolSearchGlobal() {
    viewer.entities.values.forEach(e => {
        if (e.displayInfo && typeof (e.displayInfo) == "object" && e.shapeType && e
            .shapeType === "Point") {
            for (var i = 0; i < Object.keys(e.displayInfo).length; i++) {
                let k = Object.keys(e.displayInfo)[i];
                if (e.displayInfo[k].toLowerCase().includes(_globalSearchTypeText
                        .toLowerCase())) {
                    let srchrest = _markString(e.displayInfo[k], _globalSearchTypeText);
                    $(".globalSearchResultUl").append($(`<li>
                        <div><span style="font-size: smaller;color: aqua;">Symbol</span><br>
                            <span><b style="text-transform: capitalize;">${k}:</b></span>&nbsp;<span style="color:lightcoral;">${srchrest}</span>
                            <span onclick="_gotoSelectedSymbol('${e._id}')" style="background:cadetblue;padding:2px;border-radius:2px;font-size:smaller;cursor:pointer;">&#10148;</span>
                        </div>
                        <hr>
                    </li>`));
                    break;
                }
            }
        }
    });
}

function _weaponSearchGlobal() {
    viewer.entities.values.forEach(e => {
        if (e.displayInfo && typeof (e.displayInfo) == "object" && e.shapeType && e
            .shapeType === "Weapon") {
            for (var i = 0; i < Object.keys(e.displayInfo).length; i++) {
                let k = Object.keys(e.displayInfo)[i];
                if (e.displayInfo[k] && e.displayInfo[k].toString().toLowerCase().includes(_globalSearchTypeText
                        .toLowerCase())) {
                    let srchrest = _markString(e.displayInfo[k], _globalSearchTypeText);
                    $(".globalSearchResultUl").append($(`<li>
                        <div><span style="font-size: smaller;color: aqua;">Weapon</span><br>
                            <span><b style="text-transform: capitalize;">${k}:</b></span>&nbsp;<span style="color:lightcoral;">${srchrest}</span>
                            <span onclick="_gotoSelectedSymbol('${e._id}')" style="background:cadetblue;padding:2px;border-radius:2px;font-size:smaller;cursor:pointer;">&#10148;</span>
                        </div>
                        <hr>
                    </li>`));
                    break;
                }
            }
        }
    });
}

function _shapeSearchGlobal() {
    viewer.entities.values.forEach(e => {
        if (e.displayInfo && typeof (e.displayInfo) == "object" && e.shapeType && e
            .shapeType !== "Point" && e
            .shapeType !== "Weapon") {
            let _eFound = false;
            for (var i = 0; i < Object.keys(e.displayInfo).length; i++) {
                let k = Object.keys(e.displayInfo)[i];
                if (e.displayInfo[k] && e.displayInfo[k].toString().toLowerCase().includes(_globalSearchTypeText
                        .toLowerCase())) {
                    let srchrest = _markString(e.displayInfo[k], _globalSearchTypeText);
                    $(".globalSearchResultUl").append($(`<li>
                        <div><span style="font-size: smaller;color: aqua;">Shape</span><br>
                            <span><b style="text-transform: capitalize;">${k}:</b></span>&nbsp;<span style="color:lightcoral;">${srchrest}</span>
                            <span onclick="_gotoSelectedSymbol('${e._id}')" style="background:cadetblue;padding:2px;border-radius:2px;font-size:smaller;cursor:pointer;">&#10148;</span>
                        </div>
                        <hr>
                    </li>`));
                    _eFound = true;
                    break;
                }
            }
            if (!_eFound) {
                if (e.shapeType.toLowerCase().includes(_globalSearchTypeText
                        .toLowerCase())) {
                    let srchrest = _markString(e.shapeType, _globalSearchTypeText);
                    $(".globalSearchResultUl").append($(`<li>
                    <div><span style="font-size: smaller;color: aqua;">Shape</span><br>
                        <span><b style="text-transform: capitalize;">Type:</b></span>&nbsp;<span style="color:lightcoral;">${srchrest}</span>
                        <span onclick="_gotoSelectedSymbol('${e._id}')" style="background:cadetblue;padding:2px;border-radius:2px;font-size:smaller;cursor:pointer;">&#10148;</span>
                    </div>
                    <hr>
                </li>`));
                }
            }
        }
    });
}

function _textSearchGlobal() {
    viewer.entities.values.forEach(e => {
        if (e.shapeType && e.shapeType === "Text") {
            if (e.label.text._value.toLowerCase().includes(_globalSearchTypeText
                    .toLowerCase())) {
                let srchrest = _markString(e.label.text._value, _globalSearchTypeText);
                $(".globalSearchResultUl").append($(`<li>
                    <div><span style="font-size: smaller;color: aqua;">Text</span><br>
                        <span><b style="text-transform: capitalize;">Text:</b></span>&nbsp;<span style="color:lightcoral;">${srchrest}</span>
                        <span onclick="_gotoSelectedSymbol('${e._id}')" style="background:cadetblue;padding:2px;border-radius:2px;font-size:smaller;cursor:pointer;">&#10148;</span>
                    </div>
                    <hr>
                </li>`));
            }
        }
    });
}

function _globalSearchStart(el, event) {
    event.preventDefault();
    $(".globalSearchResultUl").empty();
    $(".globalSearchResult").removeClass("_expanded");
    if (_globalSearchTypeText.length <= 0) return;
    switch (_globalSearchTypeItem.toLowerCase()) {
        case "location":
            if (_globalSearchTypeText.includes(",")) {
                _globalSearchTypeText = _globalSearchTypeText.trim().replace(" ", "");
                let lonlat = _globalSearchTypeText.split(",");
                if (lonlat.length === 2 && !isNaN(Number(lonlat[0])) && !isNaN(Number(lonlat[1]))) {
                    viewer.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(Number(lonlat[0]), Number(lonlat[
                            1]), 1200),
                        duration: 6.0
                    });
                }
            }
            return;
        case "symbol":
            _symbolSearchGlobal();
            break;
        case "weapon":
            _weaponSearchGlobal();
            break;
        case "shape":
            _shapeSearchGlobal();
            break;
        case "text":
            _textSearchGlobal();
            break;
        default:
            _symbolSearchGlobal();
            _weaponSearchGlobal();
            _shapeSearchGlobal();
            _textSearchGlobal();
    }
    $(".globalSearchResult").addClass("_expanded");
}

$(document).ready(function () {
    $(document.body).append($(`<div class="globalSearchbar untouchabbleMe">
        <div class="globalSearchTopbar">
            <label><span class="_globalSearchTypeExtensionBtn hoverHighlighter"
                    style="cursor:pointer;font-size:smaller;"
                    onclick='_globalSearchTypeExtension(this, event)'>&#9660;</span>
                <input class="globalSearchTextbox" type="text" placeholder="Search"
                    oninput="globalSearchTextbox_changed(this);" /><span class="hoverHighlighter"
                    style="cursor:pointer;font-size:smaller;"
                    onclick='_globalSearchStart(this, event)'>&#10148;</span>&nbsp;&nbsp;<span class="hoverHighlighter"
                    style="cursor:pointer;font-size:smaller;"
                    onclick='_globalSearchTypeClear(this, event)'>&#10006;</span></label>
        </div>

        <div class="globalSearchType">
            <span style="margin: 0px 5px;">Search Type</span>
            <hr>
            <ul class="globalSearchTypeUl">
            </ul>
        </div>

        <div class="globalSearchResult">
            <span style="margin: 0px 5px;">Search Results</span>
            <hr>
            <ul class="globalSearchResultUl">
            </ul>
        </div>
    </div>`));
    $(".globalSearchTypeUl").empty();
    _totalGlobalSearchTypeList.forEach((f, i) => {
        $(".globalSearchTypeUl").append($(`<li>
            <label><input class="globalSearchItemType" name="globalSearchItemType" type="radio" ${i===0?"checked":""} value="${f}">
                &nbsp;${f}</label>
        </li>`));
    });
    _globalSearchChangePlaceholder();
});