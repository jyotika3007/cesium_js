/*
_allLayersList
shapeDic = {};
shapePropsDic = {};
wallAnimPropsDic = {};

*/

var sEntities = {};
function exportAllentities(battle) {
    // console.log(_allLayersList)
// sEntities.push(_allLayersList)
// sEntities.push(shapeDic)
// sEntities.push(shapePropsDic)
// sEntities.push(wallAnimPropsDic)

sEntities[0] = { 'global_battle' :  battle } ;
sEntities[1] = { 'allLayersList' :  _allLayersList } ;
sEntities[2] = { 'shapeDic' : shapeDic };
sEntities[3] = { 'shapePropsDic' : shapePropsDic };
sEntities[4] = { 'wallAnimPropsDic' : wallAnimPropsDic };


console.log(wallAnimPropsDic)
var count_entities = 5;

    // debugger
    // var notifier = ["_description", "_displayInfo", "_groupLayerName", "_latlonPostition", "_layerId", "_objId", "_orientation", "_parent", "_path", "_plane", "_point", "_polygon", "_polyline"]

    viewer.entities.values.forEach((e, i) => {
        // console.log(e)
        // console.log("/////////////////")
        // console.log(i)
        let ek = {};
        console.log(e)
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
                if(e[o] !== undefined && e[o]._value !== undefined){                        
                    ek["position"] = e[o]._value;
                }
                break;
                case "_position_copy":
                if(e[o] !== undefined && e[o]._value !== undefined){                        
                    ek["position_copy"] = e[o]._value;
                }
                break;
                case "_rectangle":
                if(e[o] !== undefined && e[o]._value !== undefined){                        
                    ek["position_copy"] = e[o]._value;
                }
                break;
                case "_radius":
                if(e[o] !== undefined){                        
                    ek["radius"] = e[o];
                }
                break;
                case "_topleft":
                if(e[o] !== undefined){                        
                    ek["topleft"] = e[o];
                }
                break;
                case "_rightbottom":
                if(e[o] !== undefined){                        
                    ek["rightbottom"] = e[o];
                }
                break;
                case "_positionpolygon":
                if(e[o] !== undefined){                        
                    ek["positionpolygon"] = e[o];
                }
                break;
                case "_textlabel":
                if(e[o] !== undefined){                        
                    ek["textlabel"] = e[o];
                }
                break;
                case "_polygon_color":
                if(e[o] !== undefined){                        
                    ek["polygon_color"] = e[o];
                }
                break;
                case "_polyline_color":
                if(e[o] !== undefined){                        
                    ek["polyline_color"] = e[o];
                }
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
        sEntities[count_entities] = ek;
        count_entities+= 1;
        // sEntities.push(ek);
        if (i >= viewer.entities.values.length - 1) {
            console.log(sEntities);
        }

    });
    console.log(sEntities);
    return sEntities;

}


function importEntities(result) {

// console.log('///////////////////');
console.log(result)

battle = result[0].global_battle;

if(battle == global_battle){

_allLayersList = result[1].allLayersList;
shapeDic = result[2].shapeDic;
shapePropsDic = result[3].shapePropsDic;
wallAnimPropsDic = result[4].wallAnimPropsDic;

result_len = Object.keys(result).length;
// console.log(result_len)

for( i = 5;i<result_len; i++ ){
    sk = result[i];
    console.log(sk);
    shapeType = sk.shapeType
    switch(shapeType){
        case 'Point':
        // console.log(sk);
        showPoint(sk.objId, sk.position, sk.position);
        break;
        case 'Rectangle':
        // console.log(sk);
        selected_color = sk.polygon_color
        selected_outline_color = sk.polyline_color
        points = [sk.topleft,sk.rightbottom];
        showRectangle(sk.objId, points);
        break;
        case 'Circle':
        // console.log(sk);
        selected_color = sk.polygon_color
        selected_outline_color = sk.polyline_color
        points = [sk.position,sk.radius];
        showCircle(sk.objId, points);
        break;
        case 'Text':
        // console.log(sk);

        showText(sk.objId, sk.position, sk.viewModel.text);
        break;
        case "StraightArrow":
        // console.log(sk);
        selected_color = sk.polygon_color
        selected_outline_color = sk.polyline_color
        e = sk.positionpolygon
        // points = Object.keys()
        points = []
        Object.keys(e).forEach(o => {
            console.log(e[o])
            points.push(e[o])
        });
        console.log(points);
        showStraightArrow(sk.objId, points);
        break;
        case "PincerArrow":
        console.log(sk);
        selected_color = sk.polygon_color
        selected_outline_color = sk.polyline_color
        e = sk.positionpolygon
        // points = Object.keys()
        points = []
        Object.keys(e).forEach(o => {
            console.log(e[o])
            points.push(e[o])
        });
        console.log(points);
        showPincerArrow(sk.objId, points);
        break;
        case 'Polygon':
        // console.log(sk);
        selected_color = sk.polygon_color
        selected_outline_color = sk.polyline_color
        e = sk.positionpolygon
        // points = Object.keys()
        points = []
        Object.keys(e).forEach(o => {
            console.log(e[o])
            points.push(e[o])
        });
        console.log(points);
        showPolygon(sk.objId, points);
        break;
        case 'Polyline':
        // console.log(sk);
        selected_color = sk.polygon_color
        selected_outline_color = sk.polyline_color
        e = sk.positionpolygon
        // points = Object.keys()
        points = []
        Object.keys(e).forEach(o => {
            console.log(e[o])
            points.push(e[o])
        });
        console.log(points);
        showPolyline(sk.objId, points);
        break;
        
    }
}
}
else{
    alert("Battle credentials does not match. Please contact to Admin");
}
 
}