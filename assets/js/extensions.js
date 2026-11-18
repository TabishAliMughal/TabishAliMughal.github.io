// Renders one .ext-card per entry of window.VSCODE_EXTENSIONS (assets/js/extensions-data.js)
// into #extensions-grid. Built with DOM APIs (textContent), so data text is never parsed as HTML.
(function () {
    var grid = document.getElementById('extensions-grid');
    var list = window.VSCODE_EXTENSIONS || [];
    var publisher = document.getElementById('ext-publisher-link');
    if (publisher && window.VSCODE_PUBLISHER_URL) publisher.href = window.VSCODE_PUBLISHER_URL;
    if (!grid || !list.length) return;

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }
    function externalLink(href, className, iconClass, label, ariaLabel) {
        var a = el('a', className);
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener';
        a.setAttribute('aria-label', ariaLabel + ' (opens in a new tab)');
        var icon = el('i', iconClass);
        icon.setAttribute('aria-hidden', 'true');
        a.appendChild(icon);
        a.appendChild(document.createTextNode(' ' + label));
        return a;
    }

    list.forEach(function (ext) {
        var card = el('article', 'ext-card');
        card.id = 'ext-' + ext.id.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        var head = el('div', 'ext-head');
        var img = el('img', 'ext-icon');
        img.src = ext.icon;
        img.alt = '';
        img.width = 72;
        img.height = 72;
        img.loading = 'lazy';
        head.appendChild(img);
        var titles = el('div', 'ext-titles');
        titles.appendChild(el('span', 'ext-tag', 'VS Code extension'));
        titles.appendChild(el('h3', 'ext-title', ext.name));
        head.appendChild(titles);
        card.appendChild(head);

        card.appendChild(el('p', 'ext-description', ext.description));

        if (ext.features && ext.features.length) {
            var ul = el('ul', 'ext-features');
            ul.setAttribute('aria-label', ext.name + ' key features');
            ext.features.slice(0, 5).forEach(function (f) { ul.appendChild(el('li', '', f)); });
            card.appendChild(ul);
        }

        var actions = el('div', 'ext-actions');
        actions.appendChild(externalLink(ext.marketplace, 'btn btn-primary btn-sm', 'fas fa-download',
            'Install from Marketplace', 'Install ' + ext.name + ' from the VS Code Marketplace'));
        if (ext.source) {
            actions.appendChild(externalLink(ext.source, 'btn btn-secondary btn-sm', 'fab fa-github',
                'Source', ext.name + ' source code on GitHub'));
        }
        card.appendChild(actions);
        grid.appendChild(card);
    });
})();
