import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Index,
} from 'typeorm';

@Entity('users')
@Index('email')
@Index('is_admin')
@Index('role')
@Index('slug')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  middle_name?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender?: 'male' | 'female' | 'other';

  @Column({ type: 'date', nullable: true })
  dob?: Date;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  parentName?: string;

  @Column({ nullable: true })
  parentPhone?: string;

  @Column({ nullable: true })
  parentAddress?: string;

  @Column({ nullable: true })
  parentRelationship?: string;

  @Column({ unique: true, nullable: true })
  slug: string;

  @Column({ default: false })
  is_admin: boolean;

  @Column({ default: false })
  is_blocked: boolean;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['user', 'admin', 'teacher', 'student'],
    default: 'user',
  })
  role: 'user' | 'admin' | 'teacher' | 'student';

  @Column({ nullable: true })
  last_login?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true })
  resetPasswordExpires?: Date;

  @Column({ nullable: true })
  accountVerificationOtp?: string;

  @Column({ nullable: true })
  accountVerificationOtpExpires?: Date;

  @Column({ default: false })
  isAccountVerified: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
