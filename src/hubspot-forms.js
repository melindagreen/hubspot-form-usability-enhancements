const removeHubSpotFormStyles = () => {
  // Constants for HubSpot CSS removal - now removes ALL HubSpot style elements
  const HUBSPOT_STYLE_SELECTOR = 'style[data-hsfc-id]';
  const OBSERVER_TIMEOUT_MS = 10000;
  const HUBSPOT_DATA_ATTR = 'data-hsfc-id';

  // Helper function to check if a node is a HubSpot style element
  const isHubSpotStyleElement = (node) => {
    return node.nodeType === Node.ELEMENT_NODE &&
           node.tagName === 'STYLE' &&
           node.hasAttribute(HUBSPOT_DATA_ATTR);
  };

  // Function to remove ALL HubSpot style elements
  const removeAllHubSpotStyles = () => {
    const hsStyles = document.querySelectorAll(HUBSPOT_STYLE_SELECTOR);
    let removed = false;
    
    hsStyles.forEach(styleElement => {
      styleElement.remove();
      removed = true;
    });
    
    return removed;
  };

  // Try to remove immediately
  const initialRemoval = removeAllHubSpotStyles();
  
  // Set up a MutationObserver to watch for new style elements being added
  // This catches styles added dynamically after forms load
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== 'childList') continue;
      
      for (const addedNode of mutation.addedNodes) {
        // Direct match: added node is a HubSpot style element
        if (isHubSpotStyleElement(addedNode)) {
          addedNode.remove();
          continue;
        }
        
        // Indirect match: added node contains HubSpot style elements
        if (addedNode.nodeType === Node.ELEMENT_NODE && 
            addedNode.querySelector) {
          const nestedStyles = addedNode.querySelectorAll(HUBSPOT_STYLE_SELECTOR);
          nestedStyles.forEach(style => style.remove());
        }
      }
    }
  });

  // Start observing the document for changes
  observer.observe(document, {
    childList: true,
    subtree: true
  });

  // Set a timeout to stop observing after a reasonable period
  setTimeout(() => {
    observer.disconnect();
  }, OBSERVER_TIMEOUT_MS);
}

const FieldValidator = {
  /** @param {HTMLElement} field @param {HTMLElement} container @returns {boolean} */
  isFieldValid(field, container) {
    switch (field.type) {
      case 'checkbox': return this._validateCheckboxField(field, container);
      case 'radio': return this._validateRadioField(field, container);
      case 'tel': return this._validateTelField(field);
      case 'file': return this._validateFileField(field);
      default: return this._validateTextBasedField(field);
    }
  },

  /** @param {HTMLElement} field @param {HTMLElement} container @returns {boolean} */
  isFieldInvalid(field, container) {
    return !this.isFieldValid(field, container);
  },

  /** @param {HTMLElement} field @param {HTMLElement} container @returns {boolean} */
  needsValidation(field, container) {
    return this.isFieldInvalid(field, container);
  },

  /** @param {HTMLElement} field @returns {boolean} */
  isGroupField(field) {
    return field.type === 'radio' || field.type === 'checkbox';
  },

  /** @param {HTMLElement} field @param {HTMLElement} container @returns {NodeList} */
  getFieldGroup(field, container) {
    return container.querySelectorAll(`input[name="${field.name}"]`);
  },

  // Private validation methods
  _validateCheckboxField(field, container) {
    const checkboxGroup = this.getFieldGroup(field, container);
    return checkboxGroup.length > 1
      ? Array.from(checkboxGroup).some(checkbox => checkbox.checked)
      : field.checked;
  },

  _validateRadioField(field, container) {
    return Array.from(this.getFieldGroup(field, container)).some(radio => radio.checked);
  },

  _validateTelField(field) {
    const value = (field.value || '').trim();
    return value && !/^\+\d{0,3}$/.test(value) && value !== '+';
  },

  _validateFileField(field) {
    // If no files selected but field is required, it's invalid
    if (!field.files || field.files.length === 0) {
      return !field.hasAttribute('required') && field.getAttribute('aria-required') !== 'true';
    }
    
    // If files are selected, validate them
    const validation = FileUploadValidator.validateFile(field);
    return validation.valid;
  },

  _validateTextBasedField(field) {
    const hasContent = field.value && field.value.trim() !== '';
    
    // For textarea elements, also check character limit
    if (field.tagName.toLowerCase() === 'textarea') {
      const characterLimit = parseInt(field.getAttribute('data-character-limit')) || 500;
      const isWithinLimit = field.value.length <= characterLimit;
      return hasContent && isWithinLimit;
    }
    
    return hasContent;
  }
};

// Character limit validation system - hides native HubSpot errors and shows custom ones
const CharacterLimitValidator = {
  DEFAULT_LIMIT: 500,
  
  // Setup character limit validation for all textareas in a form
  setupCharacterLimits(formContainer, cleanup) {
    const textareas = formContainer.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
      this.setupSingleTextarea(textarea, cleanup);
    });
  },
  
  // Setup character limit for a single textarea
  setupSingleTextarea(textarea, cleanup) {
    const characterLimit = parseInt(textarea.getAttribute('data-character-limit')) || this.DEFAULT_LIMIT;
    
    // Set the character limit attribute if not present
    if (!textarea.hasAttribute('data-character-limit')) {
      textarea.setAttribute('data-character-limit', characterLimit);
    }
    
    // Set the native maxlength attribute for browser enforcement
    textarea.setAttribute('maxlength', characterLimit);
    
    // Create or update character counter
    this.createCharacterCounter(textarea, characterLimit);
    
    // Add event listeners
    this.addTextareaEventListeners(textarea, characterLimit, cleanup);
    
    // Set up observer to hide HubSpot error messages
    this.setupErrorHidingObserver(textarea, cleanup);
    
    // Set up immediate pre-emptive observer to catch errors before they render
    this.setupPreemptiveErrorObserver(textarea, cleanup);
  },
  
  // Create character counter element
  createCharacterCounter(textarea, characterLimit) {
    const existingCounter = this.findCharacterCounter(textarea);
    if (existingCounter) {
      existingCounter.remove();
    }
    
    const counter = document.createElement('div');
    counter.className = 'hsfc-CharacterCounter';
    counter.setAttribute('data-textarea-id', textarea.id || `textarea-${Date.now()}`);
    
    // Insert after textarea
    const parent = textarea.parentElement;
    const nextSibling = textarea.nextElementSibling;
    if (nextSibling) {
      parent.insertBefore(counter, nextSibling);
    } else {
      parent.appendChild(counter);
    }
    
    this.updateCharacterCounter(textarea, counter, characterLimit);
    
    return counter;
  },
  
  // Find existing character counter for textarea
  findCharacterCounter(textarea) {
    const textareaId = textarea.id || `textarea-${Date.now()}`;
    return textarea.parentElement.querySelector(`.hsfc-CharacterCounter[data-textarea-id="${textareaId}"]`);
  },
  
  // Update character counter display
  updateCharacterCounter(textarea, counter, characterLimit) {
    const currentLength = textarea.value.length;
    const remaining = characterLimit - currentLength;
    
    counter.textContent = `${currentLength}/${characterLimit} characters`;
    
    // Set single class based on status
    if (remaining == 0) {
      counter.className = 'hsfc-CharacterCounter hsfc-CharacterCounter--danger';
    } else if (remaining <= 20) {
      counter.className = 'hsfc-CharacterCounter hsfc-CharacterCounter--warning';
    } else {
      counter.className = 'hsfc-CharacterCounter hsfc-CharacterCounter--default';
    }
  },
  
  // Add event listeners to textarea
  addTextareaEventListeners(textarea, characterLimit, cleanup) {
    const counter = this.findCharacterCounter(textarea);
    
    // Input event for real-time updates
    textarea.addEventListener('input', () => {
      this.handleTextareaInput(textarea, characterLimit, counter);
    }, {
      signal: cleanup.abortController.signal
    });
    
    // Keyup event for additional validation
    textarea.addEventListener('keyup', () => {
      this.handleTextareaInput(textarea, characterLimit, counter);
    }, {
      signal: cleanup.abortController.signal
    });
    
    // Paste event for paste validation
    textarea.addEventListener('paste', (event) => {
      // Use setTimeout to get the value after paste is processed
      setTimeout(() => {
        this.handleTextareaInput(textarea, characterLimit, counter);
      }, 10);
    }, {
      signal: cleanup.abortController.signal
    });
    
    // Focus event to ensure counter is visible
    textarea.addEventListener('focus', () => {
      if (counter) {
        counter.style.display = 'block';
      }
    }, {
      signal: cleanup.abortController.signal
    });
  },
  
  // Handle textarea input events
  handleTextareaInput(textarea, characterLimit, counter) {
    // Update character counter
    if (counter) {
      this.updateCharacterCounter(textarea, counter, characterLimit);
    }
    
    const currentLength = textarea.value.length;
    
    // With maxlength attribute, the field should never exceed the limit
    // But we'll keep the border color logic for visual feedback as users approach the limit
    
    // Set appropriate class for visual feedback (preserving existing classes)
    const baseClasses = textarea.className.replace(/\bhsfc-Textarea--\w+\b/g, '').trim();
    
    if (currentLength >= characterLimit) {
      textarea.className = `${baseClasses} hsfc-Textarea--danger`.trim();
    } else if (currentLength >= characterLimit - 20) {
      textarea.className = `${baseClasses} hsfc-Textarea--warning`.trim();
    } else {
      textarea.className = baseClasses;
    }
  },
  
  // Show custom character limit error
  showCustomCharacterError(textarea, currentLength, characterLimit) {
    // Remove existing custom error first
    this.hideCustomCharacterError(textarea);
    
    const overBy = currentLength - characterLimit;
    
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'hsfc-ErrorAlert hsfc-CustomCharacterError';
    errorDiv.setAttribute('role', 'alert');
    
    errorDiv.textContent = `This field must be ${characterLimit} characters or less. You are ${overBy} character${overBy > 1 ? 's' : ''} over the limit.`;
    
    // Insert after character counter
    const counter = this.findCharacterCounter(textarea);
    const insertAfter = counter || textarea;
    
    if (insertAfter.nextElementSibling) {
      insertAfter.parentElement.insertBefore(errorDiv, insertAfter.nextElementSibling);
    } else {
      insertAfter.parentElement.appendChild(errorDiv);
    }
  },
  
  // Hide custom character limit error
  hideCustomCharacterError(textarea) {
    const container = textarea.closest('.hsfc-FormField, .hs-form-field') || textarea.parentElement;
    const customError = container.querySelector('.hsfc-CustomCharacterError');
    if (customError) {
      customError.remove();
    }
  },
  
  // Enhance HubSpot character limit errors for textareas
  hideHubSpotCharacterErrors(textarea) {
    const container = textarea.closest('.hsfc-FormField, .hs-form-field') || textarea.parentElement;
    if (!container) return;
    
    // Use a more comprehensive approach - look for errors in the entire container
    const errorElements = container.querySelectorAll('*');
    
    errorElements.forEach(errorEl => {
      if (errorEl.textContent) {
        const errorText = errorEl.textContent.toLowerCase().trim();
        const match = errorText.match(/enter (\d+) characters? or fewer/i);
        
        if (match) {
          const limit = parseInt(match[1]);
          const currentLength = textarea.value.length;
          const overBy = currentLength - limit;
          
          if (overBy > 0) {
            // Enhance the error message instead of hiding it
            errorEl.textContent = `Enter ${limit} characters or fewer. You are ${overBy} character${overBy > 1 ? 's' : ''} over the limit.`;
            errorEl.setAttribute('data-hubspot-character-error', 'enhanced');
          }
        }
      }
    });
  },
  
  // Show HubSpot character limit errors
  showHubSpotCharacterErrors(textarea) {
    const container = textarea.closest('.hsfc-FormField, .hs-form-field');
    if (!container) return;
    
    const hiddenErrors = container.querySelectorAll('[data-hidden-by-character-validator="true"]');
    
    hiddenErrors.forEach(errorEl => {
      errorEl.style.display = '';
      errorEl.removeAttribute('data-hidden-by-character-validator');
    });
  },
  
  // Set up observer to hide HubSpot error messages as they appear
  setupErrorHidingObserver(textarea, cleanup) {
    const container = textarea.closest('.hsfc-FormField, .hs-form-field');
    if (!container) return;
    
    const observer = new MutationObserver((mutations) => {
      const currentLength = textarea.value.length;
      const characterLimit = parseInt(textarea.getAttribute('data-character-limit')) || this.DEFAULT_LIMIT;
      
      // Only hide errors if we're over the character limit
      if (currentLength > characterLimit) {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node is an error message
              if (node.classList && (node.classList.contains('hsfc-ErrorAlert') || node.classList.contains('hs-error-msg'))) {
                this.checkAndHideCharacterError(node);
              }
              
              // Also check for error messages within the added node
              const errorElements = node.querySelectorAll?.('.hsfc-ErrorAlert, .hs-error-msg');
              if (errorElements) {
                errorElements.forEach(errorEl => {
                  this.checkAndHideCharacterError(errorEl);
                });
              }
            }
          });
        });
      }
    });
    
    // Track observer for cleanup
    cleanup.observers.push(observer);
    
    observer.observe(container, {
      childList: true,
      subtree: true
    });
  },
  
  // Check if an error message should be enhanced for textareas
  checkAndHideCharacterError(errorElement) {
    if (errorElement.textContent) {
      const errorText = errorElement.textContent.toLowerCase().trim();
      const match = errorText.match(/enter (\d+) characters? or fewer/i);
      
      if (match) {
        const limit = parseInt(match[1]);
        
        // Find the associated textarea to calculate characters over
        const container = errorElement.closest('.hsfc-FormField, .hs-form-field');
        const textarea = container?.querySelector('textarea');
        
        if (textarea) {
          const currentLength = textarea.value.length;
          const overBy = currentLength - limit;
          
          if (overBy > 0) {
            // Enhance the error message instead of hiding it
            errorElement.textContent = `Enter ${limit} characters or fewer. You are ${overBy} character${overBy > 1 ? 's' : ''} over the limit.`;
            errorElement.setAttribute('data-hubspot-character-error', 'enhanced');
          }
        }
      }
    }
  },
  
  // Check if textarea has character limit error (for form validation)
  hasCharacterLimitError(textarea) {
    const characterLimit = parseInt(textarea.getAttribute('data-character-limit')) || this.DEFAULT_LIMIT;
    return textarea.value.length > characterLimit;
  },
  
  // Get character limit error message for form-level error summary
  getCharacterLimitErrorMessage(textarea) {
    const characterLimit = parseInt(textarea.getAttribute('data-character-limit')) || this.DEFAULT_LIMIT;
    const currentLength = textarea.value.length;
    
    if (currentLength > characterLimit) {
      const overBy = currentLength - characterLimit;
      const fieldLabel = HubSpotFormValidator.getFieldLabel(textarea) || 'Text area';
      return `${fieldLabel}: Must be ${characterLimit} characters or less (currently ${overBy} over)`;
    }
    
    return null;
  },
  
  // Start aggressive monitoring to catch and remove HubSpot errors
  startAggressiveErrorMonitoring(textarea) {
    // Avoid setting up multiple monitors for the same textarea
    if (textarea.hasAttribute('data-error-monitor-active')) {
      return;
    }
    
    textarea.setAttribute('data-error-monitor-active', 'true');
    
    // Set up a repeated check that runs every 100ms for 5 seconds
    let checkCount = 0;
    const maxChecks = 50; // 5 seconds at 100ms intervals
    
    const monitorInterval = setInterval(() => {
      this.hideHubSpotCharacterErrors(textarea);
      checkCount++;
      
      if (checkCount >= maxChecks) {
        clearInterval(monitorInterval);
        textarea.removeAttribute('data-error-monitor-active');
      }
    }, 100);
    
    // Also clean up if the user moves to within the character limit
    const cleanupCheck = setInterval(() => {
      const characterLimit = parseInt(textarea.getAttribute('data-character-limit')) || this.DEFAULT_LIMIT;
      if (textarea.value.length <= characterLimit) {
        clearInterval(monitorInterval);
        clearInterval(cleanupCheck);
        textarea.removeAttribute('data-error-monitor-active');
      }
    }, 200);
  },
  
  // Set up preemptive observer to catch and mark errors immediately as they're added
  setupPreemptiveErrorObserver(textarea, cleanup) {
    const container = textarea.closest('.hsfc-FormField, .hs-form-field') || document.body;
    
    const preemptiveObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check the node itself
            this.immediatelyMarkCharacterError(node);
            
            // Check all child nodes
            const allDescendants = node.querySelectorAll('*');
            allDescendants.forEach(descendant => {
              this.immediatelyMarkCharacterError(descendant);
            });
          }
        });
      });
    });
    
    // Track observer for cleanup
    cleanup.observers.push(preemptiveObserver);
    
    // Observe the entire document to catch errors added anywhere
    preemptiveObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  },
  
  // Immediately enhance character error elements as they're added
  immediatelyMarkCharacterError(element) {
    if (element.textContent) {
      const errorText = element.textContent.toLowerCase().trim();
      const match = errorText.match(/enter (\d+) characters? or fewer/i);
      
      if (match) {
        const limit = parseInt(match[1]);
        
        // Find the associated textarea to calculate characters over
        const container = element.closest('.hsfc-FormField, .hs-form-field');
        const textarea = container?.querySelector('textarea');
        
        if (textarea) {
          const currentLength = textarea.value.length;
          const overBy = currentLength - limit;
          
          if (overBy > 0) {
            // Enhance the error message instead of hiding it
            element.textContent = `Enter ${limit} characters or fewer. You are ${overBy} character${overBy > 1 ? 's' : ''} over the limit.`;
            element.setAttribute('data-hubspot-character-error', 'enhanced');
          }
        }
      }
    }
  }
};

// Simple file upload validator
const FileUploadValidator = {
  // Configuration storage
  _config: {
    allowedExtensions: null,
    maxFileSize: null
  },
  
  // Get configuration from runtime config, environment variables, or use defaults
  get allowedExtensions() {
    if (this._config.allowedExtensions) {
      return this._config.allowedExtensions;
    }
    const envExtensions = import.meta.env.VITE_UPLOAD_ALLOWED_EXTENSIONS;
    if (envExtensions) {
      return envExtensions.split(',').map(ext => ext.trim().toLowerCase());
    }
    return ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'txt'];
  },
  
  set allowedExtensions(value) {
    this._config.allowedExtensions = value;
  },
  
  get maxFileSize() {
    if (this._config.maxFileSize) {
      return this._config.maxFileSize;
    }
    const envSize = import.meta.env.VITE_UPLOAD_MAX_SIZE;
    if (envSize) {
      // Parse size like "10MB", "5GB", etc.
      const size = envSize.toString().toUpperCase();
      const number = parseFloat(size);
      
      if (size.includes('GB')) return number * 1024 * 1024 * 1024;
      if (size.includes('MB')) return number * 1024 * 1024;
      if (size.includes('KB')) return number * 1024;
      
      return number; // Assume bytes if no unit
    }
    return 10 * 1024 * 1024; // 10MB default
  },
  
  set maxFileSize(value) {
    this._config.maxFileSize = value;
  },
  
  // Validate a file input
  validateFile(fileInput) {
    if (!fileInput.files || fileInput.files.length === 0) {
      return { valid: true, errors: [] };
    }
    
    const errors = [];
    
    // Validate each selected file
    for (let i = 0; i < fileInput.files.length; i++) {
      const file = fileInput.files[i];
      
      // Check file size
      if (file.size > this.maxFileSize) {
        errors.push(`File "${file.name}" size exceeds ${this.formatFileSize(this.maxFileSize)} limit`);
      }
      
      // Check file extension
      const extension = file.name.split('.').pop().toLowerCase();
      if (!this.allowedExtensions.includes(extension)) {
        errors.push(`File "${file.name}" type ".${extension}" is not allowed. Allowed types: ${this.allowedExtensions.map(ext => '.' + ext).join(', ')}`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  },
  
  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },
  
  // Show error message
  showError(fileInput, errors) {
    this.hideError(fileInput);
    
    if (errors.length === 0) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'hsfc-ErrorAlert hsfc-FileError';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.innerHTML = errors.join('<br/>');
    fileInput.parentElement.appendChild(errorDiv);
  },
  
  // Hide error message
  hideError(fileInput) {
    const existingError = fileInput.parentElement.querySelector('.hsfc-FileError');
    if (existingError) {
      existingError.remove();
    }
    fileInput.style.borderColor = '';
  },
  
  // Show accepted files list
  showAcceptedFiles(fileInput) {
    this.hideAcceptedFiles(fileInput);
    
    if (!fileInput.files || fileInput.files.length === 0) {
      return;
    }
    
    const acceptedFiles = [];
    const rejectedFiles = [];
    
    // Categorize files
    for (let i = 0; i < fileInput.files.length; i++) {
      const file = fileInput.files[i];
      const extension = file.name.split('.').pop().toLowerCase();
      const isValidSize = file.size <= this.maxFileSize;
      const isValidType = this.allowedExtensions.includes(extension);
      
      if (isValidSize && isValidType) {
        acceptedFiles.push(file.name);
      } else {
        rejectedFiles.push(file.name);
      }
    }
    
    // Show accepted files if any
    if (acceptedFiles.length > 0) {
      const acceptedDiv = document.createElement('div');
      acceptedDiv.className = 'hsfc-AcceptedFiles';
      
      if (acceptedFiles.length === 1) {
        acceptedDiv.textContent = `✓ Accepted: ${acceptedFiles[0]}`;
      } else {
        acceptedDiv.innerHTML = `✓ Accepted files (${acceptedFiles.length}):<br>` + 
          acceptedFiles.map(name => `• ${name}`).join('<br>');
      }
      
      fileInput.parentElement.appendChild(acceptedDiv);
    }
  },
  
  // Hide accepted files list
  hideAcceptedFiles(fileInput) {
    const existingAccepted = fileInput.parentElement.querySelector('.hsfc-AcceptedFiles');
    if (existingAccepted) {
      existingAccepted.remove();
    }
  },
  
  // Setup validation for file inputs
  setup(formContainer) {
    const fileInputs = formContainer.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach((fileInput, index) => {
      
      fileInput.addEventListener('change', () => {
        
        const validation = this.validateFile(fileInput);
        
        // Always show accepted files (if any)
        this.showAcceptedFiles(fileInput);
        
        if (validation.valid) {
          this.hideError(fileInput);
        } else {
          this.showError(fileInput, validation.errors);
          // Don't clear files - let user see which ones have errors and manually reselect
        }
      });
    });
  }
};

// HubSpot form validation system - optimized for multiple forms
const HubSpotFormValidator = {
  // HubSpot uses both 'required' and 'aria-required="true"' attributes
  REQUIRED_FIELD_SELECTOR: 'input[required], select[required], textarea[required], input[aria-required="true"], select[aria-required="true"], textarea[aria-required="true"]',
  
  // Helper to find navigation button (not Previous)
  findNavigationButton(step) {
    const buttons = step.querySelectorAll('.hsfc-NavigationRow button[type="button"], .hsfc-NavigationRow button[type="submit"]');
    for (const button of buttons) {
      const buttonText = button.textContent.trim().toLowerCase();
      // Return any button that is NOT a previous button
      if (!buttonText.includes('previous') && !buttonText.includes('back')) {
        return button;
      }
    }
    return null;
  },
  // Helper to check if element is actually visible
  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);

    return rect.width > 0 && rect.height > 0 && 
           style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  },
  
  // Create validator instance for specific form
  createValidator(formContainer) {
    const validateVisibleStep = () => {
      // Find currently visible step
      const visibleStep = Array.from(formContainer.querySelectorAll('.hsfc-Step'))
        .find(step => {
          const computedStyle = getComputedStyle(step);
          const isVisible = computedStyle.display !== 'none' && 
                          computedStyle.visibility !== 'hidden' && 
                          computedStyle.opacity !== '0';
          return isVisible;
        });
      
      if (!visibleStep) {
        return false;
      }
      
      // Find navigation button
      const nextButton = this.findNavigationButton(visibleStep);
      if (!nextButton) {
        return false;
      }
      
      // Check for visible errors
      const errorElements = visibleStep.querySelectorAll('.hsfc-ErrorAlert');
      const hasVisibleErrors = Array.from(errorElements).some(errorEl => 
        this.isElementVisible(errorEl) && errorEl.textContent.trim() !== ''
      );
      
      if (hasVisibleErrors) {
        return false;
      }
      
      // Check required fields - HubSpot uses both 'required' and 'aria-required="true"'
      const requiredFields = visibleStep.querySelectorAll(this.REQUIRED_FIELD_SELECTOR);
      
      if (requiredFields.length === 0) {
        return true;
      }
      
      // Validate required fields are filled - use centralized field validation
      const isFieldValid = (field) => FieldValidator.isFieldValid(field, visibleStep);
      
      // For radio buttons and checkbox groups, we need to validate by group, not individual buttons
      const processedFieldGroups = new Set();
      const fieldsToValidate = Array.from(requiredFields).filter(field => {
        if (field.type === 'radio' || field.type === 'checkbox') {
          if (processedFieldGroups.has(field.name)) {
            return false; // Skip duplicate field group validation
          }
          processedFieldGroups.add(field.name);
        }
        return true;
      });
      
      const allRequiredFilled = fieldsToValidate.every(isFieldValid);
      
      return allRequiredFilled;
    };
    
    return { validateVisibleStep };
  },
  
  // Show custom HubSpot-style error message with WCAG compliance
  showValidationError(step) {
    // Remove any existing custom error
    const existingError = step.querySelector('.hsfc-CustomValidationError');
    if (existingError) {
      existingError.remove();
    }
    
    // Find all fields with errors to create descriptive links
    const fieldsWithErrors = this.getFieldsWithErrors(step);
    
    if (fieldsWithErrors.length === 0) {
      // No errors found, don't show error box
      return;
    }
    
    // Create error container
    const errorDiv = document.createElement('div');
    errorDiv.className = 'hsfc-ErrorAlert hsfc-CustomValidationError';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'polite');
    
    // Create main error message
    const heading = document.createElement('div');
    heading.textContent = `This form contains ${fieldsWithErrors.length} error${fieldsWithErrors.length > 1 ? 's' : ''}. Please review the following:`;
    errorDiv.appendChild(heading);
    
    // Create list of error links
    const errorList = document.createElement('ul');
    
    fieldsWithErrors.forEach((fieldInfo, index) => {
      const listItem = document.createElement('li');
      
      const errorLink = document.createElement('a');
      errorLink.href = '#';
      errorLink.textContent = fieldInfo.description;
      
      // Add click handler to focus the field
      errorLink.addEventListener('click', (e) => {
        e.preventDefault();
        fieldInfo.field.focus();
        fieldInfo.field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      
      // Add keyboard support
      errorLink.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fieldInfo.field.focus();
          fieldInfo.field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      
      listItem.appendChild(errorLink);
      errorList.appendChild(listItem);
    });
    
    errorDiv.appendChild(errorList);
    
    // Find the step content area
    const stepContent = step.querySelector('.hsfc-Step__Content') || step;
    
    // Ensure the step content uses flexbox for proper ordering
    const stepContentStyle = getComputedStyle(stepContent);
    if (stepContentStyle.display !== 'flex' && stepContentStyle.display !== 'inline-flex') {
      stepContent.style.display = 'flex';
      stepContent.style.flexDirection = 'column';
    }
    
    // Add fallback classes for browsers that don't support :has()
    HubSpotFormManager.addFlexboxFallbackClasses(step, stepContent);
    
    // Check if there's already a repositioned progress bar in the correct position
    // If so, we insert the validation error before it (so error appears above progress bar)
    // This prevents the progress bar from moving when validation errors appear
    const existingProgressBar = stepContent.querySelector('.hsfc-ProgressBar--repositioned');
    
    if (existingProgressBar) {
      // If progress bar is already positioned, insert validation error before it
      // CSS flexbox order will ensure validation error (order: 1) appears above progress bar (order: 2)
      stepContent.insertBefore(errorDiv, existingProgressBar);
    } else {
      // If no progress bar, find the first actual form field to insert before it
      const firstFormField = HubSpotFormManager.findFirstFormField(stepContent);
      
      if (firstFormField) {
        // Insert before the first form field
        stepContent.insertBefore(errorDiv, firstFormField);
      } else {
        // Fallback: insert at the end of step content if no form fields found
        stepContent.appendChild(errorDiv);
      }
    }
    
    // Scroll error into view
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Store reference for persistent checking (no auto-remove)
    step.setAttribute('data-has-error-summary', 'true');
  },
  
  // Get fields with errors and their descriptions
  getFieldsWithErrors(step) {
    const fieldsWithErrors = [];
    
    // Find all visible error messages
    const errorElements = step.querySelectorAll('.hsfc-ErrorAlert:not(.hsfc-CustomValidationError)');
    
    for (const errorEl of errorElements) {
      if (this.isElementVisible(errorEl) && errorEl.textContent.trim() !== '') {
        // Find the associated field
        const field = this.findFieldForError(errorEl);
        if (field) {
          const fieldLabel = this.getFieldLabel(field) || `Field "${field.name || field.id || 'unknown'}"`;
          const errorText = errorEl.textContent.trim();
          
          fieldsWithErrors.push({
            field: field,
            description: `${fieldLabel}: ${errorText}`,
            errorElement: errorEl
          });
        }
      }
    }
    
    // Check for character limit errors on textareas
    const textareas = step.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      if (CharacterLimitValidator.hasCharacterLimitError(textarea)) {
        const errorMessage = CharacterLimitValidator.getCharacterLimitErrorMessage(textarea);
        if (errorMessage && !fieldsWithErrors.some(f => f.field === textarea)) {
          fieldsWithErrors.push({
            field: textarea,
            description: errorMessage,
            errorElement: step.querySelector('.hsfc-CustomCharacterError')
          });
        }
      }
    });
    
    // Also check for empty required fields that might not have shown errors yet
    const requiredFields = step.querySelectorAll(this.REQUIRED_FIELD_SELECTOR);
    
    // Helper function to check if a field is invalid - use centralized validation
    const isFieldInvalid = (field) => FieldValidator.isFieldInvalid(field, step);
    
    // For radio buttons and checkbox groups, avoid processing multiple fields from the same group
    const processedFieldGroups = new Set();
    
    for (const field of requiredFields) {
      // Skip duplicate group processing for radio buttons and checkbox groups with same name
      if (field.type === 'radio' || field.type === 'checkbox') {
        if (processedFieldGroups.has(field.name)) {
          continue; // Skip - already processed this field group
        }
        processedFieldGroups.add(field.name);
      }
      
      // Check if field is invalid and not already in the error list
      if (isFieldInvalid(field) && !fieldsWithErrors.some(f => f.field === field)) {
        const fieldLabel = this.getFieldLabel(field) || `Field "${field.name || field.id || 'unknown'}"`;
        
        const errorDescription = `${fieldLabel}: Please complete this required field.`;
        
        fieldsWithErrors.push({
          field: field,
          description: errorDescription,
          errorElement: null
        });
      }
    }
    
    // Check for format validation on fields that have values (not empty)
    const allFields = step.querySelectorAll('input, select, textarea');
    
    for (const field of allFields) {
      // Skip if already found or if field is empty
      if (fieldsWithErrors.some(f => f.field === field) || !field.value || field.value.trim() === '') {
        continue;
      }
      
      let formatError = null;
      const fieldLabel = this.getFieldLabel(field) || `Field "${field.name || field.id || 'unknown'}"`;
      
      // Check email format validation
      if (field.type === 'email' || field.name?.toLowerCase().includes('email')) {
        if (!this.isValidEmail(field.value)) {
          formatError = `${fieldLabel} must be formatted correctly`;
        }
      }
      // Check fields with pattern attribute
      else if (field.hasAttribute('pattern')) {
        try {
          if (!field.value.match(new RegExp(field.pattern))) {
            formatError = `${fieldLabel} must be formatted correctly`;
          }
        } catch (e) {
          // Pattern validation error - skip this field
        }
      }
      
      // Add format error if found
      if (formatError) {
        fieldsWithErrors.push({
          field: field,
          description: formatError,
          errorElement: null
        });
      }
    }
    
    // Finally, check for commonly required fields that are empty and not already caught
    // Only check email fields since they're commonly required but may not be marked as such
    for (const field of allFields) {
      // Skip if already found or has value
      if (fieldsWithErrors.some(f => f.field === field) || (field.value && field.value.trim() !== '')) {
        continue;
      }
      
      // Only check email fields as commonly required
      if (field.type === 'email' || field.name?.toLowerCase().includes('email')) {
        const fieldLabel = this.getFieldLabel(field) || `Field "${field.name || field.id || 'unknown'}"`;
        
        fieldsWithErrors.push({
          field: field,
          description: `${fieldLabel}: Please complete this required field.`,
          errorElement: null
        });
      }
    }
    
    return fieldsWithErrors;
  },
  
  // Find field associated with an error element
  findFieldForError(errorEl) {
    // Try multiple strategies to find the field, starting with most specific
    let field = null;
    
    // Strategy 1: Previous sibling
    field = errorEl.previousElementSibling?.matches?.('input, select, textarea') ? errorEl.previousElementSibling : null;
    if (field) return field;
    
    // Strategy 2: Within same form field container
    field = errorEl.closest('.hs-form-field, .hsfc-FormField')?.querySelector('input, select, textarea');
    if (field) return field;
    
    // Strategy 3: Within specific field type containers
    field = errorEl.closest('.hs-fieldtype-text, .hs-fieldtype-email, .hs-fieldtype-number, .hs-fieldtype-select, .hs-fieldtype-textarea')?.querySelector('input, select, textarea');
    if (field) return field;
    
    // Strategy 4: Parent element search
    field = errorEl.parentElement?.querySelector('input, select, textarea');
    if (field) return field;
    
    // Strategy 5: Look for field before this error in DOM order
    let currentEl = errorEl.previousElementSibling;
    while (currentEl) {
      if (currentEl.matches && currentEl.matches('input, select, textarea')) {
        return currentEl;
      }
      if (currentEl.querySelector) {
        field = currentEl.querySelector('input, select, textarea');
        if (field) return field;
      }
      currentEl = currentEl.previousElementSibling;
    }
    
    // Strategy 6: Look in parent's previous children
    let parentEl = errorEl.parentElement;
    while (parentEl && !parentEl.matches('.hsfc-Step')) {
      const fieldInParent = parentEl.querySelector('input, select, textarea');
      if (fieldInParent) return fieldInParent;
      parentEl = parentEl.parentElement;
    }
    
    return null;
  },
  
  // Get a readable label for a field
  getFieldLabel(field) {
    // Special handling for radio and checkbox fields
    if (field.type === 'radio' || field.type === 'checkbox') {
      // Strategy 1: Look for the field group container
      let groupContainer = field.closest('.hsfc-RadioFieldGroup, .hsfc-CheckboxFieldGroup');
      
      if (groupContainer) {
        // Look for the group label (usually at the top of the group)
        const groupLabel = groupContainer.querySelector('label[data-hsfc-id="FieldLabel"]:first-child, .hsfc-FieldLabel:first-child');
        if (groupLabel && groupLabel.textContent.trim()) {
          return groupLabel.textContent.trim().replace(/\s*\*\s*$/, '');
        }
      }
      
      // Strategy 2: Look for parent field container that might contain group info
      let parentField = field.closest('[data-hsfc-id*="Field"]');
      
      if (parentField) {
        // Look for any label in the parent that's not the individual option label
        const parentLabel = parentField.querySelector('label[data-hsfc-id="FieldLabel"]');
        if (parentLabel && !parentLabel.contains(field) && parentLabel.textContent.trim()) {
          return parentLabel.textContent.trim().replace(/\s*\*\s*$/, '');
        }
      }
      
      // Strategy 3: Look for preceding sibling that might be a group title
      let sibling = field.parentElement;
      while (sibling && sibling.previousElementSibling) {
        sibling = sibling.previousElementSibling;
        if (sibling.tagName === 'LABEL' && !sibling.querySelector('input')) {
          return sibling.textContent.trim().replace(/\s*\*\s*$/, '');
        }
      }
    }
    
    // Standard field label detection (for individual fields like text, email, etc.)
    const label = field.closest('.hs-form-field, .hsfc-FormField')?.querySelector('label') ||
                 document.querySelector(`label[for="${field.id}"]`);
    
    if (label) {
      return label.textContent.trim().replace(/\s*\*\s*$/, ''); // Remove asterisk
    }
    
    // Extended label detection strategies for date fields and other field types
    // Strategy 1: Look for label with data-hsfc-id="FieldLabel" in various parent containers
    let parentContainer = field.closest('.hsfc-FormField, .hsfc-Row, .hs-form-field, [data-hsfc-id*="Field"]');
    if (parentContainer) {
      const fieldLabel = parentContainer.querySelector('label[data-hsfc-id="FieldLabel"], .hsfc-FieldLabel');
      if (fieldLabel && fieldLabel.textContent.trim()) {
        return fieldLabel.textContent.trim().replace(/\s*\*\s*$/, '');
      }
    }
    
    // Strategy 2: Look for any label element in the parent container that's not a child of this field
    if (parentContainer) {
      const labels = parentContainer.querySelectorAll('label');
      for (const potentialLabel of labels) {
        // Skip if this label contains the field (it's wrapping the field, not labeling it)
        if (potentialLabel.contains(field)) continue;
        
        // Skip empty labels
        if (!potentialLabel.textContent.trim()) continue;
        
        return potentialLabel.textContent.trim().replace(/\s*\*\s*$/, '');
      }
    }
    
    // Strategy 3: Look for preceding elements that might contain the label text
    let currentElement = field;
    for (let i = 0; i < 5; i++) { // Check up to 5 levels up
      currentElement = currentElement.parentElement;
      if (!currentElement) break;
      
      // Look for labels in this level that don't contain our field
      const labels = currentElement.querySelectorAll('label');
      for (const potentialLabel of labels) {
        if (potentialLabel.contains(field)) continue;
        if (!potentialLabel.textContent.trim()) continue;
        
        return potentialLabel.textContent.trim().replace(/\s*\*\s*$/, '');
      }
      
      // Also check for text nodes or spans that might be labels
      const textElements = currentElement.querySelectorAll('span, div');
      for (const textElement of textElements) {
        // Skip if it contains the field or has no text
        if (textElement.contains(field) || !textElement.textContent.trim()) continue;
        
        // Only consider short text that looks like a label
        const text = textElement.textContent.trim();
        if (text.length > 0 && text.length < 100 && !text.includes('\n')) {
          // Check if this looks like a label by seeing if it's positioned before our field
          const fieldRect = field.getBoundingClientRect();
          const textRect = textElement.getBoundingClientRect();
          
          // If the text element is above or to the left of the field, it might be a label
          if (textRect.top < fieldRect.top || (textRect.top === fieldRect.top && textRect.left < fieldRect.left)) {
            return text.replace(/\s*\*\s*$/, '');
          }
        }
      }
    }
    
    // Fallback to placeholder or name
    return field.placeholder || field.getAttribute('aria-label') || field.name || 'Unknown field';
  },
  
  // Simple email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },
  
  // Check if all errors are cleared and remove error summary if so
  checkAndRemoveErrorSummary(step) {
    const errorSummary = step.querySelector('.hsfc-CustomValidationError');
    
    if (!errorSummary) return;
    
    // Check if there are still visible errors (excluding our notifications)
    const remainingErrors = step.querySelectorAll('.hsfc-ErrorAlert:not(.hsfc-CustomValidationError)');
    const hasVisibleErrors = Array.from(remainingErrors).some(errorEl => 
      this.isElementVisible(errorEl) && errorEl.textContent.trim() !== ''
    );
    
    // Check for empty required fields using field-type-aware logic
    const requiredFields = step.querySelectorAll(this.REQUIRED_FIELD_SELECTOR);
    
    // Helper function to check if a field is invalid - use centralized validation
    const isFieldInvalid = (field) => FieldValidator.isFieldInvalid(field, step);
    
    // For radio buttons and checkbox groups, avoid processing multiple fields from the same group
    const processedFieldGroups = new Set();
    const hasEmptyRequired = Array.from(requiredFields).some(field => {
      // Skip duplicate group processing for radio buttons and checkbox groups with same name
      if (field.type === 'radio' || field.type === 'checkbox') {
        if (processedFieldGroups.has(field.name)) {
          return false; // Skip - already processed this field group
        }
        processedFieldGroups.add(field.name);
      }
      
      return isFieldInvalid(field);
    });
    
    // Check for character limit errors
    const textareas = step.querySelectorAll('textarea');
    const hasCharacterLimitErrors = Array.from(textareas).some(textarea => 
      CharacterLimitValidator.hasCharacterLimitError(textarea)
    );
    
    if (!hasVisibleErrors && !hasEmptyRequired && !hasCharacterLimitErrors) {
      errorSummary.remove();
      step.removeAttribute('data-has-error-summary');
      
      // Clean up fallback classes when validation error is removed
      const stepContent = step.querySelector('.hsfc-Step__Content') || step;
      HubSpotFormManager.removeFlexboxFallbackClasses(step, stepContent);
    }
  },
  
  // Remove custom validation error (now uses smart checking)
  removeValidationError(step) {
    this.checkAndRemoveErrorSummary(step);
  }
};

// Form management system
const HubSpotFormManager = {
  // Track initialized forms to prevent duplicates
  initializedForms: new WeakSet(),

  // Track cleanup resources for each form
  formCleanupMap: new WeakMap(),

  // Create cleanup controller for a form
  createFormCleanup(formContainer) {
    const cleanup = {
      abortController: new AbortController(),
      observers: [],
      globalListeners: [],
      
      // DOM query cache
      _cachedVisibleStep: null,
      _cacheValid: true,
      
      // Method to get current visible step with caching
      getVisibleStep() {
        if (!this._cacheValid || !this._cachedVisibleStep) {
          this._cachedVisibleStep = Array.from(formContainer.querySelectorAll('.hsfc-Step'))
            .find(step => getComputedStyle(step).display !== 'none');
          this._cacheValid = true;
        }
        return this._cachedVisibleStep;
      },
      
      // Method to invalidate cache when DOM changes
      invalidateCache() {
        this._cacheValid = false;
        this._cachedVisibleStep = null;
      },
      
      // Method to cleanup everything for this form
      destroy() {
        // Abort all event listeners using AbortController
        this.abortController.abort();
        
        // Disconnect all observers
        this.observers.forEach(observer => {
          if (observer && typeof observer.disconnect === 'function') {
            observer.disconnect();
          }
        });
        
        // Remove global listeners
        this.globalListeners.forEach(({ element, event, listener }) => {
          element.removeEventListener(event, listener);
        });
        
        // Clear cache and arrays
        this.invalidateCache();
        this.observers.length = 0;
        this.globalListeners.length = 0;
      }
    };
    
    this.formCleanupMap.set(formContainer, cleanup);
    return cleanup;
  },

  // Get cleanup controller for a form
  getFormCleanup(formContainer) {
    return this.formCleanupMap.get(formContainer);
  },
  
  // Setup validation for all forms on page
  setupAllForms() {
    const hubspotForms = document.querySelectorAll('.hsfc-Form');
    
    if (hubspotForms.length > 0) {
      removeHubSpotFormStyles();
      
      hubspotForms.forEach((formContainer, index) => {
        this.setupSingleForm(formContainer);
      });
    }
    
    this.setupGlobalObserver();
  },
  
  // Setup validation for individual form
  setupSingleForm(formContainer) {
    if (this.initializedForms.has(formContainer)) {
      return;
    }

    // Clean up any existing setup for this container (in case of re-initialization)
    const existingCleanup = this.getFormCleanup(formContainer);
    if (existingCleanup) {
      existingCleanup.destroy();
    }

    // Create new cleanup controller for this form
    const cleanup = this.createFormCleanup(formContainer);
    
    this.initializedForms.add(formContainer);
    const validator = HubSpotFormValidator.createValidator(formContainer);

    this.initializeButtonState(formContainer, cleanup);
    this.addEventListeners(formContainer, validator, cleanup);
    this.setupFormObserver(formContainer, validator, cleanup);

    // Setup phone field accessibility
    this.setupPhoneFieldAccessibility(formContainer, cleanup);

    // Setup dropdown accessibility for WCAG compliance
    this.setupDropdownAccessibility(formContainer, cleanup);

    // Setup progress bar repositioning for the first form only
    this.setupProgressBarRepositioning(formContainer, cleanup);

    // Setup character limit validation for textareas
    CharacterLimitValidator.setupCharacterLimits(formContainer, cleanup);
    
    // Setup file upload validation
    FileUploadValidator.setup(formContainer);
  },
  
  // Initialize Next button state
  initializeButtonState(formContainer, cleanup = null) {
    // Use cached visible step if cleanup is available, otherwise fall back to direct query
    const visibleStep = cleanup ? cleanup.getVisibleStep() : 
      Array.from(formContainer.querySelectorAll('.hsfc-Step'))
        .find(step => getComputedStyle(step).display !== 'none');
    
    if (!visibleStep) return;
    
    const nextButton = HubSpotFormValidator.findNavigationButton(visibleStep);
    if (!nextButton) return;
    
    const requiredFields = visibleStep.querySelectorAll(HubSpotFormValidator.REQUIRED_FIELD_SELECTOR);
    // Button is now always enabled - validation moved to click handler
  },
  
  // Add all event listeners
  addEventListeners(formContainer, validator, cleanup) {
    // Navigation button handlers
    const navigationButtons = formContainer.querySelectorAll('.hsfc-NavigationRow button[type="button"], .hsfc-NavigationRow button[type="submit"]');
    
    navigationButtons.forEach((button, index) => {
      const buttonText = button.textContent.trim().toLowerCase();
      
      // Attach listener to any button that is NOT a previous button
      if (!buttonText.includes('previous') && !buttonText.includes('back')) {
        button.addEventListener('click', (event) => this.handleNextButtonClick(event, formContainer, cleanup), {
          signal: cleanup.abortController.signal
        });
      }
    });
    
    // Field change listeners
    this.addFieldListeners(formContainer, validator, cleanup);
  },
  
  // Add field listeners to visible step
  addFieldListeners(formContainer, validator, cleanup) {
    // Use cached visible step for better performance
    const visibleStep = cleanup.getVisibleStep();
    
    if (!visibleStep) return;
    
    const formFields = visibleStep.querySelectorAll('input, select, textarea');
    const events = ['input', 'change', 'blur'];
    
    formFields.forEach(field => {
      // Add character limit enforcement for text input fields (not textareas)
      if (field.type === 'text' || field.type === 'email' || (field.tagName.toLowerCase() === 'input' && !field.type)) {
        this.setupTextInputCharacterLimit(field, cleanup);
      }
      
      events.forEach(eventType => {
        // Remove any existing listeners (cleanup from previous setup)
        field.removeEventListener(eventType, validator.validateVisibleStep);
        
        // Add combined handler that removes custom errors and runs validation
        field.addEventListener(eventType, () => {
          // Remove custom validation error when user starts interacting
          HubSpotFormValidator.removeValidationError(visibleStep);
          // Run the validation (but don't disable buttons anymore)
          validator.validateVisibleStep();
        }, {
          signal: cleanup.abortController.signal
        });
      });
    });
  },

  // Setup character limit enforcement for text input fields
  setupTextInputCharacterLimit(field, cleanup) {
    // Skip if already set up
    if (field.hasAttribute('data-character-limit-enforced')) {
      return;
    }
    
    // Mark as set up
    field.setAttribute('data-character-limit-enforced', 'true');
    
    // Default character limit for text inputs (HubSpot commonly uses 100)
    const characterLimit = 100;
    
    // Set the native maxlength attribute - this prevents typing/pasting beyond the limit
    field.setAttribute('maxlength', characterLimit);
    
    // Handle initial value if it already exceeds the limit
    if (field.value.length > characterLimit) {
      field.value = field.value.substring(0, characterLimit);
    }
    
    // Also add a safeguard input listener as backup
    field.addEventListener('input', (event) => {
      if (field.value.length > characterLimit) {
        field.value = field.value.substring(0, characterLimit);
      }
    }, {
      signal: cleanup.abortController.signal
    });
  },
  
  // Handle navigation button clicks
  handleNextButtonClick(event, formContainer, cleanup) {
    const currentStep = event.target.closest('.hsfc-Step');
    
    if (!currentStep) {
      // Alternative method: find visible step using cache
      const visibleStep = cleanup.getVisibleStep();
      if (!visibleStep) return;
    }
    
    // Use cached visible step when possible
    const stepToValidate = currentStep || cleanup.getVisibleStep();
    
    // Create validator for this form
    const validator = HubSpotFormValidator.createValidator(formContainer);
    
    // Run validation on current step
    const isValid = validator.validateVisibleStep();
    
    if (!isValid) {
      // Prevent the default button behavior (form submission/navigation)
      event.preventDefault();
      event.stopPropagation();
      
      // Trigger individual field validations to show HubSpot's built-in error messages
      this.triggerFieldValidations(stepToValidate);
      
      // Show custom error message
      HubSpotFormValidator.showValidationError(stepToValidate);
      
      return false;
    }
    
    // Validation passed - remove any existing error message and allow normal flow
    HubSpotFormValidator.removeValidationError(stepToValidate);
    
    // Note: We don't preventDefault() here, so HubSpot's normal navigation will proceed
    return true;
  },
  
  // Trigger individual field validations to show HubSpot's built-in error messages
  triggerFieldValidations(step) {
    // Find all required fields in the current step
    const requiredFields = step.querySelectorAll(HubSpotFormValidator.REQUIRED_FIELD_SELECTOR);
    
    // Helper function to check if a field needs validation - use centralized validation
    const needsValidation = (field) => FieldValidator.needsValidation(field, step);
    
    // For radio buttons and checkbox groups, avoid triggering validation multiple times for the same group
    const processedFieldGroups = new Set();
    
    requiredFields.forEach(field => {
      // Skip duplicate group processing for radio buttons and checkbox groups with same name
      if (field.type === 'radio' || field.type === 'checkbox') {
        if (processedFieldGroups.has(field.name)) {
          return; // Skip - already processed this field group
        }
        processedFieldGroups.add(field.name);
      }
      
      if (needsValidation(field)) {
        // For tel fields, use more aggressive validation triggering
        if (field.type === 'tel') {
          // Tel fields need special handling to trigger HubSpot's validation
          field.focus();
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
          field.blur();
          
          // Try additional validation events that HubSpot might listen for
          field.dispatchEvent(new Event('invalid', { bubbles: true }));
          field.dispatchEvent(new Event('keyup', { bubbles: true }));
          
          // Force validation check by simulating user interaction
          setTimeout(() => {
            field.focus();
            field.blur();
          }, 50);
        } else {
          // Standard validation triggering for other field types
          field.focus();
          field.blur();
          
          // Also trigger change and input events to ensure HubSpot's validation fires
          field.dispatchEvent(new Event('change', { bubbles: true }));
          field.dispatchEvent(new Event('input', { bubbles: true }));
          
          // For checkboxes and radios, also try click events which might trigger validation
          if (field.type === 'checkbox' || field.type === 'radio') {
            field.dispatchEvent(new Event('invalid', { bubbles: true }));
          }
        }
      }
    });
    
    // Also check fields that may have other validation rules (like email format)
    const allFields = step.querySelectorAll('input, select, textarea');
    allFields.forEach(field => {
      // Skip if this field was already processed as a required field
      const isRequired = field.hasAttribute('required') || field.getAttribute('aria-required') === 'true';
      if (isRequired) return;
      
      // For tel fields, always trigger validation to ensure HubSpot shows format errors
      if (field.type === 'tel') {
        field.focus();
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
        field.blur();
        field.dispatchEvent(new Event('invalid', { bubbles: true }));
        field.dispatchEvent(new Event('keyup', { bubbles: true }));
      }
      
      // For email fields, trigger validation even if they have content
      if (field.type === 'email' || field.name?.toLowerCase().includes('email')) {
        field.focus();
        field.blur();
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      // For other field types with pattern validation
      if (field.hasAttribute('pattern') && field.value) {
        field.focus();
        field.blur();
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  },
  
  // Setup form-specific observer
  setupFormObserver(formContainer, validator, cleanup) {
    const observer = new MutationObserver((mutations) => {
      let shouldRevalidate = false;
      let shouldAddListeners = false;
      
      for (const mutation of mutations) {
        if (!formContainer.contains(mutation.target)) continue;
        
        // Error element changes
        if (mutation.target.classList?.contains('hsfc-ErrorAlert') ||
            (mutation.type === 'childList' && 
             [...mutation.addedNodes, ...mutation.removedNodes].some(node => 
               node.nodeType === Node.ELEMENT_NODE && 
               (node.classList?.contains('hsfc-ErrorAlert') || node.querySelector?.('.hsfc-ErrorAlert'))
             ))) {
          shouldRevalidate = true;
        }
        
        // Step visibility changes
        if (mutation.target.classList?.contains('hsfc-Step') && 
            mutation.type === 'attributes' && mutation.attributeName === 'style') {
          shouldRevalidate = true;
          shouldAddListeners = true;
          // Invalidate visible step cache when step visibility changes
          cleanup.invalidateCache();
          this.initializeButtonState(formContainer, cleanup);
        }
        
        // New form fields
        if (mutation.type === 'childList' && 
            [...mutation.addedNodes].some(node => 
              node.nodeType === Node.ELEMENT_NODE && node.querySelector?.('input, select, textarea')
            )) {
          shouldAddListeners = true;
        }
      }
      
      if (shouldAddListeners) {
        setTimeout(() => this.addFieldListeners(formContainer, validator, cleanup), 100);
      }
      if (shouldRevalidate) {
        setTimeout(() => validator.validateVisibleStep(), 50);
      }
    });
    
    // Track observer for cleanup
    cleanup.observers.push(observer);
    
    observer.observe(formContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  },
  
  // Setup global observer for dynamically loaded forms
  setupGlobalObserver() {
    if (window.hubspotFormGlobalObserver) return;
    
    const globalObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;
        
        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;
          
          if (addedNode.classList?.contains('hsfc-Form')) {
            removeHubSpotFormStyles();
            this.setupSingleForm(addedNode);
          }
          
          const newForms = addedNode.querySelectorAll?.('.hsfc-Form');
          if (newForms?.length > 0) {
            removeHubSpotFormStyles();
            newForms.forEach(form => this.setupSingleForm(form));
          }
        }
      }
    });
    
    globalObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Store global observer reference for potential cleanup
    window.hubspotFormGlobalObserver = globalObserver;
  },

  // Progress bar repositioning functionality
  setupProgressBarRepositioning(formContainer, cleanup) {
    // Apply to any form with a progress bar
    const allForms = document.querySelectorAll('.hsfc-Form');
    const formIndex = Array.from(allForms).indexOf(formContainer) + 1;

    // Setup observer to watch for progress bar elements
    const progressBarObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;
        
        // Check for progress bar additions
        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;
          
          // Direct progress bar match
          if (addedNode.classList?.contains('hsfc-ProgressBar')) {
            this.repositionProgressBar(addedNode, formContainer);
          }
          
          // Check for progress bars within added nodes
          const progressBars = addedNode.querySelectorAll?.('.hsfc-ProgressBar');
          if (progressBars?.length > 0) {
            progressBars.forEach(progressBar => this.repositionProgressBar(progressBar, formContainer));
          }
        }
      }
    });

    // Track observer for cleanup
    cleanup.observers.push(progressBarObserver);

    // Start observing for progress bar changes
    progressBarObserver.observe(formContainer, {
      childList: true,
      subtree: true
    });

    // Check for existing progress bars immediately
    setTimeout(() => {
      const existingProgressBars = formContainer.querySelectorAll('.hsfc-ProgressBar');
      existingProgressBars.forEach(progressBar => this.repositionProgressBar(progressBar, formContainer));
    }, 100);

    // Also check after a longer delay for late-loading progress bars
    setTimeout(() => {
      const lateProgressBars = formContainer.querySelectorAll('.hsfc-ProgressBar:not([data-repositioned])');
      if (lateProgressBars.length > 0) {
        lateProgressBars.forEach(progressBar => this.repositionProgressBar(progressBar, formContainer));
      }
    }, 1000);
  },

  // Reposition a single progress bar from bottom to top
  repositionProgressBar(progressBar, formContainer) {
    // Avoid repositioning the same progress bar multiple times
    if (progressBar.hasAttribute('data-repositioned')) {
      return;
    }

    // Find the current step that contains this progress bar
    const currentStep = progressBar.closest('.hsfc-Step');
    if (!currentStep) {
      return;
    }

    // Mark as repositioned to prevent duplicate operations
    progressBar.setAttribute('data-repositioned', 'true');

    // Remove the progress bar from its current location
    progressBar.remove();

    // Find the step content area
    const stepContent = currentStep.querySelector('.hsfc-Step__Content') || currentStep;

    // Ensure the step content uses flexbox for proper ordering
    const stepContentStyle = getComputedStyle(stepContent);
    if (stepContentStyle.display !== 'flex' && stepContentStyle.display !== 'inline-flex') {
      stepContent.style.display = 'flex';
      stepContent.style.flexDirection = 'column';
    }

    // Add fallback classes for browsers that don't support :has()
    this.addFlexboxFallbackClasses(currentStep, stepContent);

    // Find the first actual form field (with input controls) to insert before it
    // This excludes headings, paragraphs, and rich text content
    const firstFormField = this.findFirstFormField(stepContent);
    
    // Always insert the progress bar in the DOM where it should appear relative to other elements,
    // but rely on CSS flexbox order to ensure validation errors appear above it
    if (firstFormField) {
      // Insert before the first form field
      stepContent.insertBefore(progressBar, firstFormField);
    } else {
      // Fallback: insert at the end of step content if no form fields found
      stepContent.appendChild(progressBar);
    }

    // Add a CSS class to help with styling and ensure proper flexbox ordering
    progressBar.classList.add('hsfc-ProgressBar--repositioned');

    // Ensure the progress bar is visible and properly styled
    this.ensureProgressBarVisibility(progressBar);
  },

  // Ensure the repositioned progress bar maintains proper visibility
  ensureProgressBarVisibility(progressBar) {
    // The CSS will handle the ordering via flexbox order property
    // No additional JavaScript ordering needed
  },

  // Add fallback classes for proper flexbox layout
  addFlexboxFallbackClasses(currentStep, stepContent) {
    // Check if there are validation errors or progress bars
    const hasValidationError = currentStep.querySelector('.hsfc-CustomValidationError');
    const hasProgressBar = currentStep.querySelector('.hsfc-ProgressBar--repositioned');
    
    if (hasValidationError || hasProgressBar) {
      currentStep.classList.add('hsfc-step-with-validation-and-progress');
      stepContent.classList.add('hsfc-content-with-validation-and-progress');
    }
  },

  // Remove fallback classes when no longer needed
  removeFlexboxFallbackClasses(currentStep, stepContent) {
    // Check if there are still validation errors or progress bars
    const hasValidationError = currentStep.querySelector('.hsfc-CustomValidationError');
    const hasProgressBar = currentStep.querySelector('.hsfc-ProgressBar--repositioned');
    
    if (!hasValidationError && !hasProgressBar) {
      currentStep.classList.remove('hsfc-step-with-validation-and-progress');
      stepContent.classList.remove('hsfc-content-with-validation-and-progress');
    }
  },

  // Helper function to find the first actual form field (not headings/paragraphs)
  findFirstFormField(stepContent) {
    // Look for containers that contain actual form inputs
    const potentialFields = stepContent.querySelectorAll('.hsfc-Row, .hsfc-FormField, .hs-form-field');
    
    for (const fieldContainer of potentialFields) {
      // Check if this container has actual form inputs
      const hasFormInputs = fieldContainer.querySelector('input, select, textarea');
      if (hasFormInputs) {
        // Add fallback class for browsers that don't support :has()
        if (fieldContainer.classList.contains('hsfc-Row')) {
          fieldContainer.classList.add('hsfc-row-with-form-inputs');
        }
        return fieldContainer;
      }
    }
    
    // If no containers with inputs found, look for direct input elements
    const directInput = stepContent.querySelector('input, select, textarea');
    if (directInput) {
      // Find the closest container that wraps this input
      const inputContainer = directInput.closest('.hsfc-Row, .hsfc-FormField, .hs-form-field');
      if (inputContainer && inputContainer.classList.contains('hsfc-Row')) {
        inputContainer.classList.add('hsfc-row-with-form-inputs');
      }
      return inputContainer || directInput;
    }
    
    return null;
  },
  

  
  setupDropdownAccessibility(formContainer, cleanup) {
    const dropdownButtons = formContainer.querySelectorAll('.hsfc-DropdownInput input[type="text"][role="button"]');
    
    dropdownButtons.forEach((button, index) => {
      const isPhoneDropdown = this.isPhoneRelatedDropdown(button);
      
      if (isPhoneDropdown) {
        return; // Skip phone dropdowns - will be handled separately
      }
      
      // Helper function to focus search input (used by both keyboard and click)
      const focusSearchInput = () => {
        setTimeout(() => {
          const dropdownContainer = button.closest('.hsfc-DropdownField') || button.closest('.hsfc-Row');
          if (dropdownContainer) {
            const dropdownOptions = dropdownContainer.querySelector('.hsfc-DropdownOptions');
            if (dropdownOptions) {
              const isVisible = dropdownOptions.offsetHeight > 0 && 
                               getComputedStyle(dropdownOptions).display !== 'none' &&
                               getComputedStyle(dropdownOptions).visibility !== 'hidden';
              
              if (isVisible) {
                const searchInput = dropdownOptions.querySelector('.hsfc-DropdownOptions__Search input[type="text"]');
                if (searchInput) {
                  const currentValue = button.value || '';
                  if (currentValue && currentValue.trim() !== '') {
                    searchInput.value = currentValue;
                  }
                  searchInput.focus();
                }
              }
            }
          }
        }, 100);
      };

      // Keyboard handler
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          
          // Trigger dropdown opening
          button.click();
          
          // Focus search field and preserve current value
          focusSearchInput();
        }
      }, {
        signal: cleanup.abortController.signal
      });

      // Click handler for consistent behavior
      button.addEventListener('click', () => {
        // Focus search input after click (same as keyboard behavior)
        focusSearchInput();
      }, {
        signal: cleanup.abortController.signal
      });
    });
  },
  
  // Helper method to detect if a dropdown is phone-related
  isPhoneRelatedDropdown(dropdownElement) {
    // HubSpot phone fields use .hsfc-PhoneInput__FlagAndCaret, not the standard dropdown button
    // So we should rarely detect standard dropdown buttons as phone-related
    
    // First, check if there's a phone input in the same container
    const container = dropdownElement.closest('.hs-form-field, .hsfc-FormField, .hsfc-PhoneField');
    if (container) {
      const phoneInput = container.querySelector('input[type="tel"]');
      if (phoneInput) {
        return true;
      }
    }
    
    // Check for explicit HubSpot phone field classes
    let currentElement = dropdownElement;
    let checkLevels = 0;
    
    while (currentElement && checkLevels < 3) {
      const className = currentElement.className?.toLowerCase() || '';
      
      // Check for HubSpot's specific phone field classes
      if (className.includes('hsfc-phonefield') || className.includes('hsfc-phoneinput')) {
        return true;
      }
      
      // Check data attributes for HubSpot phone field indicators
      const dataId = currentElement.getAttribute('data-hsfc-id');
      if (dataId && (dataId.toLowerCase().includes('phone') || dataId === 'PhoneField' || dataId === 'PhoneInput')) {
        return true;
      }
      
      currentElement = currentElement.parentElement;
      checkLevels++;
    }
    
    return false;
  },
  
  // Setup phone field accessibility
  setupPhoneFieldAccessibility(formContainer, cleanup) {
    // Find all HubSpot phone field containers
    const phoneFields = formContainer.querySelectorAll('.hsfc-PhoneField, [data-hsfc-id="PhoneField"]');
    
    phoneFields.forEach((phoneField, index) => {
      // Find the flag and caret element (the clickable country selector)
      const flagAndCaret = phoneField.querySelector('.hsfc-PhoneInput__FlagAndCaret');
      if (!flagAndCaret) {
        return;
      }
      
      // Find the dropdown options container
      const dropdownOptions = phoneField.querySelector('.hsfc-DropdownOptions');
      if (!dropdownOptions) {
        return;
      }
      
      // Find the search input within the dropdown
      const searchInput = dropdownOptions.querySelector('input[role="searchbox"], .hsfc-DropdownOptions__Search input');
      
      // Find the options list
      const optionsList = dropdownOptions.querySelector('ul[role="listbox"]');
      
      // Find the phone input field
      const phoneInput = phoneField.querySelector('input[type="tel"]');
      
      // Add keyboard accessibility to the flag and caret
      this.addPhoneDropdownKeyboardSupport(flagAndCaret, dropdownOptions, searchInput, optionsList, phoneField, cleanup);
      
      // Add country code overwriting functionality
      if (phoneInput) {
        this.addPhoneInputOverwriteSupport(phoneInput, flagAndCaret, phoneField, cleanup);
      }
    });
  },
  
  // Add keyboard support to phone dropdown
  addPhoneDropdownKeyboardSupport(flagAndCaret, dropdownOptions, searchInput, optionsList, phoneField, cleanup) {
    
    // Ensure the flag and caret has proper ARIA attributes
    flagAndCaret.setAttribute('role', 'button');
    flagAndCaret.setAttribute('aria-expanded', 'false');
    flagAndCaret.setAttribute('aria-haspopup', 'listbox');
    flagAndCaret.setAttribute('aria-label', 'Select country code');
    
    // Add keyboard event listener to flag/caret
    flagAndCaret.addEventListener('keydown', (event) => {
      
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          event.stopPropagation();
          this.togglePhoneDropdown(flagAndCaret, dropdownOptions, searchInput);
          break;
        case ' ':
          event.preventDefault();
          event.stopPropagation();
          this.togglePhoneDropdown(flagAndCaret, dropdownOptions, searchInput);
          break;
        case 'Escape':
          event.preventDefault();
          event.stopPropagation();
          this.closePhoneDropdown(flagAndCaret, dropdownOptions);
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (this.isPhoneDropdownOpen(dropdownOptions)) {
            this.focusFirstPhoneOption(optionsList);
          } else {
            this.openPhoneDropdown(flagAndCaret, dropdownOptions, searchInput);
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (this.isPhoneDropdownOpen(dropdownOptions)) {
            this.focusLastPhoneOption(optionsList);
          } else {
            this.openPhoneDropdown(flagAndCaret, dropdownOptions, searchInput);
          }
          break;
      }
    }, {
      signal: cleanup.abortController.signal
    });
    
    // Add keyboard event listener to search input for Escape handling
    if (searchInput) {
      searchInput.addEventListener('keydown', (event) => {
        
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          this.closePhoneDropdown(flagAndCaret, dropdownOptions);
        }
      }, {
        signal: cleanup.abortController.signal
      });
    }
    
    // Add keyboard event listener to dropdown container for Escape handling
    dropdownOptions.addEventListener('keydown', (event) => {
      
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.closePhoneDropdown(flagAndCaret, dropdownOptions);
      }
    }, {
      signal: cleanup.abortController.signal
    });
    
    // Add support for option navigation when dropdown is open
    if (optionsList) {
      this.addPhoneOptionNavigation(optionsList, flagAndCaret, dropdownOptions, cleanup);
    }
    
    // Handle clicks on flag/caret to auto-focus search input
    flagAndCaret.addEventListener('click', () => {
      
      // Wait for HubSpot to open the dropdown, then focus search
      setTimeout(() => {
        if (searchInput && this.isPhoneDropdownOpen(dropdownOptions)) {
          
          // Pre-populate search input with current country selection
          this.populatePhoneSearchWithCurrentCountry(searchInput, phoneField);
          
          searchInput.focus();
        }
      }, 100);
    }, {
      signal: cleanup.abortController.signal
    });
    
    // Close dropdown when clicking outside - track as global listener
    const outsideClickHandler = (event) => {
      if (!phoneField.contains(event.target)) {
        this.closePhoneDropdown(flagAndCaret, dropdownOptions);
      }
    };
    document.addEventListener('click', outsideClickHandler);
    cleanup.globalListeners.push({
      element: document,
      event: 'click',
      listener: outsideClickHandler
    });
  },
  
  // Toggle phone dropdown open/closed
  togglePhoneDropdown(flagAndCaret, dropdownOptions, searchInput) {
    const isCurrentlyOpen = this.isPhoneDropdownOpen(dropdownOptions);
    
    if (isCurrentlyOpen) {
      this.closePhoneDropdown(flagAndCaret, dropdownOptions);
    } else {
      this.openPhoneDropdown(flagAndCaret, dropdownOptions, searchInput);
    }
  },
  
  // Open phone dropdown
  openPhoneDropdown(flagAndCaret, dropdownOptions, searchInput) {
    
    // Check if already open
    if (this.isPhoneDropdownOpen(dropdownOptions)) {
      return;
    }
    
    // Try multiple methods to open the dropdown
    // Method 1: Regular click
    flagAndCaret.click();
    
    // Method 2: If not open after delay, try mouse events
    setTimeout(() => {
      if (!this.isPhoneDropdownOpen(dropdownOptions)) {
        flagAndCaret.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        flagAndCaret.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        flagAndCaret.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
      
      // Update ARIA state and focus search input
      setTimeout(() => {
        if (this.isPhoneDropdownOpen(dropdownOptions)) {
          flagAndCaret.setAttribute('aria-expanded', 'true');
          
          if (searchInput) {
            
            // Pre-populate search input with current country selection
            this.populatePhoneSearchWithCurrentCountry(searchInput, phoneField);
            
            searchInput.focus();
          }
        } else {
        }
      }, 50);
    }, 50);
  },
  
  // Close phone dropdown
  closePhoneDropdown(flagAndCaret, dropdownOptions) {
    
    // Check if dropdown is open
    if (!this.isPhoneDropdownOpen(dropdownOptions)) {
      return;
    }
    
    // Try multiple methods to close the dropdown
    // Method 1: Click the flagAndCaret to toggle closed
    flagAndCaret.click();
    
    // Method 2: If still open after a delay, try other approaches
    setTimeout(() => {
      if (this.isPhoneDropdownOpen(dropdownOptions)) {
        dropdownOptions.style.display = 'none';
      }
      
      // Update ARIA state
      flagAndCaret.setAttribute('aria-expanded', 'false');
      
      // Return focus to flag and caret with multiple attempts
      flagAndCaret.focus();
      
      // Backup focus attempt
      setTimeout(() => {
        if (document.activeElement !== flagAndCaret) {
          flagAndCaret.focus();
        }
      }, 100);
    }, 50);
  },
  
  // Check if phone dropdown is open
  isPhoneDropdownOpen(dropdownOptions) {
    const style = getComputedStyle(dropdownOptions);
    return style.display !== 'none' && style.visibility !== 'hidden' && dropdownOptions.offsetHeight > 0;
  },
  
  // Focus first option in phone dropdown
  focusFirstPhoneOption(optionsList) {
    if (!optionsList) return;
    
    const firstOption = optionsList.querySelector('li[role="option"]');
    if (firstOption) {
      firstOption.focus();
    }
  },
  
  // Focus last option in phone dropdown
  focusLastPhoneOption(optionsList) {
    if (!optionsList) return;
    
    const options = optionsList.querySelectorAll('li[role="option"]');
    const lastOption = options[options.length - 1];
    if (lastOption) {
      lastOption.focus();
    }
  },
  
  // Add keyboard navigation to phone options
  addPhoneOptionNavigation(optionsList, flagAndCaret, dropdownOptions, cleanup) {
    
    optionsList.addEventListener('keydown', (event) => {
      const focusedOption = document.activeElement;
      const options = Array.from(optionsList.querySelectorAll('li[role="option"]'));
      const currentIndex = options.indexOf(focusedOption);
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
          options[nextIndex].focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
          options[prevIndex].focus();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedOption) {
            focusedOption.click();
            // Mark that user selected country via keyboard
            focusedOption.dispatchEvent(new CustomEvent('countrySelected', { bubbles: true }));
            this.closePhoneDropdown(flagAndCaret, dropdownOptions);
          }
          break;
        case 'Escape':
          event.preventDefault();
          this.closePhoneDropdown(flagAndCaret, dropdownOptions);
          break;
      }
    }, {
      signal: cleanup.abortController.signal
    });
  },
  
  // Add country code overwriting support to phone input
  addPhoneInputOverwriteSupport(phoneInput, flagAndCaret, phoneField, cleanup) {
    
    // Track the state of user interaction
    let initialValue = phoneInput.value || '';
    // If there's already a country code present (like default +1), treat it as selected
    let userSelectedCountry = initialValue && initialValue.trim() && /^\+\d{1,4}$/.test(initialValue.trim());
    let lastKnownValue = initialValue;
    
    
    // Mark when user selects a country via dropdown
    const markCountrySelected = () => {
      userSelectedCountry = true;
      lastKnownValue = phoneInput.value || '';
    };
    
    // Listen for country selection via dropdown (clicks and keyboard)
    const optionsList = phoneField.querySelector('ul[role="listbox"]');
    if (optionsList) {
      optionsList.addEventListener('click', markCountrySelected, {
        signal: cleanup.abortController.signal
      });
      optionsList.addEventListener('countrySelected', markCountrySelected, {
        signal: cleanup.abortController.signal
      });
    }
    
    // Listen for input changes
    phoneInput.addEventListener('input', (event) => {
      const currentValue = phoneInput.value || '';
      const previousValue = lastKnownValue;
      
      // Check if this should trigger overwrite logic
      if (this.shouldOverwriteCountryCode(currentValue, previousValue, userSelectedCountry, initialValue)) {
        this.handleCountryCodeOverwrite(phoneInput, currentValue, previousValue);
      }
      
      // Update tracking
      lastKnownValue = currentValue;
    }, {
      signal: cleanup.abortController.signal
    });
    
    // Listen for keydown to detect when user might be starting fresh
    phoneInput.addEventListener('keydown', (event) => {
      // If user is doing Ctrl+A, Cmd+A, or similar selection operations
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        // Don't reset userSelectedCountry yet, wait for actual input
      }
      
      // If user backspaces/deletes to clear the field significantly
      if (event.key === 'Backspace' || event.key === 'Delete') {
        const currentValue = phoneInput.value || '';
        // If they're clearing back to just country code or empty, allow overwrite
        if (currentValue.length <= 3) {
          userSelectedCountry = false;
        }
      }
    }, {
      signal: cleanup.abortController.signal
    });
    
    // Handle focus behavior - prevent text selection when user selected country
    phoneInput.addEventListener('focus', () => {
      const currentValue = phoneInput.value || '';
      
      // Reset userSelectedCountry only if completely empty
      if (!currentValue) {
        userSelectedCountry = false;
      } else {
        // If there's a country code present and we haven't explicitly set selection status,
        // treat it as selected (covers default country codes)
        if (!userSelectedCountry && /^\+\d{1,4}$/.test(currentValue.trim())) {
          userSelectedCountry = true;
        }
        
        // If user selected a country, prevent HubSpot from selecting the text
        if (userSelectedCountry) {
          
          // Multiple attempts to prevent text selection, as HubSpot might do it at different times
          setTimeout(() => {
            const length = phoneInput.value.length;
            phoneInput.setSelectionRange(length, length);
          }, 10);
          
          setTimeout(() => {
            const length = phoneInput.value.length;
            phoneInput.setSelectionRange(length, length);
          }, 50);
          
          setTimeout(() => {
            const length = phoneInput.value.length;
            phoneInput.setSelectionRange(length, length);
          }, 100);
        }
      }
    }, {
      signal: cleanup.abortController.signal
    });
    
    // Prevent text selection when user has selected a country
    phoneInput.addEventListener('select', (event) => {
      if (userSelectedCountry) {
        event.preventDefault();
        
        // Move cursor to end
        setTimeout(() => {
          const length = phoneInput.value.length;
          phoneInput.setSelectionRange(length, length);
        }, 1);
      }
    }, {
      signal: cleanup.abortController.signal
    });
    
    // Also handle mouseup in case HubSpot selects text on mouse events
    phoneInput.addEventListener('mouseup', () => {
      if (userSelectedCountry) {
        setTimeout(() => {
          if (phoneInput.selectionStart !== phoneInput.selectionEnd) {
            const length = phoneInput.value.length;
            phoneInput.setSelectionRange(length, length);
          }
        }, 10);
      }
    }, {
      signal: cleanup.abortController.signal
    });
  },
  
  // Determine if country code should be overwritten
  shouldOverwriteCountryCode(currentValue, previousValue, userSelectedCountry, initialValue) {
    // Never overwrite if user explicitly selected a country
    if (userSelectedCountry) {
      return false;
    }
    
    // Check if user is typing a country code pattern
    const isTypingCountryCode = this.isCountryCodePattern(currentValue, previousValue);
    if (!isTypingCountryCode) {
      return false;
    }
    
    // Check if we're in a state where overwrite makes sense
    const isDefaultState = previousValue === initialValue || previousValue.length <= 3;
    const isStartingFresh = previousValue === '' || previousValue === '+';
    
    if (isDefaultState || isStartingFresh) {
      return true;
    }
    
    return false;
  },
  
  // Check if user input looks like a country code
  isCountryCodePattern(currentValue, previousValue) {
    // User is typing a country code if:
    // 1. They start with + followed by digits
    // 2. They type digits at the start when field was empty or had just +
    // 3. They're replacing existing country code with new one
    
    const countryCodeRegex = /^\+\d{1,4}$/;
    
    // Direct country code pattern
    if (countryCodeRegex.test(currentValue)) {
      return true;
    }
    
    // User typed digits at start (should become country code)
    if (/^\d{1,4}$/.test(currentValue) && (!previousValue || previousValue === '+')) {
      return true;
    }
    
    // User started typing + and digits
    if (currentValue.startsWith('+') && /^\+\d{1,4}/.test(currentValue) && currentValue !== previousValue) {
      return true;
    }
    
    return false;
  },
  
  // Handle the actual country code overwrite
  handleCountryCodeOverwrite(phoneInput, currentValue, previousValue) {
    
    // Let HubSpot process the input normally first
    setTimeout(() => {
      const newValue = phoneInput.value;
      
      // If HubSpot appended instead of replacing, fix it
      if (this.needsCountryCodeFix(newValue, currentValue)) {
        const correctedValue = this.correctCountryCode(newValue, currentValue);
        
        // Set the corrected value
        phoneInput.value = correctedValue;
        
        // Position cursor at the end of the corrected value
        setTimeout(() => {
          const length = phoneInput.value.length;
          phoneInput.setSelectionRange(length, length);
        }, 10);
        
        // Trigger HubSpot's change events to update their state
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        // Even if no correction needed, ensure cursor is at end
        setTimeout(() => {
          const length = phoneInput.value.length;
          phoneInput.setSelectionRange(length, length);
        }, 10);
      }
    }, 10);
  },
  
  // Check if the country code needs correction after HubSpot processing
  needsCountryCodeFix(actualValue, intendedValue) {
    // Check if HubSpot incorrectly appended instead of replacing
    // For example: user typed "+44" but got "+1+44" or "+144"
    
    if (!intendedValue.startsWith('+')) {
      intendedValue = '+' + intendedValue;
    }
    
    // If the actual value contains the intended country code but has extra parts
    if (actualValue !== intendedValue && actualValue.includes(intendedValue.substring(1))) {
      return true;
    }
    
    return false;
  },
  
  // Correct the country code value
  correctCountryCode(actualValue, intendedValue) {
    if (!intendedValue.startsWith('+')) {
      intendedValue = '+' + intendedValue;
    }
    
    // Return the intended country code
    return intendedValue;
  },
  
  // Populate search input with current country selection (like regular dropdowns)
  populatePhoneSearchWithCurrentCountry(searchInput, phoneField) {
    
    // Get the current country from the flag element
    const flagElement = phoneField.querySelector('.hsfc-PhoneInput__FlagAndCaret__Flag');
    if (!flagElement) {
      return;
    }
    
    // Get the flag emoji (like 🇺🇸, 🇬🇧, etc.)
    const flagEmoji = flagElement.textContent?.trim();
    
    if (!flagEmoji) {
      return;
    }
    
    // Find the matching option in the dropdown list to get the full text
    const optionsList = phoneField.querySelector('ul[role="listbox"]');
    if (!optionsList) {
      return;
    }
    
    // Look for the option that starts with this flag emoji
    const options = optionsList.querySelectorAll('li[role="option"]');
    let matchingOption = null;
    
    for (const option of options) {
      const optionText = option.textContent?.trim();
      if (optionText && optionText.startsWith(flagEmoji)) {
        matchingOption = option;
        break;
      }
    }
    
    if (matchingOption) {
      const countryText = matchingOption.textContent?.trim();
      
      // Set the search input value to the country text
      searchInput.value = countryText;
      
      // Select all text so user can immediately type to replace/filter
      setTimeout(() => {
        searchInput.select();
      }, 10);
    }
  }
};

// Legacy compatibility functions
const setupAllFormsValidation = () => HubSpotFormManager.setupAllForms();
const setupSingleFormValidation = (formContainer) => HubSpotFormManager.setupSingleForm(formContainer);

// Legacy function for backward compatibility
const setupFieldValidation = setupAllFormsValidation;
window.addEventListener('DOMContentLoaded', () => {
  // Set up a more robust form detection that handles multiple forms
  const setupFormsWithRetry = () => {
    const hubspotForms = document.querySelectorAll('.hsfc-Form');
    
    if (hubspotForms.length > 0) {
      setupAllFormsValidation();
      return true;
    }
    return false;
  };

  // Try immediately
  if (!setupFormsWithRetry()) {
    // Set up observer to watch for dynamically loaded forms
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;
        
        // Check if any added nodes contain HubSpot form elements
        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType === Node.ELEMENT_NODE) {
            if (addedNode.classList?.contains('hsfc-Form') || 
                addedNode.querySelector?.('.hsfc-Form')) {
              removeHubSpotFormStyles(); // Remove styles for newly detected forms
              setupAllFormsValidation();
              // Don't disconnect - we might have more forms loading later
              return;
            }
          }
        }
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Timeout fallback
    setTimeout(() => {
      observer.disconnect();
    }, 10000);
  }
});

// Export main API functions
export {
  HubSpotFormManager,
  HubSpotFormValidator,
  CharacterLimitValidator
};

// Export legacy compatibility functions
export {
  setupAllFormsValidation,
  setupSingleFormValidation,
  setupFieldValidation
};

// Export utility functions
export { removeHubSpotFormStyles };

// Export additional validators for module compatibility
export { FieldValidator, FileUploadValidator };
