// Category color mapping
export const categoryColors = {
  'Food': '#FF6B6B',
  'Transport': '#4ECDC4',
  'Entertainment': '#45B7D1',
  'Shopping': '#FFA07A',
  'Bills': '#F7DC6F',
  'Healthcare': '#98D8C8',
  'Education': '#BB8FCE',
  'Business': '#5DADE2',
  'Other': '#95A5A6',
  'Default': '#667eea'
};

export const getCategoryColor = (category) => {
  return categoryColors[category] || categoryColors['Default'];
};
