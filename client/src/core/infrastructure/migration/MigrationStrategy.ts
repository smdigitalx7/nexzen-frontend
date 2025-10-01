/**
 * Migration Strategy - Defines how to gradually migrate from legacy to clean architecture
 * without breaking existing functionality
 */

export enum MigrationPhase {
  LEGACY_ONLY = 'legacy_only',
  HYBRID = 'hybrid',
  CLEAN_ARCHITECTURE = 'clean_architecture'
}

export interface MigrationConfig {
  currentPhase: MigrationPhase;
  enableCleanArchitecture: boolean;
  enableLegacyFallback: boolean;
  logMigrationSteps: boolean;
}

export class MigrationStrategy {
  private static config: MigrationConfig = {
    currentPhase: MigrationPhase.HYBRID,
    enableCleanArchitecture: true,
    enableLegacyFallback: true,
    logMigrationSteps: true
  };
  
  static getConfig(): MigrationConfig {
    return { ...MigrationStrategy.config };
  }
  
  static updateConfig(newConfig: Partial<MigrationConfig>): void {
    MigrationStrategy.config = { ...MigrationStrategy.config, ...newConfig };
  }
  
  static isCleanArchitectureEnabled(): boolean {
    return MigrationStrategy.config.enableCleanArchitecture;
  }
  
  static isLegacyFallbackEnabled(): boolean {
    return MigrationStrategy.config.enableLegacyFallback;
  }
  
  static getCurrentPhase(): MigrationPhase {
    return MigrationStrategy.config.currentPhase;
  }
  
  static setPhase(phase: MigrationPhase): void {
    MigrationStrategy.config.currentPhase = phase;
    if (MigrationStrategy.config.logMigrationSteps) {
      console.log(`🔄 Migration phase changed to: ${phase}`);
    }
  }
  
  static log(message: string): void {
    if (MigrationStrategy.config.logMigrationSteps) {
      console.log(`[Migration] ${message}`);
    }
  }
  
  /**
   * Determines which implementation to use based on current migration phase
   */
  static shouldUseCleanArchitecture(feature: string): boolean {
    switch (MigrationStrategy.config.currentPhase) {
      case MigrationPhase.LEGACY_ONLY:
        return false;
      case MigrationPhase.CLEAN_ARCHITECTURE:
        return true;
      case MigrationPhase.HYBRID:
        // In hybrid mode, we can gradually enable clean architecture for specific features
        const enabledFeatures = ['users', 'employees', 'students'];
        return enabledFeatures.includes(feature);
      default:
        return false;
    }
  }
  
  /**
   * Gets the appropriate hook based on migration strategy
   */
  static getHookImplementation(feature: string, hookName: string): string {
    if (MigrationStrategy.shouldUseCleanArchitecture(feature)) {
      MigrationStrategy.log(`Using clean architecture for ${feature}.${hookName}`);
      return `useLegacy${hookName}`;
    } else {
      MigrationStrategy.log(`Using legacy implementation for ${feature}.${hookName}`);
      return hookName;
    }
  }
}
