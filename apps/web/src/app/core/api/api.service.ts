import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Zap, ZapInput } from '@sredio/shared';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private readonly http = inject(HttpClient);

    async listZaps(): Promise<Zap[]> {
        const { zaps } = await firstValueFrom(this.http.get<{ zaps: Zap[] }>('/api/zaps'));
        return zaps;
    }

    async updateZap(id: string, input: ZapInput): Promise<Zap> {
        const { zap } = await firstValueFrom(this.http.put<{ zap: Zap }>(`/api/zaps/${id}`, input));
        return zap;
    }
}
