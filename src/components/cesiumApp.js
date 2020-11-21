
import {Ion,createDefaultTerrainProviderViewModels} from 'cesium';
import Geohash from 'latlon-geohash';

//Initiate global variables.
let terrain = createDefaultTerrainProviderViewModels();
let geoLabels;
let visitedGeohashes=[];

//Convert cartesian coordinate to cartographic (geographical) coordinates.
const toDegrees =(cartesian3Pos) => {
  let pos = Cesium.Cartographic.fromCartesian(cartesian3Pos)
  return [pos.longitude / Math.PI * 180, pos.latitude / Math.PI * 180,pos.height]
}

//Validates the labels array before assigning results.
const lablesCheck=()=>{
  return new Promise(function(resolve, reject) {
      let len=geoLabels.length;
      if (len>0){
          resolve(len)
      }
      else{
          reject("error")
      }
  });
}

//Composing custom-made geocode based on OSM Nominatim.
function OpenStreetMapNominatimGeocoder() {}
  /**
 * The function called to geocode using this geocoder service.
 *
 * @param {String} input The query to be sent to the geocoder service.
 * @returns {Promise<GeocoderService.Result[]>}
 */
  OpenStreetMapNominatimGeocoder.prototype.geocode = function (input) {  
    if (input.search("-")>-1){
      let searchtext = input;
      let searchlist = [];
      let gcLC = geoLabels;
      let len = gcLC.length;
      for (let i = 0; i < len; ++i) {
        let l = gcLC.get(i);
        if ( l.text.toLowerCase().search( searchtext.toLowerCase() ) > -1 ) {
          searchlist.push(l);
          }
        }
          return lablesCheck()
          .then(function (results) {
            return searchlist.map(function (resultObject) {
              let lonlat2= toDegrees(resultObject.position);
              let returnObject =  {
                displayName: resultObject.text,
                destination: Cesium.Cartesian3.fromDegrees(lonlat2[0],lonlat2[1], 7000.0),
              };
              return returnObject;
              });
            });
     }
     else{
          let endpoint = "https://nominatim.openstreetmap.org/search";
          let resource = new Cesium.Resource({
            url: endpoint,
            queryParameters: {
              format: "json",
              q: input,
            },
          });

            return resource.fetchJson().then(function (results) {
            let bboxDegrees;
              return results.map(function (resultObject) {
                bboxDegrees = resultObject.boundingbox;
                let x1=parseFloat(bboxDegrees[2]);
                let x2 =parseFloat(bboxDegrees[3]);
                let y1 =parseFloat(bboxDegrees[0]);
                let y2 =parseFloat(bboxDegrees[1]);
                let midX=((x1+x2)/2);
                let midY=((y1+y2)/2);
                  return {
                    displayName: resultObject.display_name,
                    destination:Cesium.Cartesian3.fromDegrees(midX, midY, 7000.0),
                 };
               });
           });
        }
    };

//A method which loads a GeoJSON file and convert it to Cesium entities.
function loadData(viewer,asset){
  let terrainPosition=[];
  let color;
  return new Promise(function(resolve, reject) {
    let promise = Cesium.GeoJsonDataSource.load('static/'+asset+'json.geojson');
    promise.then(function(dataSource) {
      return viewer.dataSources.add(dataSource);
        }).then(function (dataSource) {
            let entities = dataSource.entities.values;
            for (let i = 0; i < entities.length; i++) {
                let entity = entities[i];
                let position = entity.polygon.hierarchy.getValue().positions[0];
                terrainPosition.push(Cesium.Cartographic.fromCartesian(position));
                color=entity.properties.color.getValue();
                entity.polygon.material = new Cesium.Color.fromCssColorString(color);
                entity.name=entity.properties.tochnit;
                entity.description=entity.properties.desc.getValue();
                entity.polygon.outline = new Cesium.Color.fromCssColorString(color);
                entity.polygon.extrudedHeight = entity.properties.height;
                entity.polygon.height = 0;
            }
            Cesium.when(Cesium.sampleTerrain(viewer.terrainProvider, 13, terrainPosition), function() {
                for (let i = 0; i < entities.length; i++) {
                    let entity = entities[i];
                    let terrainHeight = (terrainPosition[i].height);
                    entity.polygon.height = terrainHeight;
                    entity.polygon.extrudedHeight = entity.properties.height + terrainHeight;
                }
            });
          return resolve("done");
        })
        .otherwise(function (error) {
          console.log(error);
       });
    });
}

//Initiate a Cesium viewer
export async function initialize(container){
    let degrees;
    //Declaring a Cesium viewer with a terrain layer  and a custom-made geocoder.
    const viewer =new Cesium.Viewer(container, {
        terrainProviderViewModels: terrain,
        selectedTerrainProviderViewModel: terrain[1],
        geocoder: new OpenStreetMapNominatimGeocoder()
    });
    //Eliminating a few of the widgets on Cesium Viewer.
    viewer.animation.container.style.visibility = "hidden";
    viewer.timeline.container.style.visibility = "hidden";
    viewer.forceResize();
    //Adding an OSM buildings layer.
    viewer.scene.primitives.add(Cesium.createOsmBuildings());
    //Declaring a camera variable and assign it to an event listner.
    let camera = viewer.camera;
    camera.moveEnd.addEventListener(async function() {
        degrees=toDegrees(camera.position);
        let geohash=Geohash.encode(degrees[0],degrees[1], 5);
        let neighbors=Geohash.neighbours(geohash);
        if (!visitedGeohashes.includes(geohash)){
          visitedGeohashes.push(geohash);
          await(loadData(viewer,geohash));
          Object.keys(neighbors).forEach(async function(key) {
          if (!visitedGeohashes.includes(neighbors[key])){
            visitedGeohashes.push(neighbors[key]);
            await(loadData(viewer,neighbors[key]));
          }
        });
      }
    });
    //Reading a CZML file for generating geocoder labels from it.
    let czmlDataSource = new Cesium.CzmlDataSource();
    viewer.dataSources.add(czmlDataSource);
    czmlDataSource.load('geohashFiles/czmltest.czml').then(function(){
      let len=parseInt(czmlDataSource.name);
      geoLabels = viewer.scene.primitives.add(new Cesium.LabelCollection() );       
      for (var i = 0; i < len; i++) {   
               let tochnitEntity=czmlDataSource.entities.getById('tochnit'+JSON.stringify(i));
               let coords=toDegrees(tochnitEntity.position.getValue());
               geoLabels.add( {position : Cesium.Cartesian3.fromDegrees(coords[0], coords[1]), text : tochnitEntity.name, font : '15.75px sans-serif', distanceDisplayCondition : new Cesium.DistanceDisplayCondition(0.0,0.1) });      
            }
           })
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(34.79144974858194,32.06544419249093, 350),
      orientation: {heading: Cesium.Math.toRadians(360.0), pitch: Cesium.Math.toRadians(-15.0)}
      });
}