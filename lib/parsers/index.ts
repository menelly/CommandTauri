/**
 * TEXT PARSERS INDEX
 * 
 * Central export for all text parsing functionality
 */

// Core parser engine
export { TextParser, createParser, mergeParseResults } from './core';

// Types
export type {
  ParsedField,
  ParseResult,
  ParserPattern,
  ParserConfig,
  ProviderData,
  MedicationData,
  InsuranceData
} from './types';

// Parser configurations
export { providerParserConfig } from './configs/provider';

// React component
export { default as TextParserComponent } from '../../components/text-parser';

// Convenience functions for common use cases
import { TextParser } from './core';
import { providerParserConfig } from './configs/provider';

/**
 * Quick provider parsing function
 */
export function parseProviderText(text: string) {
  const parser = new TextParser(providerParserConfig);
  return parser.parse(text);
}

/**
 * Test function to validate parser configs
 */
export function testParser(config: any, sampleText: string) {
  const parser = new TextParser(config);
  return parser.parse(sampleText);
}
