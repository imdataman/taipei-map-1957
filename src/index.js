import 'ol/ol.css';
import {
    Map,
    View,
    Feature
} from 'ol';
import {
    Tile as TileLayer,
    Vector as VectorLayer
} from 'ol/layer';
import {
    Fill,
    Stroke,
    Style,
    Text
} from 'ol/style';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import Clip from 'ol-ext/filter/Clip';
import {transform} from 'ol/proj';
import mobileCheck from './js/mobileCheck';
import getScreenSize from './js/getScreenSize';

var mobile = mobileCheck();
var screenSize = getScreenSize();
var fontSize;

if (mobile) {
    fontSize = 36;
} else {
    fontSize = 24;
}

var center = transform([121.5119493, 25.039962], 'EPSG:4326', 'EPSG:3857');
var extent = transform([121.475, 25], 'EPSG:4326', 'EPSG:3857').concat(transform([121.592, 25.094], 'EPSG:4326', 'EPSG:3857'));

var oldLayer = new TileLayer({
    source: new XYZ({
        url: 'tiles/tiles_1957/{z}/{x}/{y}.png'
    })
});

var newLayer = new TileLayer({
    source: new XYZ({
        url: 'tiles/tiles_2019/{z}/{x}/{y}.png'
    })
});

var style = new Style({
    text: new Text({
        font: fontSize + 'px "Helvetica"',
        placement: 'line',
        fill: new Fill({
            color: 'white'
        }),
        stroke: new Stroke({
            color: '#fff',
            width: 1
        })
    })
});

var roadLabel = new VectorLayer({
    declutter: true,
    source: new VectorSource({
        format: new GeoJSON(),
        url: 'data/roads.geojson'
    }),
    style: function (feature) {
        style.getText().setText(feature.get('name'));
        return style;
    }
})

var map = new Map({
    target: 'map',
    layers: [newLayer, oldLayer, roadLabel],
    view: new View({
        center: center,
        zoom: 16,
        maxZoom: 18,
        extent: extent
    })

});

var clip = new Clip({
    operation: 'enhance'
});

oldLayer.addFilter(clip);

function setFilter(e) {
    var zoomLevel = map.getView().getZoom();
    var c = [];
    var unit = "px";
    var radius = ((zoomLevel - 13) / 5) * 600 + 200


    for (var i = 0; i < 2 * Math.PI; i += 0.1) {
        c.push([radius * (Math.cos(i) / 2) + e.pixel[0], radius * (Math.sin(i) / 2) + e.pixel[1]]);
    }
    clip.set("coords", c);
    clip.set("units", unit);
}

if (mobile) {
    map.on("click", setFilter)
} else {
    map.on("pointermove", setFilter)
}