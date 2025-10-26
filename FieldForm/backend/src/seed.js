// backend/src/seed.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const SCHEMAS_FILE = path.join(DATA_DIR, 'schemas.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// Demo schemas
const demoSchemas = {
  'demo_pole_inspection': {
    id: 'demo_pole_inspection',
    title: 'Electrical Pole Inspection Form',
    prompt: 'Demo: Electrical pole inspection with voltage monitoring',
    schema: {
      title: 'Electrical Pole Inspection Form',
      fields: [
        {
          name: 'inspector_name',
          label: 'Inspector Name',
          type: 'string',
          required: true,
          placeholder: 'Enter your full name'
        },
        {
          name: 'pole_id',
          label: 'Pole ID',
          type: 'string',
          required: true,
          placeholder: 'e.g., POLE-2024-001'
        },
        {
          name: 'inspection_date',
          label: 'Inspection Date',
          type: 'date',
          required: true
        },
        {
          name: 'voltage',
          label: 'Voltage Reading (V)',
          type: 'number',
          required: true,
          min: 0,
          max: 1000,
          notifyIf: '>400',
          placeholder: 'Enter voltage in volts'
        },
        {
          name: 'pole_condition',
          label: 'Pole Condition',
          type: 'select',
          required: true,
          options: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical']
        },
        {
          name: 'photos',
          label: 'Inspection Photos',
          type: 'file',
          required: false
        },
        {
          name: 'remarks',
          label: 'Additional Remarks',
          type: 'textarea',
          required: false,
          placeholder: 'Any additional observations...'
        }
      ]
    },
    createdAt: new Date().toISOString()
  },
  'demo_equipment_maintenance': {
    id: 'demo_equipment_maintenance',
    title: 'Equipment Maintenance Log',
    prompt: 'Demo: Equipment maintenance tracking',
    schema: {
      title: 'Equipment Maintenance Log',
      fields: [
        {
          name: 'equipment_id',
          label: 'Equipment ID',
          type: 'string',
          required: true,
          placeholder: 'EQ-2024-XXX'
        },
        {
          name: 'technician_name',
          label: 'Technician Name',
          type: 'string',
          required: true
        },
        {
          name: 'technician_email',
          label: 'Technician Email',
          type: 'email',
          required: true,
          placeholder: 'technician@example.com'
        },
        {
          name: 'maintenance_date',
          label: 'Maintenance Date',
          type: 'date',
          required: true
        },
        {
          name: 'hours_worked',
          label: 'Hours Worked',
          type: 'number',
          required: true,
          min: 0,
          max: 24
        },
        {
          name: 'parts_replaced',
          label: 'Parts Replaced',
          type: 'textarea',
          required: false,
          placeholder: 'List parts that were replaced...'
        },
        {
          name: 'condition_rating',
          label: 'Equipment Condition',
          type: 'select',
          required: true,
          options: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical']
        },
        {
          name: 'requires_followup',
          label: 'Requires Follow-up',
          type: 'boolean',
          required: false
        }
      ]
    },
    createdAt: new Date().toISOString()
  },
  'demo_safety_audit': {
    id: 'demo_safety_audit',
    title: 'Site Safety Audit Form',
    prompt: 'Demo: Safety audit with scoring',
    schema: {
      title: 'Site Safety Audit Form',
      fields: [
        {
          name: 'auditor_name',
          label: 'Auditor Name',
          type: 'string',
          required: true
        },
        {
          name: 'site_location',
          label: 'Site Location',
          type: 'string',
          required: true,
          placeholder: 'Enter site address or identifier'
        },
        {
          name: 'audit_date',
          label: 'Audit Date',
          type: 'date',
          required: true
        },
        {
          name: 'safety_score',
          label: 'Safety Score (0-100)',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
          notifyIf: '<70',
          placeholder: 'Overall safety rating'
        },
        {
          name: 'hazards_identified',
          label: 'Hazards Identified',
          type: 'textarea',
          required: true,
          placeholder: 'List all identified hazards...'
        },
        {
          name: 'corrective_actions',
          label: 'Corrective Actions Required',
          type: 'textarea',
          required: true,
          placeholder: 'List required corrective actions...'
        },
        {
          name: 'audit_photos',
          label: 'Audit Photos',
          type: 'file',
          required: false
        }
      ]
    },
    createdAt: new Date().toISOString()
  }
};

// Demo submissions
const demoSubmissions = {
  'demo_pole_inspection': [
    {
      data: {
        inspector_name: 'John Smith',
        pole_id: 'POLE-2024-001',
        inspection_date: '2024-10-20',
        voltage: 380,
        pole_condition: 'Good',
        remarks: 'Minor wear on base, recommended for monitoring'
      },
      notifications: [],
      submittedAt: '2024-10-20T10:30:00.000Z'
    },
    {
      data: {
        inspector_name: 'Jane Doe',
        pole_id: 'POLE-2024-002',
        inspection_date: '2024-10-21',
        voltage: 450,
        pole_condition: 'Fair',
        remarks: 'High voltage detected, requires immediate attention'
      },
      notifications: [
        {
          field: 'voltage',
          message: 'Voltage Reading (V) (450) exceeds threshold of 400',
          value: 450,
          threshold: 400,
          condition: '>400'
        }
      ],
      submittedAt: '2024-10-21T14:15:00.000Z'
    }
  ],
  'demo_equipment_maintenance': [
    {
      data: {
        equipment_id: 'EQ-2024-101',
        technician_name: 'Mike Johnson',
        technician_email: 'mike.j@example.com',
        maintenance_date: '2024-10-22',
        hours_worked: 4,
        parts_replaced: 'Oil filter, air filter',
        condition_rating: 'Good',
        requires_followup: false
      },
      notifications: [],
      submittedAt: '2024-10-22T09:00:00.000Z'
    }
  ],
  'demo_safety_audit': [
    {
      data: {
        auditor_name: 'Sarah Williams',
        site_location: 'Construction Site A - Downtown',
        audit_date: '2024-10-23',
        safety_score: 85,
        hazards_identified: 'Exposed wiring in section B, Missing safety barriers near excavation',
        corrective_actions: 'Install cable covers, Set up safety barriers with warning signs'
      },
      notifications: [],
      submittedAt: '2024-10-23T11:45:00.000Z'
    },
    {
      data: {
        auditor_name: 'Robert Brown',
        site_location: 'Warehouse District - East Wing',
        audit_date: '2024-10-24',
        safety_score: 65,
        hazards_identified: 'Inadequate lighting, Slippery floor surfaces, Missing fire extinguishers',
        corrective_actions: 'Install additional lighting, Apply anti-slip coating, Purchase and install fire extinguishers'
      },
      notifications: [
        {
          field: 'safety_score',
          message: 'Safety Score (0-100) (65) is below threshold of 70',
          value: 65,
          threshold: 70,
          condition: '<70'
        }
      ],
      submittedAt: '2024-10-24T16:20:00.000Z'
    }
  ]
};

function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log('✅ Created data directory');
    }

    // Write schemas
    fs.writeFileSync(SCHEMAS_FILE, JSON.stringify(demoSchemas, null, 2));
    console.log(`✅ Seeded ${Object.keys(demoSchemas).length} demo schemas`);

    // Write submissions
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(demoSubmissions, null, 2));
    const totalSubmissions = Object.values(demoSubmissions).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`✅ Seeded ${totalSubmissions} demo submissions`);

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('Demo Schema IDs:');
    Object.keys(demoSchemas).forEach(id => {
      console.log(`  - ${id}: ${demoSchemas[id].title}`);
    });
    console.log('\n💡 Start the server and access these forms via the API');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, demoSchemas, demoSubmissions };