let formElements = null;

const MSG = {
  rssLabel: 'Ссылка RSS',
  addButton: 'Добавить',
  previewButton: 'Просмотр',
  closeButton: 'Закрыть',
  readFullButton: 'Читать полностью',
  success: 'RSS успешно загружен',
  alreadyExists: 'RSS уже существует',
  notEmpty: 'Не должно быть пустым',
  invalidUrl: 'Ссылка должна быть валидным URL',
  noValidRSS: 'Ресурс не содержит валидный RSS',
  networkError: 'Ошибка сети',
};

const getInput = () => document.querySelector('#rssUrl');
const getSubmitBtn = () => document.querySelector('#submitBtn');
const getFeedback = () => document.querySelector('#rssFeedback');

export const initForm = (container) => {
  if (!container) return null;
  
  container.innerHTML = `
    <form id="rssForm">
      <div class="mb-3">
        <label for="rssUrl" class="form-label">${MSG.rssLabel}</label>
        <div class="input-group">
          <input type="text" class="form-control" id="rssUrl" name="url" aria-label="url" autocomplete="off" placeholder="https://example.com/rss">
          <button type="submit" class="btn btn-primary" id="submitBtn">${MSG.addButton}</button>
        </div>
        <div id="rssFeedback" class="feedback form-text"></div>
      </div>
    </form>
  `;
  
  formElements = { form: container.querySelector('#rssForm'), input: container.querySelector('#rssUrl') };
  return formElements;
};

export const setLoading = (isLoading) => {
  const btn = getSubmitBtn();
  if (btn) btn.disabled = isLoading;
};

export const setSuccess = () => {
  const fb = getFeedback();
  if (fb) {
    fb.textContent = MSG.success;
    fb.classList.add('text-success');
    fb.classList.remove('text-danger');
    setTimeout(() => { if (fb) fb.textContent = ''; }, 5000);
  }
};

export const setError = (key) => {
  const input = getInput();
  const fb = getFeedback();
  const messages = { notEmpty: MSG.notEmpty, invalidUrl: MSG.invalidUrl, alreadyExists: MSG.alreadyExists, noValidRSS: MSG.noValidRSS, networkError: MSG.networkError };
  const message = messages[key] || key;
  if (input) input.classList.add('is-invalid');
  if (fb) {
    fb.textContent = message;
    fb.classList.add('text-danger');
    fb.classList.remove('text-success');
  }
};

export const clearError = () => {
  const input = getInput();
  const fb = getFeedback();
  if (input) input.classList.remove('is-invalid');
  if (fb && fb.textContent !== MSG.success) fb.textContent = '';
};

export const resetForm = () => {
  const input = getInput();
  if (input) { input.value = ''; input.focus(); }
  clearError();
};

// Пустые функции, чтобы не затирать статические данные
export const renderFeeds = () => {};
export const renderPosts = () => {};