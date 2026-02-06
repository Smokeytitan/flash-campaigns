-- Create first admin user
-- You can update the email and other fields after creation

INSERT INTO "User" (
    id,
    "createdAt",
    "updatedAt",
    role,
    email,
    name
) VALUES (
    'admin-' || gen_random_uuid()::text,
    NOW(),
    NOW(),
    'ADMIN',
    'admin@polygon.technology',
    'Admin User'
)
RETURNING id, email, role;

-- This will create an admin user with:
-- - Email: admin@polygon.technology
-- - Role: ADMIN
-- - Name: Admin User
--
-- After running this, you can connect your X account via the app
-- to complete your admin profile.
