import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));

    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('middle_name').nullable();
    table.string('image').nullable();
    table.string('email').notNullable().unique();
    table.string('phone').nullable();
    table.enu('gender', ['male', 'female', 'other']).nullable();
    table.date('dob').nullable();
    table.string('address').nullable();
    table.string('city').nullable();
    table.string('state').nullable();
    table.string('parentName').nullable();
    table.string('parentPhone').nullable();
    table.string('parentAddress').nullable();
    table.string('parentRelationship').nullable();

    table.string('slug').unique().nullable();

    table.boolean('is_admin').defaultTo(false);
    table.boolean('is_blocked').defaultTo(false);
    table.string('password').notNullable();
    table
      .enu('role', ['user', 'admin', 'teacher', 'student'])
      .defaultTo('user');

    table.timestamp('last_login').nullable();
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);

    // Fields for password reset and account verification OTP
    table.string('resetPasswordToken').nullable();
    table.timestamp('resetPasswordExpires').nullable();
    table.string('accountVerificationOtp').nullable();
    table.timestamp('accountVerificationOtpExpires').nullable();

    table.boolean('isAccountVerified').defaultTo(false);

    // Indexes
    table.index('email');
    table.index('is_admin');
    table.index('role');
    table.index('slug');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
