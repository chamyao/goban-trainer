import { buildTsumegoFrame, canFrameAsTsumego } from './websrc/utils/tsumegoFrame';
(globalThis as unknown as Record<string, unknown>).GTEngineUtils = { buildTsumegoFrame, canFrameAsTsumego };
