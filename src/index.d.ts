/**
 * Type definitions for @fahlgren-mortine/hubspot-form-usability-enhancements
 * Enhanced HubSpot form usability, validation and styling with React hydration support
 */

// Configuration options for initialization
export interface HubSpotFormsConfig {
  /** Default character limit for textarea fields (default: 500) */
  characterLimit?: number;
  /** Allowed file extensions for upload fields */
  allowedExtensions?: string[];
  /** Maximum file size in bytes for upload fields */
  maxFileSize?: number;
}

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Field validation interface
export interface FieldValidator {
  /**
   * Check if a field is valid
   * @param field The form field element
   * @param container The form container element
   * @returns True if field is valid
   */
  isFieldValid(field: HTMLElement, container: HTMLElement): boolean;
  
  /**
   * Check if a field is invalid
   * @param field The form field element
   * @param container The form container element
   * @returns True if field is invalid
   */
  isFieldInvalid(field: HTMLElement, container: HTMLElement): boolean;
  
  /**
   * Check if a field needs validation
   * @param field The form field element
   * @param container The form container element
   * @returns True if field needs validation
   */
  needsValidation(field: HTMLElement, container: HTMLElement): boolean;
  
  /**
   * Check if field is a group field (radio/checkbox)
   * @param field The form field element
   * @returns True if field is a group field
   */
  isGroupField(field: HTMLElement): boolean;
  
  /**
   * Get all fields in a group
   * @param field The form field element
   * @param container The form container element
   * @returns NodeList of group fields
   */
  getFieldGroup(field: HTMLElement, container: HTMLElement): NodeList;
}

// Character limit validator interface
export interface CharacterLimitValidator {
  /** Default character limit */
  DEFAULT_LIMIT: number;
  
  /**
   * Setup character limits for all textareas in a form
   * @param formContainer The form container element
   * @param cleanup Cleanup controller
   */
  setupCharacterLimits(formContainer: HTMLElement, cleanup: any): void;
  
  /**
   * Setup character limit for a single textarea
   * @param textarea The textarea element
   * @param cleanup Cleanup controller
   */
  setupSingleTextarea(textarea: HTMLElement, cleanup: any): void;
  
  /**
   * Check if textarea has character limit error
   * @param textarea The textarea element
   * @returns True if over character limit
   */
  hasCharacterLimitError(textarea: HTMLElement): boolean;
  
  /**
   * Get character limit error message
   * @param textarea The textarea element
   * @returns Error message or null
   */
  getCharacterLimitErrorMessage(textarea: HTMLElement): string | null;
}

// File upload validator interface
export interface FileUploadValidator {
  /** Allowed file extensions */
  allowedExtensions: string[];
  
  /** Maximum file size in bytes */
  maxFileSize: number;
  
  /**
   * Validate a file input
   * @param fileInput The file input element
   * @returns Validation result
   */
  validateFile(fileInput: HTMLInputElement): ValidationResult;
  
  /**
   * Format file size for display
   * @param bytes File size in bytes
   * @returns Formatted size string
   */
  formatFileSize(bytes: number): string;
  
  /**
   * Setup validation for file inputs in a form
   * @param formContainer The form container element
   */
  setup(formContainer: HTMLElement): void;
}

// Form validator interface
export interface FormValidator {
  /**
   * Validate the currently visible step
   * @returns True if step is valid
   */
  validateVisibleStep(): boolean;
}

// HubSpot form validator interface
export interface HubSpotFormValidator {
  /** Selector for required fields */
  REQUIRED_FIELD_SELECTOR: string;
  
  /**
   * Find navigation button in a step
   * @param step The step element
   * @returns Navigation button element or null
   */
  findNavigationButton(step: HTMLElement): HTMLElement | null;
  
  /**
   * Check if element is visible
   * @param element The element to check
   * @returns True if element is visible
   */
  isElementVisible(element: HTMLElement): boolean;
  
  /**
   * Create validator instance for a form
   * @param formContainer The form container element
   * @returns Form validator instance
   */
  createValidator(formContainer: HTMLElement): FormValidator;
  
  /**
   * Get readable label for a field
   * @param field The form field element
   * @returns Field label text
   */
  getFieldLabel(field: HTMLElement): string;
  
  /**
   * Validate email format
   * @param email Email string to validate
   * @returns True if valid email
   */
  isValidEmail(email: string): boolean;
  
  /**
   * Show custom validation error
   * @param step The form step element
   */
  showValidationError(step: HTMLElement): void;
  
  /**
   * Remove validation error
   * @param step The form step element
   */
  removeValidationError(step: HTMLElement): void;
}

// Form manager interface
export interface HubSpotFormManager {
  /**
   * Setup validation for all forms on page
   */
  setupAllForms(): void;
  
  /**
   * Setup validation for individual form
   * @param formContainer The form container element
   */
  setupSingleForm(formContainer: HTMLElement): void;
  
  /**
   * Create cleanup controller for a form
   * @param formContainer The form container element
   * @returns Cleanup controller
   */
  createFormCleanup(formContainer: HTMLElement): any;
  
  /**
   * Get cleanup controller for a form
   * @param formContainer The form container element
   * @returns Cleanup controller or undefined
   */
  getFormCleanup(formContainer: HTMLElement): any;
}

// Initialization return type
export interface HubSpotFormsInstance {
  HubSpotFormManager: HubSpotFormManager | null;
  HubSpotFormValidator: HubSpotFormValidator | null;
  CharacterLimitValidator: CharacterLimitValidator | null;
  FileUploadValidator?: FileUploadValidator | null;
  FieldValidator?: FieldValidator | null;
  removeHubSpotFormStyles?: () => void;
}

/**
 * Main initialization function
 * @param options Configuration options
 * @returns HubSpot forms instance
 */
export declare function init(options?: HubSpotFormsConfig): HubSpotFormsInstance;

/**
 * Default export - same as init function
 */
declare const hubspotForms: typeof init;
export default hubspotForms;

// Named exports
export declare const HubSpotFormManager: HubSpotFormManager;
export declare const HubSpotFormValidator: HubSpotFormValidator;
export declare const CharacterLimitValidator: CharacterLimitValidator;
export declare const FileUploadValidator: FileUploadValidator;
export declare const FieldValidator: FieldValidator;

/**
 * Remove HubSpot's default form styles
 */
export declare function removeHubSpotFormStyles(): void;

// Legacy compatibility functions
/**
 * Setup validation for all forms (legacy)
 */
export declare function setupAllFormsValidation(): void;

/**
 * Setup validation for single form (legacy)
 * @param formContainer The form container element
 */
export declare function setupSingleFormValidation(formContainer: HTMLElement): void;

/**
 * Setup field validation (legacy)
 */
export declare function setupFieldValidation(): void;

// Global declarations for browser environment
declare global {
  interface Window {
    /** Set to true to prevent auto-initialization */
    HUBSPOT_FORMS_NO_AUTO_INIT?: boolean;
    /** Global observer for dynamically loaded forms */
    hubspotFormGlobalObserver?: MutationObserver;
    /** React reference for hydration detection */
    React?: any;
  }
}