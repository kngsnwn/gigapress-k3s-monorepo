import { useConversationStore } from './store';
import { demoProjects, demoMessages, demoProgressUpdates, demoServices } from './demoData';

export const loadTestData = () => {
  const store = useConversationStore.getState();
  
  // Load demo projects immediately
  if (store.projects.length === 0) {
    demoProjects.forEach((project, index) => {
      store.addProject(project);
      if (index === 0) {
        store.setCurrentProject(project);
      }
    });
  }
  
  // Load demo messages immediately without typing simulation
  if (store.messages.length === 0) {
    demoMessages.forEach((message) => {
      store.addMessage(message);
    });
  }
  
  // Load demo progress updates
  if (store.progressUpdates.length === 0) {
    demoProgressUpdates.forEach((update, index) => {
      setTimeout(() => {
        store.addProgressUpdate(update);
      }, index * 800 + 5000);
    });
  }
  
  // Load demo services
  if (store.services.length === 0) {
    setTimeout(() => {
      store.setServices(demoServices);
    }, 1000);
  }
  
  // Simulate connection state
  setTimeout(() => {
    store.setIsConnected(true);
  }, 2000);
};