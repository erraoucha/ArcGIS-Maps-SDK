require(["esri/config", "esri/Map", "esri/views/MapView", "esri/widgets/BasemapToggle", "esri/widgets/BasemapGallery", "esri/layers/FeatureLayer", "esri/widgets/Legend", "esri/widgets/Search"], function (esriConfig, Map, MapView, BasemapToggle, BasemapGallery, FeatureLayer, Legend, Search) {


    esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurGzaVX84y0gnQrzOsoa5XiQ-JsGtCnEBLMNN9H5DVjP2wh-bnv-hOt5VbphcP4IUXlFNDV3qVO2etTKHogYwCBSa2VOACsQwGaEaLTWBzlVQ_Ajiat4BImzNL8w5IG1i4nKIOhtKD-dcLdvAMDVxAaXei_7KhoNy2JdYq43KoIHmI54FBrDUTBmA5Pf5elbwnaljbM4_bH2cn2aQmsAJpOk.AT1_1tr0X9F6";
    const map = new Map({
        basemap: "arcgis-topographic" // Basemap layer service
    });
    const view = new MapView({
        map: map,
        center: [-7.62, 33.59], // Longitude, latitude
        zoom: 10, // Zoom level
        container: "viewDiv" // Div element
    });

    let legend = new Legend({
        view: view
    });

    view.ui.add(legend, "bottom-right");

    const searchWidget = new Search({
        view: view
    });
    // Adds the search widget below other elements in
    // the top left corner of the view
    view.ui.add(searchWidget, {
        position: "top-left",
        index: 2
    });

    // let basemapToggle = new BasemapToggle({
    //     view: view,
    //     nextBasemap: "hybrid"
    // });

    // view.ui.add(basemapToggle, "bottom-right");

    document.getElementById("myButton").addEventListener("click", showBasemapGallery);

    let isMapShown = false;
    let basemapGallery;

    function showBasemapGallery() {

        if (!isMapShown) {

            basemapGallery = new BasemapGallery({
                view: view
            });

            // Add widget to the top right corner of the view
            view.ui.add(basemapGallery, {
                position: "top-right"
            });
            document.getElementById("myButton").textContent = "Hide Basemap Gallery";
            isMapShown = true;
        }



        else {
            view.ui.remove(basemapGallery);
            document.getElementById("myButton").textContent = "Basemap Gallery";
            isMapShown = false;
        }
    }


    // Création d'un rendu pour les communes
    const commRenderer = {
        type: "simple",
        symbol: {
            type: "simple-fill",
            color: [255, 165, 0, 0.5], // Orange clair avec 50% d'opacité
            outline: { width: 0.8, color: "black" }
        }
    };



    const communeLayer = new FeatureLayer({
        url: "https://services5.arcgis.com/D6UE8F2zye9hxeWo/arcgis/rest/services/Communes/FeatureServer",
        renderer: commRenderer
    });



    const roadRenderer = {
        type: "simple",
        symbol: {
            type: "simple-line",
            color: [50, 50, 50], // Gris foncé
            width: 2
        }
    };

    const roadLayer = new FeatureLayer({
        url: "https://services5.arcgis.com/D6UE8F2zye9hxeWo/arcgis/rest/services/voirie_casa_1/FeatureServer",
        renderer: roadRenderer
    });


    // Création d'un rendu pour la population
    const popRenderer = {
        type: "simple",
        symbol: {
            type: "simple-marker",
            size: 8,
            color: [255, 0, 0, 0.8], // Rouge vif avec 80% d'opacité
            outline: { width: 1, color: "white" }
        }
    };
    
    const populationLayer = new FeatureLayer({
        url: "https://services5.arcgis.com/D6UE8F2zye9hxeWo/arcgis/rest/services/casa_population1/FeatureServer",
        renderer: popRenderer
    });

    const HotelLayer = new FeatureLayer({
        url: "https://services5.arcgis.com/D6UE8F2zye9hxeWo/arcgis/rest/services/Hotels_wgs/FeatureServer",
        renderer: {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: {
                type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                size: 6,
                color: "blue",
                outline: { // autocasts as new SimpleLineSymbol()
                    width: 0.5,
                    color: "white"
                }
            }
        }
    });

    const GrandSurfaceLayer = new FeatureLayer({
        url: "https://services5.arcgis.com/D6UE8F2zye9hxeWo/arcgis/rest/services/Grande_surface_wgs/FeatureServer",
        renderer: {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: {
                type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                size: 6,
                color: "green",
                outline: { // autocasts as new SimpleLineSymbol()
                    width: 0.5,
                    color: "white"
                }
            }
        }
    });

    const ReclamationLayer = new FeatureLayer({
        url: "https://services5.arcgis.com/D6UE8F2zye9hxeWo/arcgis/rest/services/Reclamation_wgs/FeatureServer",
        renderer: {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: {
                type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                size: 6,
                color: "yellow",
                outline: { // autocasts as new SimpleLineSymbol()
                    width: 0.5,
                    color: "white"
                }
            }
        }
    });






    // Ajout des couches à la carte
    map.add(communeLayer);
    map.add(roadLayer);
    map.add(populationLayer);
    map.add(HotelLayer);
    map.add(GrandSurfaceLayer);
    map.add(ReclamationLayer);



});