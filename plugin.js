(() => {
  const PLUGIN_ID = 'cardmirror-auto-hyperlinks';
  const URL_RE = /https?:\/\/[^\s<>\"'\]\[(){}]+/g;
  let observer = null;
  let scheduled = false;

  function editor() {
    return document.querySelector('.ProseMirror');
  }

  function cleanUrl(raw) {
    return raw.replace(/[.,!?;:]+$/g, '');
  }

  function textNodes(root) {
    const out = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const p = node.parentElement;
        if (!p || p.closest('a, [contenteditable="false"]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let n;
    while ((n = walker.nextNode())) out.push(n);
    return out;
  }

  function findFirstUrl(root) {
    for (const node of textNodes(root)) {
      const text = node.nodeValue || '';
      const m = URL_RE.exec(text);
      URL_RE.lastIndex = 0;
      if (m) {
        const url = cleanUrl(m[0]);
        if (!url) continue;
        const offset = m.index;
        return { node, start: offset, end: offset + url.length, url };
      }
    }
    return null;
  }

  function linkOne(item) {
    const sel = window.getSelection();
    if (!sel) return false;
    const range = document.createRange();
    try {
      range.setStart(item.node, item.start);
      range.setEnd(item.node, item.end);
      sel.removeAllRanges();
      sel.addRange(range);
      // CardMirror uses a contenteditable ProseMirror surface. createLink is
      // intentionally used here because the public plugin API does not expose
      // the EditorView/transaction API. ProseMirror's DOM observer reconciles
      // the DOM edit into document state.
      const ok = document.execCommand('createLink', false, item.url);
      sel.removeAllRanges();
      return ok;
    } catch {
      sel.removeAllRanges();
      return false;
    }
  }

  function linkAll(root) {
    if (!root) return 0;
    let count = 0;
    // Re-scan after every mutation because execCommand may split text nodes.
    // This also avoids stale DOM ranges.
    for (let i = 0; i < 1000; i++) {
      const item = findFirstUrl(root);
      if (!item) break;
      if (!linkOne(item)) break;
      count++;
    }
    return count;
  }

  function scheduleAutoLink() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      const root = editor();
      if (!root) return;
      // Only run when the editor is focused; commands should never steal focus
      // from settings dialogs or other CardMirror windows.
      if (!root.contains(document.activeElement) && document.activeElement !== root) return;
      linkAll(root);
    }, 60);
  }

  function installAutoLink() {
    if (observer) return;
    document.addEventListener('input', onInput, true);
    document.addEventListener('keyup', onKeyup, true);
    observer = new MutationObserver(() => {
      // Do not recursively mutate from the observer itself. Input/keyup is the
      // normal trigger; this observer only catches paste and other DOM inserts.
      scheduleAutoLink();
    });
    const root = editor();
    if (root) observer.observe(root, { childList: true, subtree: true, characterData: true });
  }

  function onInput(e) {
    const root = editor();
    if (root && root.contains(e.target)) scheduleAutoLink();
  }

  function onKeyup(e) {
    if (e.key !== ' ' && e.key !== 'Enter' && e.key !== 'Tab') return;
    const root = editor();
    if (root && root.contains(e.target)) scheduleAutoLink();
  }

  function runBulk(api) {
    const root = editor();
    if (!root) {
      api.showToast('No CardMirror editor is open.');
      return;
    }
    const count = linkAll(root);
    api.showToast(count ? `Linked ${count} URL${count === 1 ? '' : 's'}.` : 'No unlinked URLs found.');
  }

  window.__registerCardMirrorPlugin?.({
    id: PLUGIN_ID,
    name: 'Auto Hyperlinks',
    apiVersion: 1,
    commands: [
      {
        id: `${PLUGIN_ID}.linkAllUrls`,
        label: 'Link All URLs',
        keywords: ['hyperlink', 'links', 'url', 'http', 'https'],
        defaultKey: null,
        run: runBulk,
      },
    ],
  });

  // Wait for CardMirror's editor to exist. The desktop host loads plugins very
  // early, before a document/editor is necessarily mounted.
  const start = () => {
    if (editor()) installAutoLink();
    else setTimeout(start, 250);
  };
  start();
})();
