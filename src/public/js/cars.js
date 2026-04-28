// Image preview — cover
function previewImage(input, index) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById(`preview-${index}`);
            preview.src = e.target.result;
            preview.style.display = 'block';
            const icon = document.getElementById('cover-icon');
            if (icon) icon.style.display = 'none';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Secondary image inputs
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.secondary-file-input').forEach(input => {
        input.addEventListener('change', function() {
            const index = this.dataset.index;
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.getElementById(`preview-${index}`);
                    const icon    = document.getElementById(`icon-${index}`);
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    if (icon) icon.style.display = 'none';
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    });

    // Discard button closes details
    const discardBtn = document.getElementById('discard-btn');
    if (discardBtn) {
        discardBtn.addEventListener('click', () => {
            document.querySelector('details').removeAttribute('open');
        });
    }
});

// Search filter
function filterCars() {
    const query = document.getElementById('search-input').value.toLowerCase();
    document.querySelectorAll('.car-row').forEach(row => {
        const title = row.dataset.title || '';
        const brand = row.dataset.brand || '';
        row.style.display = (title.includes(query) || brand.includes(query)) ? '' : 'none';
    });
}

// Update status
function updateCarStatus(select) {
    const carId     = select.id;
    const carStatus = select.value;
    fetch(`/admin/car/${carId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carStatus }),
    })
    .then(res => res.json())
    .then(() => alert('Status updated'))
    .catch(() => alert('Failed to update'));
}

// Delete car
function deleteCar(id) {
    if (!confirm('Delete this car permanently?')) return;
    fetch(`/admin/car/${id}/delete`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if (data.data) {
                window.location.reload();
            } else {
                alert('Failed to delete');
            }
        })
        .catch(() => alert('Failed to delete'));
}

// Validate form
function validateCarForm() {
    const title = document.querySelector('[name="carTitle"]').value;
    const brand = document.querySelector('[name="carBrand"]').value;
    const type  = document.querySelector('[name="carType"]').value;
    const cond  = document.querySelector('[name="carCondition"]').value;
    const year  = document.querySelector('[name="carYear"]').value;
    const price = document.querySelector('[name="carPrice"]').value;
    if (!title || !brand || !type || !cond || !year || !price) {
        alert('Please fill in all required fields');
        return false;
    }
    if (cond === 'DAMAGED') {
        const names = document.querySelectorAll('[name="damagedPartName"]');
        if (!names.length) {
            alert('Add at least one damaged part with its repair cost.');
            return false;
        }
        for (const n of names) {
            if (!n.value.trim()) { alert('Damaged part name cannot be empty.'); return false; }
        }
    }
    return true;
}

// Damaged parts dynamic list
function toggleDamagedSection() {
    const cond = document.getElementById('carCondition').value;
    const section = document.getElementById('damaged-section');
    const list = document.getElementById('damaged-parts-list');
    if (cond === 'DAMAGED') {
        section.style.display = '';
        if (!list.children.length) addDamagedPart();
    } else {
        section.style.display = 'none';
        list.innerHTML = '';
    }
}

function addDamagedPart() {
    const list = document.getElementById('damaged-parts-list');
    const row = document.createElement('div');
    row.className = 'flex gap-2 items-center';
    row.innerHTML = `
        <input type="text" name="damagedPartName" placeholder="e.g., Front bumper"
          class="flex-[2] bg-black/40 border border-outline rounded-lg focus:border-primary text-on-surface px-3 py-2 text-sm outline-none" />
        <div class="flex-1 relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-faint text-sm">$</span>
          <input type="number" name="damagedPartCost" min="0" placeholder="0"
            class="w-full bg-black/40 border border-outline rounded-lg focus:border-primary text-primary font-mono px-6 py-2 text-sm outline-none" />
        </div>
        <button type="button" onclick="this.parentElement.remove()"
          class="px-3 py-2 rounded border border-outline text-on-surface-faint hover:text-danger hover:border-danger text-xs">✕</button>
    `;
    list.appendChild(row);
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('carCondition')) toggleDamagedSection();
});