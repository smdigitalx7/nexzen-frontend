import { UserEntity, UserId, Email, UserRole } from '../entities/User';

export interface UserRepository {
  findById(id: UserId): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  findAllWithRolesAndBranches(): Promise<any[]>;
  findByEmail(email: Email): Promise<UserEntity | null>;
  findByRole(role: UserRole): Promise<UserEntity[]>;
  findByActiveStatus(isActive: boolean): Promise<UserEntity[]>;
  save(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: UserId): Promise<void>;
  exists(id: UserId): Promise<boolean>;
  count(): Promise<number>;
  countByRole(role: UserRole): Promise<number>;
  countActiveUsers(): Promise<number>;
}
