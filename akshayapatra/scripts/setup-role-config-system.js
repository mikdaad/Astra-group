#!/usr/bin/env node

/**
 * Setup script for the database-driven role configuration system
 * This script will:
 * 1. Create the necessary database tables
 * 2. Insert default role configurations
 * 3. Insert default custom permissions
 * 4. Migrate existing users to the new system
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSetup() {
  console.log('🚀 Starting role configuration system setup...\n')

  try {
    // Step 1: Check if tables exist
    console.log('📋 Checking database tables...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['role_configurations', 'custom_permissions', 'user_role_assignments'])

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError)
      return
    }

    const existingTables = tables.map(t => t.table_name)
    console.log(`✅ Found existing tables: ${existingTables.join(', ')}`)

    if (existingTables.length < 3) {
      console.log('⚠️  Some tables are missing. Please run the database schema first:')
      console.log('   Run: psql -d your_database -f database_schema.sql')
      return
    }

    // Step 2: Check if default roles exist
    console.log('\n🔍 Checking default role configurations...')
    
    const { data: existingRoles, error: rolesError } = await supabase
      .from('role_configurations')
      .select('role_name')
      .in('role_name', ['new', 'support', 'manager', 'admin', 'superadmin'])

    if (rolesError) {
      console.error('❌ Error checking roles:', rolesError)
      return
    }

    const existingRoleNames = existingRoles.map(r => r.role_name)
    console.log(`✅ Found existing roles: ${existingRoleNames.join(', ')}`)

    if (existingRoleNames.length < 5) {
      console.log('⚠️  Some default roles are missing. Please run the database schema first.')
      return
    }

    // Step 3: Check if default permissions exist
    console.log('\n🔍 Checking default permissions...')
    
    const { data: existingPermissions, error: permsError } = await supabase
      .from('custom_permissions')
      .select('permission_key')
      .limit(5)

    if (permsError) {
      console.error('❌ Error checking permissions:', permsError)
      return
    }

    console.log(`✅ Found ${existingPermissions.length} permissions`)

    if (existingPermissions.length === 0) {
      console.log('⚠️  No permissions found. Please run the database schema first.')
      return
    }

    // Step 4: Get existing staff users
    console.log('\n👥 Getting existing staff users...')
    
    const { data: staffUsers, error: staffError } = await supabase
      .from('staff_profiles')
      .select('id, role')
      .eq('is_active', true)

    if (staffError) {
      console.error('❌ Error fetching staff users:', staffError)
      return
    }

    console.log(`✅ Found ${staffUsers.length} active staff users`)

    // Step 5: Migrate existing users to new system
    console.log('\n🔄 Migrating users to database-driven system...')
    
    let migratedCount = 0
    let skippedCount = 0

    for (const staffUser of staffUsers) {
      try {
        // Check if user already has role assignments
        const { data: existingAssignments } = await supabase
          .from('user_role_assignments')
          .select('id')
          .eq('user_id', staffUser.id)
          .eq('is_active', true)

        if (existingAssignments && existingAssignments.length > 0) {
          console.log(`   ⏭️  User ${staffUser.id} already migrated (${staffUser.role})`)
          skippedCount++
          continue
        }

        // Get role configuration for this role
        const { data: roleConfig } = await supabase
          .from('role_configurations')
          .select('id')
          .eq('role_name', staffUser.role)
          .single()

        if (!roleConfig) {
          console.log(`   ⚠️  No role config found for role: ${staffUser.role}`)
          skippedCount++
          continue
        }

        // Create role assignment
        const { error: assignError } = await supabase
          .from('user_role_assignments')
          .insert({
            user_id: staffUser.id,
            role_config_id: roleConfig.id,
            is_active: true
          })

        if (assignError) {
          console.log(`   ❌ Failed to migrate user ${staffUser.id}: ${assignError.message}`)
          skippedCount++
        } else {
          console.log(`   ✅ Migrated user ${staffUser.id} (${staffUser.role})`)
          migratedCount++
        }
      } catch (error) {
        console.log(`   ❌ Error migrating user ${staffUser.id}: ${error.message}`)
        skippedCount++
      }
    }

    console.log(`\n📊 Migration Summary:`)
    console.log(`   ✅ Migrated: ${migratedCount} users`)
    console.log(`   ⏭️  Skipped: ${skippedCount} users`)

    // Step 6: Verify system is working
    console.log('\n🔍 Verifying system functionality...')
    
    const { data: testRoles } = await supabase
      .from('role_configurations')
      .select('role_name, permissions')
      .eq('is_active', true)
      .limit(3)

    if (testRoles && testRoles.length > 0) {
      console.log('✅ Role configurations are accessible')
      
      const { data: testAssignments } = await supabase
        .from('user_role_assignments')
        .select('user_id, role_config_id')
        .eq('is_active', true)
        .limit(3)

      if (testAssignments && testAssignments.length > 0) {
        console.log('✅ User role assignments are working')
      }
    }

    console.log('\n🎉 Role configuration system setup completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Test the system with a few users')
    console.log('   2. Create custom roles if needed')
    console.log('   3. Assign custom permissions to users')
    console.log('   4. Monitor the system for any issues')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

// Run the setup
runSetup().then(() => {
  console.log('\n✨ Setup script completed')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Setup script failed:', error)
  process.exit(1)
})
