// onboardingController.js
// Simple pub/sub to trigger a restart/re-show of onboarding from anywhere in the app.
// This allows the SettingsScreen to force-show the tutorial without a full app restart.

class OnboardingController {
  constructor() {
    this.listeners = [];
  }

  // Subscribe to onboarding restart events
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Trigger onboarding restart
  triggerRestart() {
    this.listeners.forEach(callback => callback());
  }
}

const onboardingController = new OnboardingController();

export default onboardingController;