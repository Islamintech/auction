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
    const year  = document.querySelector('[name="carYear"]').value;
    const price = document.querySelector('[name="carPrice"]').value;
    if (!title || !brand || !year || !price) {
        alert('Please fill in all required fields');
        return false;
    }
    return true;
}