import { Injectable } from "@angular/core";
import { HttpService } from "../../service/http-svc/http.service";
import { environment } from "../../../../environments/environment.development";

@Injectable({
    providedIn: 'root'
})
export class BulkUploadService {

    private static ITEMS_BASE_URL = environment.devUrl + '/v1/items';

    constructor(private httpService: HttpService) { }

    downloadItemsTemplate(filter: any, successCallback?: any, errorCallback?: any) {
        const url = BulkUploadService.ITEMS_BASE_URL + '/template';

        this.httpService.postHttpBlob(url, filter,
            (blob: Blob) => {
                this.downloadFile(blob, "inventory_item_template.xlsx");
                if (successCallback) successCallback();
            },
            (error: any) => {
                if (errorCallback) errorCallback(error);
            }
        );
    }

    /**
     * DOWNLOAD EXCEL
     * Calls POST /bulk/download with filter criteria
     */
    bulkItemsDownload(filter: any, successCallback?: any, errorCallback?: any) {
        const url = BulkUploadService.ITEMS_BASE_URL + '/bulk/download';

        this.httpService.postHttpBlob(url, filter,
            (blob: Blob) => {
                this.downloadFile(blob, "inventory_items.xlsx");
                if (successCallback) successCallback();
            },
            (error: any) => {
                if (errorCallback) errorCallback(error);
            }
        );
    }

    /**
     * UPLOAD EXCEL
     * Calls POST /bulk/upload with Multipart File
     */
    bulkItemsUpload(file: File, successfn: any, errorfn: any) {
        const url = BulkUploadService.ITEMS_BASE_URL + '/bulk/upload';
        const formData = new FormData();
        formData.append('file', file);
        this.httpService.postMultipart(url, formData, successfn, errorfn);
    }

    //Helper to trigger browser download
    private downloadFile(blob: Blob, fileName: string) {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
    }
}