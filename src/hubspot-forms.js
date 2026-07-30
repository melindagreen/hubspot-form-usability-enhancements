const removeHubSpotFormStyles = () => {
  // Constants for HubSpot BaseStyle CSS removal
  const HUBSPOT_BASESTYLE_SELECTOR = 'style[data-hsfc-id="BaseStyle"]';
  const OBSERVER_TIMEOUT_MS = 10000;
  const HUBSPOT_DATA_ATTR = "data-hsfc-id";
  const HUBSPOT_BASESTYLE_VALUE = "BaseStyle";

  // Helper function to check if a node is the target HubSpot style element
  const isHubSpotBaseStyleElement = (node) => {
    return (
      node.nodeType === Node.ELEMENT_NODE &&
      node.tagName === "STYLE" &&
      node.getAttribute(HUBSPOT_DATA_ATTR) === HUBSPOT_BASESTYLE_VALUE
    );
  };

  // Function to remove HubSpot BaseStyle CSS
  const removeHubSpotBaseStyle = () => {
    const hsBaseFormCss = document.querySelector(HUBSPOT_BASESTYLE_SELECTOR);
    if (hsBaseFormCss) {
      hsBaseFormCss.remove();
      return true;
    }
    return false;
  };

  // Helper function to handle successful removal and cleanup
  const handleStyleRemoved = (observer) => {
    observer.disconnect();
  };

  // Try to remove immediately
  if (!removeHubSpotBaseStyle()) {
    // Set up a MutationObserver to watch for the style element being added
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "childList") continue;

        for (const addedNode of mutation.addedNodes) {
          // Direct match: added node is the target style element
          if (isHubSpotBaseStyleElement(addedNode)) {
            addedNode.remove();
            handleStyleRemoved(observer);
            return;
          }

          // Indirect match: added node contains the target style element
          if (
            addedNode.nodeType === Node.ELEMENT_NODE &&
            addedNode.querySelector &&
            addedNode.querySelector(HUBSPOT_BASESTYLE_SELECTOR)
          ) {
            removeHubSpotBaseStyle();
            handleStyleRemoved(observer);
            return;
          }
        }
      }
    });

    // Start observing the document for changes
    observer.observe(document, {
      childList: true,
      subtree: true,
    });

    // Set a timeout to stop observing if element isn't found
    setTimeout(() => {
      observer.disconnect();
    }, OBSERVER_TIMEOUT_MS);
  }
};

const FieldValidator = {
  /** @param {HTMLElement} field @param {HTMLElement} container @returns {boolean} */
  isFieldValid(field, container) {
    switch (field.type) {
      case "checkbox":
        return this._validateCheckboxField(field, container);
      case "radio":
        return this._validateRadioField(field, container);
      case "tel":
        return this._validateTelField(field);
      case "file":
        return this._validateFileField(field);
      default:
        return this._validateTextBasedField(field);
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
    return field.type === "radio" || field.type === "checkbox";
  },

  /** @param {HTMLElement} field @param {HTMLElement} container @returns {NodeList} */
  getFieldGroup(field, container) {
    return container.querySelectorAll(`input[name="${field.name}"]`);
  },

  // Private validation methods
  _validateCheckboxField(field, container) {
    const checkboxGroup = this.getFieldGroup(field, container);
    return checkboxGroup.length > 1
      ? Array.from(checkboxGroup).some((checkbox) => checkbox.checked)
      : field.checked;
  },

  _validateRadioField(field, container) {
    return Array.from(this.getFieldGroup(field, container)).some(
      (radio) => radio.checked,
    );
  },

  _validateTelField(field) {
    const value = (field.value || "").trim();
    return value && !/^\+\d{0,3}$/.test(value) && value !== "+";
  },

  _validateFileField(field) {
    // If no files selected but field is required, it's invalid
    if (!field.files || field.files.length === 0) {
      return (
        !field.hasAttribute("required") &&
        field.getAttribute("aria-required") !== "true"
      );
    }

    // If files are selected, validate them
    const validation = FileUploadValidator.validateFile(field);
    return validation.valid;
  },

  _validateTextBasedField(field) {
    const hasContent = field.value && field.value.trim() !== "";

    // Special handling for HubSpot date fields
    if (field.classList?.contains('hsfc-DateInput') || field.closest('.hsfc-DateField')) {
      // If HubSpot has already marked this field as invalid, trust that
      if (field.getAttribute('aria-invalid') === 'true') {
        return false;
      }
      // If field has placeholder text, treat as empty
      if (hasContent && this._isHubSpotDateFieldWithPlaceholder(field)) {
        return false; 
      }
    }

    // For textarea elements, also check character limit
    if (field.tagName.toLowerCase() === "textarea") {
      const characterLimit =
        parseInt(field.getAttribute("data-character-limit")) || 500;
      const isWithinLimit = field.value.length <= characterLimit;
      return hasContent && isWithinLimit;
    }

    return hasContent;
  },

  // Helper to detect HubSpot date fields with placeholder text
  _isHubSpotDateFieldWithPlaceholder(field) {
    // Check if this is a HubSpot date field
    const isDateField = 
      field.classList?.contains('hsfc-DateInput') ||
      field.closest('.hsfc-DateField');

    if (!isDateField) {
      return false;
    }

    // If the field value matches the placeholder attribute, it's placeholder text
    if (field.placeholder && field.value === field.placeholder) {
      return true;
    }

    // Fallback: Check for common date format patterns (letters, numbers, separators)
    const dateFormatPattern = /^[MDYmdyHhSsAaPp\s\-\/\.\,\:]+$/;
    return dateFormatPattern.test(field.value.trim());
  },
};

// Character limit validation system - hides native HubSpot errors and shows custom ones
const CharacterLimitValidator = {
  DEFAULT_LIMIT: 500,

  // Setup character limit validation for all textareas in a form
  setupCharacterLimits(formContainer, cleanup) {
    const textareas = formContainer.querySelectorAll("textarea");

    textareas.forEach((textarea) => {
      this.setupSingleTextarea(textarea, cleanup);
    });
  },

  // Setup character limit for a single textarea
  setupSingleTextarea(textarea, cleanup) {
    const characterLimit =
      parseInt(textarea.getAttribute("data-character-limit")) ||
      this.DEFAULT_LIMIT;

    // Set the character limit attribute if not present
    if (!textarea.hasAttribute("data-character-limit")) {
      textarea.setAttribute("data-character-limit", characterLimit);
    }

    // Set the native maxlength attribute for browser enforcement
    textarea.setAttribute("maxlength", characterLimit);

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

    const counter = document.createElement("div");
    counter.className = "hsfc-CharacterCounter";
    counter.setAttribute(
      "data-textarea-id",
      textarea.id || `textarea-${Date.now()}`,
    );

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
    return textarea.parentElement.querySelector(
      `.hsfc-CharacterCounter[data-textarea-id="${textareaId}"]`,
    );
  },

  // Update character counter display
  updateCharacterCounter(textarea, counter, characterLimit) {
    const currentLength = textarea.value.length;
    const remaining = characterLimit - currentLength;

    counter.textContent = `${currentLength}/${characterLimit} characters`;

    // Set single class based on status
    if (remaining == 0) {
      counter.className = "hsfc-CharacterCounter hsfc-CharacterCounter--danger";
    } else if (remaining <= 20) {
      counter.className =
        "hsfc-CharacterCounter hsfc-CharacterCounter--warning";
    } else {
      counter.className =
        "hsfc-CharacterCounter hsfc-CharacterCounter--default";
    }
  },

  // Add event listeners to textarea
  addTextareaEventListeners(textarea, characterLimit, cleanup) {
    const counter = this.findCharacterCounter(textarea);

    // Input event for real-time updates
    textarea.addEventListener(
      "input",
      () => {
        this.handleTextareaInput(textarea, characterLimit, counter);
      },
      {
        signal: cleanup.abortController.signal,
      },
    );

    // Keyup event for additional validation
    textarea.addEventListener(
      "keyup",
      () => {
        this.handleTextareaInput(textarea, characterLimit, counter);
      },
      {
        signal: cleanup.abortController.signal,
      },
    );

    // Paste event for paste validation
    textarea.addEventListener(
      "paste",
      (event) => {
        // Use setTimeout to get the value after paste is processed
        setTimeout(() => {
          this.handleTextareaInput(textarea, characterLimit, counter);
        }, 10);
      },
      {
        signal: cleanup.abortController.signal,
      },
    );

    // Focus event to ensure counter is visible
    textarea.addEventListener(
      "focus",
      () => {
        if (counter) {
          counter.style.display = "block";
        }
      },
      {
        signal: cleanup.abortController.signal,
      },
    );
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
    const baseClasses = textarea.className
      .replace(/\bhsfc-Textarea--\w+\b/g, "")
      .trim();

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
    const errorDiv = document.createElement("div");
    errorDiv.className = "hsfc-ErrorAlert hsfc-CustomCharacterError";
    errorDiv.setAttribute("role", "alert");

    errorDiv.textContent = `This field must be ${characterLimit} characters or less. You are ${overBy} character${overBy > 1 ? "s" : ""} over the limit.`;

    // Insert after character counter
    const counter = this.findCharacterCounter(textarea);
    const insertAfter = counter || textarea;

    if (insertAfter.nextElementSibling) {
      insertAfter.parentElement.insertBefore(
        errorDiv,
        insertAfter.nextElementSibling,
      );
    } else {
      insertAfter.parentElement.appendChild(errorDiv);
    }
  },

  // Hide custom character limit error
  hideCustomCharacterError(textarea) {
    const container =
      textarea.closest(".hsfc-FormField, .hs-form-field") ||
      textarea.parentElement;
    const customError = container.querySelector(".hsfc-CustomCharacterError");
    if (customError) {
      customError.remove();
    }
  },

  // Enhance HubSpot character limit errors for textareas
  hideHubSpotCharacterErrors(textarea) {
    const container =
      textarea.closest(".hsfc-FormField, .hs-form-field") ||
      textarea.parentElement;
    if (!container) return;

    // Use a more comprehensive approach - look for errors in the entire container
    const errorElements = container.querySelectorAll("*");

    errorElements.forEach((errorEl) => {
      if (errorEl.textContent) {
        const errorText = errorEl.textContent.toLowerCase().trim();
        const match = errorText.match(/enter (\d+) characters? or fewer/i);

        if (match) {
          const limit = parseInt(match[1]);
          const currentLength = textarea.value.length;
          const overBy = currentLength - limit;

          if (overBy > 0) {
            // Enhance the error message instead of hiding it
            errorEl.textContent = `Enter ${limit} characters or fewer. You are ${overBy} character${overBy > 1 ? "s" : ""} over the limit.`;
            errorEl.setAttribute("data-hubspot-character-error", "enhanced");
          }
        }
      }
    });
  },

  // Show HubSpot character limit errors
  showHubSpotCharacterErrors(textarea) {
    const container = textarea.closest(".hsfc-FormField, .hs-form-field");
    if (!container) return;

    const hiddenErrors = container.querySelectorAll(
      '[data-hidden-by-character-validator="true"]',
    );

    hiddenErrors.forEach((errorEl) => {
      errorEl.style.display = "";
      errorEl.removeAttribute("data-hidden-by-character-validator");
    });
  },

  // Set up observer to hide HubSpot error messages as they appear
  setupErrorHidingObserver(textarea, cleanup) {
    const container = textarea.closest(".hsfc-FormField, .hs-form-field");
    if (!container) return;

    const observer = new MutationObserver((mutations) => {
      const currentLength = textarea.value.length;
      const characterLimit =
        parseInt(textarea.getAttribute("data-character-limit")) ||
        this.DEFAULT_LIMIT;

      // Only hide errors if we're over the character limit
      if (currentLength > characterLimit) {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node is an error message
              if (
                node.classList &&
                (node.classList.contains("hsfc-ErrorAlert") ||
                  node.classList.contains("hs-error-msg"))
              ) {
                this.checkAndHideCharacterError(node);
              }

              // Also check for error messages within the added node
              const errorElements = node.querySelectorAll?.(
                ".hsfc-ErrorAlert, .hs-error-msg",
              );
              if (errorElements) {
                errorElements.forEach((errorEl) => {
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
      subtree: true,
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
        const container = errorElement.closest(
          ".hsfc-FormField, .hs-form-field",
        );
        const textarea = container?.querySelector("textarea");

        if (textarea) {
          const currentLength = textarea.value.length;
          const overBy = currentLength - limit;

          if (overBy > 0) {
            // Enhance the error message instead of hiding it
            errorElement.textContent = `Enter ${limit} characters or fewer. You are ${overBy} character${overBy > 1 ? "s" : ""} over the limit.`;
            errorElement.setAttribute(
              "data-hubspot-character-error",
              "enhanced",
            );
          }
        }
      }
    }
  },

  // Check if textarea has character limit error (for form validation)
  hasCharacterLimitError(textarea) {
    const characterLimit =
      parseInt(textarea.getAttribute("data-character-limit")) ||
      this.DEFAULT_LIMIT;
    return textarea.value.length > characterLimit;
  },

  // Get character limit error message for form-level error summary
  getCharacterLimitErrorMessage(textarea) {
    const characterLimit =
      parseInt(textarea.getAttribute("data-character-limit")) ||
      this.DEFAULT_LIMIT;
    const currentLength = textarea.value.length;

    if (currentLength > characterLimit) {
      const overBy = currentLength - characterLimit;
      const fieldLabel =
        HubSpotFormValidator.getFieldLabel(textarea) || "Text area";
      return `${fieldLabel}: Must be ${characterLimit} characters or less (currently ${overBy} over)`;
    }

    return null;
  },

  // Start aggressive monitoring to catch and remove HubSpot errors
  startAggressiveErrorMonitoring(textarea) {
    // Avoid setting up multiple monitors for the same textarea
    if (textarea.hasAttribute("data-error-monitor-active")) {
      return;
    }

    textarea.setAttribute("data-error-monitor-active", "true");

    // Set up a repeated check that runs every 100ms for 5 seconds
    let checkCount = 0;
    const maxChecks = 50; // 5 seconds at 100ms intervals

    const monitorInterval = setInterval(() => {
      this.hideHubSpotCharacterErrors(textarea);
      checkCount++;

      if (checkCount >= maxChecks) {
        clearInterval(monitorInterval);
        textarea.removeAttribute("data-error-monitor-active");
      }
    }, 100);

    // Also clean up if the user moves to within the character limit
    const cleanupCheck = setInterval(() => {
      const characterLimit =
        parseInt(textarea.getAttribute("data-character-limit")) ||
        this.DEFAULT_LIMIT;
      if (textarea.value.length <= characterLimit) {
        clearInterval(monitorInterval);
        clearInterval(cleanupCheck);
        textarea.removeAttribute("data-error-monitor-active");
      }
    }, 200);
  },

  // Set up preemptive observer to catch and mark errors immediately as they're added
  setupPreemptiveErrorObserver(textarea, cleanup) {
    const container =
      textarea.closest(".hsfc-FormField, .hs-form-field") || document.body;

    const preemptiveObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check the node itself
            this.immediatelyMarkCharacterError(node);

            // Check all child nodes
            const allDescendants = node.querySelectorAll("*");
            allDescendants.forEach((descendant) => {
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
      subtree: true,
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
        const container = element.closest(".hsfc-FormField, .hs-form-field");
        const textarea = container?.querySelector("textarea");

        if (textarea) {
          const currentLength = textarea.value.length;
          const overBy = currentLength - limit;

          if (overBy > 0) {
            // Enhance the error message instead of hiding it
            element.textContent = `Enter ${limit} characters or fewer. You are ${overBy} character${overBy > 1 ? "s" : ""} over the limit.`;
            element.setAttribute("data-hubspot-character-error", "enhanced");
          }
        }
      }
    }
  },
};

// Simple file upload validator
const FileUploadValidator = {
  // Configuration storage
  _config: {
    allowedExtensions: null,
    maxFileSize: null,
    maxFiles: null,
  },

  DEFAULT_MAX_FILES: 5,
  _accumulatedFiles: new WeakMap(),

  // Default max file size (10 MB) used only when no site-level override is provided
  DEFAULT_MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,

  // Parse max file size from number/string into bytes
  parseMaxFileSize(value) {
    if (typeof value === "number") {
      return Number.isFinite(value) && value > 0 ? value : null;
    }

    if (typeof value !== "string") {
      return null;
    }

    // Normalize common input formats like "10MB", "10 MB", "10mb"
    const normalized = value.trim().toUpperCase();
    const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?$/);

    if (!match) {
      return null;
    }

    const number = parseFloat(match[1]);
    const unit = match[2] || "B";

    if (!Number.isFinite(number) || number <= 0) {
      return null;
    }

    if (unit === "GB") return number * 1024 * 1024 * 1024;
    if (unit === "MB") return number * 1024 * 1024;
    if (unit === "KB") return number * 1024;
    return number;
  },

  // Get configuration from runtime config, window globals, or use defaults
  get allowedExtensions() {
    if (this._config.allowedExtensions) {
      return this._config.allowedExtensions;
    }
    
    // Check for runtime configuration via window global
    if (typeof window !== 'undefined' && window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS) {
      const extensions = window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS;
      if (typeof extensions === 'string') {
        return extensions.split(",").map((ext) => ext.trim().toLowerCase());
      }
      if (Array.isArray(extensions)) {
        return extensions.map((ext) => ext.toString().trim().toLowerCase());
      }
    }
    
    // DEPRECATED: Environment variable approach no longer works in production
    // const envExtensions = import.meta.env.VITE_UPLOAD_ALLOWED_EXTENSIONS;
    // if (envExtensions) {
    //   return envExtensions.split(",").map((ext) => ext.trim().toLowerCase());
    // }
    
    return ["pdf", "doc", "docx", "jpg", "jpeg", "png", "gif", "txt"];
  },

  set allowedExtensions(value) {
    this._config.allowedExtensions = value;
  },

  get maxFileSize() {
    if (this._config.maxFileSize) {
      const configuredSize = this.parseMaxFileSize(this._config.maxFileSize);
      if (configuredSize) {
        return configuredSize;
      }
    }
    
    // Check for runtime configuration via window global
    if (typeof window !== 'undefined') {
      const envSize =
        window.HS_MAX_FILE_SIZE ||
        window.HUBSPOT_FORMS_MAX_FILE_SIZE ||
        window.HUBSPOT_MAX_FILE_SIZE;
      if (envSize) {
        const parsedSize = this.parseMaxFileSize(envSize);
        if (parsedSize) {
          return parsedSize;
        }
      }
    }
    
    // DEPRECATED: Environment variable approach no longer works in production
    // const envSize = import.meta.env.VITE_UPLOAD_MAX_SIZE;
    // if (envSize) {
    //   // Parse size like "10MB", "5GB", etc.
    //   const size = envSize.toString().toUpperCase();
    //   const number = parseFloat(size);
    //
    //   if (size.includes("GB")) return number * 1024 * 1024 * 1024;
    //   if (size.includes("MB")) return number * 1024 * 1024;
    //   if (size.includes("KB")) return number * 1024;
    //
    //   return number; // Assume bytes if no unit
    // }
    
    return this.DEFAULT_MAX_FILE_SIZE_BYTES;
  },

  set maxFileSize(value) {
    const parsedSize = this.parseMaxFileSize(value);
    this._config.maxFileSize = parsedSize || null;
  },

  get maxFiles() {
    if (this._config.maxFiles != null) return this._config.maxFiles;
    if (typeof window !== 'undefined' && window.HUBSPOT_FORMS_MAX_FILES != null) {
      const n = parseInt(window.HUBSPOT_FORMS_MAX_FILES, 10);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return this.DEFAULT_MAX_FILES;
  },

  set maxFiles(value) {
    const n = parseInt(value, 10);
    this._config.maxFiles = (Number.isFinite(n) && n > 0) ? n : null;
  },
  validateFile(fileInput) {
    if (!fileInput.files || fileInput.files.length === 0) {
      return { valid: true, errors: [], errorDetails: [] };
    }

    const errorDetails = [];

    if (fileInput.files.length > this.maxFiles) {
      errorDetails.push({
        type: 'fileCount',
        message: ErrorMessageConfig.getMessage('fileCount', { max: this.maxFiles }) ||
          `Maximum ${this.maxFiles} files allowed.`,
      });
      const errors = errorDetails.map(d => d.message);
      return { valid: false, errors, errorDetails };
    }

    // Validate each selected file
    for (let i = 0; i < fileInput.files.length; i++) {
      const file = fileInput.files[i];

      // Check file size
      if (file.size > this.maxFileSize) {
        errorDetails.push({
          type: "fileSize",
          message: ErrorMessageConfig.getMessage('fileSize', { maxSize: this.formatFileSize(this.maxFileSize) }) ||
            `File "${file.name}" size exceeds ${this.formatFileSize(this.maxFileSize)} limit`,
        });
      }

      // Check file extension
      const extension = file.name.split(".").pop().toLowerCase();
      if (!this.allowedExtensions.includes(extension)) {
        errorDetails.push({
          type: "fileType",
          message: ErrorMessageConfig.getMessage('fileType', {
            allowedTypes: this.allowedExtensions.map((ext) => "." + ext).join(", "),
          }) || `File "${file.name}" type ".${extension}" is not allowed.`,
        });
      }
    }

    const errors = errorDetails.map((errorDetail) => errorDetail.message);

    return { valid: errors.length === 0, errors, errorDetails };
  },

  // Format file size for display
  formatFileSize(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  },

  // Return the currently resolved max file size as display text
  getResolvedMaxFileSizeLabel() {
    return this.formatFileSize(this.maxFileSize);
  },

  // Show error message
  showError(fileInput, errors, errorDetails = []) {
    this.hideError(fileInput);

    if (errors.length === 0) return;

    const errorDiv = document.createElement("div");
    errorDiv.className = "hsfc-ErrorAlert hsfc-FileError";
    errorDiv.setAttribute("role", "alert");

    const errorTypes = [...new Set(errorDetails.map((detail) => detail.type))];
    if (errorTypes.length > 0) {
      errorDiv.setAttribute("data-hsfc-file-error-types", errorTypes.join(","));
    }

    errorDiv.innerHTML = errors.join("<br/>");
    fileInput.parentElement.appendChild(errorDiv);
  },

  // Hide error message
  hideError(fileInput) {
    const existingError =
      fileInput.parentElement.querySelector(".hsfc-FileError");
    if (existingError) {
      existingError.remove();
    }
    fileInput.style.borderColor = "";
  },

  // Show accepted files list
  showAcceptedFiles(fileInput) {
    this.hideAcceptedFiles(fileInput);

    // Use _accumulatedFiles as source of truth — fileInput.files can be cleared by HubSpot's own handlers
    const accumulated = this._accumulatedFiles.get(fileInput) || [];
    if (accumulated.length === 0) return;

    const acceptedFiles = accumulated
      .filter((file) => {
        const extension = file.name.split(".").pop().toLowerCase();
        return file.size <= this.maxFileSize && this.allowedExtensions.includes(extension);
      })
      .map((file) => file.name);

    if (acceptedFiles.length === 0) return;

    const acceptedDiv = document.createElement("div");
    acceptedDiv.className = "hsfc-AcceptedFiles";

    const label = document.createElement("span");
    label.className = "hsfc-AcceptedFiles__Label";
    label.textContent = acceptedFiles.length === 1
      ? "✓ Accepted:"
      : `✓ Accepted files (${acceptedFiles.length}):`;
    acceptedDiv.appendChild(label);

    const list = document.createElement("ul");
    list.className = "hsfc-AcceptedFiles__List";

    acceptedFiles.forEach((name) => {
      const item = document.createElement("li");
      item.className = "hsfc-AcceptedFile";

      const nameSpan = document.createElement("span");
      nameSpan.className = "hsfc-AcceptedFile__Name";
      nameSpan.textContent = name;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "hsfc-AcceptedFile__Remove";
      removeBtn.setAttribute("aria-label", `Remove ${name}`);
      removeBtn.textContent = "×";

      removeBtn.addEventListener("click", () => {
        this.removeFileFromInput(fileInput, name);
        this.showAcceptedFiles(fileInput);
        if (!fileInput.files || fileInput.files.length === 0) {
          this.hideError(fileInput);
        } else {
          const validation = this.validateFile(fileInput);
          if (validation.valid) {
            this.hideError(fileInput);
          } else {
            this.showError(fileInput, validation.errors, validation.errorDetails);
          }
        }
      });

      item.appendChild(nameSpan);
      item.appendChild(removeBtn);
      list.appendChild(item);
    });

    acceptedDiv.appendChild(list);
    fileInput.parentElement.appendChild(acceptedDiv);
  },

  // Hide accepted files list
  hideAcceptedFiles(fileInput) {
    const existingAccepted = fileInput.parentElement.querySelector(
      ".hsfc-AcceptedFiles",
    );
    if (existingAccepted) {
      existingAccepted.remove();
    }
  },

  // Remove a single file from the input by name using DataTransfer
  removeFileFromInput(fileInput, fileName) {
    const existing = this._accumulatedFiles.get(fileInput) || Array.from(fileInput.files || []);
    const updated = existing.filter(f => f.name !== fileName);
    const dt = new DataTransfer();
    updated.forEach(f => dt.items.add(f));
    fileInput.files = dt.files;
    this._accumulatedFiles.set(fileInput, updated);
  },

  clearFileInput(fileInput) {
    fileInput.value = '';
    this._accumulatedFiles.set(fileInput, []);
  },

  // Show max file size note near the file input
  showAllowedFormatsNote(fileInput) {
    if (fileInput.parentElement.querySelector('[data-hsfc-allowed-formats="true"]')) return;

    const fieldContainer = fileInput.closest(
      '.hsfc-FileField, .hs-fieldtype-file, .hsfc-FormField, .hs-form-field, [data-hsfc-id$="Field"]',
    );
    const fieldLabel = fieldContainer?.querySelector(
      '[data-hsfc-id="FieldLabel"], .hsfc-FieldLabel, label',
    );
    if (!fieldLabel) return;

    const desc = document.createElement('div');
    desc.className = 'hsfc-FieldDescription';
    desc.setAttribute('data-hsfc-id', 'FieldDescription');
    desc.setAttribute('data-hsfc-allowed-formats', 'true');
    desc.setAttribute('lang', document.documentElement.lang || 'en');

    const span = document.createElement('span');
    span.textContent = `Allowed formats: ${this.allowedExtensions.map(e => '.' + e).join(', ')}`;
    desc.appendChild(span);

    fieldLabel.insertAdjacentElement('afterend', desc);
  },

  showFileSizeNote(fileInput) {
    const existingNote = fileInput.parentElement.querySelector(
      '[data-hsfc-file-size-note="true"]',
    );

    const noteText = `Max file size: ${this.formatFileSize(this.maxFileSize)}`;

    if (existingNote) {
      existingNote.textContent = noteText;
      return;
    }

    const noteDiv = document.createElement("div");
    noteDiv.className = "hsfc-FieldNote";
    noteDiv.setAttribute("data-hsfc-file-size-note", "true");
    noteDiv.textContent = noteText;

    fileInput.parentElement.appendChild(noteDiv);
  },

  // Setup validation for file inputs
  setup(formContainer) {
    const fileInputs = formContainer.querySelectorAll('input[type="file"]');

    fileInputs.forEach((fileInput, index) => {
      // HubSpot doesn't forward its "allow multiple files" setting to the DOM attribute
      fileInput.setAttribute('multiple', 'multiple');
      this.showAllowedFormatsNote(fileInput);
      this.showFileSizeNote(fileInput);

      fileInput.addEventListener("change", () => {
        const existing = this._accumulatedFiles.get(fileInput) || [];
        const incoming = Array.from(fileInput.files || []);

        const errorDetails = [];
        const validIncoming = [];

        for (const file of incoming) {
          if (existing.some(f => f.name === file.name)) continue;
          const ext = file.name.split('.').pop().toLowerCase();
          let fileValid = true;
          if (file.size > this.maxFileSize) {
            errorDetails.push({ type: 'fileSize', message: ErrorMessageConfig.getMessage('fileSize', { maxSize: this.formatFileSize(this.maxFileSize) }) || `"${file.name}" exceeds ${this.formatFileSize(this.maxFileSize)}` });
            fileValid = false;
          }
          if (!this.allowedExtensions.includes(ext)) {
            errorDetails.push({ type: 'fileType', message: ErrorMessageConfig.getMessage('fileType', { allowedTypes: this.allowedExtensions.map(e => '.' + e).join(', ') }) || `"${file.name}" type not allowed` });
            fileValid = false;
          }
          if (fileValid) validIncoming.push(file);
        }

        const merged = [...existing, ...validIncoming];

        if (merged.length > this.maxFiles) {
          const allowed = Math.max(0, this.maxFiles - existing.length);
          const trimmed = [...existing, ...validIncoming.slice(0, allowed)];
          errorDetails.push({ type: 'fileCount', message: ErrorMessageConfig.getMessage('fileCount', { max: this.maxFiles }) || `Maximum ${this.maxFiles} files allowed.` });
          const dt = new DataTransfer();
          trimmed.forEach(f => dt.items.add(f));
          fileInput.files = dt.files;
          this._accumulatedFiles.set(fileInput, trimmed);
          this.showAcceptedFiles(fileInput);
          this.showError(fileInput, errorDetails.map(d => d.message), errorDetails);
          return;
        }

        const dt = new DataTransfer();
        merged.forEach(f => dt.items.add(f));
        fileInput.files = dt.files;
        this._accumulatedFiles.set(fileInput, merged);
        this.showAcceptedFiles(fileInput);

        if (errorDetails.length > 0) {
          this.showError(fileInput, errorDetails.map(d => d.message), errorDetails);
        } else {
          this.hideError(fileInput);
        }
      });
    });
  },
};

// Error message configuration system
const ErrorMessageConfig = {
  // Configuration storage
  _config: {
    messages: null,
  },

  get defaultMessages() {
    return {
      required: "⚠️ Please complete this required field.",
      email: "📧 must be formatted correctly",
      pattern: "📝 must be formatted correctly",
      characterLimit: "📏 Enter {limit} characters or fewer. You are {overBy} character{plural} over the limit.",
      date: "📅 Please enter a valid date.",
      phone: "📞 Please enter a valid phone number.",
      file: "📎 File type not allowed. Please select a different file.",
      fileSize: "📁 File size exceeds {maxSize} limit",
      fileType: "📄 File type not allowed. Allowed types: {allowedTypes}",
      fileReupload: "🔄 Please re-upload your file(s) to resubmit the form.",
      fileReuploadStep: "🔄 Please re-upload your file(s) on step {step} to resubmit the form.",
      fileCount: "📎 Maximum {max} files allowed.",
      url: "🔗 Please enter a valid URL",
      number: "🔢 Please enter a valid number",
      selectionLimit: "Please choose fewer options.",
      confirmation: "🔄 Confirmation does not match",
      captcha: "🤖 Please complete the verification",
      submission: "⚠️ There was an error submitting the form. Please try again.",
      network: "🌐 Connection error. Please check your internet connection.",
    };
  },

  // Get configuration from runtime config, window globals, or use defaults
  get messages() {
    const windowMessages =
      typeof window !== "undefined" &&
      window.HUBSPOT_FORMS_ERROR_MESSAGES &&
      typeof window.HUBSPOT_FORMS_ERROR_MESSAGES === "object"
        ? window.HUBSPOT_FORMS_ERROR_MESSAGES
        : null;

    const configuredMessages =
      this._config.messages && typeof this._config.messages === "object"
        ? this._config.messages
        : null;

    return {
      ...this.defaultMessages,
      ...(windowMessages || {}),
      ...(configuredMessages || {}),
    };
  },

  set messages(value) {
    this._config.messages = value;
  },

  hasExplicitMessage(messageType) {
    const hasOwn = (obj, key) =>
      !!obj && Object.prototype.hasOwnProperty.call(obj, key);

    const configuredMessages =
      this._config.messages && typeof this._config.messages === "object"
        ? this._config.messages
        : null;

    const windowMessages =
      typeof window !== "undefined" &&
      window.HUBSPOT_FORMS_ERROR_MESSAGES &&
      typeof window.HUBSPOT_FORMS_ERROR_MESSAGES === "object"
        ? window.HUBSPOT_FORMS_ERROR_MESSAGES
        : null;

    return (
      hasOwn(configuredMessages, messageType) ||
      hasOwn(windowMessages, messageType)
    );
  },

  // Get a specific message with optional interpolation
  getMessage(messageType, interpolations = {}) {
    const messages = this.messages;
    let message = messages[messageType];

    // If no custom message is defined for this type, return null
    // This allows the calling code to fall back to original text
    if (!message) {
      return null;
    }

    // Handle interpolation for dynamic values
    Object.keys(interpolations).forEach((key) => {
      const value = interpolations[key];
      message = message.replace(new RegExp(`\\{${key}\\}`, "g"), value);
    });

    return message;
  },
};

// Matches all nav/submit buttons HubSpot renders, including submit buttons placed outside .hsfc-NavigationRow
const NAVIGATION_BUTTON_SELECTOR =
  '.hsfc-NavigationRow button[type="button"], .hsfc-NavigationRow button[type="submit"], button[type="submit"]';

// HubSpot form validation system - optimized for multiple forms
const HubSpotFormValidator = {
  // HubSpot uses both 'required' and 'aria-required="true"' attributes
  REQUIRED_FIELD_SELECTOR:
    'input[required], select[required], textarea[required], input[aria-required="true"], select[aria-required="true"], textarea[aria-required="true"]',

  _config: {
    strictErrorSummaryOrdering: null,
  },

  get strictErrorSummaryOrdering() {
    if (typeof this._config.strictErrorSummaryOrdering === "boolean") {
      return this._config.strictErrorSummaryOrdering;
    }

    if (
      typeof window !== "undefined" &&
      typeof window.HUBSPOT_FORMS_STRICT_ERROR_SUMMARY_ORDERING === "boolean"
    ) {
      return window.HUBSPOT_FORMS_STRICT_ERROR_SUMMARY_ORDERING;
    }

    return false;
  },

  set strictErrorSummaryOrdering(value) {
    this._config.strictErrorSummaryOrdering = !!value;
  },

  getFileErrorTypes(errorElement) {
    if (!errorElement || !errorElement.getAttribute) {
      return [];
    }

    const rawTypes = errorElement.getAttribute("data-hsfc-file-error-types");
    if (!rawTypes) {
      return [];
    }

    return rawTypes
      .split(",")
      .map((type) => type.trim())
      .filter(Boolean);
  },

  getFileErrorInterpolationValues() {
    const maxSize = FileUploadValidator.getResolvedMaxFileSizeLabel();
    const allowedTypes = FileUploadValidator.allowedExtensions
      .map((ext) => `.${ext}`)
      .join(", ");

    return { maxSize, allowedTypes };
  },

  getCustomFileErrorMessage(errorElement) {
    const fileErrorTypes = this.getFileErrorTypes(errorElement);
    if (fileErrorTypes.length === 0) {
      return null;
    }

    const interpolationValues = this.getFileErrorInterpolationValues();

    if (fileErrorTypes.includes("fileReupload")) {
      return ErrorMessageConfig.getMessage("fileReupload");
    }

    if (fileErrorTypes.includes("fileSize")) {
      return ErrorMessageConfig.getMessage("fileSize", {
        maxSize: interpolationValues.maxSize,
      });
    }

    if (fileErrorTypes.includes("fileType")) {
      return ErrorMessageConfig.getMessage("fileType", {
        allowedTypes: interpolationValues.allowedTypes,
      });
    }

    return ErrorMessageConfig.getMessage("file");
  },

  isSubmissionOrNetworkError(text) {
    const t = (text || '').toLowerCase();
    return (
      ((t.includes('submit') || t.includes('submission')) &&
        (t.includes('fail') || t.includes('error') || t.includes('unable') || t.includes('problem'))) ||
      t.includes('connection') ||
      t.includes('network')
    );
  },

  resolveErrorText(originalText, errorElement) {
    const t = originalText.toLowerCase();
    if (
      t.includes("please complete this required field") ||
      t.includes("this field is required") ||
      originalText === "Please complete this required field."
    ) {
      return ErrorMessageConfig.getMessage('required') || originalText;
    } else if (t.includes("email") && (t.includes("valid") || t.includes("format"))) {
      return ErrorMessageConfig.getMessage('email') || originalText;
    } else if (t.includes("must be formatted correctly") || t.includes("invalid format")) {
      return ErrorMessageConfig.getMessage('pattern') || originalText;
    } else if (t.includes("please enter a valid date") || t.includes("invalid date")) {
      return ErrorMessageConfig.getMessage('date') || originalText;
    } else if (t.includes("phone number") && (t.includes("invalid") || t.includes("wrong format"))) {
      return ErrorMessageConfig.getMessage('phone') || originalText;
    } else {
      const customFileMessage = this.getCustomFileErrorMessage(errorElement);
      if (customFileMessage) return customFileMessage;

      if (this.isSelectionLimitErrorText(originalText)) {
        const normalized = originalText.replace(/Error:\s*/g, "Error: ");
        const interpolations = this.getSelectionLimitInterpolations(originalText);
        const customMessage = ErrorMessageConfig.hasExplicitMessage('selectionLimit')
          ? ErrorMessageConfig.getMessage('selectionLimit', interpolations)
          : null;
        return customMessage || normalized;
      } else if (t.includes("url") || t.includes("website")) {
        return ErrorMessageConfig.getMessage('url') || originalText;
      } else if (t.includes("number") || t.includes("numeric")) {
        return ErrorMessageConfig.getMessage('number') || originalText;
      } else if (t.includes("confirmation") || t.includes("match")) {
        return ErrorMessageConfig.getMessage('confirmation') || originalText;
      } else if (t.includes("captcha") || t.includes("verification")) {
        return ErrorMessageConfig.getMessage('captcha') || originalText;
      } else if (this.isSubmissionOrNetworkError(originalText)) {
        const key = (t.includes('connection') || t.includes('network')) ? 'network' : 'submission';
        return ErrorMessageConfig.getMessage(key) || originalText;
      }
    }
    return originalText;
  },

  isSelectionLimitErrorText(text = "") {
    const normalized = text.toLowerCase();

    return (
      normalized.includes("choose one or two") ||
      normalized.includes("choose up to") ||
      normalized.includes("select up to") ||
      normalized.includes("choose at least") ||
      normalized.includes("select at least") ||
      normalized.includes("at least") ||
      normalized.includes("minimum") ||
      normalized.includes("at minimum") ||
      normalized.includes("min ") ||
      normalized.includes("must select") ||
      normalized.includes("at most") ||
      normalized.includes("no more than") ||
      normalized.includes("too many options") ||
      normalized.includes("too many selected")
    );
  },

  getSelectionLimitInterpolations(text = "") {
    const normalized = text.toLowerCase();
    const maxMatch = normalized.match(/(?:up to|at most|no more than|maximum|max)\s+(\d+)/);
    const minMatch = normalized.match(/(?:at least|minimum|at minimum|min|must select)\s+(\d+)/);

    const interpolations = {};
    if (maxMatch && maxMatch[1]) {
      interpolations.constraint = "maximum";
      interpolations.limit = maxMatch[1];
    } else if (minMatch && minMatch[1]) {
      interpolations.constraint = "minimum";
      interpolations.limit = minMatch[1];
    } else {
      const numberMatch = normalized.match(/\b(\d+)\b/);
      if (numberMatch && numberMatch[1]) {
        interpolations.limit = numberMatch[1];
      }

      if (
        normalized.includes("up to") ||
        normalized.includes("at most") ||
        normalized.includes("no more than") ||
        normalized.includes("maximum") ||
        normalized.includes("max")
      ) {
        interpolations.constraint = "maximum";
      } else if (
        normalized.includes("at least") ||
        normalized.includes("minimum") ||
        normalized.includes("at minimum") ||
        normalized.includes("must select")
      ) {
        interpolations.constraint = "minimum";
      }
    }

    if (interpolations.limit) {
      interpolations.plural = interpolations.limit === "1" ? "" : "s";
    }

    return interpolations;
  },

  // Helper to find navigation button (not Previous)
  findNavigationButton(step) {
    const buttons = step.querySelectorAll(NAVIGATION_BUTTON_SELECTOR);
    for (const button of buttons) {
      const buttonText = button.textContent.trim().toLowerCase();
      // Return any button that is NOT a previous button
      if (!buttonText.includes("previous") && !buttonText.includes("back")) {
        return button;
      }
    }
    return null;
  },
  // Helper to check if element is actually visible
  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  },

  // Create validator instance for specific form
  createValidator(formContainer) {
    const validateVisibleStep = () => {
      // Find currently visible step
      const visibleStep = Array.from(
        formContainer.querySelectorAll(".hsfc-Step"),
      ).find((step) => {
        const computedStyle = getComputedStyle(step);
        const isVisible =
          computedStyle.display !== "none" &&
          computedStyle.visibility !== "hidden" &&
          computedStyle.opacity !== "0";
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
      const errorElements = visibleStep.querySelectorAll(".hsfc-ErrorAlert");
      const hasVisibleErrors = Array.from(errorElements).some(
        (errorEl) =>
          this.isElementVisible(errorEl) && errorEl.textContent.trim() !== "",
      );

      if (hasVisibleErrors) {
        return false;
      }

      // Check required fields - HubSpot uses both 'required' and 'aria-required="true"'
      const requiredFields = visibleStep.querySelectorAll(
        this.REQUIRED_FIELD_SELECTOR,
      );

      if (requiredFields.length === 0) {
        return true;
      }

      // Validate required fields are filled - use centralized field validation
      const isFieldValid = (field) =>
        FieldValidator.isFieldValid(field, visibleStep);

      // For radio buttons and checkbox groups, we need to validate by group, not individual buttons
      const processedFieldGroups = new Set();
      const fieldsToValidate = Array.from(requiredFields).filter((field) => {
        if (field.type === "radio" || field.type === "checkbox") {
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
  showValidationError(step, formContainer = null) {
    // Remove any existing custom error
    const existingError = step.querySelector(".hsfc-CustomValidationError");
    if (existingError) {
      existingError.remove();
    }

    // Find all fields with errors to create descriptive links
    const fieldsWithErrors = this.getFieldsWithErrors(step, formContainer);

    if (fieldsWithErrors.length === 0) {
      // No errors found, don't show error box
      return;
    }

    // Create error container
    const errorDiv = document.createElement("div");
    errorDiv.className = "hsfc-CustomValidationError";
    errorDiv.setAttribute("role", "alert");
    errorDiv.setAttribute("aria-live", "polite");

    // Create main error message
    const heading = document.createElement("div");
    heading.textContent = `This form contains ${fieldsWithErrors.length} error${fieldsWithErrors.length > 1 ? "s" : ""}. Please review the following:`;
    errorDiv.appendChild(heading);

    // Create list of error links
    const errorList = document.createElement("ul");

    fieldsWithErrors.forEach((fieldInfo, index) => {
      const listItem = document.createElement("li");

      const errorLink = document.createElement("a");
      errorLink.href = "#";
      errorLink.innerHTML = fieldInfo.description;

      // Add click handler to focus the field
      errorLink.addEventListener("click", (e) => {
        e.preventDefault();
        fieldInfo.field.focus();
        fieldInfo.field.scrollIntoView({ behavior: "smooth", block: "center" });
      });

      // Add keyboard support
      errorLink.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fieldInfo.field.focus();
          fieldInfo.field.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      });

      listItem.appendChild(errorLink);
      errorList.appendChild(listItem);
    });

    errorDiv.appendChild(errorList);

    // Find the step content area
    const stepContent = step.querySelector(".hsfc-Step__Content") || step;

    // Ensure the step content uses flexbox for proper ordering
    const stepContentStyle = getComputedStyle(stepContent);
    if (
      stepContentStyle.display !== "flex" &&
      stepContentStyle.display !== "inline-flex"
    ) {
      stepContent.style.display = "flex";
      stepContent.style.flexDirection = "column";
    }

    // Add fallback classes for browsers that don't support :has()
    HubSpotFormManager.addFlexboxFallbackClasses(step, stepContent);

    // Check if there's already a repositioned progress bar in the correct position
    // If so, we insert the validation error before it (so error appears above progress bar)
    // This prevents the progress bar from moving when validation errors appear
    const existingProgressBar = stepContent.querySelector(
      ".hsfc-ProgressBar--repositioned",
    );

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
    errorDiv.scrollIntoView({ behavior: "smooth", block: "center" });

    // Store reference for persistent checking (no auto-remove)
    step.setAttribute("data-has-error-summary", "true");
  },

  // Get fields with errors and their descriptions
  getFieldsWithErrors(step, formContainer = null) {
    const fieldsWithErrors = [];
    const useStrictOrdering = this.strictErrorSummaryOrdering;
    const normalizeLabel = (text) =>
      (text || "")
        .normalize("NFKD")
        .replace(/\s+/g, " ")
        .replace(/\s*\*\s*$/, "")
        .replace(/\s*:\s*$/, "")
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .toLowerCase();

    const isElementVisible = (element) => {
      if (!(element instanceof Element)) {
        return false;
      }

      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return (
        element.isConnected &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0 &&
        rect.height > 0
      );
    };

    const fieldContainers = Array.from(
      step.querySelectorAll(
        ".hsfc-TextField, .hsfc-EmailField, .hsfc-FileField, .hsfc-PhoneField, .hsfc-DateField, .hsfc-CheckboxFieldGroup, .hsfc-RadioFieldGroup, .hsfc-FormField, .hs-form-field, [data-hsfc-id$='Field'], [data-hsfc-id$='FieldGroup']",
      ),
    );

    const getContainerLabel = (container) => {
      if (!(container instanceof Element)) {
        return "";
      }

      const labelElement = container.querySelector(
        ':scope > [data-hsfc-id="FieldLabel"]:not(.hsfc-label-without-required), :scope > .hsfc-FieldLabel:not(.hsfc-label-without-required), :scope > legend, [data-hsfc-id="FieldLabel"]:not(.hsfc-label-without-required), .hsfc-FieldLabel:not(.hsfc-label-without-required), legend',
      );

      return labelElement?.textContent?.trim() || "";
    };

    const visualContainerOrder = new Map();
    fieldContainers.forEach((container) => {
      if (!isElementVisible(container) || visualContainerOrder.has(container)) {
        return;
      }

      visualContainerOrder.set(container, visualContainerOrder.size);
    });

    const visualFieldOrder = new Map();
    const visibleFieldLabels = Array.from(
      step.querySelectorAll(
        '[data-hsfc-id="FieldLabel"]:not(.hsfc-label-without-required), .hsfc-FieldLabel:not(.hsfc-label-without-required), legend',
      ),
    )
      .map((labelElement) => {
        const parentFieldContainer = labelElement.closest(
          ".hsfc-TextField, .hsfc-EmailField, .hsfc-FileField, .hsfc-PhoneField, .hsfc-DateField, .hsfc-CheckboxFieldGroup, .hsfc-RadioFieldGroup, .hsfc-FormField, .hs-form-field, [data-hsfc-id$='Field'], [data-hsfc-id$='FieldGroup']",
        );

        if (!parentFieldContainer || !isElementVisible(parentFieldContainer)) {
          return "";
        }

        return normalizeLabel(labelElement.textContent);
      })
      .filter(Boolean);

    visibleFieldLabels.forEach((label) => {
      if (!label || visualFieldOrder.has(label)) {
        return;
      }

      visualFieldOrder.set(label, visualFieldOrder.size);
    });

    const strictFieldOrder = new Map();
    if (useStrictOrdering) {
      fieldContainers.forEach((container) => {
        if (!isElementVisible(container)) {
          return;
        }

        const label = normalizeLabel(getContainerLabel(container));
        if (!label || strictFieldOrder.has(label)) {
          return;
        }

        strictFieldOrder.set(label, strictFieldOrder.size);
      });
    }

    // Find all visible error messages
    const errorElements = step.querySelectorAll(
      ".hsfc-ErrorAlert:not(.hsfc-CustomValidationError)",
    );

    for (const errorEl of errorElements) {
      if (this.isElementVisible(errorEl) && errorEl.textContent.trim() !== "") {
        // Find the associated field
        const field = this.findFieldForError(errorEl);
        if (field) {
          const fieldLabel =
            this.getFieldLabel(field) ||
            `Field "${field.name || field.id || "unknown"}"`;
          const errorText = this.resolveErrorText(errorEl.textContent.trim(), errorEl);

          fieldsWithErrors.push({
            field: field,
            fieldLabel,
            description: `<span class="customValidationErrorLabel">${fieldLabel}:</span> <span class="customValidationErrorText">${errorText}</span>`,
            errorElement: errorEl,
          });
        }
      }
    }

    // Check for character limit errors on textareas
    const textareas = step.querySelectorAll("textarea");
    textareas.forEach((textarea) => {
      if (CharacterLimitValidator.hasCharacterLimitError(textarea)) {
        const errorMessage =
          CharacterLimitValidator.getCharacterLimitErrorMessage(textarea);
        if (
          errorMessage &&
          !fieldsWithErrors.some((f) => f.field === textarea)
        ) {
          fieldsWithErrors.push({
            field: textarea,
            fieldLabel: this.getFieldLabel(textarea) || "",
            description: errorMessage,
            errorElement: step.querySelector(".hsfc-CustomCharacterError"),
          });
        }
      }
    });

    // Also check for empty required fields that might not have shown errors yet
    const requiredFields = step.querySelectorAll(this.REQUIRED_FIELD_SELECTOR);

    // Helper function to check if a field is invalid - use centralized validation
    const isFieldInvalid = (field) =>
      FieldValidator.isFieldInvalid(field, step);

    // For radio buttons and checkbox groups, avoid processing multiple fields from the same group
    const processedFieldGroups = new Set();

    for (const field of requiredFields) {
      // Skip duplicate group processing for radio buttons and checkbox groups with same name
      if (field.type === "radio" || field.type === "checkbox") {
        if (processedFieldGroups.has(field.name)) {
          continue; // Skip - already processed this field group
        }
        processedFieldGroups.add(field.name);
      }

      // Skip file fields that are already represented by a re-upload notice
      if (field.type === 'file' &&
          field.parentElement?.querySelector('[data-hsfc-file-error-types*="fileReupload"]')) {
        continue;
      }

      // Check if field is invalid and not already in the error list
      if (
        isFieldInvalid(field) &&
        !fieldsWithErrors.some((f) => f.field === field)
      ) {
        const fieldLabel =
          this.getFieldLabel(field) ||
          `Field "${field.name || field.id || "unknown"}"`;

        // For date fields with existing errors, don't add duplicate mandatory message
        if (field.classList?.contains('hsfc-DateInput') && field.getAttribute('aria-invalid') === 'true') {
          continue; // Skip - HubSpot error message should already be in the list
        }

        const customMessage = ErrorMessageConfig.getMessage('required');
        const errorMessage = customMessage || "Please complete this required field.";
        const errorDescription = `<span class="customValidationErrorLabel">${fieldLabel}:</span> <span class="customValidationErrorText">${errorMessage}</span>`;

        fieldsWithErrors.push({
          field: field,
          fieldLabel,
          description: errorDescription,
          errorElement: null,
        });
      }
    }

    // Check for format validation on fields that have values (not empty)
    const allFields = step.querySelectorAll("input, select, textarea");

    for (const field of allFields) {
      // Skip if already found or if field is empty
      if (
        fieldsWithErrors.some((f) => f.field === field) ||
        !field.value ||
        field.value.trim() === ""
      ) {
        continue;
      }

      let formatError = null;
      const fieldLabel =
        this.getFieldLabel(field) ||
        `Field "${field.name || field.id || "unknown"}"`;

      // Check email format validation
      if (
        field.type === "email" ||
        field.name?.toLowerCase().includes("email")
      ) {
        if (!this.isValidEmail(field.value)) {
          const customMessage = ErrorMessageConfig.getMessage('email');
          const errorMessage = customMessage || "must be formatted correctly";
          formatError = `<span class="customValidationErrorLabel">${fieldLabel}</span> <span class="customValidationErrorText">${errorMessage}</span>`;
        }
      }
      // Check fields with pattern attribute
      else if (field.hasAttribute("pattern")) {
        try {
          if (!field.value.match(new RegExp(field.pattern))) {
            const customMessage = ErrorMessageConfig.getMessage('pattern');
            const errorMessage = customMessage || "must be formatted correctly";
            formatError = `<span class="customValidationErrorLabel">${fieldLabel}</span> <span class="customValidationErrorText">${errorMessage}</span>`;
          }
        } catch (e) {
          // Pattern validation error - skip this field
        }
      }

      // Add format error if found
      if (formatError) {
        fieldsWithErrors.push({
          field: field,
          fieldLabel,
          description: formatError,
          errorElement: null,
        });
      }
    }

    // Finally, check for commonly required fields that are empty and not already caught
    // Only check email fields since they're commonly required but may not be marked as such
    for (const field of allFields) {
      // Skip if already found or has value
      if (
        fieldsWithErrors.some((f) => f.field === field) ||
        (field.value && field.value.trim() !== "")
      ) {
        continue;
      }

      // Only check email fields as commonly required
      if (
        field.type === "email" ||
        field.name?.toLowerCase().includes("email")
      ) {
        const fieldLabel =
          this.getFieldLabel(field) ||
          `Field "${field.name || field.id || "unknown"}"`;

        const customMessage = ErrorMessageConfig.getMessage('required');
        const errorMessage = customMessage || "Please complete this required field.";
        fieldsWithErrors.push({
          field: field,
          fieldLabel,
          description: `<span class="customValidationErrorLabel">${fieldLabel}:</span> <span class="customValidationErrorText">${errorMessage}</span>`,
          errorElement: null,
        });
      }
    }

    // Collect re-upload errors from file inputs on other steps (file may have been uploaded on an earlier panel)
    if (formContainer) {
      for (const fileInput of formContainer.querySelectorAll('input[type="file"]')) {
        if (step.contains(fileInput)) continue;
        const reuploadEl = fileInput.parentElement?.querySelector('[data-hsfc-file-error-types*="fileReupload"]');
        if (!reuploadEl || fieldsWithErrors.some(f => f.field === fileInput)) continue;
        const errorText = reuploadEl.textContent.trim();
        const fieldLabel = this.getFieldLabel(fileInput) || `Field "${fileInput.name || fileInput.id || 'unknown'}"`;
        fieldsWithErrors.push({
          field: fileInput,
          fieldLabel,
          description: `<span class="customValidationErrorLabel">${fieldLabel}:</span> <span class="customValidationErrorText">${errorText}</span>`,
          errorElement: reuploadEl,
        });
      }
    }

    // Sort by visual DOM order so the error summary matches form field order.
    // Use stable field containers as anchors to avoid hidden/re-rendered input drift.
    const getSortAnchor = (field) => {
      if (!(field instanceof Element)) {
        return null;
      }

      const isGroupField = field.type === "radio" || field.type === "checkbox";

      if (isGroupField) {
        const groupContainer = field.closest(
          ".hsfc-RadioFieldGroup, .hsfc-CheckboxFieldGroup, .hs-fieldtype-radio, .hs-fieldtype-checkbox",
        );

        if (groupContainer) {
          return groupContainer;
        }
      }

      const fileContainer = field.closest(
        ".hsfc-FileField, .hs-fieldtype-file",
      );

      if (fileContainer) {
        return fileContainer;
      }

      const fieldContainer = field.closest(
        ".hs-form-field, .hsfc-FormField, [data-hsfc-id*='Field']",
      );

      if (fieldContainer) {
        return fieldContainer;
      }

      return field;
    };

    const getAnchorMetrics = (anchor) => {
      if (!(anchor instanceof Element) || !isElementVisible(anchor)) {
        return null;
      }

      const rect = anchor.getBoundingClientRect();

      return {
        top: rect.top,
        left: rect.left,
      };
    };

    const getSortLabel = (entry) => {
      if (entry.fieldLabel) {
        return entry.fieldLabel;
      }

      if (typeof entry.description !== "string") {
        return "";
      }

      const temp = document.createElement("div");
      temp.innerHTML = entry.description;
      const labelElement = temp.querySelector(".customValidationErrorLabel");

      if (labelElement?.textContent) {
        return labelElement.textContent;
      }

      return temp.textContent || "";
    };

    return fieldsWithErrors
      .map((entry, index) => ({
        entry,
        index,
        sortLabel: getSortLabel(entry),
        anchor: getSortAnchor(entry.field),
        metrics: getAnchorMetrics(getSortAnchor(entry.field)),
        strictIndex: strictFieldOrder.has(normalizeLabel(getSortLabel(entry)))
          ? strictFieldOrder.get(normalizeLabel(getSortLabel(entry)))
          : Number.MAX_SAFE_INTEGER,
        containerIndex: visualContainerOrder.has(getSortAnchor(entry.field))
          ? visualContainerOrder.get(getSortAnchor(entry.field))
          : Number.MAX_SAFE_INTEGER,
        visualIndex: visualFieldOrder.has(normalizeLabel(getSortLabel(entry)))
          ? visualFieldOrder.get(normalizeLabel(getSortLabel(entry)))
          : Number.MAX_SAFE_INTEGER,
      }))
      .sort((a, b) => {
        if (useStrictOrdering) {
          const aKnownStrictIndex =
            a.strictIndex !== Number.MAX_SAFE_INTEGER;
          const bKnownStrictIndex =
            b.strictIndex !== Number.MAX_SAFE_INTEGER;

          if (aKnownStrictIndex && bKnownStrictIndex && a.strictIndex !== b.strictIndex) {
            return a.strictIndex - b.strictIndex;
          }

          if (aKnownStrictIndex !== bKnownStrictIndex) {
            return aKnownStrictIndex ? -1 : 1;
          }
        }

        if (a.containerIndex !== b.containerIndex) {
          return a.containerIndex - b.containerIndex;
        }

        if (a.visualIndex !== b.visualIndex) {
          return a.visualIndex - b.visualIndex;
        }

        if (a.metrics && b.metrics) {
          if (a.metrics.top !== b.metrics.top) {
            return a.metrics.top - b.metrics.top;
          }

          if (a.metrics.left !== b.metrics.left) {
            return a.metrics.left - b.metrics.left;
          }
        }

        if (a.anchor && b.anchor && a.anchor !== b.anchor) {
          const position = a.anchor.compareDocumentPosition(b.anchor);

          if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
            return -1;
          }

          if (position & Node.DOCUMENT_POSITION_PRECEDING) {
            return 1;
          }
        }

        return a.index - b.index;
      })
      .map(({ entry }) => entry);
  },

  // Find field associated with an error element
  findFieldForError(errorEl) {
    // Try multiple strategies to find the field, starting with most specific
    let field = null;

    // Strategy 1: Previous sibling
    field = errorEl.previousElementSibling?.matches?.("input, select, textarea")
      ? errorEl.previousElementSibling
      : null;
    if (field) return field;

    // Strategy 2: Within same form field container
    field = errorEl
      .closest(".hs-form-field, .hsfc-FormField")
      ?.querySelector("input, select, textarea");
    if (field) return field;

    // Strategy 3: Within specific field type containers
    field = errorEl
      .closest(
        ".hs-fieldtype-text, .hs-fieldtype-email, .hs-fieldtype-number, .hs-fieldtype-select, .hs-fieldtype-textarea",
      )
      ?.querySelector("input, select, textarea");
    if (field) return field;

    // Strategy 4: Parent element search
    field = errorEl.parentElement?.querySelector("input, select, textarea");
    if (field) return field;

    // Strategy 5: Look for field before this error in DOM order
    let currentEl = errorEl.previousElementSibling;
    while (currentEl) {
      if (currentEl.matches && currentEl.matches("input, select, textarea")) {
        return currentEl;
      }
      if (currentEl.querySelector) {
        field = currentEl.querySelector("input, select, textarea");
        if (field) return field;
      }
      currentEl = currentEl.previousElementSibling;
    }

    // Strategy 6: Look in parent's previous children
    let parentEl = errorEl.parentElement;
    while (parentEl && !parentEl.matches(".hsfc-Step")) {
      const fieldInParent = parentEl.querySelector("input, select, textarea");
      if (fieldInParent) return fieldInParent;
      parentEl = parentEl.parentElement;
    }

    return null;
  },

  // Get a readable label for a field
  getFieldLabel(field) {
    // Special handling for radio and checkbox fields
    if (field.type === "radio" || field.type === "checkbox") {
      // Strategy 1: Look for the field group container
      let groupContainer = field.closest(
        ".hsfc-RadioFieldGroup, .hsfc-CheckboxFieldGroup",
      );

      if (groupContainer) {
        // Look for the group label (usually at the top of the group)
        const groupLabel = groupContainer.querySelector(
          'label[data-hsfc-id="FieldLabel"]:first-child, .hsfc-FieldLabel:first-child',
        );
        if (groupLabel && groupLabel.textContent.trim()) {
          return groupLabel.textContent.trim().replace(/\s*\*\s*$/, "");
        }
      }

      // Strategy 2: Look for parent field container that might contain group info
      let parentField = field.closest('[data-hsfc-id*="Field"]');

      if (parentField) {
        // Look for any label in the parent that's not the individual option label
        const parentLabel = parentField.querySelector(
          'label[data-hsfc-id="FieldLabel"]',
        );
        if (
          parentLabel &&
          !parentLabel.contains(field) &&
          parentLabel.textContent.trim()
        ) {
          return parentLabel.textContent.trim().replace(/\s*\*\s*$/, "");
        }
      }

      // Strategy 3: Look for preceding sibling that might be a group title
      let sibling = field.parentElement;
      while (sibling && sibling.previousElementSibling) {
        sibling = sibling.previousElementSibling;
        if (sibling.tagName === "LABEL" && !sibling.querySelector("input")) {
          return sibling.textContent.trim().replace(/\s*\*\s*$/, "");
        }
      }
    }

    // Standard field label detection (for individual fields like text, email, etc.)
    const label =
      field
        .closest(".hs-form-field, .hsfc-FormField")
        ?.querySelector("label") ||
      document.querySelector(`label[for="${field.id}"]`);

    if (label) {
      return label.textContent.trim().replace(/\s*\*\s*$/, ""); // Remove asterisk
    }

    // Extended label detection strategies for date fields and other field types
    // Strategy 1: Look for label with data-hsfc-id="FieldLabel" in various parent containers
    let parentContainer = field.closest(
      '.hsfc-FormField, .hsfc-Row, .hs-form-field, [data-hsfc-id*="Field"]',
    );
    if (parentContainer) {
      const fieldLabel = parentContainer.querySelector(
        'label[data-hsfc-id="FieldLabel"], .hsfc-FieldLabel',
      );
      if (fieldLabel && fieldLabel.textContent.trim()) {
        return fieldLabel.textContent.trim().replace(/\s*\*\s*$/, "");
      }
    }

    // Strategy 2: Look for any label element in the parent container that's not a child of this field
    if (parentContainer) {
      const labels = parentContainer.querySelectorAll("label");
      for (const potentialLabel of labels) {
        // Skip if this label contains the field (it's wrapping the field, not labeling it)
        if (potentialLabel.contains(field)) continue;

        // Skip empty labels
        if (!potentialLabel.textContent.trim()) continue;

        return potentialLabel.textContent.trim().replace(/\s*\*\s*$/, "");
      }
    }

    // Strategy 3: Look for preceding elements that might contain the label text
    let currentElement = field;
    for (let i = 0; i < 5; i++) {
      // Check up to 5 levels up
      currentElement = currentElement.parentElement;
      if (!currentElement) break;

      // Look for labels in this level that don't contain our field
      const labels = currentElement.querySelectorAll("label");
      for (const potentialLabel of labels) {
        if (potentialLabel.contains(field)) continue;
        if (!potentialLabel.textContent.trim()) continue;

        return potentialLabel.textContent.trim().replace(/\s*\*\s*$/, "");
      }

      // Also check for text nodes or spans that might be labels
      const textElements = currentElement.querySelectorAll("span, div");
      for (const textElement of textElements) {
        // Skip if it contains the field or has no text
        if (textElement.contains(field) || !textElement.textContent.trim())
          continue;

        // Only consider short text that looks like a label
        const text = textElement.textContent.trim();
        if (text.length > 0 && text.length < 100 && !text.includes("\n")) {
          // Check if this looks like a label by seeing if it's positioned before our field
          const fieldRect = field.getBoundingClientRect();
          const textRect = textElement.getBoundingClientRect();

          // If the text element is above or to the left of the field, it might be a label
          if (
            textRect.top < fieldRect.top ||
            (textRect.top === fieldRect.top && textRect.left < fieldRect.left)
          ) {
            return text.replace(/\s*\*\s*$/, "");
          }
        }
      }
    }

    // Fallback to placeholder or name
    return (
      field.placeholder ||
      field.getAttribute("aria-label") ||
      field.name ||
      "Unknown field"
    );
  },

  // Simple email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  // Check if all errors are cleared and remove error summary if so
  checkAndRemoveErrorSummary(step) {
    const errorSummary = step.querySelector(".hsfc-CustomValidationError");

    if (!errorSummary) return;

    // Check if there are still visible errors (excluding our notifications)
    const remainingErrors = step.querySelectorAll(
      ".hsfc-ErrorAlert:not(.hsfc-CustomValidationError)",
    );
    const hasVisibleErrors = Array.from(remainingErrors).some(
      (errorEl) =>
        this.isElementVisible(errorEl) && errorEl.textContent.trim() !== "",
    );

    // Check for empty required fields using field-type-aware logic
    const requiredFields = step.querySelectorAll(this.REQUIRED_FIELD_SELECTOR);

    // Helper function to check if a field is invalid - use centralized validation
    const isFieldInvalid = (field) =>
      FieldValidator.isFieldInvalid(field, step);

    // For radio buttons and checkbox groups, avoid processing multiple fields from the same group
    const processedFieldGroups = new Set();
    const hasEmptyRequired = Array.from(requiredFields).some((field) => {
      // Skip duplicate group processing for radio buttons and checkbox groups with same name
      if (field.type === "radio" || field.type === "checkbox") {
        if (processedFieldGroups.has(field.name)) {
          return false; // Skip - already processed this field group
        }
        processedFieldGroups.add(field.name);
      }

      return isFieldInvalid(field);
    });

    // Check for character limit errors
    const textareas = step.querySelectorAll("textarea");
    const hasCharacterLimitErrors = Array.from(textareas).some((textarea) =>
      CharacterLimitValidator.hasCharacterLimitError(textarea),
    );

    if (!hasVisibleErrors && !hasEmptyRequired && !hasCharacterLimitErrors) {
      errorSummary.remove();
      step.removeAttribute("data-has-error-summary");

      // Clean up fallback classes when validation error is removed
      const stepContent = step.querySelector(".hsfc-Step__Content") || step;
      HubSpotFormManager.removeFlexboxFallbackClasses(step, stepContent);
    }
  },

  // Remove custom validation error (now uses smart checking)
  removeValidationError(step) {
    this.checkAndRemoveErrorSummary(step);
  },
};

// Form management system
const HubSpotFormManager = {
  // Track initialized forms to prevent duplicates
  initializedForms: new WeakSet(),

  // Track cleanup resources for each form
  formCleanupMap: new WeakMap(),

  // Temporary suppression set for native HubSpot renderer scroll jumps
  rendererScrollSuppressedForms: new Set(),
  _rendererScrollPatchInstalled: false,
  _originalScrollIntoView: null,

  // Configuration for mobile step-change scroll behavior
  mobileStepScrollResetConfig: {
    enabled: true,
    breakpoint: 768,
    onlyWhenFormTopAboveViewport: true,
    behavior: "smooth",
    respectReducedMotion: true,
  },

  configureMobileStepScrollReset(configOption) {
    const defaults = {
      enabled: true,
      breakpoint: 768,
      onlyWhenFormTopAboveViewport: true,
      behavior: "smooth",
      respectReducedMotion: true,
    };

    if (typeof configOption === "boolean") {
      this.mobileStepScrollResetConfig = {
        ...defaults,
        enabled: configOption,
      };
      return;
    }

    if (configOption && typeof configOption === "object") {
      const safeBreakpoint =
        Number.isFinite(configOption.breakpoint) && configOption.breakpoint > 0
          ? configOption.breakpoint
          : defaults.breakpoint;

      const safeBehavior =
        configOption.behavior === "auto" || configOption.behavior === "smooth"
          ? configOption.behavior
          : defaults.behavior;

      this.mobileStepScrollResetConfig = {
        enabled:
          typeof configOption.enabled === "boolean"
            ? configOption.enabled
            : defaults.enabled,
        breakpoint: safeBreakpoint,
        onlyWhenFormTopAboveViewport:
          typeof configOption.onlyWhenFormTopAboveViewport === "boolean"
            ? configOption.onlyWhenFormTopAboveViewport
            : defaults.onlyWhenFormTopAboveViewport,
        behavior: safeBehavior,
        respectReducedMotion:
          typeof configOption.respectReducedMotion === "boolean"
            ? configOption.respectReducedMotion
            : defaults.respectReducedMotion,
      };
      return;
    }

    this.mobileStepScrollResetConfig = defaults;
  },

  // Create cleanup controller for a form
  createFormCleanup(formContainer) {
    const cleanup = {
      abortController: new AbortController(),
      observers: [],
      globalListeners: [],

      // DOM query cache
      _cachedVisibleStep: null,
      _cacheValid: true,
      _lastVisibleStep: null,
      _hasTrackedVisibleStep: false,
      _suppressRendererAutoScrollUntil: 0,
      _clearSuppressTimer: null,

      // Method to get current visible step with caching
      getVisibleStep() {
        if (!this._cacheValid || !this._cachedVisibleStep) {
          this._cachedVisibleStep = Array.from(
            formContainer.querySelectorAll(".hsfc-Step"),
          ).find((step) => getComputedStyle(step).display !== "none");
          this._cacheValid = true;
        }
        return this._cachedVisibleStep;
      },

      // Method to invalidate cache when DOM changes
      invalidateCache() {
        this._cacheValid = false;
        this._cachedVisibleStep = null;
      },

      syncVisibleStepTracking() {
        const visibleStep = this.getVisibleStep();
        this._lastVisibleStep = visibleStep || null;
        this._hasTrackedVisibleStep = !!visibleStep;
      },

      // Method to cleanup everything for this form
      destroy() {
        // Abort all event listeners using AbortController
        this.abortController.abort();

        // Disconnect all observers
        this.observers.forEach((observer) => {
          if (observer && typeof observer.disconnect === "function") {
            observer.disconnect();
          }
        });

        // Remove global listeners
        this.globalListeners.forEach(({ element, event, listener }) => {
          element.removeEventListener(event, listener);
        });

        // Clear cache and arrays
        this.invalidateCache();
        this._lastVisibleStep = null;
        this._hasTrackedVisibleStep = false;
        this._suppressRendererAutoScrollUntil = 0;
        if (this._clearSuppressTimer) {
          clearTimeout(this._clearSuppressTimer);
          this._clearSuppressTimer = null;
        }
        HubSpotFormManager.rendererScrollSuppressedForms.delete(formContainer);
        this.observers.length = 0;
        this.globalListeners.length = 0;
      },
    };

    this.formCleanupMap.set(formContainer, cleanup);
    return cleanup;
  },

  // Get cleanup controller for a form
  getFormCleanup(formContainer) {
    return this.formCleanupMap.get(formContainer);
  },

  installRendererScrollPatch() {
    if (this._rendererScrollPatchInstalled || typeof Element === "undefined") {
      return;
    }

    this._originalScrollIntoView = Element.prototype.scrollIntoView;

    Element.prototype.scrollIntoView = function patchedRendererScrollIntoView(...args) {
      if (this?.classList?.contains("hsfc-Renderer")) {
        for (const formContainer of HubSpotFormManager.rendererScrollSuppressedForms) {
          if (!this.contains(formContainer)) {
            continue;
          }

          const cleanup = HubSpotFormManager.getFormCleanup(formContainer);
          if (!cleanup) {
            continue;
          }

          if (Date.now() <= cleanup._suppressRendererAutoScrollUntil) {
            return;
          }
        }
      }

      return HubSpotFormManager._originalScrollIntoView.apply(this, args);
    };

    this._rendererScrollPatchInstalled = true;
  },

  // Setup validation for all forms on page
  setupAllForms() {
    this.installRendererScrollPatch();

    const hubspotForms = document.querySelectorAll(".hsfc-Form");

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
    this.installRendererScrollPatch();

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

    // Setup native error message replacement
    this.setupNativeErrorMessageReplacement(formContainer, cleanup);

    // Set baseline visible step so first render does not trigger scroll reset.
    cleanup.syncVisibleStepTracking();
  },

  // Setup replacement of native HubSpot field error messages
  setupNativeErrorMessageReplacement(formContainer, cleanup) {
    // Function to replace error text in native HubSpot error elements
    const replaceNativeErrorText = (errorElement) => {
      if (errorElement.classList.contains('hsfc-CustomValidationError')) return;
      if (errorElement.classList.contains('hsfc-FileError')) return;

      const originalText = errorElement.textContent.trim();
      const newText = HubSpotFormValidator.resolveErrorText(originalText, errorElement);

      if (newText !== originalText) {
        errorElement.textContent = newText;
      }

      if (HubSpotFormValidator.isSubmissionOrNetworkError(originalText)) {
        const cleared = this.clearFilesOnSubmissionFailure(formContainer);
        if (cleared) {
          const currentStep = cleanup.getVisibleStep();
          if (currentStep) HubSpotFormValidator.showValidationError(currentStep, formContainer);
        }
      }
    };

    // Replace any existing error messages on setup
    const existingErrors = formContainer.querySelectorAll('.hsfc-ErrorAlert');
    existingErrors.forEach(replaceNativeErrorText);

    // Fade out HubSpot's native "Upload complete" status (.hsfc-InfoAlert inside .hsfc-FileField) after 2s.
    // Suppress it immediately if our validation has already rejected the file.
    const scheduleInfoAlertDismiss = (el) => {
      if (el._hsfcDismissed) return;
      el._hsfcDismissed = true;
      const fileField = el.closest('.hsfc-FileField');
      const hasFileError = () => !!(fileField && fileField.querySelector('.hsfc-FileError'));
      if (hasFileError()) { el.style.display = 'none'; return; }
      setTimeout(() => {
        if (hasFileError()) { el.style.display = 'none'; return; }
        el.style.transition = 'opacity 0.4s ease';
        el.style.opacity = '0';
        const hide = () => { el.style.display = 'none'; };
        el.addEventListener('transitionend', hide, { once: true });
        setTimeout(hide, 500);
      }, 2000);
    };
    const dismissUploadComplete = (root) => {
      if (root.classList && root.classList.contains('hsfc-InfoAlert') && root.closest('.hsfc-FileField')) {
        scheduleInfoAlertDismiss(root);
      }
      root.querySelectorAll && root.querySelectorAll('.hsfc-FileField .hsfc-InfoAlert').forEach(scheduleInfoAlertDismiss);
    };

    // Catch any already-present upload alerts
    formContainer.querySelectorAll('.hsfc-FileField .hsfc-InfoAlert').forEach(scheduleInfoAlertDismiss);

    // Set up observer to catch new error messages as they appear
    const errorObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check added nodes
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is an error element
            if (node.classList && node.classList.contains('hsfc-ErrorAlert')) {
              replaceNativeErrorText(node);
            }
            
            // Check for error elements within the added node
            const errorElements = node.querySelectorAll && node.querySelectorAll('.hsfc-ErrorAlert');
            if (errorElements) {
              errorElements.forEach(replaceNativeErrorText);
            }

            dismissUploadComplete(node);
          }
        });

        // Check modified nodes for text content changes
        if (mutation.type === 'childList' && mutation.target.classList && 
            mutation.target.classList.contains('hsfc-ErrorAlert')) {
          replaceNativeErrorText(mutation.target);
        }
      });
    });

    // Observe the form container for error message changes
    errorObserver.observe(formContainer, {
      childList: true,
      subtree: true,
    });

    // Track observer for cleanup
    cleanup.observers.push(errorObserver);
  },

  clearFilesOnSubmissionFailure(container) {
    const fileInputs = container.querySelectorAll('input[type="file"]');
    if (fileInputs.length === 0) return false;

    const allSteps = Array.from(container.querySelectorAll('.hsfc-Step'));
    const isMultiStep = allSteps.length > 1;

    let clearedAny = false;
    fileInputs.forEach(fileInput => {
      const hasFiles = fileInput.files && fileInput.files.length > 0;
      const acceptedEl = fileInput.parentElement?.querySelector('.hsfc-AcceptedFiles');
      const hasAcceptedDisplay = !!(acceptedEl && acceptedEl.textContent.trim().length > 0);
      if (!hasFiles && !hasAcceptedDisplay) return;
      clearedAny = true;

      let reuploadMessage;
      if (isMultiStep) {
        const parentStep = fileInput.closest('.hsfc-Step');
        const stepNumber = parentStep ? allSteps.indexOf(parentStep) + 1 : null;
        reuploadMessage = stepNumber
          ? (ErrorMessageConfig.getMessage('fileReuploadStep', { step: stepNumber }) ||
             `Please re-upload your file on step ${stepNumber} to resubmit the form.`)
          : (ErrorMessageConfig.getMessage('fileReupload') ||
             'Please re-upload your file to resubmit the form.');
      } else {
        reuploadMessage = ErrorMessageConfig.getMessage('fileReupload') ||
          'Please re-upload your file to resubmit the form.';
      }

      FileUploadValidator.clearFileInput(fileInput);
      FileUploadValidator.hideAcceptedFiles(fileInput);
      FileUploadValidator.showError(fileInput, [reuploadMessage], [{ type: 'fileReupload' }]);
    });

    return clearedAny;
  },

  // Initialize Next button state
  initializeButtonState(formContainer, cleanup = null) {
    // Use cached visible step if cleanup is available, otherwise fall back to direct query
    const visibleStep = cleanup
      ? cleanup.getVisibleStep()
      : Array.from(formContainer.querySelectorAll(".hsfc-Step")).find(
          (step) => getComputedStyle(step).display !== "none",
        );

    const navigationButtons = visibleStep
      ? [HubSpotFormValidator.findNavigationButton(visibleStep)].filter(Boolean)
      : Array.from(
          formContainer.querySelectorAll(NAVIGATION_BUTTON_SELECTOR),
        ).filter((button) => {
          const buttonText = button.textContent.trim().toLowerCase();
          return !buttonText.includes("previous") && !buttonText.includes("back");
        });

    // Keep navigation clickable so click-based validation/error summary can run.
    navigationButtons.forEach((button) => {
      button.disabled = false;
      button.removeAttribute("disabled");
      button.removeAttribute("aria-disabled");

      // Some form runtimes disable the ancestor fieldset instead of the button itself.
      const disabledFieldset = button.closest("fieldset[disabled]");
      if (disabledFieldset) {
        disabledFieldset.removeAttribute("disabled");
      }
    });
  },

  shouldApplyMobileStepScrollReset(formContainer) {
    const config = this.mobileStepScrollResetConfig;
    if (!config.enabled || typeof window === "undefined") {
      return false;
    }

    return this.isMobileStepScrollContext(formContainer);
  },

  isMobileStepScrollContext(formContainer) {
    const config = this.mobileStepScrollResetConfig;
    if (typeof window === "undefined") {
      return false;
    }

    const stepCount = formContainer.querySelectorAll(".hsfc-Step").length;
    if (stepCount < 2) {
      return false;
    }

    if (typeof window.matchMedia === "function") {
      return window.matchMedia(`(max-width: ${config.breakpoint}px)`).matches;
    }

    return window.innerWidth <= config.breakpoint;
  },

  capturePreNavigationScroll(formContainer, cleanup) {
    if (this.mobileStepScrollResetConfig.enabled) {
      return;
    }

    if (!this.isMobileStepScrollContext(formContainer)) {
      return;
    }

    cleanup._suppressRendererAutoScrollUntil = Date.now() + 1500;
    this.rendererScrollSuppressedForms.add(formContainer);

    if (cleanup._clearSuppressTimer) {
      clearTimeout(cleanup._clearSuppressTimer);
    }

    cleanup._clearSuppressTimer = setTimeout(() => {
      this.rendererScrollSuppressedForms.delete(formContainer);
      cleanup._suppressRendererAutoScrollUntil = 0;
      cleanup._clearSuppressTimer = null;
    }, 1700);
  },

  getMobileStepScrollBehavior() {
    const config = this.mobileStepScrollResetConfig;
    if (
      config.respectReducedMotion &&
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return "auto";
    }

    return config.behavior;
  },

  maybeResetScrollForStepChange(formContainer) {
    if (!this.shouldApplyMobileStepScrollReset(formContainer)) {
      return;
    }

    const formRect = formContainer.getBoundingClientRect();
    const { onlyWhenFormTopAboveViewport } = this.mobileStepScrollResetConfig;
    if (onlyWhenFormTopAboveViewport && formRect.top >= 0) {
      return;
    }

    formContainer.scrollIntoView({
      behavior: this.getMobileStepScrollBehavior(),
      block: "start",
      inline: "nearest",
    });
  },

  handleVisibleStepChange(formContainer, cleanup) {
    const currentVisibleStep = cleanup.getVisibleStep();

    if (!cleanup._hasTrackedVisibleStep) {
      cleanup._lastVisibleStep = currentVisibleStep || null;
      cleanup._hasTrackedVisibleStep = !!currentVisibleStep;
      return;
    }

    const previousVisibleStep = cleanup._lastVisibleStep;
    const didStepChange =
      !!previousVisibleStep &&
      !!currentVisibleStep &&
      previousVisibleStep !== currentVisibleStep;

    cleanup._lastVisibleStep = currentVisibleStep || null;
    cleanup._hasTrackedVisibleStep = !!currentVisibleStep;

    if (didStepChange) {
      if (this.mobileStepScrollResetConfig.enabled) {
        this.maybeResetScrollForStepChange(formContainer);
      }
    }
  },

  // Add all event listeners
  addEventListeners(formContainer, validator, cleanup) {
    // Navigation button handlers
    const navigationButtons = formContainer.querySelectorAll(NAVIGATION_BUTTON_SELECTOR);

    navigationButtons.forEach((button, index) => {
      const buttonText = button.textContent.trim().toLowerCase();

      if (!button.hasAttribute("data-hsfc-nav-scroll-capture-bound")) {
        button.addEventListener(
          "click",
          () => this.capturePreNavigationScroll(formContainer, cleanup),
          {
            signal: cleanup.abortController.signal,
          },
        );

        button.setAttribute("data-hsfc-nav-scroll-capture-bound", "true");
      }

      // Attach listener to any button that is NOT a previous button
      if (!buttonText.includes("previous") && !buttonText.includes("back")) {
        if (button.hasAttribute("data-hsfc-next-handler-bound")) {
          return;
        }

        button.addEventListener(
          "click",
          (event) => this.handleNextButtonClick(event, formContainer, cleanup),
          {
            signal: cleanup.abortController.signal,
          },
        );

        button.setAttribute("data-hsfc-next-handler-bound", "true");
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

    const formFields = visibleStep.querySelectorAll("input, select, textarea");
    const events = ["input", "change", "blur"];

    formFields.forEach((field) => {
      // Add character limit enforcement for text input fields (not textareas)
      if (
        field.type === "text" ||
        field.type === "email" ||
        (field.tagName.toLowerCase() === "input" && !field.type)
      ) {
        this.setupTextInputCharacterLimit(field, cleanup);
      }

      events.forEach((eventType) => {
        // Remove any existing listeners (cleanup from previous setup)
        field.removeEventListener(eventType, validator.validateVisibleStep);

        // Add combined handler that removes custom errors and runs validation
        field.addEventListener(
          eventType,
          () => {
            // Remove custom validation error when user starts interacting
            HubSpotFormValidator.removeValidationError(visibleStep);
            // Run the validation (but don't disable buttons anymore)
            validator.validateVisibleStep();
          },
          {
            signal: cleanup.abortController.signal,
          },
        );
      });
    });
  },

  // Setup character limit enforcement for text input fields
  setupTextInputCharacterLimit(field, cleanup) {
    // Skip if already set up
    if (field.hasAttribute("data-character-limit-enforced")) {
      return;
    }

    // Mark as set up
    field.setAttribute("data-character-limit-enforced", "true");

    // Default character limit for text inputs (HubSpot commonly uses 100)
    const characterLimit = 100;

    // Set the native maxlength attribute - this prevents typing/pasting beyond the limit
    field.setAttribute("maxlength", characterLimit);

    // Handle initial value if it already exceeds the limit
    if (field.value.length > characterLimit) {
      field.value = field.value.substring(0, characterLimit);
    }

    // Also add a safeguard input listener as backup
    field.addEventListener(
      "input",
      (event) => {
        if (field.value.length > characterLimit) {
          field.value = field.value.substring(0, characterLimit);
        }
      },
      {
        signal: cleanup.abortController.signal,
      },
    );
  },

  // Handle navigation button clicks
  handleNextButtonClick(event, formContainer, cleanup) {
    const currentStep = event.target.closest(".hsfc-Step");

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

      // Only clear uploaded files on a failed final submission, not on failed Next-step navigation
      if (event.target.type === 'submit') {
        this.clearFilesOnSubmissionFailure(formContainer);
      }

      // Show custom error message
      HubSpotFormValidator.showValidationError(stepToValidate, formContainer);

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
    const requiredFields = step.querySelectorAll(
      HubSpotFormValidator.REQUIRED_FIELD_SELECTOR,
    );

    // Helper function to check if a field needs validation - use centralized validation
    const needsValidation = (field) =>
      FieldValidator.needsValidation(field, step);

    // For radio buttons and checkbox groups, avoid triggering validation multiple times for the same group
    const processedFieldGroups = new Set();

    requiredFields.forEach((field) => {
      // Skip duplicate group processing for radio buttons and checkbox groups with same name
      if (field.type === "radio" || field.type === "checkbox") {
        if (processedFieldGroups.has(field.name)) {
          return; // Skip - already processed this field group
        }
        processedFieldGroups.add(field.name);
      }

      if (needsValidation(field)) {
        // Special handling for HubSpot date fields - don't clear value to preserve date picker
        if (field.classList?.contains('hsfc-DateInput')) {
          // For date fields, just trigger validation events without clearing the value
          field.focus();
          field.dispatchEvent(new Event("input", { bubbles: true }));
          field.dispatchEvent(new Event("change", { bubbles: true }));
          field.dispatchEvent(new Event("invalid", { bubbles: true }));
          field.blur();
        } else if (field.type === "tel") {
          // Tel fields need special handling to trigger HubSpot's validation
          field.focus();
          field.dispatchEvent(new Event("input", { bubbles: true }));
          field.dispatchEvent(new Event("change", { bubbles: true }));
          field.blur();

          // Try additional validation events that HubSpot might listen for
          field.dispatchEvent(new Event("invalid", { bubbles: true }));
          field.dispatchEvent(new Event("keyup", { bubbles: true }));

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
          field.dispatchEvent(new Event("change", { bubbles: true }));
          field.dispatchEvent(new Event("input", { bubbles: true }));

          // For checkboxes and radios, also try click events which might trigger validation
          if (field.type === "checkbox" || field.type === "radio") {
            field.dispatchEvent(new Event("invalid", { bubbles: true }));
          }
        }
      }
    });

    // Also check fields that may have other validation rules (like email format)
    const allFields = step.querySelectorAll("input, select, textarea");
    allFields.forEach((field) => {
      // Skip if this field was already processed as a required field
      const isRequired =
        field.hasAttribute("required") ||
        field.getAttribute("aria-required") === "true";
      if (isRequired) return;

      // For tel fields, always trigger validation to ensure HubSpot shows format errors
      if (field.type === "tel") {
        field.focus();
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
        field.blur();
        field.dispatchEvent(new Event("invalid", { bubbles: true }));
        field.dispatchEvent(new Event("keyup", { bubbles: true }));
      }

      // For email fields, trigger validation even if they have content
      if (
        field.type === "email" ||
        field.name?.toLowerCase().includes("email")
      ) {
        field.focus();
        field.blur();
        field.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // For other field types with pattern validation
      if (field.hasAttribute("pattern") && field.value) {
        field.focus();
        field.blur();
        field.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  },

  // Setup form-specific observer
  setupFormObserver(formContainer, validator, cleanup) {
    const observer = new MutationObserver((mutations) => {
      let shouldRevalidate = false;
      let shouldAddListeners = false;
      let shouldRefreshNavigation = false;
      let shouldHandleStepChange = false;

      for (const mutation of mutations) {
        if (!formContainer.contains(mutation.target)) continue;

        // Error element changes
        if (
          mutation.target.classList?.contains("hsfc-ErrorAlert") ||
          (mutation.type === "childList" &&
            [...mutation.addedNodes, ...mutation.removedNodes].some(
              (node) =>
                node.nodeType === Node.ELEMENT_NODE &&
                (node.classList?.contains("hsfc-ErrorAlert") ||
                  node.querySelector?.(".hsfc-ErrorAlert")),
            ))
        ) {
          shouldRevalidate = true;
        }

        // Step visibility changes
        if (
          mutation.target.classList?.contains("hsfc-Step") &&
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          shouldRevalidate = true;
          shouldAddListeners = true;
          shouldHandleStepChange = true;
        }

        // If HubSpot toggles button disabled state, immediately restore click path.
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "disabled" ||
            mutation.attributeName === "aria-disabled") &&
          mutation.target.matches?.(NAVIGATION_BUTTON_SELECTOR)
        ) {
          this.initializeButtonState(formContainer, cleanup);
        }

        // New form fields
        if (
          mutation.type === "childList" &&
          [...mutation.addedNodes].some(
            (node) =>
              node.nodeType === Node.ELEMENT_NODE &&
              node.querySelector?.("input, select, textarea"),
          )
        ) {
          shouldAddListeners = true;
        }

        // Navigation buttons may be injected after initial setup.
        if (
          mutation.type === "childList" &&
          [...mutation.addedNodes].some(
            (node) =>
              node.nodeType === Node.ELEMENT_NODE &&
              (node.matches?.(NAVIGATION_BUTTON_SELECTOR) ||
                node.querySelector?.(NAVIGATION_BUTTON_SELECTOR)),
          )
        ) {
          shouldRefreshNavigation = true;
        }
      }

      if (shouldAddListeners) {
        setTimeout(
          () => this.addFieldListeners(formContainer, validator, cleanup),
          100,
        );
      }
      if (shouldHandleStepChange) {
        setTimeout(() => {
          cleanup.invalidateCache();
          this.handleVisibleStepChange(formContainer, cleanup);
          this.initializeButtonState(formContainer, cleanup);
        }, 50);
      }
      if (shouldRefreshNavigation) {
        setTimeout(() => {
          this.initializeButtonState(formContainer, cleanup);
          this.addEventListeners(formContainer, validator, cleanup);
        }, 50);
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
      attributeFilter: ["style", "class", "disabled", "aria-disabled"],
    });
  },

  // Setup global observer for dynamically loaded forms
  setupGlobalObserver() {
    if (window.hubspotFormGlobalObserver) return;

    const globalObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "childList") continue;

        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;

          if (addedNode.classList?.contains("hsfc-Form")) {
            removeHubSpotFormStyles();
            this.setupSingleForm(addedNode);
          }

          const newForms = addedNode.querySelectorAll?.(".hsfc-Form");
          if (newForms?.length > 0) {
            removeHubSpotFormStyles();
            newForms.forEach((form) => this.setupSingleForm(form));
          }
        }
      }
    });

    globalObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Store global observer reference for potential cleanup
    window.hubspotFormGlobalObserver = globalObserver;
  },

  // Progress bar repositioning functionality
  setupProgressBarRepositioning(formContainer, cleanup) {
    // Apply to any form with a progress bar
    const allForms = document.querySelectorAll(".hsfc-Form");
    const formIndex = Array.from(allForms).indexOf(formContainer) + 1;

    // Setup observer to watch for progress bar elements
    const progressBarObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "childList") continue;

        // Check for progress bar additions
        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;

          // Direct progress bar match
          if (addedNode.classList?.contains("hsfc-ProgressBar")) {
            this.repositionProgressBar(addedNode, formContainer);
          }

          // Check for progress bars within added nodes
          const progressBars =
            addedNode.querySelectorAll?.(".hsfc-ProgressBar");
          if (progressBars?.length > 0) {
            progressBars.forEach((progressBar) =>
              this.repositionProgressBar(progressBar, formContainer),
            );
          }
        }
      }
    });

    // Track observer for cleanup
    cleanup.observers.push(progressBarObserver);

    // Start observing for progress bar changes
    progressBarObserver.observe(formContainer, {
      childList: true,
      subtree: true,
    });

    // Check for existing progress bars immediately
    setTimeout(() => {
      const existingProgressBars =
        formContainer.querySelectorAll(".hsfc-ProgressBar");
      existingProgressBars.forEach((progressBar) =>
        this.repositionProgressBar(progressBar, formContainer),
      );
    }, 100);

    // Also check after a longer delay for late-loading progress bars
    setTimeout(() => {
      const lateProgressBars = formContainer.querySelectorAll(
        ".hsfc-ProgressBar:not([data-repositioned])",
      );
      if (lateProgressBars.length > 0) {
        lateProgressBars.forEach((progressBar) =>
          this.repositionProgressBar(progressBar, formContainer),
        );
      }
    }, 1000);
  },

  // Reposition a single progress bar from bottom to top
  repositionProgressBar(progressBar, formContainer) {
    // Avoid repositioning the same progress bar multiple times
    if (progressBar.hasAttribute("data-repositioned")) {
      return;
    }

    // Find the current step that contains this progress bar
    const currentStep = progressBar.closest(".hsfc-Step");
    if (!currentStep) {
      return;
    }

    // Mark as repositioned to prevent duplicate operations
    progressBar.setAttribute("data-repositioned", "true");

    // Remove the progress bar from its current location
    progressBar.remove();

    // Find the step content area
    const stepContent =
      currentStep.querySelector(".hsfc-Step__Content") || currentStep;

    // Ensure the step content uses flexbox for proper ordering
    const stepContentStyle = getComputedStyle(stepContent);
    if (
      stepContentStyle.display !== "flex" &&
      stepContentStyle.display !== "inline-flex"
    ) {
      stepContent.style.display = "flex";
      stepContent.style.flexDirection = "column";
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
    progressBar.classList.add("hsfc-ProgressBar--repositioned");

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
    const hasValidationError = currentStep.querySelector(
      ".hsfc-CustomValidationError",
    );
    const hasProgressBar = currentStep.querySelector(
      ".hsfc-ProgressBar--repositioned",
    );

    if (hasValidationError || hasProgressBar) {
      currentStep.classList.add("hsfc-step-with-validation-and-progress");
      stepContent.classList.add("hsfc-content-with-validation-and-progress");
    }
  },

  // Remove fallback classes when no longer needed
  removeFlexboxFallbackClasses(currentStep, stepContent) {
    // Check if there are still validation errors or progress bars
    const hasValidationError = currentStep.querySelector(
      ".hsfc-CustomValidationError",
    );
    const hasProgressBar = currentStep.querySelector(
      ".hsfc-ProgressBar--repositioned",
    );

    if (!hasValidationError && !hasProgressBar) {
      currentStep.classList.remove("hsfc-step-with-validation-and-progress");
      stepContent.classList.remove("hsfc-content-with-validation-and-progress");
    }
  },

  // Helper function to find the first actual form field (not headings/paragraphs)
  findFirstFormField(stepContent) {
    // Look for containers that contain actual form inputs
    const potentialFields = stepContent.querySelectorAll(
      ".hsfc-Row, .hsfc-FormField, .hs-form-field",
    );

    for (const fieldContainer of potentialFields) {
      // Check if this container has actual form inputs
      const hasFormInputs = fieldContainer.querySelector(
        "input, select, textarea",
      );
      if (hasFormInputs) {
        // Add fallback class for browsers that don't support :has()
        if (fieldContainer.classList.contains("hsfc-Row")) {
          fieldContainer.classList.add("hsfc-row-with-form-inputs");
        }
        return fieldContainer;
      }
    }

    // If no containers with inputs found, look for direct input elements
    const directInput = stepContent.querySelector("input, select, textarea");
    if (directInput) {
      // Find the closest container that wraps this input
      const inputContainer = directInput.closest(
        ".hsfc-Row, .hsfc-FormField, .hs-form-field",
      );
      if (inputContainer && inputContainer.classList.contains("hsfc-Row")) {
        inputContainer.classList.add("hsfc-row-with-form-inputs");
      }
      return inputContainer || directInput;
    }

    return null;
  },

  setupDropdownAccessibility(formContainer, cleanup) {
    const dropdownButtons = formContainer.querySelectorAll(
      '.hsfc-DropdownInput input[type="text"][role="button"]',
    );

    dropdownButtons.forEach((button, index) => {
      const isPhoneDropdown = this.isPhoneRelatedDropdown(button);

      if (isPhoneDropdown) {
        return; // Skip phone dropdowns - will be handled separately
      }

      // Helper function to focus search input (used by both keyboard and click)
      const focusSearchInput = () => {
        setTimeout(() => {
          const dropdownContainer =
            button.closest(".hsfc-DropdownField") ||
            button.closest(".hsfc-Row");
          if (dropdownContainer) {
            const dropdownOptions = dropdownContainer.querySelector(
              ".hsfc-DropdownOptions",
            );
            if (dropdownOptions) {
              const isVisible =
                dropdownOptions.offsetHeight > 0 &&
                getComputedStyle(dropdownOptions).display !== "none" &&
                getComputedStyle(dropdownOptions).visibility !== "hidden";

              if (isVisible) {
                const searchInput = dropdownOptions.querySelector(
                  '.hsfc-DropdownOptions__Search input[type="text"]',
                );
                if (searchInput) {
                  const currentValue = button.value || "";
                  if (currentValue && currentValue.trim() !== "") {
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
      button.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            // Trigger dropdown opening
            button.click();

            // Focus search field and preserve current value
            focusSearchInput();
          }
        },
        {
          signal: cleanup.abortController.signal,
        },
      );

      // Click handler for consistent behavior
      button.addEventListener(
        "click",
        () => {
          // Focus search input after click (same as keyboard behavior)
          focusSearchInput();
        },
        {
          signal: cleanup.abortController.signal,
        },
      );
    });

    // --- Caret click-to-focus logic (delegated, robust) ---
    formContainer.addEventListener(
      "click",
      function (e) {
        let caret = null;
        if (
          e.target.classList &&
          e.target.classList.contains("hsfc-DropdownInput__Caret")
        ) {
          caret = e.target;
        } else if (
          e.target.parentElement &&
          e.target.parentElement.classList &&
          e.target.parentElement.classList.contains("hsfc-DropdownInput__Caret")
        ) {
          caret = e.target.parentElement;
        }
        if (caret && formContainer.contains(caret)) {
          const dropdownInput = caret.closest(".hsfc-DropdownInput");
          if (dropdownInput) {
            setTimeout(() => {
              const dropdownOptions = dropdownInput.parentElement.querySelector(
                ".hsfc-DropdownOptions",
              );
              if (
                dropdownOptions &&
                dropdownOptions.offsetHeight > 0 &&
                getComputedStyle(dropdownOptions).display !== "none" &&
                getComputedStyle(dropdownOptions).visibility !== "hidden"
              ) {
                const searchInput = dropdownOptions.querySelector(
                  '.hsfc-DropdownOptions__Search input[type="text"]',
                );
                if (searchInput) {
                  searchInput.focus();
                }
              }
            }, 120);
          }
        }
        // --- Phone caret click-to-focus logic ---
        let phoneCaret = null;
        if (
          e.target.classList &&
          e.target.classList.contains("hsfc-PhoneInput__FlagAndCaret")
        ) {
          phoneCaret = e.target;
        } else if (
          e.target.parentElement &&
          e.target.parentElement.classList &&
          e.target.parentElement.classList.contains(
            "hsfc-PhoneInput__FlagAndCaret",
          )
        ) {
          phoneCaret = e.target.parentElement;
        }
        if (phoneCaret && formContainer.contains(phoneCaret)) {
          const phoneField = phoneCaret.closest(
            '.hsfc-PhoneField, [data-hsfc-id="PhoneField"]',
          );
          if (phoneField) {
            setTimeout(() => {
              const dropdownOptions = phoneField.querySelector(
                ".hsfc-DropdownOptions",
              );
              if (
                dropdownOptions &&
                dropdownOptions.offsetHeight > 0 &&
                getComputedStyle(dropdownOptions).display !== "none" &&
                getComputedStyle(dropdownOptions).visibility !== "hidden"
              ) {
                const searchInput = dropdownOptions.querySelector(
                  '.hsfc-DropdownOptions__Search input[type="text"]',
                );
                if (searchInput) {
                  searchInput.focus();
                }
              }
            }, 120);
          }
        }
      },
      { signal: cleanup.abortController.signal },
    );
  },

  // Helper method to detect if a dropdown is phone-related
  isPhoneRelatedDropdown(dropdownElement) {
    // HubSpot phone fields use .hsfc-PhoneInput__FlagAndCaret, not the standard dropdown button
    // So we should rarely detect standard dropdown buttons as phone-related

    // First, check if there's a phone input in the same container
    const container = dropdownElement.closest(
      ".hs-form-field, .hsfc-FormField, .hsfc-PhoneField",
    );
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
      const className = currentElement.className?.toLowerCase() || "";

      // Check for HubSpot's specific phone field classes
      if (
        className.includes("hsfc-phonefield") ||
        className.includes("hsfc-phoneinput")
      ) {
        return true;
      }

      // Check data attributes for HubSpot phone field indicators
      const dataId = currentElement.getAttribute("data-hsfc-id");
      if (
        dataId &&
        (dataId.toLowerCase().includes("phone") ||
          dataId === "PhoneField" ||
          dataId === "PhoneInput")
      ) {
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
    const phoneFields = formContainer.querySelectorAll(
      '.hsfc-PhoneField, [data-hsfc-id="PhoneField"]',
    );

    phoneFields.forEach((phoneField, index) => {
      // Find the flag and caret element (the clickable country selector)
      const flagAndCaret = phoneField.querySelector(
        ".hsfc-PhoneInput__FlagAndCaret",
      );
      if (!flagAndCaret) {
        return;
      }

      // Find the dropdown options container
      const dropdownOptions = phoneField.querySelector(".hsfc-DropdownOptions");
      if (!dropdownOptions) {
        return;
      }

      // Find the search input within the dropdown
      const searchInput = dropdownOptions.querySelector(
        'input[role="searchbox"], .hsfc-DropdownOptions__Search input',
      );

      // Find the options list
      const optionsList = dropdownOptions.querySelector('ul[role="listbox"]');

      // Find the phone input field
      const phoneInput = phoneField.querySelector('input[type="tel"]');

      // Add keyboard accessibility to the flag and caret
      this.addPhoneDropdownKeyboardSupport(
        flagAndCaret,
        dropdownOptions,
        searchInput,
        optionsList,
        phoneField,
        cleanup,
      );

      // Add country code overwriting functionality
      if (phoneInput) {
        this.addPhoneInputOverwriteSupport(
          phoneInput,
          flagAndCaret,
          phoneField,
          cleanup,
        );
      }
    });
  },

  // Add keyboard support to phone dropdown
  addPhoneDropdownKeyboardSupport(
    flagAndCaret,
    dropdownOptions,
    searchInput,
    optionsList,
    phoneField,
    cleanup,
  ) {
    // Ensure the flag and caret has proper ARIA attributes
    flagAndCaret.setAttribute("role", "button");
    flagAndCaret.setAttribute("aria-expanded", "false");
    flagAndCaret.setAttribute("aria-haspopup", "listbox");
    flagAndCaret.setAttribute("aria-label", "Select country code");

    // Add keyboard event listener to flag/caret
    flagAndCaret.addEventListener(
      "keydown",
      (event) => {
        switch (event.key) {
          case "Enter":
            event.preventDefault();
            event.stopPropagation();
            this.togglePhoneDropdown(
              flagAndCaret,
              dropdownOptions,
              searchInput,
            );
            break;
          case " ":
            event.preventDefault();
            event.stopPropagation();
            this.togglePhoneDropdown(
              flagAndCaret,
              dropdownOptions,
              searchInput,
            );
            break;
          case "Escape":
            event.preventDefault();
            event.stopPropagation();
            this.closePhoneDropdown(flagAndCaret, dropdownOptions);
            break;
          case "ArrowDown":
            event.preventDefault();
            if (this.isPhoneDropdownOpen(dropdownOptions)) {
              this.focusFirstPhoneOption(optionsList);
            } else {
              this.openPhoneDropdown(
                flagAndCaret,
                dropdownOptions,
                searchInput,
              );
            }
            break;
          case "ArrowUp":
            event.preventDefault();
            if (this.isPhoneDropdownOpen(dropdownOptions)) {
              this.focusLastPhoneOption(optionsList);
            } else {
              this.openPhoneDropdown(
                flagAndCaret,
                dropdownOptions,
                searchInput,
              );
            }
            break;
        }
      },
      {
        signal: cleanup.abortController.signal,
      },
    );

    // Add keyboard event listener to search input for Escape handling
    if (searchInput) {
      searchInput.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            this.closePhoneDropdown(flagAndCaret, dropdownOptions);
          }
        },
        {
          signal: cleanup.abortController.signal,
        },
      );
    }

    // Add keyboard event listener to dropdown container for Escape handling
    dropdownOptions.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          this.closePhoneDropdown(flagAndCaret, dropdownOptions);
        }
      },
      {
        signal: cleanup.abortController.signal,
      },
    );

    // Add support for option navigation when dropdown is open
    if (optionsList) {
      this.addPhoneOptionNavigation(
        optionsList,
        flagAndCaret,
        dropdownOptions,
        cleanup,
      );
    }

    // Handle clicks on flag/caret to auto-focus search input
    flagAndCaret.addEventListener(
      "click",
      () => {
        // Wait for HubSpot to open the dropdown, then focus search
        setTimeout(() => {
          if (searchInput && this.isPhoneDropdownOpen(dropdownOptions)) {
            // Pre-populate search input with current country selection
            this.populatePhoneSearchWithCurrentCountry(searchInput, phoneField);

            searchInput.focus();
          }
        }, 100);
      },
      {
        signal: cleanup.abortController.signal,
      },
    );

    // Close dropdown when clicking outside - track as global listener
    const outsideClickHandler = (event) => {
      if (!phoneField.contains(event.target)) {
        this.closePhoneDropdown(flagAndCaret, dropdownOptions);
      }
    };
    document.addEventListener("click", outsideClickHandler);
    cleanup.globalListeners.push({
      element: document,
      event: "click",
      listener: outsideClickHandler,
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
        flagAndCaret.dispatchEvent(
          new MouseEvent("mousedown", { bubbles: true }),
        );
        flagAndCaret.dispatchEvent(
          new MouseEvent("mouseup", { bubbles: true }),
        );
        flagAndCaret.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }

      // Update ARIA state and focus search input
      setTimeout(() => {
        if (this.isPhoneDropdownOpen(dropdownOptions)) {
          flagAndCaret.setAttribute("aria-expanded", "true");

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
        dropdownOptions.style.display = "none";
      }

      // Update ARIA state
      flagAndCaret.setAttribute("aria-expanded", "false");

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
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      dropdownOptions.offsetHeight > 0
    );
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
  addPhoneOptionNavigation(
    optionsList,
    flagAndCaret,
    dropdownOptions,
    cleanup,
  ) {
    optionsList.addEventListener(
      "keydown",
      (event) => {
        const focusedOption = document.activeElement;
        const options = Array.from(
          optionsList.querySelectorAll('li[role="option"]'),
        );
        const currentIndex = options.indexOf(focusedOption);

        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            const nextIndex =
              currentIndex < options.length - 1 ? currentIndex + 1 : 0;
            options[nextIndex].focus();
            break;
          case "ArrowUp":
            event.preventDefault();
            const prevIndex =
              currentIndex > 0 ? currentIndex - 1 : options.length - 1;
            options[prevIndex].focus();
            break;
          case "Enter":
          case " ":
            event.preventDefault();
            if (focusedOption) {
              focusedOption.click();
              // Mark that user selected country via keyboard
              focusedOption.dispatchEvent(
                new CustomEvent("countrySelected", { bubbles: true }),
              );
              this.closePhoneDropdown(flagAndCaret, dropdownOptions);
            }
            break;
          case "Escape":
            event.preventDefault();
            this.closePhoneDropdown(flagAndCaret, dropdownOptions);
            break;
        }
      },
      {
        signal: cleanup.abortController.signal,
      },
    );
  },

  // Add country code overwriting support to phone input
  addPhoneInputOverwriteSupport(phoneInput, flagAndCaret, phoneField, cleanup) {
    // Track the state of user interaction
    let initialValue = phoneInput.value || "";
    // If there's already a country code present (like default +1), treat it as selected
    let userSelectedCountry =
      initialValue &&
      initialValue.trim() &&
      /^\+\d{1,4}$/.test(initialValue.trim());
    let lastKnownValue = initialValue;

    // E.164 max (15 digits) + country code + typical formatting chars (spaces, parens, dashes) ≤ 25
    phoneInput.setAttribute('maxlength', 25);

    // Mark when user selects a country via dropdown
    const markCountrySelected = () => {
      userSelectedCountry = true;
      lastKnownValue = phoneInput.value || "";
    };

    // Listen for country selection via dropdown (clicks and keyboard)
    const optionsList = phoneField.querySelector('ul[role="listbox"]');
    if (optionsList) {
      optionsList.addEventListener("click", markCountrySelected, {
        signal: cleanup.abortController.signal,
      });
      optionsList.addEventListener("countrySelected", markCountrySelected, {
        signal: cleanup.abortController.signal,
      });
    }

    // Listen for input changes
    phoneInput.addEventListener(
      "input",
      (event) => {
        const currentValue = phoneInput.value || "";
        const previousValue = lastKnownValue;

        // Check if this should trigger overwrite logic
        if (
          this.shouldOverwriteCountryCode(
            currentValue,
            previousValue,
            userSelectedCountry,
            initialValue,
          )
        ) {
          this.handleCountryCodeOverwrite(
            phoneInput,
            currentValue,
            previousValue,
          );
        }

        // Update tracking
        lastKnownValue = currentValue;
      },
      {
        signal: cleanup.abortController.signal,
      },
    );

    // Listen for keydown to detect when user might be starting fresh
    phoneInput.addEventListener(
      "keydown",
      (event) => {
        // If user is doing Ctrl+A, Cmd+A, or similar selection operations
        if ((event.ctrlKey || event.metaKey) && event.key === "a") {
          // Don't reset userSelectedCountry yet, wait for actual input
        }

        // If user backspaces/deletes to clear the field significantly
        if (event.key === "Backspace" || event.key === "Delete") {
          const currentValue = phoneInput.value || "";
          // If they're clearing back to just country code or empty, allow overwrite
          if (currentValue.length <= 3) {
            userSelectedCountry = false;
          }
        }
      },
      {
        signal: cleanup.abortController.signal,
      },
    );

    // Handle focus behavior - prevent text selection when user selected country
    phoneInput.addEventListener(
      "focus",
      () => {
        const currentValue = phoneInput.value || "";

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
      },
      {
        signal: cleanup.abortController.signal,
      },
    );

    // Prevent text selection when user has selected a country
    phoneInput.addEventListener(
      "select",
      (event) => {
        if (userSelectedCountry) {
          event.preventDefault();

          // Move cursor to end
          setTimeout(() => {
            const length = phoneInput.value.length;
            phoneInput.setSelectionRange(length, length);
          }, 1);
        }
      },
      {
        signal: cleanup.abortController.signal,
      },
    );

    // Also handle mouseup in case HubSpot selects text on mouse events
    phoneInput.addEventListener(
      "mouseup",
      () => {
        if (userSelectedCountry) {
          setTimeout(() => {
            if (phoneInput.selectionStart !== phoneInput.selectionEnd) {
              const length = phoneInput.value.length;
              phoneInput.setSelectionRange(length, length);
            }
          }, 10);
        }
      },
      {
        signal: cleanup.abortController.signal,
      },
    );
  },

  // Determine if country code should be overwritten
  shouldOverwriteCountryCode(
    currentValue,
    previousValue,
    userSelectedCountry,
    initialValue,
  ) {
    // Never overwrite if user explicitly selected a country
    if (userSelectedCountry) {
      return false;
    }

    // Check if user is typing a country code pattern
    const isTypingCountryCode = this.isCountryCodePattern(
      currentValue,
      previousValue,
    );
    if (!isTypingCountryCode) {
      return false;
    }

    // Check if we're in a state where overwrite makes sense
    const isDefaultState =
      previousValue === initialValue || previousValue.length <= 3;
    const isStartingFresh = previousValue === "" || previousValue === "+";

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
    if (
      /^\d{1,4}$/.test(currentValue) &&
      (!previousValue || previousValue === "+")
    ) {
      return true;
    }

    // User started typing + and digits
    if (
      currentValue.startsWith("+") &&
      /^\+\d{1,4}/.test(currentValue) &&
      currentValue !== previousValue
    ) {
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
        phoneInput.dispatchEvent(new Event("input", { bubbles: true }));
        phoneInput.dispatchEvent(new Event("change", { bubbles: true }));
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

    if (!intendedValue.startsWith("+")) {
      intendedValue = "+" + intendedValue;
    }

    // If the actual value contains the intended country code but has extra parts
    if (
      actualValue !== intendedValue &&
      actualValue.includes(intendedValue.substring(1))
    ) {
      return true;
    }

    return false;
  },

  // Correct the country code value
  correctCountryCode(actualValue, intendedValue) {
    if (!intendedValue.startsWith("+")) {
      intendedValue = "+" + intendedValue;
    }

    // Return the intended country code
    return intendedValue;
  },

  // Populate search input with current country selection (like regular dropdowns)
  populatePhoneSearchWithCurrentCountry(searchInput, phoneField) {
    // Get the current country from the flag element
    const flagElement = phoneField.querySelector(
      ".hsfc-PhoneInput__FlagAndCaret__Flag",
    );
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
  },
};

// Legacy compatibility functions
const setupAllFormsValidation = () => HubSpotFormManager.setupAllForms();
const setupSingleFormValidation = (formContainer) =>
  HubSpotFormManager.setupSingleForm(formContainer);

// Legacy function for backward compatibility
const setupFieldValidation = setupAllFormsValidation;

// NOTE: Auto-init has been moved to entry points (index.js and index-cdn.js)
// This allows different initialization strategies for different environments:
// - index.js: For bundlers/npm, uses hydration-safe delayed init
// - index-cdn.js: For CDN/script tags, uses its own delayed init
// Users who import hubspot-forms.js directly should call HubSpotFormManager.setupAllForms()

// Export main API functions
export { HubSpotFormManager, HubSpotFormValidator, CharacterLimitValidator, ErrorMessageConfig };

// Export legacy compatibility functions
export {
  setupAllFormsValidation,
  setupSingleFormValidation,
  setupFieldValidation,
};

// Export utility functions
export { removeHubSpotFormStyles };

// Export additional validators for module compatibility
export { FieldValidator, FileUploadValidator };
