// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  cipher: 'schrodinger',
  locationUrl: 'https://locationsng-api.herokuapp.com/api/v1/',
  host: 'https://dev.suplias.com',
  fileHost: 'https://etc.suplias.com/test/io/',
  FCM: 'https://fcm.googleapis.com/fcm/send',
  // tslint:disable-next-line
  FCMServerKey: 'AAAAmRaXhPw:APA91bEmaQFdDgKjSVx4oHoZTAuJAUrPGBZX_aQ-BHO5oJ4bHGubm2dO3fJm874E4yfEyoo9RBk8rukObYTVIZeYdbB_83xgc_C4rePcCd77eR9UpwvP5Ijnxh1h0GPI8jThQdjHYVrE',
};

/*
 * In development mode, for easier debugging, you can ignore zone related error
 * stack frames such as `zone.run`/`zoneDelegate.invokeTask` by importing the
 * below file. Don't forget to comment it out in production mode
 * because it will have a performance impact when errors are thrown
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
