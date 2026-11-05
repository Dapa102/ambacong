const dialogScreen = document.getElementById('dialog-screen');
const dialogSpeaker = document.getElementById('dialog-speaker');
const dialogText = document.getElementById('dialog-text');
const newsScreen = document.getElementById('news-screen');
const newsTitle = document.getElementById('news-title');
const newsBody = document.getElementById('news-body');
const noteScreen = document.getElementById('note-screen');
const noteTitle = document.getElementById('note-title');
const noteBody = document.getElementById('note-body');
const pauseScreen = document.getElementById('pause-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const gameoverText = document.getElementById('gameover-text');
const completeScreen = document.getElementById('complete-screen');
const completeText = document.getElementById('complete-text');
const loadingScreen = document.getElementById('loading-screen');
const loadingText = document.getElementById('loading-text');

let dialogLines = [];
let dialogIndex = 0;
let dialogOnDone = null;
let onDialogAdvance = null;

const show = (element) => {
  element.hidden = false;
};
const hide = (element) => {
  element.hidden = true;
};

export const initOverlays = ({
  onResume,
  onSave,
  onPauseExit,
  onRetry,
  onGameOverMenu,
  onCompleteMenu,
}) => {
  document.getElementById('resume-button').addEventListener('click', () => onResume());
  document.getElementById('save-button').addEventListener('click', () => onSave());
  document.getElementById('pause-exit-button').addEventListener('click', () => onPauseExit());
  document.getElementById('retry-button').addEventListener('click', () => onRetry());
  document.getElementById('gameover-menu-button').addEventListener('click', () => onGameOverMenu());
  document.getElementById('complete-menu-button').addEventListener('click', () => onCompleteMenu());

  const advanceDialog = (event) => {
    if (dialogScreen.hidden) return;
    event.stopPropagation();
    if (dialogIndex < dialogLines.length - 1) {
      dialogIndex += 1;
      renderDialogLine();
    } else {
      hide(dialogScreen);
      const done = dialogOnDone;
      dialogLines = [];
      dialogOnDone = null;
      done?.();
    }
  };

  dialogScreen.addEventListener('click', advanceDialog);
  onDialogAdvance = advanceDialog;
};

export const getDialogAdvanceHandler = () => onDialogAdvance;

export const isDialogOpen = () => !dialogScreen.hidden;

export const showDialog = (lines, onDone) => {
  dialogLines = lines;
  dialogIndex = 0;
  dialogOnDone = onDone;
  renderDialogLine();
  show(dialogScreen);
};

export const isOverlayOpen = () =>
  !dialogScreen.hidden ||
  !newsScreen.hidden ||
  !noteScreen.hidden ||
  !pauseScreen.hidden ||
  !gameoverScreen.hidden ||
  !completeScreen.hidden;

export const showNews = (title, body, onClose) => {
  newsTitle.textContent = title;
  newsBody.textContent = body;
  newsScreen.hidden = false;
  document.getElementById('news-close-button').onclick = () => {
    newsScreen.hidden = true;
    onClose?.();
  };
};

export const showNote = (title, body, onClose) => {
  noteTitle.textContent = title;
  noteBody.textContent = body;
  noteScreen.hidden = false;
  document.getElementById('note-close-button').onclick = () => {
    noteScreen.hidden = true;
    onClose?.();
  };
};

export const showPause = () => show(pauseScreen);
export const hidePause = () => hide(pauseScreen);

export const showGameOver = (text, onRetry, onMenu) => {
  gameoverText.textContent = text;
  gameoverScreen.hidden = false;
  document.getElementById('retry-button').onclick = () => {
    gameoverScreen.hidden = true;
    onRetry?.();
  };
  document.getElementById('gameover-menu-button').onclick = () => {
    gameoverScreen.hidden = true;
    onMenu?.();
  };
};

export const showComplete = (text, onMenu) => {
  completeText.textContent = text;
  completeScreen.hidden = false;
  document.getElementById('complete-menu-button').onclick = () => {
    completeScreen.hidden = true;
    onMenu?.();
  };
};

export const showLoading = (text = 'Memuat...') => {
  loadingText.textContent = text;
  show(loadingScreen);
};

export const hideLoading = () => hide(loadingScreen);

const renderDialogLine = () => {
  const line = dialogLines[dialogIndex];
  dialogSpeaker.textContent = line.speaker ?? '';
  dialogText.textContent = line.text;
};
