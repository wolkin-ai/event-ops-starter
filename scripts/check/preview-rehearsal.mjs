import { previewRehearsalConfig } from './config/preview-rehearsal.config.mjs';
import { runPreviewRehearsal } from './lib/preview-rehearsal.mjs';

await runPreviewRehearsal(previewRehearsalConfig);
