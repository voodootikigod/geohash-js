GeoHash.js
----------

SUMMARY
=======

This is a basic demonstration of how the GeoHash algorithm can be used to generate bounding box searches without the use of specialized spatial indexing approaches.

This can be especially helpful in cases where spatial indexes are either not supported or do not scale to high volumes.  Environments such as Google App Engine, EC2, and SQLite provide reasonable string indexing services but do not support spatial indexing.  This algorithm could be used to provide proximity searching in these environments.

BACKGROUND
==========

The Geohash algorithm was first described by Gustavo Niemeyer in February 2008.  By interleaving latitude and longitude information in a bitwise fashion, a composite value is generated that provides a high resolution geographic point, and is well suited for storage or transmission as a character string.

Geohash also has the property that as the number of digits decreases (from the right), accuracy degrades.  This property can be used to do bounding box searches, as points near to one another will share similar Geohash prefixes.

However, because a given point may appear at the edge of a given Geohash bounding box, it is necessary to generate a list of Geohash values in order to perform a true proximity search around a point.  Because the Geohash algorithm uses a base-32 numbering system, it is possible to derive the Geohash values surrounding any other given Geohash value using a simple lookup table.

So, for example, 1600 Pennsylvania Avenue, Washington DC resolves to:

  38.897, -77.036

Using the geohash algorithm, this latitude and longitude is converted to:

  dqcjqcp84c6e

A simple bounding box around this point could be described by truncating this geohash to:

  dqcjqc

However, 'dqcjqcp84c6e' is not centered inside 'dqcjqc', and searching within 'dqcjqc' may miss some desired targets.

So instead, we can use the mathematical properties of the Geohash to quickly calculate the neighbors of 'dqcjqc';  we find that they are:

  'dqcjqf','dqcjqb','dqcjr1','dqcjq9','dqcjqd','dqcjr4','dqcjr0','dqcjq8'

This gives us a bounding box around 'dqcjqcp84c6e' roughly 2km x 1.5km and allows for a database search on just 9 keys:

  SELECT * FROM table WHERE LEFT(geohash,6) IN ('dqcjqc', 'dqcjqf','dqcjqb','dqcjr1','dqcjq9','dqcjqd','dqcjr4','dqcjr0','dqcjq8');

MORE INFORMATION
================
[GeoHash on Wikipedia](http://en.wikipedia.org/wiki/Geohash)
[GeoHash gem on Rubyforge](http://geohash.rubyforge.org/)

THIS PROJECT
============

[Demo Site](http://openlocation.org/geohash/geohash-js)
[Source Code](http://github.com/davetroy/geohash-js/tree/master)

Please contact me at dave at roundhousetech.com with any questions you may have about this code;  right now this is experimental.  The bounding box code found here will be added to the Ruby gem soon.


USE AS COMMONJS MODULE
======================

To use this in a CommonJS capable system use the following code snippet to generate GeoHashes:

`
  var GeoHash = require("./geohash");
  var hash = GeoHash.encodeGeoHash(38.897, -77.036); // lat, lng
  
`


Geohash Javascript Demonstration
(c) 2008 David Troy
Refactored to CommonJS module by Chris Williams (c) 2010
Released under the MIT License
