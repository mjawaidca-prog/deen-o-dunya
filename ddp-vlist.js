/* Deen o Dunya Planner — Virtual List (ddp-vlist.js)
   Exposes: window.DDP_VLIST

   WHY: The reading view currently renders every AyahCard at once. Sūrah Al-Baqarah
   is 286 heavy cards (Arabic + English + Urdu + controls). On a 1–2 GB RAM phone's
   WebView this is the exact cause of the scroll-jank testers reported and the same
   failure users punish Islam 360 for.

   WHAT: A lightweight windowing helper — no framework, works with the app's existing
   React.createElement rendering. It renders only the ayahs visible in the viewport
   (plus a small overscan buffer), using a spacer div to preserve correct scroll
   height and position. Handles variable-height rows via measured-height caching.

   USAGE (in ReadingView):
     const vlist = DDP_VLIST.create({
       container: scrollEl,          // the scrolling element
       count: surah.ayahs.length,    // total rows
       estimateHeight: 220,          // rough px per ayah card (auto-corrects once measured)
       overscan: 4,                  // rows above/below viewport to keep mounted
       renderRow: (index) => renderAyahCard(surah.ayahs[index], index),
       onRangeChange: (start, end) => {   // optional: preload audio for visible range
         DDP_AUDIO.preload(DDP_AUDIO.ayahSources(surah.ayahs[Math.min(end, count-1)].g + 1));
       }
     });
     vlist.mount(listContainerEl);
     // later, to jump to an ayah (e.g. resume position or khatm start):
     vlist.scrollToIndex(ayahIndex);
     // on unmount:
     vlist.destroy();
*/
(function () {
  function create(opts) {
    var container = opts.container;              // scroll parent
    var count = opts.count;
    var estimate = opts.estimateHeight || 200;
    var overscan = opts.overscan != null ? opts.overscan : 4;
    var renderRow = opts.renderRow;
    var onRangeChange = opts.onRangeChange || null;

    var heights = new Array(count).fill(estimate); // measured heights, default = estimate
    var offsets = new Array(count + 1).fill(0);     // prefix sums of heights
    var measured = new Array(count).fill(false);

    var listEl = null;      // inner container we render into
    var spacerTop = null;   // div that pushes content down
    var spacerBottom = null;
    var mountedRows = {};    // index -> DOM node
    var rafPending = false;
    var lastStart = -1, lastEnd = -1;

    function recomputeOffsets(from) {
      from = from || 0;
      for (var i = from; i < count; i++) {
        offsets[i + 1] = offsets[i] + heights[i];
      }
    }
    recomputeOffsets(0);

    function totalHeight() { return offsets[count]; }

    function indexAtOffset(y) {
      // binary search in offsets
      var lo = 0, hi = count;
      while (lo < hi) {
        var mid = (lo + hi) >> 1;
        if (offsets[mid + 1] <= y) lo = mid + 1; else hi = mid;
      }
      return Math.min(lo, count - 1);
    }

    function visibleRange() {
      var scrollTop = container.scrollTop;
      var viewH = container.clientHeight;
      var start = indexAtOffset(scrollTop);
      var end = indexAtOffset(scrollTop + viewH);
      start = Math.max(0, start - overscan);
      end = Math.min(count - 1, end + overscan);
      return [start, end];
    }

    function measureRow(index, node) {
      if (!node) return;
      var h = node.offsetHeight;
      if (h > 0 && Math.abs(h - heights[index]) > 1) {
        heights[index] = h;
        measured[index] = true;
        recomputeOffsets(index);
        applySpacers();
      }
    }

    function applySpacers() {
      var range = visibleRange();
      var start = range[0], end = range[1];
      spacerTop.style.height = offsets[start] + "px";
      spacerBottom.style.height = (totalHeight() - offsets[end + 1]) + "px";
    }

    function render() {
      rafPending = false;
      var range = visibleRange();
      var start = range[0], end = range[1];

      // Remove rows no longer in range
      Object.keys(mountedRows).forEach(function (k) {
        var idx = +k;
        if (idx < start || idx > end) {
          var n = mountedRows[idx];
          if (n && n.parentNode) n.parentNode.removeChild(n);
          delete mountedRows[idx];
        }
      });

      // Add rows newly in range (in order, between spacers)
      for (var i = start; i <= end; i++) {
        if (!mountedRows[i]) {
          var rowNode = renderRow(i); // returns a DOM node
          if (rowNode) {
            rowNode.setAttribute("data-vindex", i);
            // insert in correct order relative to already-mounted rows
            insertOrdered(rowNode, i);
            mountedRows[i] = rowNode;
            // measure after paint
            (function (idx, node) {
              requestAnimationFrame(function () { measureRow(idx, node); });
            })(i, rowNode);
          }
        }
      }

      applySpacers();

      if ((start !== lastStart || end !== lastEnd) && onRangeChange) {
        onRangeChange(start, end);
        lastStart = start; lastEnd = end;
      }
    }

    function insertOrdered(node, index) {
      // find the first mounted row with a greater index and insert before it
      var next = null;
      var mountedIdx = Object.keys(mountedRows).map(Number).sort(function (a, b) { return a - b; });
      for (var i = 0; i < mountedIdx.length; i++) {
        if (mountedIdx[i] > index) { next = mountedRows[mountedIdx[i]]; break; }
      }
      if (next) listEl.insertBefore(node, next);
      else listEl.insertBefore(node, spacerBottom);
    }

    function onScroll() {
      if (!rafPending) { rafPending = true; requestAnimationFrame(render); }
    }

    function mount(target) {
      listEl = target;
      listEl.style.position = "relative";
      spacerTop = document.createElement("div");
      spacerTop.setAttribute("data-vspacer", "top");
      spacerBottom = document.createElement("div");
      spacerBottom.setAttribute("data-vspacer", "bottom");
      listEl.appendChild(spacerTop);
      listEl.appendChild(spacerBottom);
      container.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      render();
    }

    function scrollToIndex(index) {
      index = Math.max(0, Math.min(count - 1, index));
      container.scrollTop = offsets[index];
      onScroll();
    }

    function destroy() {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      Object.keys(mountedRows).forEach(function (k) {
        var n = mountedRows[k];
        if (n && n.parentNode) n.parentNode.removeChild(n);
      });
      mountedRows = {};
      if (spacerTop && spacerTop.parentNode) spacerTop.parentNode.removeChild(spacerTop);
      if (spacerBottom && spacerBottom.parentNode) spacerBottom.parentNode.removeChild(spacerBottom);
    }

    return {
      mount: mount,
      scrollToIndex: scrollToIndex,
      destroy: destroy,
      refresh: onScroll,
      totalHeight: totalHeight
    };
  }

  window.DDP_VLIST = { create: create };
})();
