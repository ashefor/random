import { AreaService } from 'src/app/services/area.service';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

const host = environment.host, header = { user_session_token: 'dxUKrPUgOYlZp0'};

interface IResponse {
  code: number;
  success?: boolean;
  message?: boolean;
  data: string | object;
}

interface IHttpArgs {
  url: string;
  form?: FormData;
  header?: object;
}

interface Area {
  _id: string;
  name: string;
  status: string;
  manufacturer_id: string;
}

interface LocationArea {
  _id: string;
  area_id: string;
  status: string;
  manufacturer_id: string;
}

const area: Area = { _id: '5c9ce172363ab88471e9fa5c', name: 'North-Central', status: 'active',
  manufacturer_id: '5c9ce172363ab88471e9fa5c' },
locationArea: LocationArea = { _id: '5c9ce172363ab88471e9fa5c', status: 'active', manufacturer_id: area.manufacturer_id,
  area_id: area._id };

let httpClientSpy: { get: jasmine.Spy, post: jasmine.Spy }, areaService: AreaService,
  dataService: { setHeader: jasmine.Spy }, cacheService: { setAreas: jasmine.Spy };

describe('AreaService', () => {
  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    dataService = jasmine.createSpyObj('DataHandlerService', ['setHeader']);
    cacheService = jasmine.createSpyObj('CacheService', ['setAreas']);

    dataService.setHeader.and.returnValue({ user_session_token: 'dxUKrPUgOYlZp0'});
    areaService = new AreaService(<any> httpClientSpy, <any> dataService, <any> cacheService);
  });

  it('should have initialized', () => {
    expect(httpClientSpy).toBeTruthy();
    expect(dataService).toBeTruthy();
    expect(cacheService).toBeTruthy();
    expect(areaService).toBeTruthy();
  });

  it('should create an area', () => {
    const expectedResponse: IResponse = { code: 200, data: area._id, success: true };
    const httpArgs: IHttpArgs = { url: `${host}/area/create`, form: new FormData(), header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));

    areaService.create(area.name, area.status, area.manufacturer_id).then(response => expect(response)
    .toEqual(undefined, 'response should be undefined'), fail);

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it('should fetch all areas', () => {
    const expectedResponse: IResponse = { code: 200, data: [{ ...area }], message: true };
    const expectedResponse1: IResponse = { code: 200, data: [{ ...locationArea }], message: true };

    const httpArgs: IHttpArgs = { url: `${host}/area/read_by_manufacturer`, form: new FormData(),
      header: { headers: header } };
    const httpArgs1: IHttpArgs = { url: `${host}/location_area/read_all`, header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));
    httpClientSpy.get.withArgs(httpArgs1.url, httpArgs1.header).and.returnValue(of(expectedResponse1));

    areaService.fetchAll(area.manufacturer_id).then(response => expect(response).toEqual(undefined, 'response should be undefined'));

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(httpClientSpy.get.calls.count()).toBe(1, 'make one http get request');
    expect(dataService.setHeader.calls.count()).toBe(2, 'make two calls to the data service');
    expect(cacheService.setAreas.calls.count()).toBe(1, 'make one call to the cache service');
  });

  it('should fetch all areas (lite)', () => {
    const expectedResponse: IResponse = { code: 200, data: [{ ...area }], message: true };
    const httpArgs: IHttpArgs = { url: `${host}/area/read_all`, header: { headers: header } };

    httpClientSpy.get.withArgs(httpArgs.url, httpArgs.header).and.returnValue(of(expectedResponse));
    areaService.fetchLite().then(response => expect(response).toEqual(expectedResponse.data, 'response should equal expectedResponse'));

    expect(httpClientSpy.get.calls.count()).toBe(1, 'make one http get request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it('should delete an area', () => {
    const expectedResponse: IResponse = { code: 200, data: area._id, message: true };
    const httpArgs: IHttpArgs = { url: `${host}/area/delete`, form: new FormData(), header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));
    areaService.delete(area._id).then(response => expect(response).toEqual(undefined, 'response should be undefined'));

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it('should edit an area', () => {
    const expectedResponse: IResponse = { code: 200, data: area._id, success: true };
    const httpArgs: IHttpArgs = { url: `${host}/area/update`, form: new FormData(), header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));

    areaService.edit(area)
      .then(response => expect(response).toEqual(undefined, 'response should be undefined'), fail);

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it(`should toggle an area's status`, () => {
    const expectedResponse: IResponse = { code: 200, data: area._id, success: true };
    const httpArgs: IHttpArgs = { url: `${host}/area/set_status`, form: new FormData(), header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));

    areaService.toggleStatus(area).then(response => expect(response).toEqual(undefined, 'response should be undefined'), fail);

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it('should add locations to an area', () => {
    const expectedResponse: IResponse = { code: 200, data: null, success: true };
    const httpArgs: IHttpArgs = { url: `${host}/location_area/add_bulk_location`, form: new FormData(), header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));

    areaService.addLocations([area._id, area._id], area._id, area.manufacturer_id)
      .then(response => expect(response).toEqual(undefined, 'response should be undefined'), fail);

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it(`should toggle a location_area's status`, () => {
    const expectedResponse: IResponse = { code: 200, data: locationArea._id, success: true };
    const httpArgs: IHttpArgs = { url: `${host}/location_area/set_status`, form: new FormData(), header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));

    areaService.toggleLocationAreaStatus(area).then(response => expect(response).toEqual(undefined, 'response should be undefined'), fail);

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it('should delete a location_area', () => {
    const expectedResponse: IResponse = { code: 200, data: locationArea._id, message: true };
    const httpArgs: IHttpArgs = { url: `${host}/location_area/delete`, form: new FormData(), header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));
    areaService.deleteLocationArea(locationArea._id).then(response => expect(response).toEqual(undefined, 'response should be undefined'));

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it('should fail to create an area', () => {
    const expectedResponse: IResponse = { code: 400, data: area._id, success: false };
    const httpArgs: IHttpArgs = { url: `${host}/area/create`, form: new FormData(), header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));

    areaService.create(area.name, area.status, area.manufacturer_id)
      .then(null, (response) => expect(response.code).toEqual(expectedResponse.code));

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it('should fail to fetch all areas (area req fails)', () => {
    const expectedResponse: IResponse = { code: 400, data: null, message: false };

    const httpArgs: IHttpArgs = { url: `${host}/area/read_by_manufacturer`, form: new FormData(),
      header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));

    areaService.fetchAll(area.manufacturer_id).then(null, (response) => expect(response.code).toEqual(expectedResponse.code));

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it('should fail to fetch all areas (location area req fails)', () => {
    const expectedResponse: IResponse = { code: 200, data: [{ ...area }], message: true };
    const expectedResponse1: IResponse = { code: 400, data: null, message: false };

    const httpArgs: IHttpArgs = { url: `${host}/area/read_by_manufacturer`, form: new FormData(),
      header: { headers: header } };
    const httpArgs1: IHttpArgs = { url: `${host}/location_area/read_all`, header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));
    httpClientSpy.get.withArgs(httpArgs1.url, httpArgs1.header).and.returnValue(of(expectedResponse1));

    areaService.fetchAll(area.manufacturer_id).then(null, (response) => expect(response.code).toEqual(expectedResponse1.code));

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(httpClientSpy.get.calls.count()).toBe(1, 'make one http get request');
    expect(dataService.setHeader.calls.count()).toBe(2, 'make two calls to the data service');
  });

  it('should fail to fetch all areas (lite)', () => {
    const expectedResponse: IResponse = { code: 400, data: null, message: false };
    const httpArgs: IHttpArgs = { url: `${host}/area/read_all`, header: { headers: header } };

    httpClientSpy.get.withArgs(httpArgs.url, httpArgs.header).and.returnValue(of(expectedResponse));
    areaService.fetchLite().then(null, (response) => expect(response.code).toEqual(expectedResponse.code));

    expect(httpClientSpy.get.calls.count()).toBe(1, 'make one http get request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it('should fail to delete an area', () => {
    const expectedResponse: IResponse = { code: 400, data: null, message: false };
    const httpArgs: IHttpArgs = { url: `${host}/area/delete`, form: new FormData(), header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));
    areaService.delete(area._id).then(null, (response) => expect(response.message).toEqual('Delete failed'));

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it('should fail to edit an area', () => {
    const expectedResponse: IResponse = { code: 400, data: null, success: false };
    const httpArgs: IHttpArgs = { url: `${host}/area/update`, form: new FormData(), header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));

    areaService.edit(area).then(null, (response) => expect(response.code).toEqual(expectedResponse.code));

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it(`should fail to toggle an area's status`, () => {
    const expectedResponse: IResponse = { code: 400, data: null, message: false };
    const httpArgs: IHttpArgs = { url: `${host}/area/set_status`, form: new FormData(), header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));

    areaService.toggleStatus(area).then(null, (response) => expect(response.message).toEqual('Toggle failed!'));

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it('should fail to add locations to an area', () => {
    const expectedResponse: IResponse = { code: 400, data: null, success: true };
    const httpArgs: IHttpArgs = { url: `${host}/location_area/add_bulk_location`, form: new FormData(), header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));

    areaService.addLocations([area._id, area._id], area._id, area.manufacturer_id)
      .then(null, (response) => expect(response.code).toEqual(expectedResponse.code));

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it(`should fail to toggle a location_area's status`, () => {
    const expectedResponse: IResponse = { code: 200, data: locationArea._id, success: true };
    const httpArgs: IHttpArgs = { url: `${host}/location_area/set_status`, form: new FormData(), header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));

    areaService.toggleLocationAreaStatus(area).then(null, (response) => expect(response.message).toEqual('Toggle failed!'));

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });

  it('should fail to delete a location_area', () => {
    const expectedResponse: IResponse = { code: 200, data: locationArea._id, message: true };
    const httpArgs: IHttpArgs = { url: `${host}/location_area/delete`, form: new FormData(), header: { headers: header } };

    httpClientSpy.post.withArgs(httpArgs.url, httpArgs.form, httpArgs.header).and.returnValue(of(expectedResponse));
    areaService.deleteLocationArea(locationArea._id).then(null, (response) => expect(response.message).toEqual('Delete failed!'));

    expect(httpClientSpy.post.calls.count()).toBe(1, 'make one http post request');
    expect(dataService.setHeader.calls.count()).toBe(1, 'make one call to the data service');
  });
});
