if (typeof Cesium !== 'undefined')
    /**
     * @author descrip
     * @param viewer {object} three-dimensional object
     * @param options {object} initialization parameters
     * @constructor
     */
    Cesium.ImageryAdjustment = (function (Cesium) {

        /**
         * Drawing objects
         * @param viewer
         * @param options
         * @constructor
         */
        // Make the active imagery layer a subscriber of the viewModel.
        // function subscribeLayerParameter($this, name) {
        //     Cesium.knockout
        //         .getObservable($this.viewModel, name)
        //         .subscribe(function (newValue) {
        //             if ($this.imageryLayers.length > 0) {
        //                 var layer = $this.imageryLayers.get(0);
        //                 layer[name] = newValue;
        //             }
        //         });
        // }

        function _(viewer, options = {}) {
            if (viewer && viewer instanceof Cesium.Viewer) {
                this._basePath = options.basePath || ''

                this._viewer = viewer
                this.imageryLayers = viewer.imageryLayers;
                this.viewModel = {
                    brightness: 1,
                    contrast: 1,
                    hue: 0,
                    saturation: 1,
                    gamma: 1
                };

                //subscribeLayerParameter($this, "brightness");
                //subscribeLayerParameter($this, "contrast");
                //subscribeLayerParameter($this, "hue");
                //subscribeLayerParameter($this, "saturation");
                //subscribeLayerParameter($this, "gamma");

                // this.imageryLayers.layerAdded.addEventListener(this.updateViewModel);
                // this.imageryLayers.layerRemoved.addEventListener(this.updateViewModel);
                // this.imageryLayers.layerMoved.addEventListener(this.updateViewModel);
            }
        }
        _.prototype = {
            updateMaterial: function (options = {}) {
                let $this = this;
                if (this._viewer && options && options.enabled) {
                    if (this.imageryLayers.length > 0) {
                        var layer = this.imageryLayers.get(0);
                        $this.viewModel.brightness = layer.brightness;
                        $this.viewModel.contrast = layer.contrast;
                        $this.viewModel.hue = layer.hue;
                        $this.viewModel.saturation = layer.saturation;
                        $this.viewModel.gamma = layer.gamma;
                    }
                } else {
                    $this.viewModel.brightness = 1;
                    $this.viewModel.contrast = 1;
                    $this.viewModel.hue = 0;
                    $this.viewModel.saturation = 1;
                    $this.viewModel.gamma = 1;
                }
            },
            clearAll: function () {
                this.viewModel.brightness = 1;
                this.viewModel.contrast = 1;
                this.viewModel.hue = 0;
                this.viewModel.saturation = 1;
                this.viewModel.gamma = 1;
            }
        }
        return _
    })(Cesium);