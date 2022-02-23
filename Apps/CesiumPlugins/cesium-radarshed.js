/**
 * Visual domain analysis.
 *
 * @author DesCrip
 * @date 2020/08/28
 * @level 0
 * @alias RadarShedStage
 * @constructor
 * @param {Cesium.Viewer} viewer Cesium three-dimensional viewport.
 * @param {Object} options options.
 * @param {Cesium.Cartesian3} options.viewPosition The position of the observation point.
 * @param {Cesium.Cartesian3} options.viewPositionEnd The position of the farthest observation point (if the observation distance is set, this property does not need to be set).
 * @param {Number} options.viewDistance Observation distance (unit `m`, default value 100).
 * @param {Number} options.viewHeading heading angle (unit `degree`, default value 0).
 * @param {Number} options.viewPitch Pitch angle (unit `degree`, default value 0).
 * @param {Number} options.horizontalViewAngle The horizontal angle of the visual field (unit `degree`, default value 90).
 * @param {Number} options.verticalViewAngle The vertical angle of the visual field (unit `degree`, default value 60).
 * @param {Cesium.Color} options.visibleAreaColor Color of visible area (default value is `green`).
 * @param {Cesium.Color} options.invisibleAreaColor The color of the invisible area (the default value is `red`).
 * @param {Boolean} options.enabled Whether the shadow map is available.
 * @param {Boolean} options.softShadows Whether to enable soft shadows.
 * @param {Boolean} options.size The size of each shadow map.
 */

var glsl = `
 #define USE_CUBE_MAP_SHADOW true
 uniform sampler2D colorTexture;
 uniform sampler2D depthTexture;
 varying vec2 v_textureCoordinates;
 uniform mat4 camera_projection_matrix;
 uniform mat4 camera_view_matrix;
 uniform float far;
 uniform samplerCube shadowMap_textureCube;
 uniform mat4 shadowMap_matrix;
 uniform vec4 shadowMap_lightPositionEC;
 uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
 uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;
 struct zx_shadowParameters
 {
     vec3 texCoords;
     float depthBias;
     float depth;
     float nDotL;
     vec2 texelStepSize;
     float normalShadingSmooth;
     float darkness;
 };
 float czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters)
 {
     float depthBias = shadowParameters.depthBias;
     float depth = shadowParameters.depth;
     float nDotL = shadowParameters.nDotL;
     float normalShadingSmooth = shadowParameters.normalShadingSmooth;
     float darkness = shadowParameters.darkness;
     vec3 uvw = shadowParameters.texCoords;
     depth -= depthBias;
     float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);
     return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);
 }
 vec4 getPositionEC(){
     return czm_windowToEyeCoordinates(gl_FragCoord);
 }
 vec3 getNormalEC(){
     return vec3(1.);
 }
 vec4 toEye(in vec2 uv,in float depth){
     vec2 xy=vec2((uv.x*2.-1.),(uv.y*2.-1.));
     vec4 posInCamera=czm_inverseProjection*vec4(xy,depth,1.);
     posInCamera=posInCamera/posInCamera.w;
     return posInCamera;
 }
 vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point){
     vec3 v01=point-planeOrigin;
     float d=dot(planeNormal,v01);
     return(point-planeNormal*d);
 }
 float getDepth(in vec4 depth){
     float z_window=czm_unpackDepth(depth);
     z_window=czm_reverseLogDepth(z_window);
     float n_range=czm_depthRange.near;
     float f_range=czm_depthRange.far;
     return(2.*z_window-n_range-f_range)/(f_range-n_range);
 }
 float shadow( in vec4 positionEC ){
     vec3 normalEC=getNormalEC();
     zx_shadowParameters shadowParameters;
     shadowParameters.texelStepSize=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;
     shadowParameters.depthBias=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;
     shadowParameters.normalShadingSmooth=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;
     shadowParameters.darkness=shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;
     vec3 directionEC=positionEC.xyz-shadowMap_lightPositionEC.xyz;
     float distance=length(directionEC);
     directionEC=normalize(directionEC);
     float radius=shadowMap_lightPositionEC.w;
     if(distance>radius)
     {
         return 2.0;
     }
     vec3 directionWC=czm_inverseViewRotation*directionEC;
     shadowParameters.depth=distance/radius-0.0003;
     shadowParameters.nDotL=clamp(dot(normalEC,-directionEC),0.,1.);
     shadowParameters.texCoords=directionWC;
     float visibility=czm_shadowVisibility(shadowMap_textureCube,shadowParameters);
     return visibility;
 }
 bool visible(in vec4 result)
 {
     result.x/=result.w;
     result.y/=result.w;
     result.z/=result.w;
     return result.x>=-1.&&result.x<=1.
     &&result.y>=-1.&&result.y<=1.
     &&result.z>=-1.&&result.z<=1.;
 }
 void main(){
           // Get glaze color = two-dimensional structure (color texture, texture coordinates)
     gl_FragColor=texture2D(colorTexture,v_textureCoordinates);
           // Depth = (glaze color = two-dimensional structure (depth texture, texture coordinates))
     float depth=getDepth(texture2D(depthTexture,v_textureCoordinates));
           // Angle of view = (texture coordinates, depth)
     vec4 viewPos=toEye(v_textureCoordinates,depth);
           // world coordinates
     vec4 wordPos=czm_inverseView*viewPos;
           // Coordinates in the virtual camera
     vec4 vcPos=camera_view_matrix*wordPos;
     float near=.001*far;
     float dis=length(vcPos.xyz);
     if(dis>near&&dis<far){
                   // Perspective projection
         vec4 posInEye=camera_projection_matrix*vcPos;
                   // Viewable area color
         vec4 v_color=vec4(0.,1.,0.,.5);
         vec4 inv_color=vec4(1.,0.,0.,.5);
         if(visible(posInEye)){
             float vis=shadow(viewPos);
             if(vis>0.3){
                 gl_FragColor=mix(gl_FragColor,v_color,.5);
             } else{
                 gl_FragColor=mix(gl_FragColor,inv_color,.5);
             }
         }
     }
 }`;

if (typeof Cesium !== 'undefined')
    Cesium.RadarShed = (function (Cesium) {
        /**
         * Drawing objects
         * @param viewer
         * @param options
         * @constructor
         */
        // Make the active imagery layer a subscriber of the viewModel.
        function initi($this, options) {
            $this.viewer = viewer;
            /** Observation point location */
            // $this.viewPosition = options.viewPosition;
            // /** The location of the farthest observation point (if the observation distance is set, this attribute can be left unset) */
            // $this.viewPositionEnd = options.viewPositionEnd;
            /** Observation distance (unit `m`, default value 100) */

            /** Heading angle (unit `degree`, default value 0) */
            // $this.viewHeading = options.direction_angle ? options.direction_angle : (options.viewHeading ? Number(options.viewHeading) : 0.0);
            // /** Pitch angle (unit `degree`, default value 0) */
            // $this.viewPitch = $this.viewModel && $this.viewModel.vdirection_angle ? $this.viewModel.vdirection_angle : (options.viewPitch ? Number(options.viewPitch) : 0.0);
            /** Horizontal angle of the visual field (unit `degree`, default value 90) */
            // $this.horizontalViewAngle = options.horizontalViewAngle ? Number(options.horizontalViewAngle) : 90.0;
            /** The vertical angle of the visual field (unit `degree`, default value 60) */
            // $this.verticalViewAngle = options.verticalViewAngle ? Number(options.verticalViewAngle) : 60.0;
            /** Viewable area color (default value is `green`) */
            $this.visibleAreaColor = options.visibleAreaColor || Cesium.Color.GREEN;
            /** Invisible area color (default value is `red`) */
            $this.invisibleAreaColor = options.invisibleAreaColor || Cesium.Color.RED;

            $this.frustumGridColorMaterial = options.frustumGridColorMaterial || Cesium.Color.WHITE.withAlpha(0.3);

            $this.frustumOutlineColor = options.frustumOutlineColor || Cesium.Color.WHITE.withAlpha(0.6);
            /** Is the shadow map available */
            $this.enabled = (typeof options.enabled === "boolean") ? options.enabled : true;
            /** Whether to enable soft shadows */
            $this.softShadows = (typeof options.softShadows === "boolean") ? options.softShadows : true;
            /** The size of each shadow map */
            $this.size = options.size || 2048;
        }

        function _(viewer, options = {}) {
            let $this = this;
            if (viewer && viewer instanceof Cesium.Viewer) {
                this._counter = 0;
                this._viewer = viewer;
                this.rsobjId = options.rsobjId;
                // this.viewshadLayer = new Cesium.CustomDataSource('measureLayer')
                // viewer && viewer.dataSources.add(this.viewshadLayer)
                this.lng_stop, this.lat_stop, this.lng_start, this.lat_start;
                initi(this, options);

                /** The location of the farthest observation point (if the observation distance is set, this attribute can be left unset) */
                this.viewModel = {
                    is3d: true,
                    direction_angle: options.direction_angle ? options.direction_angle : 0.0,
                    vdirection_angle: options.vdirection_angle ? options.vdirection_angle : 0.0,
                    horizontalViewAngle: options.horizontalViewAngle ? Number(options.horizontalViewAngle) : 90.0,
                    verticalViewAngle: options.verticalViewAngle ? Number(options.verticalViewAngle) : 60.0,
                    viewDistance: options.viewDistance ? Number(options.viewDistance) : 100.0,
                    maxviewDistance: (options.viewDistance ? Number(options.viewDistance) : 100.0) * 2,
                    visibleAreaColor: $this.visibleAreaColor,
                    invisibleAreaColor: $this.invisibleAreaColor,
                    enabled: $this.enabled,
                    softShadows: $this.softShadows
                };
                this.viewPosition = options.viewPosition ? options.viewPosition : undefined;

                // $this.clearAll();
                $this.addv();

                // this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);

                // //initial point
                // this.handler.setInputAction(function (movement) {
                //     //$this.clearAll();
                //     var adaptivePosition = $this.viewer.scene.pickPosition(movement.position);

                //     var positionCarto = Cesium.Cartographic.fromCartesian(adaptivePosition);
                //     this.lng_start = Cesium.Math.toDegrees(positionCarto.longitude).toFixed(8);
                //     this.lat_start = Cesium.Math.toDegrees(positionCarto.latitude).toFixed(8);
                //     height_start = positionCarto.height;

                //     let pos = new Cesium.Cartesian3.fromDegrees(parseFloat(this.lng_start), parseFloat(this.lat_start), parseFloat(height_start));
                //     $this.viewPosition = pos;
                //     //$this.viewModel.viewPosition = $this.viewPosition;
                //     $this.addv();

                // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            }
        }


        _.prototype = {
            clearAll: function () {
                if (this.sketch) {
                    this._viewer.entities.removeById(this.sketch.id);
                    this.sketch = null;
                    delete this.sketch
                }
                if (this.frustumOutline) {
                    this.frustumOutline.destroy();
                    this.frustumOutline = null;
                    delete this.frustumOutline;
                }
                if (this.postStage) {
                    this.viewer.scene.postProcessStages.remove(this.postStage);
                    this.postStage = null;
                    delete this.postStage;
                }

                // if (this.shadowMap) {
                //     this.shadowMap.destroy();
                //     this.shadowMap = null;
                // }

                //clearEntityByKeyValue("rsobjId", this.rsobjId);

            },
            addv: function () {
                let $this = this;
                this.viewModel.horizontalViewAngle = Number(this.viewModel.horizontalViewAngle);
                this.viewModel.verticalViewAngle = Number(this.viewModel.verticalViewAngle);
                if (this.viewModel.horizontalViewAngle > 180) this.viewModel.horizontalViewAngle = 180;
                if (this.viewModel.verticalViewAngle > 180) this.viewModel.verticalViewAngle = 180;
                this.viewModel.viewDistance = Number(this.viewModel.viewDistance);
                // Object.keys(options).forEach(k => {
                //     $this.viewModel[k] = options[k];
                // });
                initi($this, $this.viewModel);
                //$this.clear();
                if (this.viewPosition && this.viewModel.viewDistance) {
                    this.createLightCamera();
                    this.createShadowMap();
                    this.createPostStage();
                    //this.drawFrustumOutine();
                    this.drawSketch();
                    //this.handler.destroy();
                    // this.tooltip.removeMe();
                }
            },
            update: function () {
                // this._counter += 1;
                // if (this._counter < 3) {
                //     return;
                // }
                let $this = this;
                this.viewModel.horizontalViewAngle = Number(this.viewModel.horizontalViewAngle);
                this.viewModel.verticalViewAngle = Number(this.viewModel.verticalViewAngle);
                this.viewModel.direction_angle = Number(this.viewModel.direction_angle);
                if (this.viewModel.horizontalViewAngle > 180) this.viewModel.horizontalViewAngle = 180;
                if (this.viewModel.verticalViewAngle > 180) this.viewModel.verticalViewAngle = 180;
                if (this.viewModel.direction_angle > 360) this.viewModel.direction_angle = 360;
                this.viewModel.viewDistance = Number(this.viewModel.viewDistance);
                // Object.keys(options).forEach(k => {
                //     $this.viewModel[k] = options[k];
                // });

                initi($this, $this.viewModel);
                // $this.clear();
                // $this.add();
                if (this.viewPosition && this.viewModel.viewDistance) {
                    // var enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(this.viewPosition);

                    // let directionX = this.viewModel.viewDistance * Math.cos(Cesium.Math.toRadians(this.viewModel.direction_angle));
                    // let directionY = this.viewModel.viewDistance * Math.sin(Cesium.Math.toRadians(this.viewModel.direction_angle));
                    // let limitENU = new Cesium.Cartesian4(directionX, directionY, 0.0, 1.0);

                    // var limitECF = new Cesium.Cartesian4();
                    // limitECF = Cesium.Matrix4.multiplyByVector(enuTransform, limitENU, limitECF);
                    // this.viewPositionEnd = {
                    //     x: limitECF.x,
                    //     y: limitECF.y,
                    //     z: limitECF.z
                    // };


                    this.updateLightCamera();
                    this.updateShadowMap();
                    if (this.lightCamera) {
                        this.updatePostStage();
                        this.updateSketch();
                    }
                }

                //console.log(this.viewPosition, this.viewPositionEnd, limitECF);

            },
            createLightCamera: function () {
                this.lightCamera = new Cesium.Camera(this.viewer.scene);
                this.lightCamera.position = this.viewPosition;
                // if (this.viewPositionEnd) {
                //     let direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(this.viewPositionEnd, this.viewPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3());
                // this.lightCamera.direction = direction; // direction is the direction the camera is facing
                // }
                this.lightCamera.frustum.near = this.viewModel.viewDistance * 0.001;
                this.lightCamera.frustum.far = this.viewModel.viewDistance;
                var hr = Cesium.Math.toRadians(this.viewModel.horizontalViewAngle);
                var vr = Cesium.Math.toRadians(this.viewModel.verticalViewAngle);
                var aspectRatio =
                    (this.viewModel.viewDistance * Math.tan(hr / 2) * 2) /
                    (this.viewModel.viewDistance * Math.tan(vr / 2) * 2);
                this.lightCamera.frustum.aspectRatio = aspectRatio;
                if (hr > vr) {
                    this.lightCamera.frustum.fov = hr;
                } else {
                    this.lightCamera.frustum.fov = vr;
                }
                this.lightCamera.setView({
                    destination: this.viewPosition,
                    orientation: {
                        heading: Cesium.Math.toRadians(this.viewModel.direction_angle || 0),
                        pitch: Cesium.Math.toRadians(this.viewModel.vdirection_angle || 0),
                        roll: 0
                    }
                });
            },
            updateLightCamera: function () {
                if (!this.lightCamera) return;
                this.lightCamera.position = this.viewPosition;
                this.lightCamera.frustum.near = this.viewModel.viewDistance * 0.001;
                this.lightCamera.frustum.far = this.viewModel.viewDistance;
                var hr = Cesium.Math.toRadians(this.viewModel.horizontalViewAngle);
                var vr = Cesium.Math.toRadians(this.viewModel.verticalViewAngle);
                var aspectRatio =
                    (this.viewModel.viewDistance * Math.tan(hr / 2) * 2) /
                    (this.viewModel.viewDistance * Math.tan(vr / 2) * 2);
                this.lightCamera.frustum.aspectRatio = aspectRatio;
                if (hr > vr) {
                    this.lightCamera.frustum.fov = hr;
                } else {
                    this.lightCamera.frustum.fov = vr;
                }
                this.lightCamera.setView({
                    destination: this.viewPosition,
                    orientation: {
                        heading: Cesium.Math.toRadians(this.viewModel.direction_angle || 0),
                        pitch: Cesium.Math.toRadians(this.viewModel.vdirection_angle || 0),
                        roll: 0
                    }
                });
            },
            createShadowMap: function () {
                let $this = this;
                this.shadowMap = new Cesium.ShadowMap({
                    context: (this.viewer.scene).context,
                    lightCamera: this.lightCamera,
                    enabled: this.enabled,
                    isPointLight: true,
                    pointLightRadius: $this.viewModel.viewDistance,
                    cascadesEnabled: false,
                    size: this.size,
                    softShadows: this.softShadows,
                    normalOffset: false,
                    fromLightSource: false
                });
                this.viewer.scene.shadowMap = this.shadowMap;
            },
            updateShadowMap: function () {
                if (!this.shadowMap) return;
                this.shadowMap._pointLightRadius = this.viewModel.viewDistance;
                //this.viewer.scene.shadowMap = this.shadowMap;
            },
            createPostStage: function () {
                let $this = this;
                const fs = glsl
                this.postStage = new Cesium.PostProcessStage({
                    rsobjId: $this.rsobjId,
                    fragmentShader: fs,
                    uniforms: {
                        camera_projection_matrix: this.lightCamera.frustum.projectionMatrix,
                        camera_view_matrix: this.lightCamera.viewMatrix,
                        far: () => {
                            return this.viewModel.viewDistance;
                        },
                        shadowMap_textureCube: () => {
                            this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                            return Reflect.get(this.shadowMap, "_shadowMapTexture");
                        },
                        shadowMap_matrix: () => {
                            this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                            return Reflect.get(this.shadowMap, "_shadowMapMatrix");
                        },
                        shadowMap_lightPositionEC: () => {
                            this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                            return Reflect.get(this.shadowMap, "_lightPositionEC");
                        },
                        shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
                            this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                            const bias = this.shadowMap._pointBias;
                            return Cesium.Cartesian4.fromElements(
                                bias.normalOffsetScale,
                                this.shadowMap._distance,
                                this.shadowMap.maximumDistance,
                                0.0,
                                new Cesium.Cartesian4()
                            );
                        },
                        shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
                            this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                            const bias = this.shadowMap._pointBias;
                            const scratchTexelStepSize = new Cesium.Cartesian2();
                            const texelStepSize = scratchTexelStepSize;
                            texelStepSize.x = 1.0 / this.shadowMap._textureSize.x;
                            texelStepSize.y = 1.0 / this.shadowMap._textureSize.y;

                            return Cesium.Cartesian4.fromElements(
                                texelStepSize.x,
                                texelStepSize.y,
                                bias.depthBias,
                                bias.normalShadingSmooth,
                                new Cesium.Cartesian4()
                            );
                        }
                    }
                });

                this.viewer.scene.postProcessStages.add(this.postStage);
            },
            updatePostStage: function () {
                const fs = glsl
                // if(this.postStage === null || this.postStage === undefined)
                // {
                //     this.createPostStage();
                //     return;
                // }
                this.postStage.fragmentShader = fs;
                this.postStage.unigforms = {
                    camera_projection_matrix: this.lightCamera.frustum.projectionMatrix,
                    camera_view_matrix: this.lightCamera.viewMatrix,
                    far: () => {
                        return this.viewModel.viewDistance;
                    },
                    shadowMap_textureCube: () => {
                        this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                        return Reflect.get(this.shadowMap, "_shadowMapTexture");
                    },
                    shadowMap_matrix: () => {
                        this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                        return Reflect.get(this.shadowMap, "_shadowMapMatrix");
                    },
                    shadowMap_lightPositionEC: () => {
                        this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                        return Reflect.get(this.shadowMap, "_lightPositionEC");
                    },
                    shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
                        this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                        const bias = this.shadowMap._pointBias;
                        return Cesium.Cartesian4.fromElements(
                            bias.normalOffsetScale,
                            this.shadowMap._distance,
                            this.shadowMap.maximumDistance,
                            0.0,
                            new Cesium.Cartesian4()
                        );
                    },
                    shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
                        this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                        const bias = this.shadowMap._pointBias;
                        const scratchTexelStepSize = new Cesium.Cartesian2();
                        const texelStepSize = scratchTexelStepSize;
                        texelStepSize.x = 1.0 / this.shadowMap._textureSize.x;
                        texelStepSize.y = 1.0 / this.shadowMap._textureSize.y;

                        return Cesium.Cartesian4.fromElements(
                            texelStepSize.x,
                            texelStepSize.y,
                            bias.depthBias,
                            bias.normalShadingSmooth,
                            new Cesium.Cartesian4()
                        );
                    }
                }
            },
            drawFrustumOutine: function () {
                $this = this;
                const scratchRight = new Cesium.Cartesian3();
                const scratchRotation = new Cesium.Matrix3();
                const scratchOrientation = new Cesium.Quaternion();
                //const position = this.lightCamera.positionWC;
                const direction = this.lightCamera.directionWC;
                const up = this.lightCamera.upWC;
                let right = this.lightCamera.rightWC;
                right = Cesium.Cartesian3.negate(right, scratchRight);
                let rotation = scratchRotation;
                Cesium.Matrix3.setColumn(rotation, 0, right, rotation);
                Cesium.Matrix3.setColumn(rotation, 1, up, rotation);
                Cesium.Matrix3.setColumn(rotation, 2, direction, rotation);
                let orientation = Cesium.Quaternion.fromRotationMatrix(rotation, scratchOrientation);

                let instance = new Cesium.GeometryInstance({
                    geometry: new Cesium.FrustumOutlineGeometry({
                        frustum: this.lightCamera.frustum,
                        origin: this.viewPosition,
                        orientation: orientation
                    }),
                    id: Math.random().toString(36).substr(2),
                    attributes: {
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                            Cesium.Color.WHITE //new Cesium.Color(0.0, 1.0, 0.0, 1.0)
                            //$this.frustumOutlineColor
                        ),
                        show: new Cesium.ShowGeometryInstanceAttribute(true)
                    }
                });

                this.frustumOutline = this.viewer.scene.primitives.add(
                    new Cesium.Primitive({
                        geometryInstances: [instance],
                        appearance: new Cesium.PerInstanceColorAppearance({
                            flat: true,
                            translucent: false
                        })
                    })
                );
            },
            drawSketch: function () {
                // return;
                $this = this;
                // if (this.sketch !== undefined || this.sketch !== null) this._viewer.entities.remove(this.sketch);
                // if (!this.viewModel.is3d) return;

                var biasval = this.viewModel.horizontalViewAngle - 90;
                var vbiasval = 0 //this.viewModel.verticalViewAngle - 82;

                this.sketch = new Cesium.Entity({
                    position: $this.viewPosition,
                    orientation: Cesium.Transforms.headingPitchRollQuaternion(
                        $this.viewPosition,
                        new Cesium.HeadingPitchRoll.fromDegrees($this.viewModel.direction_angle - $this.viewModel.horizontalViewAngle + biasval, $this.viewModel.vdirection_angle + vbiasval, 0.0)
                    ),
                    ellipsoid: {
                        radii: new Cesium.Cartesian3(
                            $this.viewModel.viewDistance,
                            $this.viewModel.viewDistance,
                            $this.viewModel.viewDistance
                        ),
                        innerRadii: new Cesium.Cartesian3(0.2, 0.2, 0.2),
                        minimumClock: Cesium.Math.toRadians(-$this.viewModel.horizontalViewAngle / 2),
                        maximumClock: Cesium.Math.toRadians($this.viewModel.horizontalViewAngle / 2),
                        minimumCone: Cesium.Math.toRadians((90 - $this.viewModel.verticalViewAngle / 2) + 7.75),
                        maximumCone: Cesium.Math.toRadians((90 + $this.viewModel.verticalViewAngle / 2) + 7.75),
                        material: $this.frustumGridColorMaterial,
                        //fill: false,
                        outline: true,
                        subdivisions: 256,
                        stackPartitions: 64,
                        slicePartitions: 64,
                        outlineColor: $this.frustumOutlineColor,
                        outlineWidth: 5.0,
                        show: this.viewModel.is3d
                    },
                    rsobjId: $this.rsobjId
                });
                this._viewer.entities.add(this.sketch);
            },
            updateSketch: function () {
                $this = this;
                // if(this.sketch === null || this.sketch === undefined)
                // {
                //     this.drawSketch();
                //     return;
                // }
                var biasval = this.viewModel.horizontalViewAngle - 90;
                var vbiasval = 0 //-($this.viewModel.verticalViewAngle / 2)  //this.viewModel.verticalViewAngle - 82;
                this.sketch.position = this.viewPosition;
                this.sketch.orientation = Cesium.Transforms.headingPitchRollQuaternion(
                    $this.viewPosition,
                    //new Cesium.HeadingPitchRoll.fromDegrees($this.viewModel.direction_angle - $this.viewModel.horizontalViewAngle + biasval,  Cesium.Math.toRadians($this.viewModel.vdirection_angle), 0.0)
                    new Cesium.HeadingPitchRoll.fromDegrees($this.viewModel.direction_angle - $this.viewModel.horizontalViewAngle + biasval, $this.viewModel.vdirection_angle + vbiasval, 0.0)
                )
                this.sketch.ellipsoid = {
                    radii: new Cesium.Cartesian3(
                        $this.viewModel.viewDistance,
                        $this.viewModel.viewDistance,
                        $this.viewModel.viewDistance
                    ),
                    innerRadii: new Cesium.Cartesian3(0.2, 0.2, 0.2),
                    minimumClock: Cesium.Math.toRadians(-$this.viewModel.horizontalViewAngle / 2),
                    maximumClock: Cesium.Math.toRadians($this.viewModel.horizontalViewAngle / 2),
                    minimumCone: Cesium.Math.toRadians((90 - $this.viewModel.verticalViewAngle / 2) + 7.75),
                    maximumCone: Cesium.Math.toRadians((90 + $this.viewModel.verticalViewAngle / 2) + 7.75),
                    material: $this.frustumGridColorMaterial,
                    outline: true,
                    subdivisions: 256,
                    stackPartitions: 64,
                    slicePartitions: 64,
                    outlineColor: $this.frustumOutlineColor,
                    outlineWidth: 5.0,
                    show: this.viewModel.is3d
                }
            }
        }
        return _
    })(Cesium);

/* radarshed Analysis */
var _radarsheds = {};
var _rsobjId = null;
//var radarshed3d = null; //new Cesium.radarshed(viewer);

function create_new_rs() {
    _rsobjId = (new Date()).getTime();
    _radarsheds[_rsobjId] = new Cesium.RadarShed(viewer, {
        rsobjId: _rsobjId
    });
    // bindToolbar(_radarsheds[_rsobjId].viewModel, "viewshad3d_toolbar",
    //     `_radarsheds['${_rsobjId}'].update()`);

    // _radarsheds[_rsobjId].addv();
}

function clear_all_rs() {
    Object.keys(_radarsheds).forEach(vs => {
        _radarsheds[vs].clearAll();
    });
}

function clear_one_rs() {
    // radarshed3d = _radarsheds[rsobjId];
    if (_radarsheds[_rsobjId]) {
        _radarsheds[_rsobjId].clearAll();
    }
}

function _clicked_rs(rsobjId) {
    _rsobjId = rsobjId;
    // bindToolbar(_radarsheds[rsobjId].viewModel, "viewshad3d_toolbar",
    //     `_radarsheds['${rsobjId}'].update()`);
}

// function toggleVisibilityAnalysis(el) {
//     radarshedAnalysisPanelLoader(function () {
//         //     bindToolbar(radarshed3d.viewModel, "viewshad3d_toolbar",
//         //         "radarshed3d.update({ radarshade_enabled: true })");
//     });
// }