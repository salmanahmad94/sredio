import { Component, computed, inject, input, signal, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
    CATALOG,
    findAction,
    findApp,
    findTrigger,
    renderTemplate,
    samplePayload,
    type CopilotDraft,
    type InputField,
    type Repository,
    type ZapInput
} from '@sredio/shared';

import { ApiService } from '../../core/api/api.service';
import { toApiError, type ApiError } from '../../core/api/api-error';

import { AppPicker } from './app-picker';
import { ZapRuns } from './zap-runs';

type Config = Record<string, string>;

// Default values for an action's fields, e.g. a starter comment.
const defaults = (fields: InputField[]): Config =>
    Object.fromEntries(
        fields.filter((field) => field.default).map((field) => [field.key, field.default!])
    );

@Component({
    selector: 'app-zap-editor-page',
    imports: [FormsModule, RouterLink, AppPicker, ZapRuns],
    templateUrl: './zap-editor.page.html'
})
export class ZapEditorPage implements OnInit {
    private readonly api = inject(ApiService);
    private readonly router = inject(Router);

    // Route param (/zaps/:id). Absent for a new Zap.
    readonly id = input<string>();

    // Every app is listed (the picker shows what the product covers); only available ones can be picked.
    protected readonly triggerApps = CATALOG.filter((app) => app.triggers.length);
    protected readonly actionApps = CATALOG.filter((app) => app.actions.length);

    protected readonly loading = signal(true);
    protected readonly saving = signal(false);
    protected readonly deleting = signal(false);
    protected readonly error = signal<ApiError | null>(null);
    protected readonly notice = signal<string | null>(null);
    // The Copilot's explanation when the form was filled from a draft.
    protected readonly copilotNote = signal<string | null>(null);
    protected readonly repositories = signal<Repository[] | null>(null);
    protected readonly repositoriesError = signal<string | null>(null);

    protected readonly name = signal('');
    protected readonly enabled = signal(false);
    // Whether the saved Zap is on, as opposed to the unsaved switch. Drives the run history refresh.
    protected readonly savedEnabled = signal(false);
    protected readonly triggerApp = signal('github');
    protected readonly triggerKey = signal('pull_request_opened');
    protected readonly triggerConfig = signal<Config>({});
    protected readonly actionApp = signal('github');
    protected readonly actionKey = signal('comment_on_pull_request');
    protected readonly actionConfig = signal<Config>({});

    protected readonly triggerAppDef = computed(() => findApp(this.triggerApp()));
    protected readonly actionAppDef = computed(() => findApp(this.actionApp()));
    protected readonly trigger = computed(() => findTrigger(this.triggerApp(), this.triggerKey()));
    protected readonly action = computed(() => findAction(this.actionApp(), this.actionKey()));

    protected readonly sample = computed(() => samplePayload(this.trigger()?.outputs ?? []));

    protected readonly input = computed<ZapInput>(() => ({
        name: this.name().trim(),
        enabled: this.enabled(),
        trigger: { app: this.triggerApp(), key: this.triggerKey(), config: this.triggerConfig() },
        action: { app: this.actionApp(), key: this.actionKey(), config: this.actionConfig() }
    }));

    async ngOnInit(): Promise<void> {
        const id = this.id();

        // A notice carried over from creating the Zap (the route changes from /new to /:id).
        this.notice.set((history.state as { notice?: string } | null)?.notice ?? null);

        // Suggestions for the repository field; loads alongside the Zap and never blocks the form.
        void this.loadRepositories();

        try {
            if (id) {
                this.apply(await this.api.getZap(id));
            } else {
                const draft = (history.state as { draft?: CopilotDraft } | null)?.draft;

                if (draft) {
                    this.apply(draft.zap);
                    this.copilotNote.set(draft.explanation);
                } else {
                    this.name.set('Thank pull request authors');
                    this.actionConfig.set(defaults(this.action()?.fields ?? []));
                }
            }
        } catch (error) {
            this.error.set(toApiError(error));
        } finally {
            this.loading.set(false);
        }
    }

    protected pickTriggerApp(appKey: string): void {
        const app = findApp(appKey);
        const first = app?.triggers[0];

        if (!app || !first || app.status !== 'available') return;

        this.triggerApp.set(appKey);
        this.triggerKey.set(first.key);
        this.triggerConfig.set({});
    }

    protected pickTrigger(key: string): void {
        this.triggerKey.set(key);
        this.triggerConfig.set({});
    }

    protected pickActionApp(appKey: string): void {
        const app = findApp(appKey);
        const first = app?.actions[0];

        if (!app || !first || app.status !== 'available') return;

        this.actionApp.set(appKey);
        this.pickAction(first.key);
    }

    protected pickAction(key: string): void {
        this.actionKey.set(key);
        this.actionConfig.set(defaults(findAction(this.actionApp(), key)?.fields ?? []));
    }

    protected setTriggerField(key: string, value: string): void {
        this.triggerConfig.update((config) => ({ ...config, [key]: value }));
    }

    protected setActionField(key: string, value: string): void {
        this.actionConfig.update((config) => ({ ...config, [key]: value }));
    }

    /** Inserts `{{path}}` at the cursor in a template field. */
    protected insertToken(
        key: string,
        textarea: HTMLTextAreaElement,
        picker: HTMLSelectElement
    ): void {
        const path = picker.value;
        picker.value = '';

        if (!path) return;

        const token = `{{${path}}}`;
        const value = this.actionConfig()[key] ?? '';
        const start = textarea.selectionStart ?? value.length;
        const end = textarea.selectionEnd ?? value.length;

        this.setActionField(key, value.slice(0, start) + token + value.slice(end));

        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(start + token.length, start + token.length);
        });
    }

    protected preview(template: string | undefined): string {
        return renderTemplate(template ?? '', this.sample());
    }

    protected fieldError(path: string): string | undefined {
        return this.error()?.details.find((detail) => detail.path === path)?.message;
    }

    async save(): Promise<void> {
        this.saving.set(true);
        this.error.set(null);
        this.notice.set(null);

        try {
            const id = this.id();
            const zap = id
                ? await this.api.updateZap(id, this.input())
                : await this.api.createZap(this.input());

            const notice = zap.enabled ? 'Saved. The Zap is on.' : 'Saved. The Zap is off.';

            if (!id) {
                await this.router.navigate(['/zaps', zap.id], {
                    replaceUrl: true,
                    state: { notice }
                });
                return;
            }

            this.apply(zap);
            this.notice.set(notice);
        } catch (error) {
            this.error.set(toApiError(error));
        } finally {
            this.saving.set(false);
        }
    }

    async remove(): Promise<void> {
        const id = this.id();

        if (!id || !confirm(`Delete "${this.name()}"? Its webhook and run history go with it.`))
            return;

        this.deleting.set(true);

        try {
            await this.api.deleteZap(id);
            await this.router.navigateByUrl('/zaps');
        } catch (error) {
            this.error.set(toApiError(error));
            this.deleting.set(false);
        }
    }

    private apply(zap: ZapInput): void {
        this.name.set(zap.name);
        this.enabled.set(zap.enabled);
        this.savedEnabled.set(zap.enabled);
        this.triggerApp.set(zap.trigger.app);
        this.triggerKey.set(zap.trigger.key);
        this.triggerConfig.set({ ...zap.trigger.config });
        this.actionApp.set(zap.action.app);
        this.actionKey.set(zap.action.key);
        this.actionConfig.set({ ...zap.action.config });
    }

    private async loadRepositories(): Promise<void> {
        try {
            this.repositories.set(await this.api.listRepositories());
        } catch (error) {
            this.repositoriesError.set(toApiError(error).message);
        }
    }
}
