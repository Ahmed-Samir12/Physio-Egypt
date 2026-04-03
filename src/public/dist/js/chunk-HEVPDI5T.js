// src/public/js/components/skeleton.js
function renderTableSkeleton(tbody, rows = 6, cols = 6) {
  tbody.innerHTML = "";
  for (let r = 0; r < rows; r++) {
    const tr = document.createElement("tr");
    for (let c = 0; c < cols; c++) {
      const td = document.createElement("td");
      const sk = document.createElement("div");
      sk.className = "skeleton skeleton-text";
      sk.style.width = `${Math.max(40, 90 - c * 6)}%`;
      td.appendChild(sk);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vanMvY29tcG9uZW50cy9za2VsZXRvbi5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZnVuY3Rpb24gcmVuZGVyVGFibGVTa2VsZXRvbih0Ym9keSwgcm93cyA9IDYsIGNvbHMgPSA2KSB7XHJcbiAgdGJvZHkuaW5uZXJIVE1MID0gJyc7XHJcbiAgZm9yIChsZXQgciA9IDA7IHIgPCByb3dzOyByKyspIHtcclxuICAgIGNvbnN0IHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgIGZvciAobGV0IGMgPSAwOyBjIDwgY29sczsgYysrKSB7XHJcbiAgICAgIGNvbnN0IHRkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuICAgICAgY29uc3Qgc2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgc2suY2xhc3NOYW1lID0gJ3NrZWxldG9uIHNrZWxldG9uLXRleHQnO1xyXG4gICAgICBzay5zdHlsZS53aWR0aCA9IGAke01hdGgubWF4KDQwLCA5MCAtIGMgKiA2KX0lYDtcclxuICAgICAgdGQuYXBwZW5kQ2hpbGQoc2spO1xyXG4gICAgICB0ci5hcHBlbmRDaGlsZCh0ZCk7XHJcbiAgICB9XHJcbiAgICB0Ym9keS5hcHBlbmRDaGlsZCh0cik7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJDYXJkc1NrZWxldG9uKGNvbnRhaW5lciwgY291bnQgPSA2KSB7XHJcbiAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgY2FyZC5jbGFzc05hbWUgPSAnY2FyZCBjYXJkLXBhZCBza2VsZXRvbiBza2VsZXRvbi1jYXJkJztcclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjYXJkKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7IHJlbmRlclRhYmxlU2tlbGV0b24sIHJlbmRlckNhcmRzU2tlbGV0b24gfTtcclxuXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxTQUFTLG9CQUFvQixPQUFPLE9BQU8sR0FBRyxPQUFPLEdBQUc7QUFDdEQsUUFBTSxZQUFZO0FBQ2xCLFdBQVMsSUFBSSxHQUFHLElBQUksTUFBTSxLQUFLO0FBQzdCLFVBQU0sS0FBSyxTQUFTLGNBQWMsSUFBSTtBQUN0QyxhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sS0FBSztBQUM3QixZQUFNLEtBQUssU0FBUyxjQUFjLElBQUk7QUFDdEMsWUFBTSxLQUFLLFNBQVMsY0FBYyxLQUFLO0FBQ3ZDLFNBQUcsWUFBWTtBQUNmLFNBQUcsTUFBTSxRQUFRLEdBQUcsS0FBSyxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztBQUM1QyxTQUFHLFlBQVksRUFBRTtBQUNqQixTQUFHLFlBQVksRUFBRTtBQUFBLElBQ25CO0FBQ0EsVUFBTSxZQUFZLEVBQUU7QUFBQSxFQUN0QjtBQUNGO0FBRUEsU0FBUyxvQkFBb0IsV0FBVyxRQUFRLEdBQUc7QUFDakQsWUFBVSxZQUFZO0FBQ3RCLFdBQVMsSUFBSSxHQUFHLElBQUksT0FBTyxLQUFLO0FBQzlCLFVBQU0sT0FBTyxTQUFTLGNBQWMsS0FBSztBQUN6QyxTQUFLLFlBQVk7QUFDakIsY0FBVSxZQUFZLElBQUk7QUFBQSxFQUM1QjtBQUNGOyIsCiAgIm5hbWVzIjogW10KfQo=
