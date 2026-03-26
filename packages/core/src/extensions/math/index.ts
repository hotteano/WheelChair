/**
 * WheelChair Editor - Math Extension
 * 数学公式扩展入口
 */

export { InlineMath, BlockMath, MathExtensions, MathPlugin } from './MathExtension';
export { createInlineMathRule, createBlockMathRule, getMathInputRules } from './MathInputRules';
export {
  insertInlineMath,
  insertBlockMath,
  updateMath,
  deleteMath,
  isMath,
  getMathContent,
} from './MathCommands';

export type { MathCommands } from './MathCommands';
