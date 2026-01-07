import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    private headers = new HttpHeaders();
    constructor(private http: HttpClient) {
        // Set default headers for all requests
        this.headers = this.headers.set('app-key', environment.appKey);
    }

    // HTTP GET request with headers
    getHttp(apiUrl: string, successFunc: any, errorFunc: any) {
        this.http.get(apiUrl, { headers: this.headers }).subscribe({ next: successFunc, error: errorFunc });
    }

    // HTTP PUT request with headers
    putHttp(apiUrl: string, data: any, successFunc: any, errorFunc: any) {
        this.http.put(apiUrl, data, { headers: this.headers }).subscribe({ next: successFunc, error: errorFunc });
    }

    // HTTP DELETE request with headers
    deleteHttp(apiUrl: string, successFunc: any, errorFunc: any) {
        this.http.delete(apiUrl, { headers: this.headers }).subscribe({ next: successFunc, error: errorFunc });
    }

    // Observable-based HTTP GET request with headers
    getHttpObservable(path: string, params: HttpParams | any = new HttpParams()): Observable<any> {
        return this.http.get(path, { headers: this.headers, params });
    }

    // Observable-based HTTP GET request for PDF
    getHttpObservableAsPDF(path: string): Observable<Blob> {
        return this.http.get(path, {
            headers: this.headers,
            responseType: 'blob'
        });
    }

    // POST request with headers
    postHttp<T>(apiUrl: string, data: T, successFunc: any, errorFunc: any) {
        this.http.post(apiUrl, data, { headers: this.headers }).subscribe({ next: successFunc, error: errorFunc });
    }

    // POST request with PDF response (e.g. for download)
    postHttpPDF(apiUrl: string, data: any, successFunc: any, errorFunc: any) {
        this.http.post(apiUrl, data, {
            headers: this.headers,
            responseType: 'blob'
        }).subscribe({ next: successFunc, error: errorFunc });
    }

    // POST request with CSV response
    postHttpCSV(apiUrl: string, data: any, successFunc: any, errorFunc: any) {
        this.http.post(apiUrl, data, {
            headers: this.headers,
            responseType: 'blob'
        }).subscribe({ next: successFunc, error: errorFunc });
    }

    // Multipart file upload request (Content-Type handled by browser automatically)
    postHttpMultipartUpload(apiUrl: string, data: any, successFunc: any, errorFunc: any) {
        const headers = new HttpHeaders({
            'app-key': environment.appKey,
        });
        this.http.put(apiUrl + '?RemoveAuthToken', data, {
            headers,
            reportProgress: true,
            observe: 'events'
        }).subscribe({ next: successFunc, error: errorFunc });
    }

    // GET request to download files (PDF, images etc.)
    getFile(apiUrl: string, successFunc: any, errorFunc: any) {
        this.http.get(apiUrl, {
            headers: this.headers,
            responseType: 'blob',
            observe: 'response'
        }).subscribe({ next: successFunc, error: errorFunc });
    }

    // Upload file using pre-signed temp URL (no custom headers)
    uploadFileUsingTemporaryUploadUrl(apiUrl: string, file: any, successFunc: any, errorFunc: any) {
        this.http.put(apiUrl, file, {
            responseType: 'blob'
        }).subscribe({ next: successFunc, error: errorFunc });
    }
    // uploadFileUsingTemporaryUploadUrl(apiUrl: string, file: any, successFunc: any, errorFunc: any) {
    //   this.http.put(apiUrl, file).subscribe({ next: successFunc, error: errorFunc });
    // }

    // Upload and save document in object storage
    saveDocumentInObjectStorage(apiUrl: string, file: any, successFunc: any, errorFunc: any) {
        this.http.post(apiUrl, file, {
            headers: this.headers,
            responseType: "blob"
        }).subscribe({ next: successFunc, error: errorFunc });
    }

    postHttpBlob(apiUrl: string, data: any, successFunc: any, errorFunc: any) {
        this.http.post(apiUrl, data, {
            headers: this.headers,
            responseType: 'blob' // Important: Tells Angular to expect binary data, not JSON
        }).subscribe({ next: successFunc, error: errorFunc });
    }

    postMultipart(apiUrl: string, formData: FormData, successFunc: any, errorFunc: any) {
        this.http.post(apiUrl, formData, {
            headers: this.headers // Keeps your app-key, etc.
        }).subscribe({ next: successFunc, error: errorFunc });
    }
}