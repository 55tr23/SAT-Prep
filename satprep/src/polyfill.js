// Import buffer and make it available globally
import { Buffer } from 'buffer';

// Add buffer to window if running in a browser environment
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

export { Buffer }; 