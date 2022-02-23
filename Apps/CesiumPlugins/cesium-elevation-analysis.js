if (typeof Cesium !== 'undefined')
    /**
     * @author descrip
     * @param viewer {object} three-dimensional object
     * @param options {object} initialization parameters
     * @constructor
     */
    Cesium.ElevationAnalysis = (function (Cesium) {

        /**
          * Drawing objects
          * @param viewer
          * @param options
          * @constructor
          */
        function _(viewer, options = {}) {

            if (viewer && viewer instanceof Cesium.Viewer) {
                this._basePath = options.basePath || ''

                this._viewer = viewer
                this.viewModel = {
                    gradient: false,
                    band1Position: 7000.0,
                    band2Position: 7500.0,
                    band3Position: 8000.0,
                    bandThickness: 100.0,
                    bandTransparency: 0.5,
                    backgroundTransparency: 0.75,
                };
            }
        }
        _.prototype = {
            updateMaterial: function (options = {}) {
                let $this = this;
                if (this._viewer && options && options.enabled) {
                    var gradient = Boolean($this.viewModel.gradient);
                    var band1Position = Number($this.viewModel.band1Position);
                    var band2Position = Number($this.viewModel.band2Position);
                    var band3Position = Number($this.viewModel.band3Position);
                    var bandThickness = Number($this.viewModel.bandThickness);
                    var bandTransparency = Number($this.viewModel.bandTransparency);
                    var backgroundTransparency = Number($this.viewModel.backgroundTransparency);

                    var layers = [];
                    var backgroundLayer = {
                        entries: [
                            {
                                height: 4200.0,
                                color: new Cesium.Color(0.0, 0.0, 0.2, backgroundTransparency),
                            },
                            {
                                height: 8000.0,
                                color: new Cesium.Color(1.0, 1.0, 1.0, backgroundTransparency),
                            },
                            {
                                height: 8500.0,
                                color: new Cesium.Color(1.0, 0.0, 0.0, backgroundTransparency),
                            },
                        ],
                        extendDownwards: true,
                        extendUpwards: true,
                    };
                    layers.push(backgroundLayer);

                    var gridStartHeight = 4200.0;
                    var gridEndHeight = 8848.0;
                    var gridCount = 50;
                    for (var i = 0; i < gridCount; i++) {
                        var lerper = i / (gridCount - 1);
                        var heightBelow = Cesium.Math.lerp(
                            gridStartHeight,
                            gridEndHeight,
                            lerper
                        );
                        var heightAbove = heightBelow + 10.0;
                        var alpha =
                            Cesium.Math.lerp(0.2, 0.4, lerper) * backgroundTransparency;
                        layers.push({
                            entries: [
                                {
                                    height: heightBelow,
                                    color: new Cesium.Color(1.0, 1.0, 1.0, alpha),
                                },
                                {
                                    height: heightAbove,
                                    color: new Cesium.Color(1.0, 1.0, 1.0, alpha),
                                },
                            ],
                        });
                    }

                    var antialias = Math.min(10.0, bandThickness * 0.1);

                    if (!gradient) {
                        var band1 = {
                            entries: [
                                {
                                    height: band1Position - bandThickness * 0.5 - antialias,
                                    color: new Cesium.Color(0.0, 0.0, 1.0, 0.0),
                                },
                                {
                                    height: band1Position - bandThickness * 0.5,
                                    color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency),
                                },
                                {
                                    height: band1Position + bandThickness * 0.5,
                                    color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency),
                                },
                                {
                                    height: band1Position + bandThickness * 0.5 + antialias,
                                    color: new Cesium.Color(0.0, 0.0, 1.0, 0.0),
                                },
                            ],
                        };

                        var band2 = {
                            entries: [
                                {
                                    height: band2Position - bandThickness * 0.5 - antialias,
                                    color: new Cesium.Color(0.0, 1.0, 0.0, 0.0),
                                },
                                {
                                    height: band2Position - bandThickness * 0.5,
                                    color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency),
                                },
                                {
                                    height: band2Position + bandThickness * 0.5,
                                    color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency),
                                },
                                {
                                    height: band2Position + bandThickness * 0.5 + antialias,
                                    color: new Cesium.Color(0.0, 1.0, 0.0, 0.0),
                                },
                            ],
                        };

                        var band3 = {
                            entries: [
                                {
                                    height: band3Position - bandThickness * 0.5 - antialias,
                                    color: new Cesium.Color(1.0, 0.0, 0.0, 0.0),
                                },
                                {
                                    height: band3Position - bandThickness * 0.5,
                                    color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency),
                                },
                                {
                                    height: band3Position + bandThickness * 0.5,
                                    color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency),
                                },
                                {
                                    height: band3Position + bandThickness * 0.5 + antialias,
                                    color: new Cesium.Color(1.0, 0.0, 0.0, 0.0),
                                },
                            ],
                        };

                        layers.push(band1);
                        layers.push(band2);
                        layers.push(band3);
                    } else {
                        var combinedBand = {
                            entries: [
                                {
                                    height: band1Position - bandThickness * 0.5,
                                    color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency),
                                },
                                {
                                    height: band2Position,
                                    color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency),
                                },
                                {
                                    height: band3Position + bandThickness * 0.5,
                                    color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency),
                                },
                            ],
                        };

                        layers.push(combinedBand);
                    }

                    var material = Cesium.createElevationBandMaterial({
                        scene: viewer.scene,
                        layers: layers,
                    });
                    $this._viewer.scene.globe.material = material;
                } else {
                    this._viewer.scene.globe.material = undefined;
                }
            },
            clearAll: function () {
                this._viewer.scene.globe.material = undefined;
            }
        }
        return _
    })(Cesium);


Cesium.ElevationAnalysis2 = (function (Cesium) {

    /**
      * Drawing objects
      * @param viewer
      * @param options
      * @constructor
      */
    function getElevationContourMaterial() {
        // Creates a composite material with both elevation shading and contour lines
        return new Cesium.Material({
            fabric: {
                type: "ElevationColorContour",
                materials: {
                    contourMaterial: {
                        type: "ElevationContour",
                    },
                    elevationRampMaterial: {
                        type: "ElevationRamp",
                    },
                },
                components: {
                    diffuse:
                        "contourMaterial.alpha == 0.0 ? elevationRampMaterial.diffuse : contourMaterial.diffuse",
                    alpha:
                        "max(contourMaterial.alpha, elevationRampMaterial.alpha)",
                },
            },
            translucent: false,
        });
    }

    function getSlopeContourMaterial() {
        // Creates a composite material with both slope shading and contour lines
        return new Cesium.Material({
            fabric: {
                type: "SlopeColorContour",
                materials: {
                    contourMaterial: {
                        type: "ElevationContour",
                    },
                    slopeRampMaterial: {
                        type: "SlopeRamp",
                    },
                },
                components: {
                    diffuse:
                        "contourMaterial.alpha == 0.0 ? slopeRampMaterial.diffuse : contourMaterial.diffuse",
                    alpha: "max(contourMaterial.alpha, slopeRampMaterial.alpha)",
                },
            },
            translucent: false,
        });
    }

    function getAspectContourMaterial() {
        // Creates a composite material with both aspect shading and contour lines
        return new Cesium.Material({
            fabric: {
                type: "AspectColorContour",
                materials: {
                    contourMaterial: {
                        type: "ElevationContour",
                    },
                    aspectRampMaterial: {
                        type: "AspectRamp",
                    },
                },
                components: {
                    diffuse:
                        "contourMaterial.alpha == 0.0 ? aspectRampMaterial.diffuse : contourMaterial.diffuse",
                    alpha: "max(contourMaterial.alpha, aspectRampMaterial.alpha)",
                },
            },
            translucent: false,
        });
    }
    var elevationRamp = [0.0, 0.045, 0.1, 0.15, 0.37, 0.54, 1.0];
    var slopeRamp = [0.0, 0.29, 0.5, Math.sqrt(2) / 2, 0.87, 0.91, 1.0];
    var aspectRamp = [0.0, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0];
    function getColorRamp(selectedShading) {
        var ramp = document.createElement("canvas");
        ramp.width = 100;
        ramp.height = 1;
        var ctx = ramp.getContext("2d");

        var values;
        if (selectedShading === "elevation") {
            values = elevationRamp;
        } else if (selectedShading === "slope") {
            values = slopeRamp;
        } else if (selectedShading === "aspect") {
            values = aspectRamp;
        }

        var grd = ctx.createLinearGradient(0, 0, 100, 0);
        grd.addColorStop(values[0], "#000000"); //black
        grd.addColorStop(values[1], "#2747E0"); //blue
        grd.addColorStop(values[2], "#D33B7D"); //pink
        grd.addColorStop(values[3], "#D33038"); //red
        grd.addColorStop(values[4], "#FF9742"); //orange
        grd.addColorStop(values[5], "#ffd700"); //yellow
        grd.addColorStop(values[6], "#ffffff"); //white

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 100, 1);

        return ramp;
    }

    // var minHeight = -414.0; // approximate dead sea elevation
    // var maxHeight = 8777.0; // approximate everest elevation
    // var contourColor = Cesium.Color.RED.clone();
    // var contourUniforms = {};
    // var shadingUniforms = {};
    function _(viewer, options = {}) {
        let $this = this;
        if (viewer && viewer instanceof Cesium.Viewer) {
            this._basePath = options.basePath || ''
            this.minHeight = -414.0; // approximate dead sea elevation
            this.maxHeight = 8777.0; // approximate everest elevation
            this.contourColor = Cesium.Color.RED.clone();
            this.contourUniforms = {}
            this.shadingUniforms = {}
            this._viewer = viewer
            this.viewModel = {
                enableContour: false,
                contourSpacing: 150.0,
                contourWidth: 2.0,
                selectedShading: "elevation",
                changeColor: function () {
                    $this.contourUniforms.color = Cesium.Color.fromRandom(
                        { alpha: 1.0 },
                        $this.contourColor
                    );
                },
            };
        }
    }
    _.prototype = {
        updateMaterial: function (options = {}) {
            let $this = this;
            if (this._viewer && options && options.enabled) {
                var hasContour = $this.viewModel.enableContour;
                var selectedShading = $this.viewModel.selectedShading;
                var material;
                if (hasContour) {
                    if (selectedShading === "elevation") {
                        material = getElevationContourMaterial();
                        this.shadingUniforms =
                            material.materials.elevationRampMaterial.uniforms;
                        this.shadingUniforms.minimumHeight = this.minHeight;
                        this.shadingUniforms.maximumHeight = this.maxHeight;
                        this.contourUniforms = material.materials.contourMaterial.uniforms;
                    } else if (selectedShading === "slope") {
                        material = getSlopeContourMaterial();
                        this.shadingUniforms = material.materials.slopeRampMaterial.uniforms;
                        this.contourUniforms = material.materials.contourMaterial.uniforms;
                    } else if (selectedShading === "aspect") {
                        material = getAspectContourMaterial();
                        this.shadingUniforms = material.materials.aspectRampMaterial.uniforms;
                        this.contourUniforms = material.materials.contourMaterial.uniforms;
                    } else {
                        material = Cesium.Material.fromType("ElevationContour");
                        this.contourUniforms = material.uniforms;
                    }
                    this.contourUniforms.width = $this.viewModel.contourWidth;
                    this.contourUniforms.spacing = $this.viewModel.contourSpacing;
                    this.contourUniforms.color = this.contourColor;
                } else if (selectedShading === "elevation") {
                    material = Cesium.Material.fromType("ElevationRamp");
                    this.shadingUniforms = material.uniforms;
                    this.shadingUniforms.minimumHeight = this.minHeight;
                    this.shadingUniforms.maximumHeight = this.maxHeight;
                } else if (selectedShading === "slope") {
                    material = Cesium.Material.fromType("SlopeRamp");
                    this.shadingUniforms = material.uniforms;
                } else if (selectedShading === "aspect") {
                    material = Cesium.Material.fromType("AspectRamp");
                    this.shadingUniforms = material.uniforms;
                }
                if (selectedShading !== "none") {
                    this.shadingUniforms.image = getColorRamp(selectedShading);
                }

                this._viewer.scene.globe.material = material;
            } else {
                this._viewer.scene.globe.material = undefined;
            }
        },
        clearAll: function () {
            this._viewer.scene.globe.material = undefined;
        }
    }
    return _
})(Cesium);

