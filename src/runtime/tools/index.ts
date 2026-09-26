/**
 * ATKIN Runtime - Tool Registry
 * Sections 34, 35: Deterministic legal tools & MCP protocol boundary
 */

import { ToolRegistry } from '../../engine/protocol/toolRegistry.ts';

export { ToolRegistry, type ToolName, type ToolExecutionRecord } from '../../engine/protocol/toolRegistry.ts';
export const toolRegistry = new ToolRegistry();
