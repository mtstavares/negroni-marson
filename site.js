// Navigation shared by the home and story pages.
const mobileNavigation = document.querySelector('#mobile-navigation');
if (mobileNavigation) {
  const summary = mobileNavigation.querySelector('summary');
  mobileNavigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { mobileNavigation.open = false; }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileNavigation.open) {
      event.preventDefault();
      mobileNavigation.open = false;
      summary.focus();
    }
  });
  document.addEventListener('click', event => {
    if (mobileNavigation.open && !mobileNavigation.contains(event.target)) mobileNavigation.open = false;
  });
}

document.querySelector('#year').textContent = new Date().getFullYear();
