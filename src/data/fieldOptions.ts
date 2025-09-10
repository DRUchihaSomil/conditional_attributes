// Predefined options for different fields
export const FIELD_OPTIONS: Record<string, string[]> = {
  'priority': [
    'High',
    'Medium', 
    'Low',
    'Very High',
    'Critical',
    'Not Prioritized'
  ],
  'stage': [
    'Development',
    'Triage',
    'Under Review',
    'Backlog',
    'In Progress',
    'Testing',
    'Done',
    'Blocked'
  ],
  'owner': [
    'John Smith',
    'Sarah Johnson',
    'Mike Chen',
    'Emily Davis',
    'Alex Rodriguez',
    'Lisa Wang',
    'David Brown',
    'Maria Garcia'
  ],
  'status': [
    'Open',
    'In Progress',
    'Resolved',
    'Closed',
    'Reopened',
    'Pending',
    'Cancelled'
  ],
  'department': [
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'Support',
    'Operations',
    'HR'
  ],
  'issue_category_l1': [
    'Technical Issue',
    'Feature Request',
    'Bug Report',
    'Performance Issue',
    'Security Concern',
    'User Experience',
    'Integration Problem',
    'Data Issue'
  ],
  'issue_category_l2': [
    'Frontend',
    'Backend',
    'Database',
    'API',
    'Authentication',
    'UI/UX',
    'Mobile',
    'Infrastructure'
  ],
  'issue_category_l3': [
    'Critical',
    'Major',
    'Minor',
    'Enhancement',
    'Documentation',
    'Configuration',
    'Deployment',
    'Monitoring'
  ],
  'date': [
    'Today',
    'Tomorrow',
    'This Week',
    'Next Week',
    'This Month',
    'Next Month',
    'Custom Date'
  ],
  'severity': [
    'P0 - Critical',
    'P1 - High',
    'P2 - Medium',
    'P3 - Low',
    'P4 - Very Low'
  ],
  'environment': [
    'Production',
    'Staging',
    'Development',
    'Testing',
    'Local',
    'Preview'
  ],
  'type': [
    'Bug',
    'Feature',
    'Task',
    'Epic',
    'Story',
    'Subtask',
    'Improvement'
  ]
};

// Helper function to get options for a field
export const getFieldOptions = (field: string): string[] => {
  // Check if field starts with 'custom_fields.' and extract the actual field name
  const actualField = field.replace('custom_fields.', '');
  return FIELD_OPTIONS[actualField] || [];
};

// Helper function to check if a field has predefined options
export const hasPredefinedOptions = (field: string): boolean => {
  const actualField = field.replace('custom_fields.', '');
  return actualField in FIELD_OPTIONS;
};
