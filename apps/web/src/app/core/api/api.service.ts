import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { CopilotDraft, Repository, Zap, ZapInput, ZapRun } from '@sredio/shared';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private readonly http = inject(HttpClient);

    async listZaps(): Promise<Zap[]> {
        const { zaps } = await firstValueFrom(this.http.get<{ zaps: Zap[] }>('/api/zaps'));
        return zaps;
    }

    async getZap(id: string): Promise<Zap> {
        const { zap } = await firstValueFrom(this.http.get<{ zap: Zap }>(`/api/zaps/${id}`));
        return zap;
    }

    async createZap(input: ZapInput): Promise<Zap> {
        const { zap } = await firstValueFrom(this.http.post<{ zap: Zap }>('/api/zaps', input));
        return zap;
    }

    async updateZap(id: string, input: ZapInput): Promise<Zap> {
        const { zap } = await firstValueFrom(this.http.put<{ zap: Zap }>(`/api/zaps/${id}`, input));
        return zap;
    }

    async deleteZap(id: string): Promise<void> {
        await firstValueFrom(this.http.delete(`/api/zaps/${id}`));
    }

    async listRuns(id: string): Promise<ZapRun[]> {
        const { runs } = await firstValueFrom(
            this.http.get<{ runs: ZapRun[] }>(`/api/zaps/${id}/runs`)
        );
        return runs;
    }

    draftZap(prompt: string): Promise<CopilotDraft> {
        return firstValueFrom(this.http.post<CopilotDraft>('/api/copilot/drafts', { prompt }));
    }

    async listRepositories(): Promise<Repository[]> {
        const { repositories } = await firstValueFrom(
            this.http.get<{ repositories: Repository[] }>('/api/github/repositories')
        );
        return repositories;
    }
}
