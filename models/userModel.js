// DynamoDB User Model
const USER_ROLES = ["user", "admin"];

// Validation functions
const validateUser = (user) => {
  const errors = [];
  
  if (!user.name) errors.push("name is required");
  if (!user.email) errors.push("email is required");
  if (!user.password && !user.hashedPassword) errors.push("password is required");
  if (user.role && !USER_ROLES.includes(user.role)) {
    errors.push(`role must be one of: ${USER_ROLES.join(', ')}`);
  }
  
  return errors;
};

// Process user before saving
const processUser = (user) => {
  return {
    ...user,
    role: user.role || "user",
    isActive: user.isActive ?? true,
    lastLogin: user.lastLogin || null,
    profile: {
      avatar: user.profile?.avatar || null,
      phone: user.profile?.phone || null,
      address: user.profile?.address || null,
      bio: user.profile?.bio || null
    },
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Allow overriding the table name via environment variable (USER_TABLE). Default to 'portfolio-users'
module.exports = {
  TABLE_NAME: process.env.USER_TABLE || 'portfolio-users',
  USER_ROLES,
  validateUser,
  processUser
};
