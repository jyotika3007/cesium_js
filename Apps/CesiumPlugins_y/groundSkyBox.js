/*
 * @Author: gongzhiyuan
 * @E-mail: zhangb@geovis.com.cn
 * @Date: 2020-01-07 20:17:09
 * @LastEditors  : zhangbo
 * @LastEditTime : 2020-01-10 15:22:07
 * @Desc: Cesium近地天空盒
 */

(function () {
    const Cesium = window.Cesium;
    const BoxGeometry = Cesium.BoxGeometry;
    const Cartesian3 = Cesium.Cartesian3;
    const defaultValue = Cesium.defaultValue;
    const defined = Cesium.defined;
    const destroyObject = Cesium.destroyObject;
    const DeveloperError = Cesium.DeveloperError;
    const GeometryPipeline = Cesium.GeometryPipeline;
    const Matrix3 = Cesium.Matrix3;
    const Matrix4 = Cesium.Matrix4;
    const Transforms = Cesium.Transforms;
    const VertexFormat = Cesium.VertexFormat;
    const BufferUsage = Cesium.BufferUsage;
    const CubeMap = Cesium.CubeMap;
    const DrawCommand = Cesium.DrawCommand;
    const loadCubeMap = Cesium.loadCubeMap;
    const RenderState = Cesium.RenderState;
    const VertexArray = Cesium.VertexArray;
    const BlendingState = Cesium.BlendingState;
    const SceneMode = Cesium.SceneMode;
    const ShaderProgram = Cesium.ShaderProgram;
    const ShaderSource = Cesium.ShaderSource;
    const SkyBoxFS = "uniform samplerCube u_cubeMap;\n\
  varying vec3 v_texCoord;\n\
  void main()\n\
  {\n\
  vec4 color = textureCube(u_cubeMap, normalize(v_texCoord));\n\
  gl_FragColor = vec4(czm_gammaCorrect(color).rgb, czm_morphTime);\n\
  }\n\
  ";

    const SkyBoxVS = "attribute vec3 position;\n\
  varying vec3 v_texCoord;\n\
  uniform mat3 u_rotateMatrix;\n\
  void main()\n\
  {\n\
  vec3 p = czm_viewRotation * u_rotateMatrix * (czm_temeToPseudoFixed * (czm_entireFrustum.y * position));\n\
  gl_Position = czm_projection * vec4(p, 1.0);\n\
  v_texCoord = position.xyz;\n\
  }\n\
  ";

    function skyBoxOnGround(options) {
        /**
         * 近景天空盒
         * @type Object
         * @default undefined
         */
        this.sources = options.sources;
        this._sources = undefined;

        /**
         * Determines if the sky box will be shown.
         *
         * @type {Boolean}
         * @default true
         */
        this.show = defaultValue(options.show, true);

        this._command = new DrawCommand({
            modelMatrix: Matrix4.clone(Matrix4.IDENTITY),
            owner: this
        });
        this._cubeMap = undefined;

        this._attributeLocations = undefined;
        this._useHdr = undefined;
    }

    /**
     * Called when {@link Viewer} or {@link CesiumWidget} render the scene to
     * get the draw commands needed to render this primitive.
     * <p>
     * Do not call this function directly.  This is documented just to
     * list the exceptions that may be propagated when the scene is rendered:
     * </p>
     */
    const skyboxMatrix3 = new Matrix3();
    skyBoxOnGround.prototype.update = function (frameState, useHdr) {
        const that = this;

        if (!this.show) {
            return undefined;
        }

        if ((frameState.mode !== SceneMode.SCENE3D) &&
            (frameState.mode !== SceneMode.MORPHING)) {
            return undefined;
        }

        // The sky box is only rendered during the render pass; it is not pickable, it doesn't cast shadows, etc.
        if (!frameState.passes.render) {
            return undefined;
        }

        const context = frameState.context;

        if (this._sources !== this.sources) {
            this._sources = this.sources;
            const sources = this.sources;

            if ((!defined(sources.positiveX)) ||
                (!defined(sources.negativeX)) ||
                (!defined(sources.positiveY)) ||
                (!defined(sources.negativeY)) ||
                (!defined(sources.positiveZ)) ||
                (!defined(sources.negativeZ))) {
                throw new DeveloperError('this.sources is required and must have positiveX, negativeX, positiveY, negativeY, positiveZ, and negativeZ properties.');
            }

            if ((typeof sources.positiveX !== typeof sources.negativeX) ||
                (typeof sources.positiveX !== typeof sources.positiveY) ||
                (typeof sources.positiveX !== typeof sources.negativeY) ||
                (typeof sources.positiveX !== typeof sources.positiveZ) ||
                (typeof sources.positiveX !== typeof sources.negativeZ)) {
                throw new DeveloperError('this.sources properties must all be the same type.');
            }

            if (typeof sources.positiveX === 'string') {
                // Given urls for cube-map images.  Load them.
                loadCubeMap(context, this._sources).then(function (cubeMap) {
                    that._cubeMap = that._cubeMap && that._cubeMap.destroy();
                    that._cubeMap = cubeMap;
                });
            } else {
                this._cubeMap = this._cubeMap && this._cubeMap.destroy();
                this._cubeMap = new CubeMap({
                    context: context,
                    source: sources
                });
            }
        }

        const command = this._command;

        command.modelMatrix = Transforms.eastNorthUpToFixedFrame(frameState.camera._positionWC);
        if (!defined(command.vertexArray)) {
            command.uniformMap = {
                u_cubeMap: function () {
                    return that._cubeMap;
                },
                u_rotateMatrix: function () {
                    return Matrix4.getMatrix3(command.modelMatrix, skyboxMatrix3);
                    //return Matrix4.getRotation(command.modelMatrix, skyboxMatrix3);
                },
            };

            const geometry = BoxGeometry.createGeometry(BoxGeometry.fromDimensions({
                dimensions: new Cartesian3(2.0, 2.0, 2.0),
                vertexFormat: VertexFormat.POSITION_ONLY
            }));
            const attributeLocations = this._attributeLocations = GeometryPipeline.createAttributeLocations(geometry);

            command.vertexArray = VertexArray.fromGeometry({
                context: context,
                geometry: geometry,
                attributeLocations: attributeLocations,
                bufferUsage: BufferUsage._DRAW
            });

            command.renderState = RenderState.fromCache({
                blending: BlendingState.ALPHA_BLEND
            });
        }

        if (!defined(command.shaderProgram) || this._useHdr !== useHdr) {
            const fs = new ShaderSource({
                defines: [useHdr ? 'HDR' : ''],
                sources: [SkyBoxFS]
            });
            command.shaderProgram = ShaderProgram.fromCache({
                context: context,
                vertexShaderSource: SkyBoxVS,
                fragmentShaderSource: fs,
                attributeLocations: this._attributeLocations
            });
            this._useHdr = useHdr;
        }

        if (!defined(this._cubeMap)) {
            return undefined;
        }

        return command;
    };
    skyBoxOnGround.prototype.isDestroyed = function () {
        return false
    };
    skyBoxOnGround.prototype.destroy = function () {
        const command = this._command;
        command.vertexArray = command.vertexArray && command.vertexArray.destroy();
        command.shaderProgram = command.shaderProgram && command.shaderProgram.destroy();
        this._cubeMap = this._cubeMap && this._cubeMap.destroy();
        return destroyObject(this);
    };
    skyBoxOnGround.SUNSET = {
        positiveX: "CesiumPlugins/skybox/sunset/px.png",
        negativeX: "CesiumPlugins/skybox/sunset/nx.png",
        positiveY: "CesiumPlugins/skybox/sunset/py.png",
        negativeY: "CesiumPlugins/skybox/sunset/ny.png",
        positiveZ: "CesiumPlugins/skybox/sunset/pz.png",
        negativeZ: "CesiumPlugins/skybox/sunset/nz.png"
    }
    skyBoxOnGround.SUNNY = {
        positiveX: "CesiumPlugins/skybox/sunny/px.png",
        negativeX: "CesiumPlugins/skybox/sunny/nx.png",
        positiveY: "CesiumPlugins/skybox/sunny/py.png",
        negativeY: "CesiumPlugins/skybox/sunny/ny.png",
        positiveZ: "CesiumPlugins/skybox/sunny/pz.png",
        negativeZ: "CesiumPlugins/skybox/sunny/nz.png"
    }
    skyBoxOnGround.STAR = {
        positiveX: "CesiumPlugins/skybox/stars/px.png",
        negativeX: "CesiumPlugins/skybox/stars/nx.png",
        positiveY: "CesiumPlugins/skybox/stars/py.png",
        negativeY: "CesiumPlugins/skybox/stars/ny.png",
        positiveZ: "CesiumPlugins/skybox/stars/pz.png",
        negativeZ: "CesiumPlugins/skybox/stars/nz.png"
    }
    skyBoxOnGround.DARK = {
        positiveX: "CesiumPlugins/skybox/dark/px.png",
        negativeX: "CesiumPlugins/skybox/dark/nx.png",
        positiveY: "CesiumPlugins/skybox/dark/py.png",
        negativeY: "CesiumPlugins/skybox/dark/ny.png",
        positiveZ: "CesiumPlugins/skybox/dark/pz.png",
        negativeZ: "CesiumPlugins/skybox/dark/nz.png"
    }
    skyBoxOnGround.DUSK = {
        positiveX: "CesiumPlugins/skybox/dusk/px.png",
        negativeX: "CesiumPlugins/skybox/dusk/nx.png",
        positiveY: "CesiumPlugins/skybox/dusk/py.png",
        negativeY: "CesiumPlugins/skybox/dusk/ny.png",
        positiveZ: "CesiumPlugins/skybox/dusk/pz.png",
        negativeZ: "CesiumPlugins/skybox/dusk/nz.png"
    }
    skyBoxOnGround.CLOUDS = {
        positiveX: "CesiumPlugins/skybox/clouds/px.jpg",
        negativeX: "CesiumPlugins/skybox/clouds/nx.jpg",
        positiveY: "CesiumPlugins/skybox/clouds/py.jpg",
        negativeY: "CesiumPlugins/skybox/clouds/ny.jpg",
        positiveZ: "CesiumPlugins/skybox/clouds/pz.jpg",
        negativeZ: "CesiumPlugins/skybox/clouds/nz.jpg"
    }
    window.Cesium.SkyBoxOnGround = skyBoxOnGround
})();