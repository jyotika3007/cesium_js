
let geometryID = 0;
let loadedCRN = new Array();

let crnDic = {};
let crnPropsDic = {};
let selectedCartisan = '';
let selectedLatLong = '';
let selected_x = 0;
let selected_y = 0;

let selected_lat = 0;
let selected_long = 0;

let positionArr = Array();

var crnLayerLatLng = Array();

var ellipsoidTerrainProvider = new Cesium.EllipsoidTerrainProvider();

let handler_crn = "";
let crn_color_codes = ['#ff0000','#ffff00','#ff9933','#ff22ff','#00ff00','#0000ff'];

function selectLatLong(click){
  handler_crn = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  var rest_handler = handler_crn.setInputAction(function (movement){
    var adaptivePosition = viewer.scene.pickPosition(movement.position);

    var cartographicPosition = Cesium.Cartographic.fromCartesian(adaptivePosition);

    console.log(cartographicPosition)
    var y = cartographicPosition.latitude;
    var x = cartographicPosition.longitude;
    selected_long = parseFloat(Cesium.Math.toDegrees(cartographicPosition.longitude).toFixed(5))
    selected_lat  = parseFloat(Cesium.Math.toDegrees(cartographicPosition.latitude).toFixed(5))
    selectedLatLong = {
     lon: selected_long,
     lat: selected_lat,
   }

  // alert("Location Selector");

  $('#crnLatitude').val(y);
  $('#crnLongitude').val(x);
  $('#crnModal').modal('show');

  selected_x = x;
  selected_y = y;
  console.log(x,y)
  imgp = "/static/images/crn.png";
  flag = 0;
  let wd = {};
  wd["category"] = "CRN";
  wd["displayInfo"] = "CRN";
  wd["img"] = imgp;
  var objId = (new Date()).getTime();
  crnPropsDic[objId] = wd;

}, Cesium.ScreenSpaceEventType.LEFT_CLICK);


  // alert(rest_handler)

  return false;
}

function drawWindCircle (wind_direction, wpn_weight, distance, height_of_blast,wind_speed,crn_mode) {

  wpn_height = wpn_weight.split('_')[2]
  wpn_radius = wpn_weight.split('_')[1]
  wpn_weight = wpn_weight.split('_')[0]

  wpn_radius = wpn_radius.split(',')

  let windCircleRadius = wpn_radius;

  let typhoonPoint = selectedLatLong;

  lat = selectedLatLong.lat;
  lon = selectedLatLong.lon;

  radius_deduct = getCrnRaduiReduction(wind_speed);
  let geometryID = 0;

  for (let m = 0; m < windCircleRadius.length; m++) {

   let wnRadius = windCircleRadius[m];
   let reduced_rad = parseFloat(wnRadius - parseFloat((radius_deduct*wnRadius)/100));
   let ellipse_radius = parseInt(wnRadius) + parseInt(distance);
   console.log(wnRadius+"//"+reduced_rad)
   switch (wind_direction) {
    case "North":
    getWindCircle(lon, lat, wnRadius, ellipse_radius, 0,90);
    getWindCircle(lon, lat, wnRadius, reduced_rad, 90,180);
    getWindCircle(lon, lat, wnRadius, reduced_rad, 180,270);
    getWindCircle(lon, lat, wnRadius, ellipse_radius, 270,360);
    break;
    case "South":
    getWindCircle(lon, lat, wnRadius, reduced_rad, 0,90);
    getWindCircle(lon, lat, wnRadius, ellipse_radius, 90,180);
    getWindCircle(lon, lat, wnRadius, ellipse_radius, 180,270);
    getWindCircle(lon, lat, wnRadius, reduced_rad, 270,360);
    break;
    case "East":
    getWindCircle(lon, lat, ellipse_radius, wnRadius, 0,90);
    getWindCircle(lon, lat, ellipse_radius, wnRadius, 90,180);
    getWindCircle(lon, lat, reduced_rad, wnRadius, 180,270);
    getWindCircle(lon, lat, reduced_rad, wnRadius, 270,360);
    break;
    case "West":
    getWindCircle(lon, lat, reduced_rad, wnRadius, 0,90);
    getWindCircle(lon, lat, reduced_rad, wnRadius, 90,180);
    getWindCircle(lon, lat, ellipse_radius, wnRadius, 180,270);
    getWindCircle(lon, lat, ellipse_radius, wnRadius, 270,360);
    break;
    case "North-East":
    getWindCircle(lon, lat, ellipse_radius, wnRadius, 0,45);
    getWindCircle(lon, lat, wnRadius, wnRadius, 45,90);
    getWindCircle(lon, lat, wnRadius, wnRadius, 90,135);
    getWindCircle(lon, lat, wnRadius, wnRadius, 135,180);
    getWindCircle(lon, lat, wnRadius, wnRadius, 180,225);
    getWindCircle(lon, lat, ellipse_radius, wnRadius, 225,270);
    getWindCircle(lon, lat, ellipse_radius, wnRadius, 270,315);
    getWindCircle(lon, lat, ellipse_radius, wnRadius, 315,360);
    break;
  }                    

  let windType = windCircleRadius;

  let circleColor = Cesium.Color.YELLOW;
  switch (m) {
    case 0:
    circleColor = Cesium.Color.fromCssColorString('#ff000055');
    break;
    case 1:
    circleColor = Cesium.Color.fromCssColorString('#ffff0055');
    break;
    case 2:
    circleColor = Cesium.Color.fromCssColorString('#ff993355');
    break;
    case 3:
    circleColor = Cesium.Color.fromCssColorString('#ff22ff55');
    break;
    case 4:
    circleColor = Cesium.Color.fromCssColorString('#00ff0055');
    break;
    case 5:
    circleColor = Cesium.Color.fromCssColorString('#0000ff55');
    break;
  }
  var entities = viewer.entities;

  var positions = Cesium.Cartesian3.fromDegreesArray(
   positionArr
   );

  txt_crn = {'radius': wnRadius, 'points': [...positionArr]}

  crnLayerLatLng[m] = txt_crn;

  if(crn_mode == 0){

    loadedCRN[geometryID] = entities.add({
     polygon : {
      hierarchy : new Cesium.PolygonHierarchy(positions),
      outline: true,
      outlineColor: circleColor,
      outlineWidth: 1,
      material: circleColor,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      clampToGround: true,
      stRotation: Cesium.Math.toRadians(45)
    }
  });

  }
  else{
    loadedCRN[geometryID] = entities.add({
      polygon : {
        hierarchy : new Cesium.PolygonHierarchy(positions),
        extrudedHeight: height_of_blast,
        outline: true,
        outlineColor: circleColor,
        outlineWidth: 1,
        material: circleColor,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        clampToGround: true,
        stRotation: Cesium.Math.toRadians(45)
      }
    });
  }
  geometryID+= 1;

  positionArr.length = 0;

}

var entity = viewer.entities.add({
 position: Cesium.Cartesian3.fromDegrees(lon,lat),
 point: {
  pixelSize: 10,
  outlineColor: Cesium.Color.BLUE,
  outlineWidth: 5,
  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  clampToGround: true,
}
});

checkCrnClickEvent = 1;


handler_crn.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)


}


    // For Wind Towards North Direction

    function getWindCircle(lon,lat,radius1, radius2,start,end){
        let Ea = 6378137; //Equatorial radius
        let Eb = 6356725; //Polar radius

        for (let i = start; i <= end; i = i + 2) {        
        	let dx = radius1 * Math.sin(i * Math.PI / 180.0);
        	let dy = radius2 * Math.cos(i * Math.PI / 180.0);

        	let ec = Eb + (Ea - Eb) * (90.0 - lat) / 90.0;
        	let ed = ec * Math.cos(lat * Math.PI / 180);

        	let BJD = lon + (dx / ed) * 180.0 / Math.PI;
        	let BWD = lat + (dy / ec) * 180.0 / Math.PI;
          positionArr.push(BJD);
          positionArr.push(BWD);

        }                           

        return positionArr;
      }

      function getCrnRaduiReduction(speed){
       var token = '{{csrf_token}}';

       reduction = 0;
            $.ajax({ // create an AJAX call...
              headers: { "X-CSRFToken": token },
              data : {speed : speed},
                type: 'GET', // GET or POST
                url: "/wardec/get-reduction-radius-for-crn", // the file to call
                success: function (response) { // on success..

                  console.log(response)
                  reduction = 0;
                  radius = response.radius

                  if(radius>0){
                    reduction = radius[0].reduction
                  }
                  // radius = response.radius

                }
              });

            return reduction;
          }




          function checkPointExixtanceInCRN(){

           if (typeof(Storage) !== "undefined") {
            var populate_orbat = localStorage.getItem("populate_orbat");

              // symbols_list = symbol_array_list

              console.log("Getting new symbol array ")
              // console.log(symbol_array_list)

              strength_array = [0,0,80,70,50,40]
              efficiency_array = [0,100,100,100,100,100]

              for(var i=0;i<crnLayerLatLng.length;i++){ 
                positions = crnLayerLatLng[i];
                points = positions.points

                    // For Blue Land
                    for(j=0;j<blue_land_symbols.length;j++){
                      symbol_data = blue_land_symbols[j]

                      result = isLatLngInZone(points, symbol_data.lat, symbol_data.lng)

                      if(result == true){
                        console.log(strength_array[i]);
                        if(symbol_data.strength == 100){
                          symbol_data.strength = strength_array[i];
                          symbol_data.efficiency = efficiency_array[i];
                        }
                      }

                    }
                    // For Red Land
                    for(j=0;j<red_land_symbols.length;j++){
                      symbol_data = red_land_symbols[j]

                      result = isLatLngInZone(points, symbol_data.lat, symbol_data.lng)

                      if(result == true){
                        console.log(strength_array[i]);
                        if(symbol_data.strength == 100){
                          symbol_data.strength = strength_array[i];
                          symbol_data.efficiency = efficiency_array[i];
                        }
                      }

                    }
                    // For Yellow Land
                    for(j=0;j<yellow_land_symbols.length;j++){
                      symbol_data = yellow_land_symbols[j]

                      result = isLatLngInZone(points, symbol_data.lat, symbol_data.lng)

                      if(result == true){
                        console.log(strength_array[i]);
                        if(symbol_data.strength == 100){
                          symbol_data.strength = strength_array[i];
                          symbol_data.efficiency = efficiency_array[i];
                        }
                      }

                    }

                  }



// -----------------------------------------------------------------------------------------------------------------------
// -------------------------------- To get all the enitities for playing orbat -------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------

var orbat_points = populate_orbat_points.split(",");
var orbat_points_array = Array();

                  // console.log(orbat_points)

                  for(orb=0;orb<orbat_points.length;orb++){
                    orbs = orbat_points[orb];
                    orbs = orbs.split(' ');
                    orbs.filter(function(e){return e.trim() != ''; });

                    orbat_points_array.push(orbs[0]);
                    orbat_points_array.push(orbs[1]);

                  }


                    // For Blue Land
                    for(j=0;j<blue_land_symbols.length;j++){
                      symbol_data = blue_land_symbols[j]
                      result = isLatLngInZone(orbat_points_array, symbol_data.lat, symbol_data.lng)
                        // alert(result);
                        if(result == true){
                          symbol_data.status = 1;
                        }

                      }
                    // For Red Land
                    for(j=0;j<red_land_symbols.length;j++){
                      symbol_data = red_land_symbols[j]
                      result = isLatLngInZone(orbat_points_array, symbol_data.lat, symbol_data.lng)

                        // alert(result);
                        if(result == true){
                          symbol_data.status = 1;
                        }

                      }
                    // For Yellow Land
                    for(j=0;j<yellow_land_symbols.length;j++){
                      symbol_data = yellow_land_symbols[j]
                      result = isLatLngInZone(orbat_points_array, symbol_data.lat, symbol_data.lng)
                            // alert(result);

                            if(result == true){
                              symbol_data.status = 1;
                            }

                          }

                          var attacking_force =  $('#select_attacking_force').val();

                          var result = {'attacking_force': attacking_force , 'blue_land_force': blue_land_symbols, 'yellow_land_force': yellow_land_symbols, 'red_land_force': red_land_symbols}
                          console.log(result)
                          localStorage.setItem("populate_orbat",JSON.stringify(result));
                          localStorage.setItem("populate_status",0);

                        }

          // console.log(localStorage);

        }


        function isLatLngInZone(latLngs,lat,lng){

        // alert("1")
  // latlngs = [{"lat":22.281610498720003,"lng":70.77577162868579},{"lat":22.28065743343672,"lng":70.77624369747241},{"lat":22.280860953131217,"lng":70.77672113067706},{"lat":22.281863655593973,"lng":70.7762061465462}];
  vertices_y = new Array();
  vertices_x = new Array();
  longitude_x = lng;
  latitude_y = lat;
  // latLngs = JSON.parse(latLngs);
  var r = 0;
  var i = 0;
  var j = 0;
  var c = 0;
  var point = 0;

  console.log(latLngs.length)

  for(r=0; r<latLngs.length; r+=2){
   vertices_y.push(parseFloat(latLngs[r+1]));
   vertices_x.push(parseFloat(latLngs[r]));
 }

 points_polygon = vertices_x.length;
 for(i = 0, j = points_polygon; i < points_polygon; j = i++){
   point = i;
   if(point == points_polygon)
    point = 0;
  if ( ((vertices_y[point]  >  latitude_y != (vertices_y[j] > latitude_y)) && (longitude_x < (vertices_x[j] - vertices_x[point]) * (latitude_y - vertices_y[point]) / (vertices_y[j] - vertices_y[point]) + vertices_x[point]) ) )
    c = !c;
}
return c;
}

