import './styles.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import initI18n from './i18n.js';
import initApp from './app.js';

const init = async () => {
  await initI18n();
  initApp();
};

init();