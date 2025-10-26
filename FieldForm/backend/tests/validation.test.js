// backend/tests/validation.test.js
const { validateAgainstSchema, checkNotifications } = require('../src/validation');

describe('Validation Tests', () => {
  describe('validateAgainstSchema', () => {
    test('should pass validation for valid data', () => {
      const schema = {
        fields: [
          { name: 'name', type: 'string', required: true },
          { name: 'age', type: 'number', required: true, min: 0, max: 120 }
        ]
      };

      const data = {
        name: 'John Doe',
        age: 30
      };

      const errors = validateAgainstSchema(data, schema);
      expect(errors).toEqual([]);
    });

    test('should fail validation for missing required field', () => {
      const schema = {
        fields: [
          { name: 'name', type: 'string', required: true, label: 'Name' }
        ]
      };

      const data = {};

      const errors = validateAgainstSchema(data, schema);
      expect(errors).toContain('Name is required');
    });

    test('should fail validation for number out of range', () => {
      const schema = {
        fields: [
          { name: 'voltage', type: 'number', required: true, min: 0, max: 1000, label: 'Voltage' }
        ]
      };

      const data = { voltage: 1500 };

      const errors = validateAgainstSchema(data, schema);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toMatch(/at most 1000/);
    });

    test('should pass validation for optional empty field', () => {
      const schema = {
        fields: [
          { name: 'notes', type: 'string', required: false }
        ]
      };

      const data = {};

      const errors = validateAgainstSchema(data, schema);
      expect(errors).toEqual([]);
    });
  });

  describe('checkNotifications', () => {
    test('should trigger notification when value exceeds threshold', () => {
      const schema = {
        fields: [
          { 
            name: 'voltage', 
            label: 'Voltage',
            type: 'number', 
            notifyIf: '>400' 
          }
        ]
      };

      const data = { voltage: 450 };

      const notifications = checkNotifications(schema, data);
      expect(notifications.length).toBe(1);
      expect(notifications[0].field).toBe('voltage');
      expect(notifications[0].value).toBe(450);
      expect(notifications[0].threshold).toBe(400);
    });

    test('should not trigger notification when value is within threshold', () => {
      const schema = {
        fields: [
          { 
            name: 'voltage', 
            type: 'number', 
            notifyIf: '>400' 
          }
        ]
      };

      const data = { voltage: 300 };

      const notifications = checkNotifications(schema, data);
      expect(notifications.length).toBe(0);
    });
  });
});