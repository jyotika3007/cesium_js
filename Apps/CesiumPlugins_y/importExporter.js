/*
_allLayersList
shapeDic = {};
shapePropsDic = {};
wallAnimPropsDic = {};

 */

var sEntities = [];
function exportAllentities() {
    // debugger
    // var notifier = ["_description", "_displayInfo", "_groupLayerName", "_latlonPostition", "_layerId", "_objId", "_orientation", "_parent", "_path", "_plane", "_point", "_polygon", "_polyline"]

    viewer.entities.values.forEach((e, i) => {
        let ek = {};
        Object.keys(e).forEach(o => {
            switch (o) {
                case "_description":
                    ek[o.replace("_", "")] = e[o];
                    break;
                case "_displayInfo":
                    ek[o.replace("_", "")] = e[o];
                    break;
                case "_layerId":
                    ek[o.replace("_", "")] = e[o];
                    break;
                case "_objId":
                    ek[o.replace("_", "")] = e[o];
                    break;
                case "_shapeType":
                    ek[o.replace("_", "")] = e[o];
                    break;
                case "_name":
                    ek[o.replace("_", "")] = e[o];
                    break;
                case "_latlonPostition":
                    ek[o.replace("_", "")] = e[o];
                    break;
                case "_weaponData":
                    ek[o.replace("_", "")] = e[o];
                    break;
                case "_groupLayerName":
                    ek[o] = e[o];
                    break;
                case "_position":
                    ek["position"] = e[o]._value;
                    break;
                case "_position_copy":
                    ek["position_copy"] = e[o];
                    break;
                case "_viewModel":
                    let vm = {}
                    if (e[o] !== null && e[o] !== undefined && e[o] !== null && typeof (e[o]) === "object") {
                        Object.keys(e[o]).forEach(v => {
                            vm[v] = e[o][v];
                        });
                    }
                    ek["viewModel"] = vm;
                    break;
                //ek["viewModel"] = 

            }

        });
        sEntities.push(ek);
        if (i >= viewer.entities.values.length - 1) {
            console.log(sEntities);
        }

    });

}


function importEntities() {
    sEntities.forEach(s => {
        if(s.shapeType.toLowerCase() == "weapon")
        {
            importshowWeapon(s);
        }
    });
}