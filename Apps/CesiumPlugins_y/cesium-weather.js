if (typeof Cesium !== 'undefined')
    /**
     * @author descrip
     * @param viewer {object} three-dimensional object
     * @param options {object} initialization parameters
     * @constructor
     */
    Cesium.Weather = (function (Cesium) {

        /**
         * Drawing objects
         * @param viewer
         * @param options
         * @constructor
         */

        function _(viewer, options = {}) {
            if (viewer && viewer instanceof Cesium.Viewer) {
                let $this = this;
                this.weat = new Weather(viewer);
                this._basePath = options.basePath || '';
                this._viewer = viewer;
                this.cloudsLayer = new Cesium.CustomDataSource('cloudsLayer');
                viewer.dataSources.add(this.cloudsLayer);
                this.snowAudio = undefined;
                this.rainAudio = undefined;
                this.viewModal = {
                    sky_settings_enabled: false,
                    skyAtmosphere_hueShift: 0,
                    skyAtmosphere_saturationShift: 0,
                    skyAtmosphere_brightnessShift: 0,
                    sky_type: "default",
                    effective_height: 9000,
                    fog_density: 0.0002,
                    fog_minimumBrightness: 0.03,
                    fog_transparancy: 0.9,
                    fog_enabled: false,
                    fog_blackshed: false,
                    snow_enabled: false,
                    snow_sound: false,
                    // snowParticleSize: 6.0,

                    rain_enabled: false,
                    rain_sound: false,
                    // rainParticleSize: 6.0,

                    show_clouds: false,
                    ncloud: 100,
                    cloudZ: 300
                };
                this.viewModal1 = {
                    globelightening_enabled: false,
                    currhrs: 0,
                    currmins: 0,
                    currsecs: 0,
                    currtotsecs: 0,
                    isautotimer: true
                };
                $this.timeUpdater();
                /*
                this.snowRadius = 100000.0;
                this.minimumSnowImageSize = new Cesium.Cartesian2( //Snow particles
                    $this.viewModal.snowParticleSize,
                    $this.viewModal.snowParticleSize
                );
                this.maximumSnowImageSize = new Cesium.Cartesian2( // Snow particles
                    $this.viewModal.snowParticleSize * 2.0,
                    $this.viewModal.snowParticleSize * 2.0
                );

                this.rainRadius = 100000.0;
                this.rainImageSize = new Cesium.Cartesian2( // Rain particles
                    $this.viewModal.rainParticleSize,
                    $this.viewModal.rainParticleSize * 8.0
                );
                */
                //Fog Fragmentation Next Level
                this.fogPostProcessStages = undefined;
                this.fragmentShaderSource =
                    "float getDistance(sampler2D depthTexture, vec2 texCoords) \n" +
                    "{ \n" +
                    "    float depth = czm_unpackDepth(texture2D(depthTexture, texCoords)); \n" +
                    "    if (depth == 0.0) { \n" +
                    "        return czm_infinity; \n" +
                    "    } \n" +
                    "    vec4 eyeCoordinate = czm_windowToEyeCoordinates(gl_FragCoord.xy, depth); \n" +
                    "    return -eyeCoordinate.z / eyeCoordinate.w; \n" +
                    "} \n" +
                    "float interpolateByDistance(vec4 nearFarScalar, float distance) \n" +
                    "{ \n" +
                    "    float startDistance = nearFarScalar.x; \n" +
                    "    float startValue = nearFarScalar.y; \n" +
                    "    float endDistance = nearFarScalar.z; \n" +
                    "    float endValue = nearFarScalar.w; \n" +
                    "    float t = clamp((distance - startDistance) / (endDistance - startDistance), 0.0, 1.0); \n" +
                    "    return mix(startValue, endValue, t); \n" +
                    "} \n" +
                    "vec4 alphaBlend(vec4 sourceColor, vec4 destinationColor) \n" +
                    "{ \n" +
                    "    return sourceColor * vec4(sourceColor.aaa, 1.0) + destinationColor * (1.0 - sourceColor.a); \n" +
                    "} \n" +
                    "uniform sampler2D colorTexture; \n" +
                    "uniform sampler2D depthTexture; \n" +
                    "uniform vec4 fogByDistance; \n" +
                    "uniform vec4 fogColor; \n" +
                    "varying vec2 v_textureCoordinates; \n" +
                    "void main(void) \n" +
                    "{ \n" +
                    "    float distance = getDistance(depthTexture, v_textureCoordinates); \n" +
                    "    vec4 sceneColor = texture2D(colorTexture, v_textureCoordinates); \n" +
                    "    float blendAmount = interpolateByDistance(fogByDistance, distance); \n" +
                    "    vec4 finalFogColor = vec4(fogColor.rgb, fogColor.a * blendAmount); \n" +
                    "    gl_FragColor = alphaBlend(finalFogColor, sceneColor); \n" +
                    "} \n";


                this.defaultSkybox = viewer.scene.skyBox;
                this.currSkyBox = new Cesium.SkyBoxOnGround({
                    sources: Cesium.SkyBoxOnGround.DARK
                });

                this._viewer.scene.postRender.addEventListener(function () {
                    let e = $this._viewer.camera.position;
                    if ($this.viewModal.sky_type !== "default") {
                        if (Cesium.Cartographic.fromCartesian(e).height < $this.viewModal.effective_height) {
                            $this._viewer.scene.skyBox = $this.currSkyBox;
                            $this._viewer.scene.skyAtmosphere.show = false;
                        } else {
                            $this._viewer.scene.skyBox = $this.defaultSkybox;
                            $this._viewer.scene.skyAtmosphere.show = true;
                        }
                    } else {
                        $this._viewer.scene.skyBox = $this.defaultSkybox;
                        $this._viewer.scene.skyAtmosphere.show = true;
                    }
                });

            }


            /*
            this.snowGravityScratch = new Cesium.Cartesian3();

            function snowUpdate(particle, dt) {
                if (!$this.viewModal.snow_enabled) {
                    $this.snowSystem = undefined;
                    return;
                }

                $this.snowGravityScratch = Cesium.Cartesian3.normalize(
                    particle.position,
                    $this.snowGravityScratch
                );
                Cesium.Cartesian3.multiplyByScalar(
                    $this.snowGravityScratch,
                    Cesium.Math.randomBetween(-30.0, -300.0),
                    $this.snowGravityScratch
                );
                particle.velocity = Cesium.Cartesian3.add(
                    particle.velocity,
                    $this.snowGravityScratch,
                    particle.velocity
                );

                var distance = Cesium.Cartesian3.distance(
                    $this._viewer.scene.camera.position,
                    particle.position
                );
                if (distance > $this.snowRadius) {
                    particle.endColor.alpha = 0.0;
                } else {
                    particle.endColor.alpha =
                        $this.snowSystem.endColor.alpha / (distance / $this.snowRadius + 0.1);
                }
            }

            this.getsnowSystem = function () {
                $this._viewer.scene.skyAtmosphere.hueShift = -0.8;
                $this._viewer.scene.skyAtmosphere.saturationShift = -0.7;
                $this._viewer.scene.skyAtmosphere.brightnessShift = -0.33;

                $this._viewer.scene.fog.density = 0.001;
                $this._viewer.scene.fog.minimumBrightness = 0.8;

                return new Cesium.ParticleSystem({
                    modelMatrix: new Cesium.Matrix4.fromTranslation(
                        $this._viewer.scene.camera.position
                    ),
                    minimumSpeed: -1.0,
                    maximumSpeed: 0.0,
                    lifetime: 15.0,
                    emitter: new Cesium.SphereEmitter($this.snowRadius),
                    startScale: 0.5,
                    endScale: 1.0,
                    image: "SampleData/snowflake_particle.png",
                    emissionRate: 7000.0,
                    startColor: Cesium.Color.WHITE.withAlpha(0.0),
                    endColor: Cesium.Color.WHITE.withAlpha(1.0),
                    minimumImageSize: $this.minimumSnowImageSize,
                    maximumImageSize: $this.maximumSnowImageSize,
                    updateCallback: snowUpdate,
                });
            }

            this.rainGravityScratch = new Cesium.Cartesian3();

            function rainUpdate(particle, dt) {
                if (!$this.viewModal.rain_enabled) {
                    $this.rainSystem = undefined;
                    return;
                }

                $this.rainGravityScratch = Cesium.Cartesian3.normalize(
                    particle.position,
                    $this.rainGravityScratch
                );
                $this.rainGravityScratch = Cesium.Cartesian3.multiplyByScalar(
                    $this.rainGravityScratch,
                    -1050.0,
                    $this.rainGravityScratch
                );

                particle.position = Cesium.Cartesian3.add(
                    particle.position,
                    $this.rainGravityScratch,
                    particle.position
                );

                var distance = Cesium.Cartesian3.distance(
                    $this._viewer.scene.camera.position,
                    particle.position
                );
                if (distance > $this.rainRadius) {
                    particle.endColor.alpha = 0.0;
                } else {
                    particle.endColor.alpha =
                        $this.rainSystem.endColor.alpha / (distance / $this.rainRadius + 0.1);
                }
            }

            this.getrainSystem = function () {
                $this._viewer.scene.skyAtmosphere.hueShift = -0.97;
                $this._viewer.scene.skyAtmosphere.saturationShift = 0.25;
                $this._viewer.scene.skyAtmosphere.brightnessShift = -0.4;

                $this._viewer.scene.fog.density = 0.00025;
                $this._viewer.scene.fog.minimumBrightness = 0.01;

                return new Cesium.ParticleSystem({
                    modelMatrix: new Cesium.Matrix4.fromTranslation(
                        scene.camera.position
                    ),
                    speed: -1.0,
                    lifetime: 15.0,
                    emitter: new Cesium.SphereEmitter($this.rainRadius),
                    startScale: 1.0,
                    endScale: 0.0,
                    image: "SampleData/circular_particle.png",
                    emissionRate: 12000.0,
                    startColor: new Cesium.Color(0.8, 0.9, 0.9, 0.0),
                    endColor: new Cesium.Color(1.0, 1.0, 1.0, 0.80),
                    imageSize: $this.rainImageSize,
                    updateCallback: rainUpdate,
                });
            }
            */
        }


        _.prototype = {
            resetAll: function () {
                this.updateWeather();
            },
            resetCurrTime: function () {
                let $this = this;
                let cd = new Date();
                $this.viewModal1.currhrs = cd.getHours();
                $this.viewModal1.currmins = cd.getMinutes();
                $this.viewModal1.currsecs = cd.getSeconds();
                $this._viewer.clock.currentTime.secondsOfDay = (cd.getHours() * 3600) + (cd.getMinutes() * 60) + cd.getSeconds();
            },
            timeUpdater: function () {
                var $this = this;
                setInterval(() => {
                    if ($this.viewModal1.isautotimer) {
                        let cd = new Date();
                        $this.viewModal1.currhrs = cd.getHours();
                        $this.viewModal1.currmins = cd.getMinutes();
                        $this.viewModal1.currsecs = cd.getSeconds();
                        $this.viewModal1.currtotsecs = (cd.getHours() * 3600) + (cd.getMinutes() * 60) + cd.getSeconds();
                    }
                }, 1000);
            },
            updateTimer: function () {
                let $this = this;
                if ($this._viewer.scene.globe.enableLighting !== $this.viewModal1.globelightening_enabled) {
                    $this._viewer.scene.globe.enableLighting = $this.viewModal1.globelightening_enabled
                }
                if (!$this.viewModal1.isautotimer) {
                    $this.viewModal1.currtotsecs = ($this.viewModal1.currhrs * 3600) + ($this.viewModal1.currmins * 60) + $this.viewModal1.currsecs;
                    $this._viewer.clock.currentTime.secondsOfDay = $this.viewModal1.currtotsecs;
                } else {
                    let cd = new Date();
                    $this.viewModal1.currhrs = cd.getHours();
                    $this.viewModal1.currmins = cd.getMinutes();
                    $this.viewModal1.currsecs = cd.getSeconds();
                    $this.viewModal1.currtotsecs = (cd.getHours() * 3600) + (cd.getMinutes() * 60) + cd.getSeconds();
                    $this._viewer.clock.currentTime.secondsOfDay = $this.viewModal1.currtotsecs;
                }
            },
            playSnowAudio: function (audiofile) {
                let $this = this;
                if ($this.snowAudio === undefined) {
                    $this.snowAudio = new Audio(audiofile);
                    $this.snowAudio.addEventListener('timeupdate', function () {
                        var buffer = .44
                        if (this.currentTime > this.duration - buffer) {
                            this.currentTime = 0
                            this.play()
                        }
                    });
                }
                $this.snowAudio.play();
            },
            playRainAudio: function (audiofile) {
                let $this = this;
                if ($this.rainAudio === undefined) {
                    $this.rainAudio = new Audio(audiofile);
                    $this.rainAudio.addEventListener('timeupdate', function () {
                        var buffer = .44
                        if (this.currentTime > this.duration - buffer) {
                            this.currentTime = 0
                            this.play()
                        }
                    });
                }
                $this.rainAudio.play();
            },

            updateWeather: function () {
                let $this = this;
                if (this._viewer) {
                    if ($this.viewModal.fog_enabled) {
                        if ($this.fogPostProcessStages !== undefined) {
                            $this._viewer.scene.postProcessStages.remove(
                                $this.fogPostProcessStages
                            );
                            $this.fogPostProcessStages = undefined;
                        }
                        $this.fogPostProcessStages = new Cesium.PostProcessStage({
                            fragmentShader: $this.fragmentShaderSource,
                            uniforms: {
                                fogByDistance: new Cesium.Cartesian4(10, 0.0, 200, Number($this.viewModal.fog_transparancy)),
                                fogColor: $this.viewModal.fog_blackshed ? Cesium.Color.BLACK : Cesium.Color.GRAY,
                            }
                        });
                        $this._viewer.scene.postProcessStages.add(
                            $this.fogPostProcessStages
                        );
                    } else {
                        $this._viewer.scene.postProcessStages.remove(
                            $this.fogPostProcessStages
                        );
                        $this.fogPostProcessStages = undefined;
                    }

                    $this.weat.showSnowWeather($this.viewModal.snow_enabled)
                    $this.weat.showRainWeather($this.viewModal.rain_enabled)
                    if ($this.viewModal.rain_enabled && $this.viewModal.rain_sound) {
                        $this.playRainAudio('CesiumPlugins/sounds/rain1.mp3');
                    } else {
                        if ($this.rainAudio !== undefined) {
                            $this.rainAudio.pause();
                        }
                    }
                    if ($this.viewModal.snow_enabled && $this.viewModal.snow_sound) {
                        $this.playSnowAudio('CesiumPlugins/sounds/snow1.mp3');
                    } else {
                        if ($this.snowAudio !== undefined) {
                            $this.snowAudio.pause();
                        }
                    }

                    if ($this.viewModal.sky_settings_enabled) {
                        switch ($this.viewModal.sky_type) {
                            case "default":
                                break;
                            case "dusk":
                                $this.currSkyBox = new Cesium.SkyBoxOnGround({
                                    sources: Cesium.SkyBoxOnGround.DUSK
                                });
                                break;
                            case "dark":
                                $this.currSkyBox = new Cesium.SkyBoxOnGround({
                                    sources: Cesium.SkyBoxOnGround.DARK
                                });
                                break;
                            case "sunny":
                                $this.currSkyBox = new Cesium.SkyBoxOnGround({
                                    sources: Cesium.SkyBoxOnGround.SUNNY
                                });
                                break;
                            case "stars":
                                $this.currSkyBox = new Cesium.SkyBoxOnGround({
                                    sources: Cesium.SkyBoxOnGround.STAR
                                });
                                break;
                            case "sunset":
                                $this.currSkyBox = new Cesium.SkyBoxOnGround({
                                    sources: Cesium.SkyBoxOnGround.SUNSET
                                });
                                break;
                            case "clouds":
                                $this.currSkyBox = new Cesium.SkyBoxOnGround({
                                    sources: Cesium.SkyBoxOnGround.CLOUDS
                                });
                                break;
                        }
                    } else {
                        $this.viewModal.sky_type = "default";
                    }


                    // if ($this.viewModal.rain_enabled) {
                    // }

                    /*
                    $this.minimumSnowImageSize = new Cesium.Cartesian2(
                        $this.viewModal.snowParticleSize,
                        $this.viewModal.snowParticleSize
                    );
                    $this.maximumSnowImageSize = new Cesium.Cartesian2(
                        $this.viewModal.snowParticleSize * 2.0,
                        $this.viewModal.snowParticleSize * 2.0
                    );

                    
                    if ($this.viewModal.snow_enabled) {
                        if ($this.snowSystem !== undefined) {
                            $this.snowSystem.show = false;
                            $this._viewer.scene.primitives.remove($this.snowSystem);
                            $this.snowSystem = undefined;
                        }
                        $this.snowSystem = $this.getsnowSystem();
                        $this.snowSystem.show = true;
                        $this._viewer.scene.primitives.add($this.snowSystem);

                        if ($this.viewModal.snow_sound) {
                            $this.playSnowAudio('CesiumPlugins/sounds/snow1.mp3');
                        } else {
                            if ($this.snowAudio !== undefined) {
                                $this.snowAudio.pause();
                            }
                        }
                    } else {
                        if ($this.snowSystem !== undefined) {
                            $this.snowSystem.show = false;
                            $this.snowSystem = undefined;
                        }
                        if ($this.snowAudio !== undefined) {
                            $this.snowAudio.pause();
                        }
                        $this._viewer.scene.skyAtmosphere.hueShift = 0;
                        $this._viewer.scene.skyAtmosphere.saturationShift = 0;
                        $this._viewer.scene.skyAtmosphere.brightnessShift = 0;

                        $this._viewer.scene.fog.density = 0;
                        $this._viewer.scene.fog.minimumBrightness = 0;
                        $this._viewer.scene.primitives.remove($this.snowSystem);
                        if ($this.snowAudio !== undefined) {
                            $this.snowAudio.pause();
                        }
                    }

                    if ($this.viewModal.rain_enabled) {
                        if ($this.rainSystem !== undefined) {
                            $this.rainSystem.show = false;
                            $this._viewer.scene.primitives.remove($this.rainSystem);
                            $this.rainSystem = undefined;
                        }
                        $this.rainSystem = $this.getrainSystem();
                        $this.rainSystem.show = true;
                        $this._viewer.scene.primitives.add($this.rainSystem);

                        if ($this.viewModal.rain_sound) {
                            $this.playRainAudio('CesiumPlugins/sounds/rain1.mp3');
                        } else {
                            if ($this.rainAudio !== undefined) {
                                $this.rainAudio.pause();
                            }
                        }
                    } else {
                        if ($this.rainSystem !== undefined) {
                            $this.rainSystem.show = false;
                            $this.rainSystem.show = undefined;
                        }
                        if ($this.rainAudio !== undefined) {
                            $this.rainAudio.pause();
                        }
                        $this._viewer.scene.skyAtmosphere.hueShift = 0;
                        $this._viewer.scene.skyAtmosphere.saturationShift = 0;
                        $this._viewer.scene.skyAtmosphere.brightnessShift = 0;

                        $this._viewer.scene.fog.density = 0;
                        $this._viewer.scene.fog.minimumBrightness = 0;
                        $this._viewer.scene.primitives.remove($this.rainSystem);
                        if ($this.rainSystem !== undefined) {
                            $this.rainSystem.show = false;
                        }

                    }
                    */
                    if ($this.viewModal.sky_settings_enabled) { //Keep these lines in the last
                        $this._viewer.scene.skyAtmosphere.hueShift = Number($this.viewModal.skyAtmosphere_hueShift);
                        $this._viewer.scene.skyAtmosphere.saturationShift = Number($this.viewModal.skyAtmosphere_saturationShift);
                        $this._viewer.scene.skyAtmosphere.brightnessShift = Number($this.viewModal.skyAtmosphere_brightnessShift);
                        $this._viewer.scene.fog.density = Number($this.viewModal.fog_density);
                        $this._viewer.scene.fog.minimumBrightness = Number($this.viewModal.fog_minimumBrightness);
                    }

                    if ($this.viewModal.show_clouds) {
                        $this.addClouds();
                    } else {
                        $this.clearClouds();
                    }
                }
            },
            addClouds: function () {
                this.clearClouds();
                let $this = this;
                for (var c = 0; c < Math.floor($this.viewModal.ncloud / 100); c++) {
                    let cloudX = 0,
                        cloudY = 0,
                        cloud = [],
                        cloudx = [],
                        cloudy = [],
                        cloudz = [],
                        cloudsc = [],
                        icloud = [];
                    let campos = Cesium.Cartographic.fromCartesian($this._viewer.scene.camera.position);
                    cloudX = Cesium.Math.toDegrees(campos.longitude),
                        cloudY = Cesium.Math.toDegrees(campos.latitude);

                    for (var i = 0; i < $this.viewModal.ncloud; i++) {
                        icloud[i] = i;
                        var dymax = 28 * 360 / 40000;
                        cloudx[i] = cloudX + (Math.random() - 0.5) * 2 * dymax;
                        cloudy[i] = cloudY + (Math.random() - 0.5) * 2 * dymax;
                        cloudz[i] = $this.viewModal.cloudZ / 2 + (Math.random() - 0.2) * 2 * 800;
                        var sc = 0.14 * (2 + Math.random()); //if(Math.random()<0.3){sc=-sc;}
                        cloudsc[i] = sc;
                        var alpha = 1;
                        //var dist=(Math.abs(cloudx[i]-x)/klon+Math.abs(cloudy[i]-y))*40000/360;
                        cloud[i] = $this.cloudsLayer.entities.add({
                            position: new Cesium.Cartesian3.fromDegrees(cloudx[i], cloudy[i], cloudz[i]),
                            billboard: {
                                //eyeOffset : new Cesium.Cartesian3(0,0,i*0.3),
                                //verticalOrigin : Cesium.VerticalOrigin.BOTTOM, // default: CENTER
                                scale: sc,
                                color: new Cesium.Color(1, 1, 1, alpha),
                                image: cloudpng,
                                width: Math.floor(Math.random() * 600) + 300
                            }
                        });
                        cloud[i].myposition = new Cesium.Cartesian3.fromDegrees(cloudx[i], cloudy[i], cloudz[i]);
                    }
                }

            },
            clearClouds: function () {
                this.cloudsLayer.entities.removeAll();
            }
        }
        return _
    })(Cesium);