function renderTableSkeleton(tbody, rows = 6, cols = 6) {
  tbody.innerHTML = '';
  for (let row = 0; row < rows; row++) {
    const tr = document.createElement('tr');
    for (let col = 0; col < cols; col++) {
      const td = document.createElement('td');
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton skeleton-text';
      skeleton.style.width = `${Math.max(40, 90 - col * 6)}%`;
      td.appendChild(skeleton);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

function renderCardsSkeleton(container, count = 6) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'card card-pad skeleton skeleton-card';
    container.appendChild(card);
  }
}

export { renderTableSkeleton, renderCardsSkeleton };
