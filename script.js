document.addEventListener('DOMContentLoaded', () => {
    // Select DOM elements
    const addButton = document.getElementById('add-button');
    const addFormWrapper = document.getElementById('add-form-wrapper');
    const addForm = document.getElementById('add-form');
    const cancelButton = document.getElementById('cancel-button');
    const typeSelect = document.getElementById('type-select');
    const categoryInput = document.getElementById('category-input');
    const amountInput = document.getElementById('amount-input');
    const dataList = document.getElementById('data-list'); // tbody
    const searchInputEl = document.getElementById('search-input');
    const savedData = document.getElementById('saved-data')
    const searchWrapper = document.getElementById('search-wrapper')


    // Guard
    if (!addButton || !addFormWrapper || !addForm || !cancelButton ||
        !typeSelect || !categoryInput || !amountInput || !dataList ||
        !searchInputEl) {
        console.error('One or more elements not found (check your IDs, especially search-button).');
        return;
    }

    // Show form
    addButton.addEventListener('click', () => {
        addFormWrapper.style.display = 'block';
        savedData.style.display = 'none'
        searchWrapper.style.display = 'none'
    });

    // Hide form
    cancelButton.addEventListener('click', () => {
        addFormWrapper.style.display = 'none';
        savedData.style.display = 'block'
        searchWrapper.style.display = 'block'
        addForm.reset();
    });

    // Submit
    addForm.addEventListener('submit', (event) => {
        event.preventDefault();
        savedData.style.display = 'block'
        searchWrapper.style.display = 'block'
        const formData = {
            type: typeSelect.value.toLowerCase(),
            category: categoryInput.value.trim(),
            amount: parseFloat(amountInput.value),
            // timestamp: new Date().toLocaleString() // add if you want a timestamp column
        };

        if (formData.category && !isNaN(formData.amount)) {
            const savedEntries = JSON.parse(localStorage.getItem('formEntries')) || [];
            savedEntries.push(formData);
            localStorage.setItem('formEntries', JSON.stringify(savedEntries));

            displaySavedEntries();
            addForm.reset();
            addFormWrapper.style.display = 'none';
            filterRows(); // re-apply current filter after adding
        } else {
            console.error('Invalid input: category or amount is missing/invalid');
        }

    });

    let currentPage = 1;
    const rowsPerPage = 5;
    let searchTerm = '';

    // Main function to display table
    function displaySavedEntries(page = 1) {
        const savedEntries = JSON.parse(localStorage.getItem('formEntries')) || [];

        // Filter entries based on search
        const filteredEntries = savedEntries.filter(entry => {
            const text = `${entry.type} ${entry.category} ${entry.amount}`.toLowerCase();
            return text.includes(searchTerm.toLowerCase());
        });

        const dataList = document.getElementById('data-list');
        dataList.innerHTML = '';

        // Pagination
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedEntries = filteredEntries.slice(start, end);

        paginatedEntries.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
      <td>${entry.type}</td>
      <td>${entry.category}</td>
      <td>Rs.${entry.amount}</td>
    `;
            dataList.appendChild(row);
        });

        updatePagination(filteredEntries.length, page);
        updateTotals();
    }

    // Pagination buttons
    function updatePagination(totalItems, page) {
        let pagination = document.getElementById('pagination');
        if (!pagination) {
            pagination = document.createElement('div');
            pagination.id = 'pagination';
            pagination.style.marginTop = '10px';
            document.getElementById('saved-data').appendChild(pagination);
        }
        pagination.innerHTML = '';

        const totalPages = Math.ceil(totalItems / rowsPerPage);

        // Prev
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Prev';
        prevBtn.disabled = page === 1;
        prevBtn.addEventListener('click', () => {
            currentPage--;
            displaySavedEntries(currentPage);
        });
        pagination.appendChild(prevBtn);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.disabled = i === page;
            btn.addEventListener('click', () => {
                currentPage = i;
                displaySavedEntries(currentPage);
            });
            pagination.appendChild(btn);
        }

        // Next
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.disabled = page === totalPages || totalPages === 0;
        nextBtn.addEventListener('click', () => {
            currentPage++;
            displaySavedEntries(currentPage);
        });
        pagination.appendChild(nextBtn);
    }

    // Search input
    searchInputEl.addEventListener('input', () => {
        searchTerm = searchInputEl.value.trim();
        currentPage = 1; // reset to first page
        displaySavedEntries(currentPage);
    });


    // Search/filter
    function filterRows() {
        const term = searchInputEl.value.trim().toLowerCase();
        const rows = document.querySelectorAll('#data-table tbody tr'); // re-query each time

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    }

    // Events for search
    searchInputEl.addEventListener('input', filterRows); // live as you type
    searchInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') filterRows();
    });

    // Initial load
    displaySavedEntries(currentPage);
    updateTotals()
});
