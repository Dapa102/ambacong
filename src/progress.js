export const advanceProgress = (progress, action) => {
  if (progress === 'start' && action === 'key') return 'key';
  if (progress === 'key' && action === 'door') return 'done';
  return progress;
};
