import './styles.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import initI18n from './i18n.js';
import initApp from './app.js';

console.log('=== INDEX.JS START ===');

const init = async () => {
  console.log('Initializing i18n...');
  await initI18n();
  console.log('i18n ready, initializing app...');
  initApp();
  console.log('App initialized');
};

init();