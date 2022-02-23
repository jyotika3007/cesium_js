//import Cesium from "cesium/Cesium";

class PolylineTrailMaterialProperty {
    /*USE:
     let material = new Cesium.PolylineTrailMaterialProperty({
          color: Cesium.Color.GREEN,

          duration: 3000,

          trailImage: "images/colors1.png"

        });

    viewer.entities.add({
          polyline: {
            positions: this.generateCurve(startPoint, endPoint),

            width: 2,

            material: material

          }

        });

    viewer.entities.resumeEvents();
 */

    constructor(options) {

        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

        this._definitionChanged = new Cesium.Event();

        this._color = undefined;

        this._colorSubscription = undefined;

        this.color = options.color;

        this.duration = options.duration;

        this.trailImage = options.trailImage;

        this._time = performance.now();

    }

}

Object.defineProperties(PolylineTrailMaterialProperty.prototype, {

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

    color: Cesium.createPropertyDescriptor('color')

});

PolylineTrailMaterialProperty.prototype.getType = function (time) {

    return 'PolylineTrail';

}

PolylineTrailMaterialProperty.prototype.getValue = function (time, result) {

    if (!Cesium.defined(result)) {

        result = {};

    }

    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);

    //result.image = Cesium.Material.PolylineTrailImage;

    result.image = this.trailImage;

    result.time = ((performance.now() - this._time) % this.duration) / this.duration;

    return result;

}

PolylineTrailMaterialProperty.prototype.equals = function (other) {

    return this === other ||

        (other instanceof PolylineTrailMaterialProperty &&

            Cesium.Property.equals(this._color, other._color))

}

Cesium.Material.PolylineTrailType = 'PolylineTrail';

Cesium.Material.PolylineTrailImage = "images/colors.png";

Cesium.Material.PolylineTrailSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n" +

    "{\n" +
    "czm_material material = czm_getDefaultMaterial(materialInput);\n" +

    "vec2 st = materialInput.st;\n" +

    "vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n" +

    "material.alpha = colorImage.a * color.a;\n" +

    "material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n" +

    "return material;\n" +

    "}";

Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailType, {

    fabric: {

        type: Cesium.Material.PolylineTrailType,

        uniforms: {

            color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),

            image: Cesium.Material.PolylineTrailImage,

            time: 0

        },

        source: Cesium.Material.PolylineTrailSource

    },

    translucent: function (material) {

        return true;

    }

});

Cesium.PolylineTrailMaterialProperty = PolylineTrailMaterialProperty;

/* FULL USAGE *//*
import "cesium/Widgets/widgets.css";

import Cesium from "cesium/Cesium";

import CesiumFactory from "@/js/cesium/CesiumFactory";

import PolylineTrailMaterialProperty from "@/js/cesium/overlay/PolylineTrailMaterialProperty";

export default {
  name: "CesiumDynamicLine1",

  data() {
    return {
      viewer: null

    };

  },

  mounted() {
    const factory = new CesiumFactory();

    this.viewer = factory.getViewer();

    this.create();

  },

  methods: {
    create() {
      //Create ray

      var data = {
        center: {
          id: 0,

          lon: 114.302312702,

          years: 30.598026044,

          size: 20,

          color: Cesium.Color.PURPLE

        },

        points: [

          {
            id: 1,

            lon: 115.028495718,

            years: 30.200814617,

            color: Cesium.Color.YELLOW,

            size: 15

          },

          {
            id: 2,

            lon: 110.795000473,

            years: 32.638540762,

            color: Cesium.Color.RED,

            size: 15

          },

          {
            id: 3,

            lon: 111.267729446,

            years: 30.698151246,

            color: Cesium.Color.BLUE,

            size: 15

          },

          {
            id: 4,

            lon: 112.126643144,

            years: 32.058588576,

            color: Cesium.Color.GREEN,

            size: 15

          },

          {
            id: 5,

            lon: 114.885884938,

            years: 30.395401912,

            color: Cesium.Color.BLUE,

            size: 15

          },

          {
            id: 6,

            lon: 112.190419415,

            years: 31.043949588,

            color: Cesium.Color.BLUE,

            size: 15

          },

          {
            id: 7,

            lon: 113.903569642,

            years: 30.93205405,

            color: Cesium.Color.BLUE,

            size: 15

          },

          {
            id: 8,

            lon: 112.226648859,

            years: 30.367904255,

            color: Cesium.Color.BLUE,

            size: 15

          },

          {
            id: 9,

            lon: 114.86171677,

            years: 30.468634833,

            color: Cesium.Color.BLUE,

            size: 15

          },

          {
            id: 10,

            lon: 114.317846048,

            years: 29.848946148,

            color: Cesium.Color.BLUE,

            size: 15

          },

          {
            id: 11,

            lon: 113.371985426,

            years: 31.70498833,

            color: Cesium.Color.BLUE,

            size: 15

          },

          {
            id: 12,

            lon: 109.468884533,

            years: 30.289012191,

            color: Cesium.Color.BLUE,

            size: 15

          },

          {
            id: 13,

            lon: 113.414585069,

            years: 30.368350431,

            color: Cesium.Color.SALMON,

            size: 15

          },

          {
            id: 14,

            lon: 112.892742589,

            years: 30.409306203,

            color: Cesium.Color.WHITE,

            size: 15

          },

          {
            id: 15,

            lon: 113.16085371,

            years: 30.667483468,

            color: Cesium.Color.SALMON,

            size: 15

          },

          {
            id: 16,

            lon: 110.670643354,

            years: 31.74854078,

            color: Cesium.Color.PINK,

            size: 15

          }

        ],

        options: {
          name: "",

          polyline: {
            width: 2,

            material: [Cesium.Color.GREEN, 3000]

          }

        }

      };

      this.createFlyLines(data);

    },

    createFlyLines(data) {
      const center = data.center;

      const cities = data.points;

      const startPoint = Cesium.Cartesian3.fromDegrees(

        center.lon,

        center.lat,

        0

      );

      //Center point

      this.viewer.entities.add({
        position: startPoint,

        point: {
          pixelSize: center.size,

          color: center.color

        }

      });

      //When operating in large batches, temporarily disabling events can improve performance

      this.viewer.entities.suspendEvents();

      //Scatter

      cities.map(city => { // or new PolylineTrailLinkMaterialProperty(Cesium.Color.BLUE, 8000)
        let material = new Cesium.PolylineTrailMaterialProperty({
          color: Cesium.Color.GREEN,

          duration: 3000,

          trailImage: "images/colors1.png"

        });

        const endPoint = Cesium.Cartesian3.fromDegrees(city.lon, city.lat, 0);

        this.viewer.entities.add({
          position: endPoint,

          point: {
            pixelSize: city.size - 10,

            color: city.color

          }

        });

        this.viewer.entities.add({
          polyline: {
            positions: this.generateCurve(startPoint, endPoint),

            width: 2,

            material: material

          }

        });

      });

      this.viewer.entities.resumeEvents();

      this.viewer.flyTo(this.viewer.entities);

    },


//     * Generate flow curve

//     * @param startPoint starting point

//     * @param endPoint end point

//     * @returns {Array}


    generateCurve(startPoint, endPoint) {
      let addPointCartesian = new Cesium.Cartesian3();

      Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian);

      let midPointCartesian = new Cesium.Cartesian3();

      Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian);

      let midPointCartographic = Cesium.Cartographic.fromCartesian(

        midPointCartesian

      );

      midPointCartographic.height =

        Cesium.Cartesian3.distance(startPoint, endPoint) / 5;

      let midPoint = new Cesium.Cartesian3();

      Cesium.Ellipsoid.WGS84.cartographicToCartesian(

        midPointCartographic,

        midPoint

      );

      let spline = new Cesium.CatmullRomSpline({
        times: [0.0, 0.5, 1.0],

        points: [startPoint, midPoint, endPoint]

      });

      let curvePoints = [];

      for (let i = 0, len = 200; i < len; i++) {
        curvePoints.push(spline.evaluate(i / len));

      }

      return curvePoints;

    }

  }

}; */