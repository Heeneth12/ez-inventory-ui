import { Injectable } from "@angular/core";
import { FileReferenceType, FileType } from "./file-manager.model";
import { environment } from "../../../environments/environment.development";
import { HttpService } from "../../layouts/service/http-svc/http.service";

@Injectable({
    providedIn: 'root'
})
export class FileManagerService {

    private static FILE_BASE_URL = environment.devUrl + '/v1/files';

    constructor(private httpService: HttpService) { }

    /**
     * POST /v1/files/upload
     * Upload a file with its ownership metadata via multipart/form-data.
     */
    uploadFile(formData: FormData, successfn: any, errorfn: any) {
        return this.httpService.postMultipart(
            `${FileManagerService.FILE_BASE_URL}/upload`,
            formData,
            successfn,
            errorfn
        );
    }

    /**
     * GET /v1/files/{uuid}
     * Fetch metadata for a single file record.
     */
    getFileRecord(uuid: string, successfn: any, errorfn: any) {
        return this.httpService.getHttp(
            `${FileManagerService.FILE_BASE_URL}/${uuid}`,
            successfn,
            errorfn
        );
    }

    /**
     * GET /v1/files/{uuid}/download
     * Download file bytes directly (returns blob).
     */
    downloadFile(uuid: string, successfn: any, errorfn: any) {
        return this.httpService.getFile(
            `${FileManagerService.FILE_BASE_URL}/${uuid}/download`,
            successfn,
            errorfn
        );
    }

    /**
     * GET /v1/files/{uuid}/presigned?expirationMinutes=60
     * Get a time-limited pre-signed S3 URL.
     */
    getPresignedUrl(uuid: string, expirationMinutes: number = 60, successfn: any, errorfn: any) {
        return this.httpService.getHttp(
            `${FileManagerService.FILE_BASE_URL}/${uuid}/presigned?expirationMinutes=${expirationMinutes}`,
            successfn,
            errorfn
        );
    }

    /**
     * GET /v1/files/reference/{referenceId}?referenceType=X&fileType=Y
     * All files attached to a specific entity.
     */
    getFilesByReference(referenceId: string, referenceType: FileReferenceType, fileType?: FileType, successfn?: any, errorfn?: any) {
        let url = `${FileManagerService.FILE_BASE_URL}/reference/${referenceId}?referenceType=${referenceType}`;
        if (fileType) url += `&fileType=${fileType}`;
        return this.httpService.getHttp(url, successfn, errorfn);
    }

    /**
     * GET /v1/files/tenant/{tenantId}?fileType=X
     * All files belonging to a tenant, optionally filtered by file type.
     */
    getFilesByTenant(tenantId: string, fileType?: FileType | null, successfn?: any, errorfn?: any) {
        let url = `${FileManagerService.FILE_BASE_URL}/tenant/${tenantId}`;
        if (fileType) url += `?fileType=${fileType}`;
        return this.httpService.getHttp(url, successfn, errorfn);
    }

    /**
     * DELETE /v1/files/{uuid}
     * Soft-delete: marks record as deleted; S3 object retained.
     */
    softDeleteFile(uuid: string, successfn: any, errorfn: any) {
        return this.httpService.deleteHttp(
            `${FileManagerService.FILE_BASE_URL}/${uuid}`,
            successfn,
            errorfn
        );
    }

    /**
     * DELETE /v1/files/{uuid}/permanent
     * Hard-delete: removes S3 object and DB record. Use for GDPR/compliance only.
     */
    permanentDeleteFile(uuid: string, successfn: any, errorfn: any) {
        return this.httpService.deleteHttp(
            `${FileManagerService.FILE_BASE_URL}/${uuid}/permanent`,
            successfn,
            errorfn
        );
    }
}
