//https://www.programmersought.com/article/76267565721/
// Custom material
if (Cesium.PolylineTrailLinkMaterialPropertyRoad1 == undefined) {
    function PolylineTrailLinkMaterialPropertyRoad1(color, duration) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this.color = color;
        this.duration = duration;
        this._time = new Date().getTime();
    }
    Object.defineProperties(
        PolylineTrailLinkMaterialPropertyRoad1.prototype,
        {
            isConstant: {
                get: function () {
                    return false;
                }
            },
            definitionChanged: {
                get: function () {
                    return this._definitionChanged;
                }
            },
            color: Cesium.createPropertyDescriptor("color")
        }
    );
    PolylineTrailLinkMaterialPropertyRoad1.prototype.getType = function (time) {
        return "PolylineTrailLink";
    };
    PolylineTrailLinkMaterialPropertyRoad1.prototype.getValue = function (time,result) {
        if (!Cesium.defined(result)) {
            result = {};
        }
        result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
        result.time =((new Date().getTime() - this._time) % this.duration) / this.duration;
        return result;
    };
    PolylineTrailLinkMaterialPropertyRoad1.prototype.equals = function ( other ) {
        return ( this === other || (other instanceof PolylineTrailLinkMaterialPropertyRoad1 && Property.equals(this._color, other._color)) ); 
    };
    Cesium.PolylineTrailLinkMaterialPropertyRoad1 = PolylineTrailLinkMaterialPropertyRoad1;
    Cesium.Material.PolylineTrailLinkType = "PolylineTrailLink";
         Cesium.Material.PolylineTrailLinkImage = require("./blue6.png");//Road style png
    Cesium.Material.PolylineTrailLinkSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                {\n\
                                                    czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                    vec2 st = materialInput.st;\n\
                                                    vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                                                    material.alpha = colorImage.a * color.a;\n\
                                                    material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                                                    return material;\n\
                                                }";
    Cesium.Material._materialCache.addMaterial(
        Cesium.Material.PolylineTrailLinkType,
        {
            fabric: {
                type: Cesium.Material.PolylineTrailLinkType,
                uniforms: {
                    color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
                    image: Cesium.Material.PolylineTrailLinkImage,
                    time: 0,
                    constantSpeed: 300,
                    depthFailMaterial: true
                },
                source: Cesium.Material.PolylineTrailLinkSource
            },
            translucent: function (material) {
                return true;
            }
        }
    );
}
 
 // new to generate material entities
if (!window.roadMaterialRoad1) {
    let roadColor = new Cesium.Color.fromCssColorString("#0cfd11");
    window.roadMaterialRoad1 = new Cesium.PolylineTrailLinkMaterialPropertyRoad1( roadColor, 20000 );
}
 
 // Create a flow line object
viewer.entities.add({
    polyline: new Cesium.PolylineGraphics({
        material: roadMaterial,
                 width: new Cesium.ConstantProperty(25),// line width
        arcType: Cesium.ArcType.GEODESIC,
                 positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions)//positions A collection of coordinate points passed by the road
    })
});