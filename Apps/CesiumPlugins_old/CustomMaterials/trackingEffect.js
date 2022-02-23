//https://www.programmersought.com/article/14073790161/
function moveTc(sourEntity,tarEntity, sourceColor, tcColor){
   function offsetToLongLat( start, offset )
{
    var er = 6378137;
    var lat = parseFloat( start[1] );
    var lon = parseFloat( start[0] );
    var dn = parseFloat( offset[1] );
    var de = parseFloat( offset[0] );
 
    dLat = dn / er;
    var pi = Math.PI;
    var dLon = de / ( er * Math.cos( pi * lat / 180 ) )
    return [
        lon + dLon * 180 / pi, lat + dLat * 180 / pi
    ];
}

//https://blog.csdn.net/happyduoduo1/article/details/51865758
    var isConstant = false;
   //  var sourceColor = tarEntity.model.color;
   //  var tcColor = Cesium.Color.fromAlpha(Cesium.Color.RED,
   //  parseFloat(0.5));
    var colors = Cesium.Color.fromRandom({alpha : 0.4});
    for(var k = 0 ; k < 36 ; k += 3){
      Cesium.when(k).then(function(k){
          viewer.entities.add( {
           polygon : {
            hierarchy  : new Cesium.CallbackProperty(function(time, result) {
                        //   if(yzentities.length != 0){
                        //     for(var i = 0 ; i < yzentities.length; i++){
                        //        viewer.entities.remove(yzentities[i]);
                        //     }
                            
                        //  }
                         var time = viewer.clock.currentTime; 
                         var position= tarEntity.position.getValue(time); 
                         if(!Cesium.defined(tarEntity)){
                          return Cesium.Cartesian3.fromDegreesArrayHeights([]);
                         }
                         if(!Cesium.defined(position)){
                          return Cesium.Cartesian3.fromDegreesArrayHeights([]);
                         }
                      
                        var cartographic = viewer.scene.globe.ellipsoid.
    cartesianToCartographic(position);
    var ecLat=Cesium.Math.toDegrees(cartographic.latitude);
     
                      var ecLong=Cesium.Math.toDegrees(cartographic.longitude);
                      var alt=cartographic.height;
                       var sourPos= sourEntity.position.getValue(time,result);
                       var cartographic1 = viewer.scene.globe.ellipsoid.
    cartesianToCartographic(sourPos);
                   var sourLon=Cesium.Math.toDegrees(cartographic1.longitude);
                   var sourLat=Cesium.Math.toDegrees(cartographic1.latitude);
                         var souralt=cartographic1.height;
     
                         var r = 60; // radius
                         var color = '#0000FF';
                         var finalArr = [];
                                               // Several polygons to simulate the lighting effect
                         var points = [];
                         for ( var i = 0; i < 360; i += 30 )
                         {
                            var coord = offsetToLongLat( [
                               ecLong, ecLat
                            ], [Math.cos( Math.PI * i / 180 ) * r, Math.sin( Math.PI * i / 180 ) * r] );
                            points.push( coord[0] );
                            points.push( coord[1] );
                            points.push( alt );
                         }
                         
                        var array = [sourLon, sourLat, souralt, points[k], points[k + 1], points[k + 2] ];
                            if ( k + 3 == points.length )
                            {
                               array.push( points[0] );
                               array.push( points[1] );
                               array.push( points[2] );
                            }
                            else
                            {
                               array.push( points[k + 3] );
                               array.push( points[k + 4] );
                               array.push( points[k + 5] );
                            }
                     return Cesium.Cartesian3.fromDegreesArrayHeights( array );
                    },isConstant),
                      perPositionHeight : true,
                      outline : false,
                      material : colors
                    }
                });
             })
            
              
                
          }
            
           
    }