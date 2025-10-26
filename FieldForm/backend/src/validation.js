// backend/src/validation.js

/**
 * Validate submitted form data against a schema
 * Returns array of error messages (empty if valid)
 */
function validateAgainstSchema(data, schema) {
  const errors = [];

  if (!schema || !schema.fields) {
    return ['Invalid schema'];
  }

  schema.fields.forEach(field => {
    const value = data[field.name];
    const fieldLabel = field.label || field.name;

    // Check required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`${fieldLabel} is required`);
      return;
    }

    // Skip validation if field is optional and empty
    if (!field.required && (value === undefined || value === null || value === '')) {
      return;
    }

    // Type-specific validation
    switch (field.type) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) {
          errors.push(`${fieldLabel} must be a valid number`);
        } else {
          if (field.min !== undefined && num < field.min) {
            errors.push(`${fieldLabel} must be at least ${field.min}`);
          }
          if (field.max !== undefined && num > field.max) {
            errors.push(`${fieldLabel} must be at most ${field.max}`);
          }
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${fieldLabel} must be a valid email address`);
        }
        break;

      case 'select':
        if (field.options && !field.options.includes(value)) {
          errors.push(`${fieldLabel} must be one of: ${field.options.join(', ')}`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          errors.push(`${fieldLabel} must be true or false`);
        }
        break;

      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(`${fieldLabel} must be a valid date`);
        }
        break;

      case 'string':
      case 'textarea':
        if (typeof value !== 'string') {
          errors.push(`${fieldLabel} must be text`);
        } else if (field.minLength && value.length < field.minLength) {
          errors.push(`${fieldLabel} must be at least ${field.minLength} characters`);
        } else if (field.maxLength && value.length > field.maxLength) {
          errors.push(`${fieldLabel} must be at most ${field.maxLength} characters`);
        }
        break;
    }
  });

  return errors;
}

/**
 * Check if any notification conditions are met
 * Returns array of notification objects
 */
function checkNotifications(schema, data) {
  const notifications = [];

  schema.fields.forEach(field => {
    if (field.notifyIf && data[field.name] !== undefined) {
      const value = parseFloat(data[field.name]);
      const condition = field.notifyIf.trim();

      let shouldNotify = false;
      let message = '';

      // Parse simple conditions like ">400", "<100", ">=50", "<=200"
      const match = condition.match(/^([><=]+)(\d+\.?\d*)$/);
      if (match) {
        const operator = match[1];
        const threshold = parseFloat(match[2]);

        switch (operator) {
          case '>':
            shouldNotify = value > threshold;
            message = `${field.label || field.name} (${value}) exceeds threshold of ${threshold}`;
            break;
          case '>=':
            shouldNotify = value >= threshold;
            message = `${field.label || field.name} (${value}) is at or above threshold of ${threshold}`;
            break;
          case '<':
            shouldNotify = value < threshold;
            message = `${field.label || field.name} (${value}) is below threshold of ${threshold}`;
            break;
          case '<=':
            shouldNotify = value <= threshold;
            message = `${field.label || field.name} (${value}) is at or below threshold of ${threshold}`;
            break;
        }

        if (shouldNotify) {
          notifications.push({
            field: field.name,
            message,
            value,
            threshold,
            condition
          });
        }
      }
    }
  });

  return notifications;
}

module.exports = { validateAgainstSchema, checkNotifications };