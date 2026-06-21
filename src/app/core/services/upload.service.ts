import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResult {
  uri: string;
  nome_original: string;
  tipo_mime: string;
  tamanho_bytes: number;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);

  /** Uploads a file to the API; returns metadata used to create an Arquivo. */
  upload(file: File): Observable<UploadResult> {
    const form = new FormData();
    form.append('file', file);
    // No explicit Content-Type: the browser sets the multipart boundary.
    return this.http.post<UploadResult>(`${environment.apiBaseUrl}/upload`, form);
  }
}
