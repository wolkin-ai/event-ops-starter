import { observabilityCheckConfig } from './config/observability.config.mjs';
import { runObservabilityReadiness } from './lib/observability-readiness.mjs';

runObservabilityReadiness(observabilityCheckConfig);
