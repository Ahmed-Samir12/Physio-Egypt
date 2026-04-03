// src/public/js/components/skeleton.js
function renderTableSkeleton(tbody, rows = 6, cols = 6) {
  tbody.innerHTML = "";
  for (let row = 0; row < rows; row++) {
    const tr = document.createElement("tr");
    for (let col = 0; col < cols; col++) {
      const td = document.createElement("td");
      const skeleton = document.createElement("div");
      skeleton.className = "skeleton skeleton-text";
      skeleton.style.width = `${Math.max(40, 90 - col * 6)}%`;
      td.appendChild(skeleton);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}
function renderCardsSkeleton(container, count = 6) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "card card-pad skeleton skeleton-card";
    container.appendChild(card);
  }
}

export {
  renderTableSkeleton,
  renderCardsSkeleton
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vanMvY29tcG9uZW50cy9za2VsZXRvbi5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZnVuY3Rpb24gcmVuZGVyVGFibGVTa2VsZXRvbih0Ym9keSwgcm93cyA9IDYsIGNvbHMgPSA2KSB7XHJcbiAgdGJvZHkuaW5uZXJIVE1MID0gJyc7XHJcbiAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgcm93czsgcm93KyspIHtcclxuICAgIGNvbnN0IHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IGNvbHM7IGNvbCsrKSB7XHJcbiAgICAgIGNvbnN0IHRkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuICAgICAgY29uc3Qgc2tlbGV0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgc2tlbGV0b24uY2xhc3NOYW1lID0gJ3NrZWxldG9uIHNrZWxldG9uLXRleHQnO1xyXG4gICAgICBza2VsZXRvbi5zdHlsZS53aWR0aCA9IGAke01hdGgubWF4KDQwLCA5MCAtIGNvbCAqIDYpfSVgO1xyXG4gICAgICB0ZC5hcHBlbmRDaGlsZChza2VsZXRvbik7XHJcbiAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcclxuICAgIH1cclxuICAgIHRib2R5LmFwcGVuZENoaWxkKHRyKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlckNhcmRzU2tlbGV0b24oY29udGFpbmVyLCBjb3VudCA9IDYpIHtcclxuICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcbiAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBjYXJkLmNsYXNzTmFtZSA9ICdjYXJkIGNhcmQtcGFkIHNrZWxldG9uIHNrZWxldG9uLWNhcmQnO1xyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNhcmQpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IHsgcmVuZGVyVGFibGVTa2VsZXRvbiwgcmVuZGVyQ2FyZHNTa2VsZXRvbiB9O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsU0FBUyxvQkFBb0IsT0FBTyxPQUFPLEdBQUcsT0FBTyxHQUFHO0FBQ3RELFFBQU0sWUFBWTtBQUNsQixXQUFTLE1BQU0sR0FBRyxNQUFNLE1BQU0sT0FBTztBQUNuQyxVQUFNLEtBQUssU0FBUyxjQUFjLElBQUk7QUFDdEMsYUFBUyxNQUFNLEdBQUcsTUFBTSxNQUFNLE9BQU87QUFDbkMsWUFBTSxLQUFLLFNBQVMsY0FBYyxJQUFJO0FBQ3RDLFlBQU0sV0FBVyxTQUFTLGNBQWMsS0FBSztBQUM3QyxlQUFTLFlBQVk7QUFDckIsZUFBUyxNQUFNLFFBQVEsR0FBRyxLQUFLLElBQUksSUFBSSxLQUFLLE1BQU0sQ0FBQyxDQUFDO0FBQ3BELFNBQUcsWUFBWSxRQUFRO0FBQ3ZCLFNBQUcsWUFBWSxFQUFFO0FBQUEsSUFDbkI7QUFDQSxVQUFNLFlBQVksRUFBRTtBQUFBLEVBQ3RCO0FBQ0Y7QUFFQSxTQUFTLG9CQUFvQixXQUFXLFFBQVEsR0FBRztBQUNqRCxZQUFVLFlBQVk7QUFDdEIsV0FBUyxJQUFJLEdBQUcsSUFBSSxPQUFPLEtBQUs7QUFDOUIsVUFBTSxPQUFPLFNBQVMsY0FBYyxLQUFLO0FBQ3pDLFNBQUssWUFBWTtBQUNqQixjQUFVLFlBQVksSUFBSTtBQUFBLEVBQzVCO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
