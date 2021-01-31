/* tslint:disable:no-unused-variable */
// tslint:disable: no-empty
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DBData, MetaData } from '@common/communication/drawing-data';
import { DatabaseService } from './database.service';

describe('Service: Database', () => {
    let httpMock: HttpTestingController;
    let service: DatabaseService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(DatabaseService);
        httpMock = TestBed.inject(HttpTestingController);
        // tslint:disable: no-string-literal
        baseUrl = service['BASE_URL'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should not return any message when sending a POST request (HttpClient called once)', () => {
        const meta: MetaData = { id: 'test', name: 'test', tags: ['tag1', 'tag2'] };
        service.addDrawing(meta, {} as Blob).subscribe(() => {}, fail);
        const req = httpMock.expectOne(baseUrl + '/addDrawing');
        expect(req.request.method).toBe('POST');
        req.flush(meta);
    });

    it('should not return any message when sending a DELETE request (HttpClient called once)', () => {
        const filename = 'filename';
        service.deleteDrawing(filename).subscribe(() => {}, fail);
        const req = httpMock.expectOne(baseUrl + '/deleteDrawing/' + filename);
        expect(req.request.method).toBe('DELETE');
        req.flush(filename);
    });

    it('should handle http error safely', () => {
        service.getAllDBData().subscribe((response: DBData[]) => {
            expect(response).toBeUndefined();
        }, fail);

        const req = httpMock.expectOne(baseUrl + '/getDBData');
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occured'));
    });

    it('should return expected image (HttpClient called once)', () => {
        const expectedBlob: Blob = new Blob();
        const filename = 'filename';

        service.getDrawingPng(filename).subscribe((response: Blob) => {
            expect(response.size).toEqual(expectedBlob.size, 'Title check');
        }, fail);

        const req = httpMock.expectOne(baseUrl + '/getDrawingPng/' + filename);
        expect(req.request.method).toBe('GET');
        req.flush(expectedBlob);
    });
});
