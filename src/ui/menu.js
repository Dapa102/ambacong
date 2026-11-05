const menuScreen = document.getElementById('menu-screen');
const chapterSelect = document.getElementById('chapter-select-screen');
const continueButton = document.getElementById('continue-button');
const newGameButton = document.getElementById('new-game-button');
const chaptersButton = document.getElementById('chapters-button');
const exitButton = document.getElementById('exit-button');
const backButton = document.getElementById('back-to-menu-button');

export const initMenu = ({ onContinue, onNewGame, onChapterSelect, onExit }) => {
  continueButton.addEventListener('click', () => onContinue());
  newGameButton.addEventListener('click', () => onNewGame());
  chaptersButton.addEventListener('click', () => showChapterSelect());
  exitButton.addEventListener('click', () => onExit());

  document.querySelectorAll('.chapter-item[data-chapter]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      onChapterSelect(Number(button.dataset.chapter));
    });
  });

  backButton.addEventListener('click', () => {
    chapterSelect.hidden = true;
    menuScreen.hidden = false;
  });
};

export const setContinueEnabled = (enabled) => {
  continueButton.disabled = !enabled;
  continueButton.title = enabled ? '' : 'Belum ada save tersedia';
};

export const showMenu = () => {
  menuScreen.hidden = false;
  chapterSelect.hidden = true;
};

export const hideMenu = () => {
  menuScreen.hidden = true;
  chapterSelect.hidden = true;
};

export const showChapterSelect = () => {
  menuScreen.hidden = true;
  chapterSelect.hidden = false;
};
