// Turns the disabled "Coming soon to Google Play" badge into a live link for every
// element with data-app="<slug>" whose URL is set in assets/js/apps-data.js.
(function () {
    var urls = window.ENTITY_PLAY_URLS || {};
    document.querySelectorAll('[data-app]').forEach(function (el) {
        var url = (urls[el.getAttribute('data-app')] || '').trim();
        var badge = el.querySelector('.app-store-badge');
        if (!url || !badge) return;
        var link = document.createElement('a');
        link.className = badge.className + ' is-live';
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.innerHTML = '<i class="fab fa-google-play"></i> Get it on Google Play';
        badge.replaceWith(link);
    });
})();
