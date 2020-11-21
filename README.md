# Israel's 3D Zoning

## Motivation 
Most of the maps that are displaying data of zoning or construction plans are 2D.  It's hard to deduce from those maps how our environment will be looked like because 2D maps cannot simulate topography and ground coverage properly. Hence, there is a need for a 3D map that can display this data and help us have a better understanding of how our environment might look like.


## Overview
The app provides data on zoning plans across Israel which has been analyzed and processed to be represented in 3D.
The 3D representation is based on ['Cesium'](https://cesium.com/) platform. The data is dervied from public services such as: [Israel's Planning Administarion](https://www.gov.il/en/departments/iplan) and [Open Street Map](https://www.openstreetmap.org).

## Useage
The map loads the 3D data for each area within the display extent.
There's also an option for using the geocoder search bar for specific plans (those formatted with following format: xxx-xxxxxxx). 

![cesium](images/cesium.gif)
