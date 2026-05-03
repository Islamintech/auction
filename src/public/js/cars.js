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

function getCarFromButton(button) {
    const row = button.closest('.car-row');
    if (!row || !row.dataset.car) return null;
    return JSON.parse(decodeURIComponent(row.dataset.car));
}

function openEditCarModal(button) {
    const car = getCarFromButton(button);
    const modal = document.getElementById('edit-car-modal');
    const form = document.getElementById('edit-car-form');
    const imageGrid = document.getElementById('edit-car-images');
    const partsList = document.getElementById('edit-damaged-parts-list');
    if (!car || !modal || !form) return;

    form.reset();
    form.elements._id.value = car._id;

    [
        'carTitle',
        'carBrand',
        'carType',
        'carCondition',
        'carStatus',
        'carYear',
        'carMileage',
        'carPrice',
        'carColor',
        'carMake',
        'carModel',
        'carFuel',
        'carTransmission',
        'carDamage',
        'carDamageDesc',
        'carDesc',
    ].forEach((name) => {
        if (form.elements[name]) form.elements[name].value = car[name] ?? '';
    });

    imageGrid.innerHTML = '';
    (car.carImages || []).forEach((image) => {
        const img = document.createElement('img');
        img.src = `/${image}`;
        img.alt = car.carTitle || 'car';
        img.className = 'w-full h-24 object-cover rounded border border-outline bg-black';
        imageGrid.appendChild(img);
    });
    if (!imageGrid.children.length) {
        imageGrid.innerHTML = '<div class="col-span-2 h-24 rounded border border-outline bg-black/40 flex items-center justify-center text-on-surface-faint text-xs font-mono uppercase">No images</div>';
    }

    partsList.innerHTML = '';
    (car.damagedParts || []).forEach((part) => addEditDamagedPart(part));
    toggleEditDamagedSection();
    modal.classList.remove('hidden');
}

function closeEditCarModal() {
    const modal = document.getElementById('edit-car-modal');
    if (modal) modal.classList.add('hidden');
}

function toggleEditDamagedSection() {
    const condition = document.getElementById('edit-car-condition');
    const section = document.getElementById('edit-damaged-section');
    const list = document.getElementById('edit-damaged-parts-list');
    if (!condition || !section || !list) return;

    if (condition.value === 'DAMAGED') {
        section.style.display = '';
        if (!list.children.length) addEditDamagedPart();
    } else {
        section.style.display = 'none';
        list.innerHTML = '';
    }
}

function addEditDamagedPart(part = {}) {
    const list = document.getElementById('edit-damaged-parts-list');
    if (!list) return;

    const row = document.createElement('div');
    row.className = 'grid grid-cols-12 gap-2 items-center';
    row.innerHTML = `
        <input type="text" name="damagedPartName" placeholder="Part name"
          class="col-span-4 bg-black/40 border border-outline rounded-lg focus:border-primary text-on-surface px-3 py-2 text-sm outline-none" />
        <div class="col-span-2 relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-faint text-sm">$</span>
          <input type="number" name="damagedPartPrice" min="0" placeholder="Price"
            class="w-full bg-black/40 border border-outline rounded-lg focus:border-primary text-primary font-mono px-6 py-2 text-sm outline-none" />
        </div>
        <input type="text" name="damagedPartOem" placeholder="OEM #"
          class="col-span-3 bg-black/40 border border-outline rounded-lg focus:border-primary text-on-surface px-3 py-2 text-sm outline-none" />
        <div class="col-span-2 relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-faint text-sm">$</span>
          <input type="number" name="damagedPartShip" min="0" placeholder="Ship"
            class="w-full bg-black/40 border border-outline rounded-lg focus:border-primary text-on-surface font-mono px-6 py-2 text-sm outline-none" />
        </div>
        <button type="button" onclick="this.parentElement.remove()"
          class="col-span-1 px-3 py-2 rounded border border-outline text-on-surface-faint hover:text-danger hover:border-danger text-xs">X</button>
    `;
    row.querySelector('[name="damagedPartName"]').value = part.name || '';
    row.querySelector('[name="damagedPartPrice"]').value = part.price ?? 0;
    row.querySelector('[name="damagedPartOem"]').value = part.oem || '';
    row.querySelector('[name="damagedPartShip"]').value = part.ship ?? 0;
    list.appendChild(row);
}

function collectEditDamagedParts(form) {
    const names = Array.from(form.querySelectorAll('[name="damagedPartName"]'));
    return names
        .map((input) => {
            const row = input.closest('.grid');
            return {
                name: input.value.trim(),
                price: Number(row.querySelector('[name="damagedPartPrice"]').value) || 0,
                oem: row.querySelector('[name="damagedPartOem"]').value.trim() || undefined,
                ship: Number(row.querySelector('[name="damagedPartShip"]').value) || 0,
            };
        })
        .filter((part) => part.name);
}

document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('edit-car-form');
    if (!editForm) return;

    editForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const carId = editForm.elements._id.value;
        const payload = {};
        const optionalFields = ['carColor', 'carMake', 'carModel', 'carDamage', 'carDamageDesc', 'carDesc'];

        [
            'carStatus',
            'carTitle',
            'carBrand',
            'carType',
            'carCondition',
            'carFuel',
            'carTransmission',
            'carYear',
            'carMileage',
            'carPrice',
            ...optionalFields,
        ].forEach((name) => {
            const value = editForm.elements[name]?.value;
            if (optionalFields.includes(name) && value === '') return;
            payload[name] = ['carYear', 'carMileage', 'carPrice'].includes(name) ? Number(value) : value;
        });

        payload.damagedParts = payload.carCondition === 'DAMAGED'
            ? collectEditDamagedParts(editForm)
            : [];

        if (payload.carCondition === 'DAMAGED' && !payload.damagedParts.length) {
            alert('Add at least one damaged part with its repair cost.');
            return;
        }

        fetch(`/admin/car/${carId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        .then((res) => {
            if (!res.ok) throw new Error('Update failed');
            return res.json();
        })
        .then(() => {
            alert('Car information updated');
            window.location.reload();
        })
        .catch(() => alert('Failed to update car information'));
    });
});

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
    row.className = 'grid grid-cols-12 gap-2 items-center';
    row.innerHTML = `
        <input type="text" name="damagedPartName" placeholder="Part name (e.g., Front bumper)"
          class="col-span-4 bg-black/40 border border-outline rounded-lg focus:border-primary text-on-surface px-3 py-2 text-sm outline-none" />
        <div class="col-span-2 relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-faint text-sm">$</span>
          <input type="number" name="damagedPartPrice" min="0" placeholder="Price"
            class="w-full bg-black/40 border border-outline rounded-lg focus:border-primary text-primary font-mono px-6 py-2 text-sm outline-none" />
        </div>
        <input type="text" name="damagedPartOem" placeholder="OEM #"
          class="col-span-3 bg-black/40 border border-outline rounded-lg focus:border-primary text-on-surface px-3 py-2 text-sm outline-none" />
        <div class="col-span-2 relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-faint text-sm">$</span>
          <input type="number" name="damagedPartShip" min="0" placeholder="Ship"
            class="w-full bg-black/40 border border-outline rounded-lg focus:border-primary text-on-surface font-mono px-6 py-2 text-sm outline-none" />
        </div>
        <button type="button" onclick="this.parentElement.remove()"
          class="col-span-1 px-3 py-2 rounded border border-outline text-on-surface-faint hover:text-danger hover:border-danger text-xs">✕</button>
    `;
    list.appendChild(row);
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('carCondition')) toggleDamagedSection();
});
