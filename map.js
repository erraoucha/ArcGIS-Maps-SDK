require([
  "esri/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/widgets/BasemapToggle",
  "esri/widgets/BasemapGallery",
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend",
  "esri/widgets/LayerList",
  "esri/widgets/Search",
  "esri/PopupTemplate",
  "esri/rest/support/Query",
  "esri/renderers/ClassBreaksRenderer",
  "esri/symbols/SimpleFillSymbol",
  "esri/renderers/UniqueValueRenderer",
  "esri/widgets/Expand",
  "esri/renderers/ClassBreaksRenderer",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/renderers/PieChartRenderer",
  "esri/renderers/SimpleRenderer",
  "esri/widgets/Editor",
  "esri/widgets/FeatureTable",
  "esri/widgets/CoordinateConversion",
  "esri/core/promiseUtils",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/widgets/Sketch/SketchViewModel"
], function (
  esriConfig, Map, MapView, BasemapToggle, BasemapGallery, FeatureLayer,
  Legend, LayerList, Search, PopupTemplate, Query, ClassBreaksRenderer,
  SimpleFillSymbol, UniqueValueRenderer, Expand, ClassBreaksRenderer, SimpleMarkerSymbol, PieChartRenderer, SimpleRenderer, Editor, FeatureTable, CoordinateConversion, promiseUtils, GraphicsLayer, Graphic, SketchViewModel
) {

  esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurGzaVX84y0gnQrzOsoa5XiSQHbukiFgglmw4Hinz6JSvU_kZn3I5OjPKvUb9k0UJm0FQJFUeSpF1_M9lgJu_XEkt0ivAB0Vi0I1fEdM0hqMQTjmIA6ZDdX2MWl0YkdyTMIJEZQEUBUmu2eHfWm1X28jjmHKuwV66jhxdf3st1EpzRjisiR-gfmP9CnRbCwBJfsTzukzODhYq8xzM-dFcKx0.AT1_1tr0X9F6";

  const map = new Map({
    basemap: "arcgis-topographic"
  });

  const view = new MapView({
    map: map,
    center: [-7.62, 33.59],
    zoom: 10,
    container: "viewDiv"
  });

  let legend = new Legend({ view: view });
  view.ui.add(legend, "bottom-right");

  const searchWidget = new Search({ view: view });
  view.ui.add(searchWidget, { position: "top-left", index: 2 });

  const layerList = new LayerList({ view: view });
  view.ui.add(layerList, { position: "bottom-right" });

  document.getElementById("myButton").addEventListener("click", showBaseMapGallery);

  let isMapShown = false;
  let basemapGallery;

  function showBaseMapGallery() {

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

  // Couche des communes
  const communesLayer = new FeatureLayer({
    url: "https://services5.arcgis.com/D6UE8F2zye9hxeWo/arcgis/rest/services/Communes/FeatureServer",
    outFields: ["PREFECTURE", "COMMUNE_AR", "Shape_Area"],
    popupTemplate: new PopupTemplate({
      title: "<b>Commune: {COMMUNE_AR}</b>",
      content: "<p>PREFECTURE : {PREFECTURE}</p>" +
        "<p>Communes : {COMMUNE_AR}</p>" +
        "<p>Surface : {Shape_Area}</p>"
    })
  });

  // Renderer pour les surfaces
  const surfaceRenderer = new ClassBreaksRenderer({
    field: "Shape_Area",
    legendOptions: { title: "Surface des communes" },
    defaultSymbol: new SimpleFillSymbol({
      color: [200, 200, 200, 0.5],
      outline: { width: 0.5, color: [100, 100, 100, 0.8] }
    }),
    classBreakInfos: [
      {
        minValue: 0,
        maxValue: 10000000,
        symbol: new SimpleFillSymbol({
          color: [198, 255, 221, 0.7],
          outline: {
            width: 0.5,
            color: [100, 100, 100, 0.8]
          }
        }),
        label: "Très petite (< 10 km²)"
      },
      {
        minValue: 10000000,
        maxValue: 20000000,
        symbol: new SimpleFillSymbol({
          color: [154, 219, 217, 0.7],
          outline: {
            width: 0.5,
            color: [100, 100, 100, 0.8]
          }
        }),
        label: "Petite (10-20 km²)"
      },
      {
        minValue: 20000000,
        maxValue: 30000000,
        symbol: new SimpleFillSymbol({
          color: [106, 173, 209, 0.7],
          outline: {
            width: 0.5,
            color: [100, 100, 100, 0.8]
          }
        }),
        label: "Moyenne (20-30 km²)"
      },
      {
        minValue: 30000000,
        maxValue: 40000000,
        symbol: new SimpleFillSymbol({
          color: [75, 126, 193, 0.7],
          outline: {
            width: 0.5,
            color: [100, 100, 100, 0.8]
          }
        }),
        label: "Grande (30-40 km²)"
      },
      {
        minValue: 40000000,
        maxValue: 1000000000,
        symbol: new SimpleFillSymbol({
          color: [50, 77, 168, 0.7],
          outline: {
            width: 0.5,
            color: [100, 100, 100, 0.8]
          }
        }),
        label: "Très grande (> 40 km²)"
      }]
  });

  // Fonction de style pour les filtres
  function applyStyleToFilteredFeatures(prefecture, commune, surface) {
    let symbolColor;
    let legendTitle;

    if (prefecture) {
      symbolColor = [255, 140, 0, 0.7];
      legendTitle = `Communes de: ${prefecture}`;
    } else if (commune) {
      symbolColor = [255, 105, 180, 0.7];
      legendTitle = `Commune contenant: ${commune}`;
    } else if (surface) {
      symbolColor = [75, 0, 130, 0.7];
      switch (surface) {
        case "1": legendTitle = "Communes très petites (< 10 km²)"; break;
        case "2": legendTitle = "Communes petites (10-20 km²)"; break;
        case "3": legendTitle = "Communes moyennes (20-30 km²)"; break;
        case "4": legendTitle = "Communes grandes (30-40 km²)"; break;
        case "5": legendTitle = "Communes très grandes (> 40 km²)"; break;
      }
    } else {
      communesLayer.renderer = surfaceRenderer;
      return;
    }

    communesLayer.renderer = {
      type: "simple",
      symbol: new SimpleFillSymbol({
        color: symbolColor,
        outline: { width: 1.5, color: [0, 0, 0, 0.8] }
      }),
      label: "Communes filtrées",
      visualVariables: [{
        type: "opacity",
        field: "Shape_Area",
        stops: [
          { value: 0, opacity: 0.7 },
          { value: 50000000, opacity: 0.9 }
        ]
      }]
    };

    legend.layerInfos = [{ layer: communesLayer, title: legendTitle }];
  }

  // Boutons de contrôle des renderers
  const surfaceRendererButton = document.createElement("button");
  surfaceRendererButton.className = "esri-widget esri-button";
  surfaceRendererButton.textContent = "Visualiser par surface";
  surfaceRendererButton.addEventListener("click", () => communesLayer.renderer = surfaceRenderer);

  const prefectureRendererButton = document.createElement("button");
  prefectureRendererButton.className = "esri-widget esri-button";
  prefectureRendererButton.textContent = "Visualiser par préfecture";
  prefectureRendererButton.addEventListener("click", () => {
    communesLayer.renderer = new UniqueValueRenderer({
      field: "PREFECTURE",
      defaultSymbol: new SimpleFillSymbol({
        color: [200, 200, 200, 0.6],
        outline: { width: 0.5, color: [100, 100, 100, 0.8] }
      }),
      uniqueValueInfos: [
        {
          value: "PREFECTURE DE CASABLANCA",
          symbol: {
            type: "simple-fill",
            color: [255, 0, 0, 0.6], // Rouge
            outline: { width: 0.5, color: [100, 100, 100, 0.8] }
          }
        },
        {
          value: "PREFECTURE DE MOHAMMEDIA",
          symbol: {
            type: "simple-fill",
            color: [0, 0, 255, 0.6], // Bleu
            outline: { width: 0.5, color: [100, 100, 100, 0.8] }
          }
        },
        {
          value: "PROVINCE DE BEN SLIMANE",
          symbol: {
            type: "simple-fill",
            color: [255, 165, 0, 0.6], // Orange
            outline: { width: 0.5, color: [100, 100, 100, 0.8] }
          }
        },
        {
          value: "PROVINCE DE MEDIOUNA",
          symbol: {
            type: "simple-fill",
            color: [128, 0, 128, 0.6], // Violet
            outline: { width: 0.5, color: [100, 100, 100, 0.8] }
          }
        },
        {
          value: "PROVINCE DE NOUACEUR",
          symbol: {
            type: "simple-fill",
            color: [34, 139, 34, 0.6], // Vert foncé
            outline: { width: 0.5, color: [100, 100, 100, 0.8] }
          }
        }
      ],
      legendOptions: { title: "Préfectures" }
    });
  });

  // Conteneur des contrôles
  const rendererContainer = document.createElement("div");
  rendererContainer.className = "esri-widget";
  rendererContainer.style.padding = "5px";
  rendererContainer.append(
    surfaceRendererButton, document.createElement("br"),
    prefectureRendererButton
  );

  view.ui.add(
    new Expand({
      view: view,
      content: rendererContainer,
      expanded: false,
      expandIconClass: "esri-icon-visible",
      expandTooltip: "Styles de visualisation"
    }),
    "top-left"
  );

  // Déclaration préalable des symboles
  function createPopulationSymbol(color) {
    return new SimpleMarkerSymbol({
      size: 10,
      color: color,
      outline: { width: 0.5, color: "white" }
    });
  }

  // Déclaration des renderers avant utilisation
  const pop1994Renderer = new ClassBreaksRenderer({
    field: "TOTAL1994",
    classificationMethod: "natural-breaks",
    classBreakInfos: [
      { minValue: 0, maxValue: 50000, symbol: createPopulationSymbol([255, 255, 204]) },
      { minValue: 50000, maxValue: 100000, symbol: createPopulationSymbol([255, 237, 160]) },
      { minValue: 100000, maxValue: 150000, symbol: createPopulationSymbol([254, 217, 118]) },
      { minValue: 150000, maxValue: 200000, symbol: createPopulationSymbol([254, 178, 76]) },
      { minValue: 200000, maxValue: 300000, symbol: createPopulationSymbol([253, 141, 60]) }
    ],
    legendOptions: { title: "Population 1994 (5 classes)" }
  });

  const pop2004Renderer = new ClassBreaksRenderer({
    field: "TOTAL2004",
    classificationMethod: "natural-breaks",
    classBreakInfos: [
      { minValue: 0, maxValue: 100000, symbol: createPopulationSymbol([237, 248, 233]) },
      { minValue: 100000, maxValue: 200000, symbol: createPopulationSymbol([199, 233, 192]) },
      { minValue: 200000, maxValue: 300000, symbol: createPopulationSymbol([161, 217, 155]) },
      { minValue: 300000, maxValue: 400000, symbol: createPopulationSymbol([116, 196, 118]) },
      { minValue: 400000, maxValue: 500000, symbol: createPopulationSymbol([49, 163, 84]) }
    ],
    legendOptions: { title: "Population 2004 (5 classes)" }
  });

  // Renderer par défaut avec diagrammes
  const popDefaultRenderer = {
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
  };

  // PopupTemplate amélioré pour la comparaison
  const popupPopulation = new PopupTemplate({
    title: "<b>Population de : {ARRONDISSE}</b>",
    content: [{
      type: "media",
      mediaInfos: [{
        type: "column-chart",
        caption: "Évolution démographique (1994 vs 2004)",
        value: {
          fields: ["TOTAL1994", "TOTAL2004"],
          tooltipField: "Valeur (habitants)",
          normalizeField: null
        },
        series: [
          { valueField: "TOTAL1994", label: "1994", color: "#1f77b4" },
          { valueField: "TOTAL2004", label: "2004", color: "#ff7f0e" }
        ]
      }]
    }]
  });

  // Création de la couche population avec le renderer par défaut
  const populationLayer = new FeatureLayer({
    url: "https://services5.arcgis.com/D6UE8F2zye9hxeWo/arcgis/rest/services/casa_population1/FeatureServer",
    outFields: ["*"],
    popupTemplate: popupPopulation,
    renderer: popDefaultRenderer
  });

  // Gestion des boutons de contrôle
  const pop1994Button = document.createElement("button");
  pop1994Button.className = "esri-widget esri-button";
  pop1994Button.textContent = "Population 1994";
  pop1994Button.addEventListener("click", () => {
    populationLayer.renderer = pop1994Renderer;
    populationLayer.popupTemplate = null;
  });

  const pop2004Button = document.createElement("button");
  pop2004Button.className = "esri-widget esri-button";
  pop2004Button.textContent = "Population 2004";
  pop2004Button.addEventListener("click", () => {
    populationLayer.renderer = pop2004Renderer;
    populationLayer.popupTemplate = null;
  });

  const popCompareButton = document.createElement("button");
  popCompareButton.className = "esri-widget esri-button";
  popCompareButton.textContent = "Comparaison 1994/2004";
  popCompareButton.addEventListener("click", () => {
    populationLayer.renderer = {
      type: "pie-chart", // autocasts as new PieChartRenderer()
      attributes: [{
        field: "TOTAL2004",
        label: "Population 2004",
        color: "red"
      }, {
        field: "TOTAL1994",
        label: "Population 1994",
        color: "blue"
      }]
    };
    populationLayer.popupTemplate = popupPopulation;
  });

  // Intégration dans l'interface
  const popControls = document.createElement("div");
  popControls.className = "esri-widget";
  popControls.style.padding = "5px";
  popControls.append(
    pop1994Button,
    document.createElement("br"),
    pop2004Button,
    document.createElement("br"),
    popCompareButton
  );

  view.ui.add(
    new Expand({
      view: view,
      content: popControls,
      expanded: false,
      expandIconClass: "esri-icon-chart",
      expandTooltip: "Visualisation démographique"
    }),
    "top-left"
  );



  const roadRenderer = {
    type: "simple",
    symbol: {
      type: "simple-line",
      color: [50, 50, 50], // Gris foncé
      width: 2
    }
  };

  var popupVoirie = new PopupTemplate({
    title: "Voirie de Casablanca",
    content: [{
      type: "fields",
      fieldInfos: [
        {
          "fieldName": "NOM",
          "label": "",
          "isEditable": true,
          "tooltip": "",
          "visible": true,
          "format": null,
          "stringFieldOption": "text-box"
        },
        {
          "fieldName": "LENGTH",
          "label": "Longueur",
          "isEditable": true,
          "tooltip": "",
          "visible": true,
          "format": {
            "places": 1,
            "digitSeparator": true
          },
          "stringFieldOption": "text-box"
        },
      ]
    }]
  });

  const roadLayer = new FeatureLayer({
    url: "https://services5.arcgis.com/D6UE8F2zye9hxeWo/arcgis/rest/services/voirie_casa_1/FeatureServer",
    popupTemplate: popupVoirie,
    renderer: roadRenderer
  });

  var popupHotel = new PopupTemplate({
    title: "Hotels de Casablanca",
    content: [{
      type: "fields",
      fieldInfos: [
        {
          "fieldName": "HOTEL",
          "label": "",
          "isEditable": true,
          "tooltip": "",
          "visible": true,
          "format": null,
          "stringFieldOption": "text-box"
        },
        {
          "fieldName": "ADRESSE",
          "label": "",
          "isEditable": true,
          "tooltip": "",
          "visible": true,
          "format": {
            "places": 1,
            "digitSeparator": true
          }, "stringFieldOption": "text-box"
        },
        {
          "fieldName": "CATÉGORIE",
          "label": "Gatégorie",
          "isEditable": true,
          "tooltip": "",
          "visible": true,
          "format": {
            "places": 1,
            "digitSeparator": true
          },
          "stringFieldOption": "text-box"
        },
      ]
    }]
  });

  const HotelLayer = new FeatureLayer({
    url: "https://services5.arcgis.com/D6UE8F2zye9hxeWo/arcgis/rest/services/Hotels_wgs/FeatureServer",
    renderer: {
      type: "simple", // autocasts as new SimpleRenderer()
      symbol: {
        type: "picture-marker", // Icône personnalisé
        url: "assests/icons8-hotel-48.png", // Remplace par l'URL de ton icône
        width: "20px", // Largeur de l'icône
        height: "20px" // Hauteur de l'icône
      }
    },
    popupTemplate: popupHotel
  });


  var popupGrandeSurface = new PopupTemplate({
    title: "<b>Grande Surface</b>",
    content: "<p> Adresse : {Adresse} </p>" +
      "<p> Type : {Type} </p>"
  });

  const GrandSurfaceLayer = new FeatureLayer({
    url: "https://services5.arcgis.com/D6UE8F2zye9hxeWo/arcgis/rest/services/Grande_surface_wgs/FeatureServer",
    renderer: {
      type: "simple", // autocasts as new SimpleRenderer()
      symbol: {
        type: "picture-marker", // Icône personnalisé
        url: "assests/icons8-grocery-store-48.png", // Remplace par l'URL de ton icône
        width: "17px", // Largeur de l'icône
        height: "17px" // Hauteur de l'icône
      }
    },
    popupTemplate: popupGrandeSurface
  });

  // Configuration de la couche Réclamations
  const ReclamationLayer = new FeatureLayer({
    url: "https://services5.arcgis.com/D6UE8F2zye9hxeWo/arcgis/rest/services/Reclamation_wgs/FeatureServer",
    outFields: ["Objet", "Message", "Mail"],
    renderer: {
      type: "simple",
      symbol: {
        type: "picture-marker",
        url: "assests/icons8-complaint-48.png",
        width: "17px",
        height: "17px"
      },
    },
    popupTemplate: new PopupTemplate({
      title: "Réclamation #{OBJECTID}",
      content: [{
        type: "fields",
        fieldInfos: [
          { fieldName: "Objet", label: "Objet" },
          { fieldName: "Message", label: "Description" },
          { fieldName: "Mail", label: "Email" },
          //{ fieldName: "date_creation", label: "Date" }
        ]
      }]
    })
  });


  // Widget Editor
  const editor = new Editor({
    view: view,
    snappingOptions: {
      enabled: true,
      featureSources: [
        { layer: HotelLayer, enabled: true },
        { layer: GrandSurfaceLayer, enabled: true }]
    },
    layerInfos: [{
      layer: ReclamationLayer,
      formTemplate: {
        elements: [{
          type: "field",
          fieldName: "Objet",
          label: "Objet de la réclamation",
          required: true
        }, {
          type: "field",
          fieldName: "Message",
          label: "Description détaillée",
          required: true
        }, {
          type: "field",
          fieldName: "Mail",
          label: "Email de contact",
          required: true
        }]
      }
    }]
  });

  // Widget FeatureTable
  const featureTable = new FeatureTable({
    view: view,
    layer: ReclamationLayer,
    container: document.createElement("div"),
    visibleElements: {
      menuItems: {
        refreshData: true,
        toggleColumns: true
      }
    }
  });

  // Ajout des contrôles d'édition
  const editExpand = new Expand({
    view: view,
    content: editor,
    expanded: false,
    expandIconClass: "esri-icon-edit",
    expandTooltip: "Gestion des réclamations"
  });

  const tableExpand = new Expand({
    view: view,
    content: featureTable,
    expanded: false,
    expandIconClass: "esri-icon-table",
    expandTooltip: "Liste des réclamations"
  });

  view.ui.add([editExpand, tableExpand], "top-left");

/*   document.getElementById("addReclamationBtn").addEventListener("click", () => {
    // Mode sélection d'entité
    view.on("click", async (event) => {
      const hitTest = await view.hitTest(event);
      const feature = hitTest.results.find(result =>
        result.graphic.layer === HotelLayer ||
        result.graphic.layer === GrandSurfaceLayer
      );

      if (feature) {
        // Créer la réclamation à la position de l'entité
        editor.startCreateWorkflowAtFeatureCreation(ReclamationLayer, {
          creationType: "point",
          geometry: feature.graphic.geometry
        });
      }
    });
  }); */

  // Mise à jour automatique de la table
  ReclamationLayer.watch("edits", () => {
    featureTable.refresh();
  });

  const HotelSqlExpressions = ["Gatégorie", "CATÉGORIE = '1*'", "CATÉGORIE = '2*'", "CATÉGORIE = '3*'", "CATÉGORIE = '4*'", "CATÉGORIE = '5*'", "CATÉGORIE = 'V.V.T 2ème C'", "CATÉGORIE = 'Fermé'", "CATÉGORIE = 'RT 1ère CAT. (c'", "CATÉGORIE = 'CC'", "CATÉGORIE = '5* luxe'", "CATÉGORIE = 'C.C'", "CATÉGORIE = 'Maison d'Hôtes'", "CATÉGORIE = 'RT 2ème CAT'", "CATÉGORIE = 'c conf'", "CATÉGORIE = 'P expo'", "CATÉGORIE = 'cinema'"];
  const GrandeSurfaceSqlExpressions = ["Type", "Type = 'Marjane'", "Type = 'Metro'", "Type = 'Acima'", "Type = 'Grande Surface Spécialisée'", "Type = 'LABEL VIE'", "Type = 'Twin Center'", "Type = 'Marina'"]

  const HotelSelectFilter = document.createElement("select");
  HotelSqlExpressions.forEach(function (sql) {
    let option = document.createElement("option");
    option.value = sql;
    option.innerHTML = sql;
    HotelSelectFilter.appendChild(option);
  });
  view.ui.add(HotelSelectFilter, "top-right");

  const GrandeSurfaceSelectFilter = document.createElement("select");
  GrandeSurfaceSqlExpressions.forEach(function (sql) {
    let option = document.createElement("option");
    option.value = sql;
    option.innerHTML = sql;
    GrandeSurfaceSelectFilter.appendChild(option);
  });
  view.ui.add(GrandeSurfaceSelectFilter, "top-right");

  // Server-side filter
  function setHotelLayer(expression) {
    HotelLayer.definitionExpression = expression;
  }

  // Server-side filter
  function setGrandSurfaceLayer(expression) {
    GrandSurfaceLayer.definitionExpression = expression;
  }

  // Event listener
  HotelSelectFilter.addEventListener('change', function (event) {
    setHotelLayer(event.target.value);
  });

  // Event listener
  GrandeSurfaceSelectFilter.addEventListener('change', function (event) {
    setGrandSurfaceLayer(event.target.value);
  });

  map.add(communesLayer);
  map.add(populationLayer);
  map.add(roadLayer);
  map.add(HotelLayer);
  map.add(GrandSurfaceLayer);
  map.add(ReclamationLayer);


  // ... autres ajouts de couches

});