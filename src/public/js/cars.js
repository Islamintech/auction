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

    // Selling requires buyer details — collect them through the sale modal.
    if (carStatus === 'SOLD') {
        openSaleModal(select);
        return;
    }

    fetch(`/admin/car/${carId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carStatus }),
    })
    .then(res => res.json())
    .then(() => window.location.reload())
    .catch(() => alert('Failed to update'));
}

// Record-sale modal
let saleSourceSelect = null;

function openSaleModal(select) {
    saleSourceSelect = select;
    const row = select.closest('.car-row');
    const car = row && row.dataset.car ? JSON.parse(decodeURIComponent(row.dataset.car)) : {};
    const modal = document.getElementById('sale-modal');
    const form = document.getElementById('sale-form');
    if (!modal || !form) return;

    form.reset();
    form.elements._id.value = car._id || select.id;
    const titleEl = document.getElementById('sale-car-title');
    if (titleEl) titleEl.textContent = car.carTitle || '';
    form.elements.carVin.value = car.carVin || '';
    form.elements.buyerName.value = car.buyerName || '';
    if (car.salePrice != null) form.elements.salePrice.value = car.salePrice;
    // Pre-fill the saved sale date, otherwise default to today.
    form.elements.saleDate.value = car.saleDate
        ? new Date(car.saleDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

    modal.classList.remove('hidden');
}

function closeSaleModal() {
    const modal = document.getElementById('sale-modal');
    if (modal) modal.classList.add('hidden');
    // Revert the dropdown to the car's saved status since the sale was not confirmed.
    if (saleSourceSelect) {
        const row = saleSourceSelect.closest('.car-row');
        const car = row && row.dataset.car ? JSON.parse(decodeURIComponent(row.dataset.car)) : null;
        if (car && car.carStatus) saleSourceSelect.value = car.carStatus;
    }
    saleSourceSelect = null;
}

document.addEventListener('DOMContentLoaded', () => {
    const saleForm = document.getElementById('sale-form');
    if (!saleForm) return;

    saleForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const carId = saleForm.elements._id.value;
        const carVin = saleForm.elements.carVin.value.trim().toUpperCase();
        const buyerName = saleForm.elements.buyerName.value.trim();
        const salePrice = Number(saleForm.elements.salePrice.value);
        const saleDate = saleForm.elements.saleDate.value;

        if (!carVin || !buyerName || !(salePrice >= 0) || !saleDate) {
            alert('Enter the VIN, buyer name, sale price and sale date.');
            return;
        }

        fetch(`/admin/car/${carId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carStatus: 'SOLD', carVin, buyerName, salePrice, saleDate }),
        })
        .then((res) => {
            if (!res.ok) throw new Error('Update failed');
            return res.json();
        })
        .then(() => {
            saleSourceSelect = null;
            alert('Sale recorded');
            window.location.reload();
        })
        .catch(() => alert('Failed to record sale'));
    });
});

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
    if (!car || !modal || !form) return;

    form.reset();
    form.elements._id.value = car._id;

    [
        'carTitle',
        'carVin',
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
        'carDesc',
    ].forEach((name) => {
        if (form.elements[name]) form.elements[name].value = car[name] ?? '';
    });

    imageGrid.innerHTML = '';
    (car.carImages || []).forEach((image) => {
        const img = document.createElement('img');
        img.src = /^https?:\/\//.test(image) ? image : `/${image}`;
        img.alt = car.carTitle || 'car';
        img.className = 'w-full h-24 object-cover rounded border border-outline bg-black';
        imageGrid.appendChild(img);
    });
    if (!imageGrid.children.length) {
        imageGrid.innerHTML = '<div class="col-span-2 h-24 rounded border border-outline bg-black/40 flex items-center justify-center text-on-surface-faint text-xs font-mono uppercase">No images</div>';
    }

    modal.classList.remove('hidden');
}

function closeEditCarModal() {
    const modal = document.getElementById('edit-car-modal');
    if (modal) modal.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('edit-car-form');
    if (!editForm) return;

    editForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const carId = editForm.elements._id.value;
        const payload = {};
        const optionalFields = ['carVin', 'carColor', 'carMake', 'carModel', 'carDesc'];

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
            payload[name] = name === 'carMileage' ? Number(value) : value;
        });

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
    return true;
}
