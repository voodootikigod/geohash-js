// geohash.js
// Geohash library for Javascript
// (c) 2008 David Troy
// (c) 2010 Chris Williams
// (c) 2012 Max Ogden
// Distributed under the MIT License

function GeoHash() {
  this.BITS = [16, 8, 4, 2, 1]
  this.MAX_PRECISION = 11
  
  
  this.BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz"
  var NEIGHBORS = { right  : { even :  "bc01fg45238967deuvhjyznpkmstqrwx" },
                left   : { even :  "238967debc01fg45kmstqrwxuvhjyznp" },
                top    : { even :  "p0r21436x8zb9dcf5h7kjnmqesgutwvy" },
                bottom : { even :  "14365h7k9dcfesgujnmqp0r2twvyx8zb" } }
  var BORDERS   = { right  : { even : "bcfguvyz" },
                left   : { even : "0145hjnp" },
                top    : { even : "prxz" },
                bottom : { even : "028b" } }

  NEIGHBORS.bottom.odd = NEIGHBORS.left.even
  NEIGHBORS.top.odd = NEIGHBORS.right.even
  NEIGHBORS.left.odd = NEIGHBORS.bottom.even
  NEIGHBORS.right.odd = NEIGHBORS.top.even

  BORDERS.bottom.odd = BORDERS.left.even
  BORDERS.top.odd = BORDERS.right.even
  BORDERS.left.odd = BORDERS.bottom.even
  BORDERS.right.odd = BORDERS.top.even
  
  this.NEIGHBORS = NEIGHBORS
  this.BORDERS = BORDERS
}

GeoHash.prototype.refineInterval = function (interval, cd, mask) {
  if (cd&mask) interval[0] = (interval[0] + interval[1])/2
  else interval[1] = (interval[0] + interval[1])/2
}

GeoHash.prototype.encodeGeoHash = function (latitude, longitude) {
  var self = this
  var isEven = 1
  var i = 0
  var lat = []
  var lon = []
  var bit = 0
  var ch = 0
  geohash = ""

  lat[0] = -90.0
  lat[1] = 90.0
  lon[0] = -180.0
  lon[1] = 180.0

  while (geohash.length < self.MAX_PRECISION) {
    if (isEven) {
      mid = (lon[0] + lon[1]) / 2
      if (longitude > mid) {
        ch |= self.BITS[bit]
        lon[0] = mid
      } else
        lon[1] = mid
    } else {
      mid = (lat[0] + lat[1]) / 2
      if (latitude > mid) {
        ch |= self.BITS[bit]
        lat[0] = mid
      } else
        lat[1] = mid
    }

    isEven = !isEven
    if (bit < 4)
      bit++
    else {
      geohash += self.BASE32[ch]
      bit = 0
      ch = 0
    }
  }
  return geohash
}

GeoHash.prototype.decodeGeoHash =  function (geohash) {
  var self = this
  var isEven = 1
  var lat = []
  var lon = []
  lat[0] = -90.0
  lat[1] = 90.0
  lon[0] = -180.0
  lon[1] = 180.0
  lat_err = 90.0
  lon_err = 180.0

  for (i = 0; i < geohash.length; i++) {
    c = geohash[i]
    cd = self.BASE32.indexOf(c)
    for (j = 0; j < 5; j++) {
      mask = self.BITS[j]
      if (isEven) {
        lon_err /= 2
        self.refineInterval(lon, cd, mask)
      } else {
        lat_err /= 2
        self.refineInterval(lat, cd, mask)
      }
      isEven = !isEven
    }
  }
  lat[2] = (lat[0] + lat[1])/2
  lon[2] = (lon[0] + lon[1])/2

  return { latitude: lat, longitude: lon}
}

GeoHash.prototype.calculateAdjacent = function (srcHash, dir) {
  var self = this
  srcHash = srcHash.toLowerCase()
  var lastChr = srcHash.charAt(srcHash.length-1)
  var type = (srcHash.length % 2) ? 'odd' : 'even'
  var base = srcHash.substring(0, srcHash.length - 1)
  if (self.BORDERS[dir][type].indexOf(lastChr) != -1)
    base = self.calculateAdjacent(base, dir)
  return base + self.BASE32[self.NEIGHBORS[dir][type].indexOf(lastChr)]
}

GeoHash.prototype.neighbors = function (srcHash) {
  var self = this
  var neighbors = []
  var directions = [['top', 'right'], ['right', 'bottom'], ['bottom', 'left'], ['left', 'top']]
  directions.forEach(function(dir) {
    var point = self.calculateAdjacent(srcHash, dir[0])
    neighbors.push(point)
    neighbors.push(self.calculateAdjacent(point, dir[1]))
  })
  return neighbors
}


GeoHash.prototype.buildLengthToDimensionTables = function() {
  var self = this
  var hashLenToLatHeight = []
  var hashLenToLonWidth = []
  hashLenToLatHeight[0] = 90 * 2
  hashLenToLonWidth[0] = 180 * 2
  var even = false
  for(var i = 1; i <= self.MAX_PRECISION; i++) {
    hashLenToLatHeight[i] = hashLenToLatHeight[i-1] / (even ? 8 : 4)
    hashLenToLonWidth[i] = hashLenToLonWidth[i-1] / (even ? 4 : 8 )
    even = !even
  }
  return {height: hashLenToLatHeight, width: hashLenToLonWidth}
}

GeoHash.prototype.geohashRange = function (lat, lon, radius) {
  var diff = radius / 111034 // convert from meters to degrees
  diff = diff / 2 // square diameter -> radius
  var upper = this.encodeGeoHash(lat + diff, lon + diff)
  var lower = this.encodeGeoHash(lat - diff, lon - diff)
  return [lower, upper]  
}

module.exports = new GeoHash()