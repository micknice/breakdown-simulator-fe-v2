function extractLatitudeAndLongitude(arrayOfObjects, markers) {
    console.log('arr of obj @ extract', arrayOfObjects);
    return arrayOfObjects.map((obj, index) => {
      if (obj.currentLocation && Array.isArray(obj.currentLocation) && obj.currentLocation.length === 2) {
        const [latitude, longitude] = obj.currentLocation;
        return { latitude, longitude };
      } else {
        return { latitude: markers[index].latitude, longitude: markers[index].longitude };
      }
    });
  }
  
  export default extractLatitudeAndLongitude;