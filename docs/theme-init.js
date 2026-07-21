(function() {
  const savedLevel = localStorage.getItem('theme-level');
  const savedTheme = localStorage.getItem('theme');
  if (savedLevel) {
    document.documentElement.setAttribute('data-theme-level', savedLevel);
    document.documentElement.setAttribute('data-theme', parseInt(savedLevel, 10) <= 3 ? 'dark' : 'light');
  } else if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme-level', isDark ? '2' : '5');
  }
})();
