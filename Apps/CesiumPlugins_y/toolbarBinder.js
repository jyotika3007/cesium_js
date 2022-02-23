function bindToolbar(viewModel, elem, _cb) {
    Cesium.knockout.cleanNode(document.getElementById(elem));
    Cesium.knockout.track(viewModel);
    Cesium.knockout.applyBindings(viewModel, document.getElementById(elem));
    for (var name in viewModel) {
        if (viewModel.hasOwnProperty(name)) {
            Cesium.knockout
                .getObservable(viewModel, name)
                .subscribe(function () {
                    if (typeof _cb === "string") {
                        eval(_cb);
                    }else{
                        _cb
                    }
                });
        }
    }
}


function bindToolbarCb(viewModel, elem, _cb) {
    Cesium.knockout.cleanNode(document.getElementById(elem));
    Cesium.knockout.track(viewModel);
    Cesium.knockout.applyBindings(viewModel, document.getElementById(elem));
    for (var name in viewModel) {
        if (viewModel.hasOwnProperty(name)) {
            Cesium.knockout
                .getObservable(viewModel, name)
                .subscribe(function () {
                    if (typeof _cb == "string") {
                        eval(_cb);
                    };
                });
        }
    }
}

function bindToolbar2(eav, elem, _cb) {
    Cesium.knockout.cleanNode(document.getElementById(elem));
    Cesium.knockout.track(eav.viewModel);
    Cesium.knockout.applyBindings(eav.viewModel, document.getElementById(elem));
    Cesium.knockout
        .getObservable(eav.viewModel, "enableContour")
        .subscribe(function (newValue) {
            eval(_cb);
        });

    Cesium.knockout
        .getObservable(eav.viewModel, "contourWidth")
        .subscribe(function (newValue) {
            eav.contourUniforms.width = parseFloat(newValue);
        });

    Cesium.knockout
        .getObservable(eav.viewModel, "contourSpacing")
        .subscribe(function (newValue) {
            eav.contourUniforms.spacing = parseFloat(newValue);
        });

    Cesium.knockout
        .getObservable(eav.viewModel, "selectedShading")
        .subscribe(function (value) {
            eval(_cb);
        });

}


function bindToolbar3(eav, elem, _cb) {
    Cesium.knockout.cleanNode(document.getElementById(elem));
    Cesium.knockout.track(eav.viewModel);
    Cesium.knockout.applyBindings(eav.viewModel, document.getElementById(elem));

    function subscribeLayerParameter(nm) {
        Cesium.knockout
            .getObservable(eav.viewModel, nm)
            .subscribe(function (newValue) {
                if (eav.imageryLayers.length > 0) {
                    var layer = eav.imageryLayers.get(0);
                    layer[nm] = newValue;
                }
                eval(_cb);
            });
    }
    subscribeLayerParameter("brightness");
    subscribeLayerParameter("contrast");
    subscribeLayerParameter("hue");
    subscribeLayerParameter("saturation");
    subscribeLayerParameter("gamma");
    eav.imageryLayers.layerAdded.addEventListener(eav.updateMaterial);
    eav.imageryLayers.layerRemoved.addEventListener(eav.updateMaterial);
    eav.imageryLayers.layerMoved.addEventListener(eav.updateMaterial);
}