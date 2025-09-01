
        // Use localStorage for persistent storage
        const ITEMS_STORAGE_KEY = 'itemsData';
        
        // Initialize items from localStorage or empty array
        let items = JSON.parse(localStorage.getItem(ITEMS_STORAGE_KEY)) || [];
        let editingIndex = -1;
        let deleteIndex = -1;

        // DOM elements
        const form = document.getElementById('itemForm');
        const tableBody = document.getElementById('tableBody');
        const submitBtn = document.getElementById('submitBtn');
        const imageInput = document.getElementById('image');
        const imagePreview = document.getElementById('imagePreview');
        const fileName = document.getElementById('file-name');
        const deleteModal = document.getElementById('deleteModal');
        const confirmDeleteBtn = document.getElementById('confirmDelete');

        // Load data on page load
        document.addEventListener('DOMContentLoaded', function() {
            displayItems();
        });

        function displayItems() {
            if (items.length === 0) {
                tableBody.innerHTML = `
                    <tr class="no-data">
                        <td colspan="5">No items yet. Add your first item above! 🚀</td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = items.map((item, index) => `
                <tr class="table-row" draggable="true" data-index="${index}">
                    <td class="drag-handle">⋮⋮</td>
                    <td>
                        ${item.image ? 
                            `<img src="${item.image}" alt="${item.name}" class="table-img">` : 
                            '<div style="width:60px;height:60px;background:#f0f0f0;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#999;">📷</div>'
                        }
                    </td>
                    <td><strong>${(item.name)}</strong></td>
                    <td>${(item.description)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-success btn-small" onclick="editItem(${index})">
                                ✏️ Edit
                            </button>
                            <button class="btn btn-danger btn-small" onclick="confirmDeleteItem(${index})">
                                🗑️ Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            // Add drag and drop functionality
            addDragAndDrop();
        }
        function addDragAndDrop() {
            const rows = tableBody.querySelectorAll('.table-row');
            
            rows.forEach(row => {
                row.addEventListener('dragstart', function(e) {
                    e.dataTransfer.setData('text/plain', row.dataset.index);
                    row.classList.add('dragging');
                });
                
                row.addEventListener('dragend', function() {
                    row.classList.remove('dragging');
                });
                
                row.addEventListener('dragover', function(e) {
                    e.preventDefault();
                });
                
                row.addEventListener('drop', function(e) {
                    e.preventDefault();
                    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    const targetIndex = parseInt(row.dataset.index);
                    
                    if (draggedIndex !== targetIndex) {
                        // Reorder items
                        const draggedItem = items.splice(draggedIndex, 1)[0];
                        items.splice(targetIndex, 0, draggedItem);
                        
                        // Update editing index if needed
                        if (editingIndex === draggedIndex) {
                            editingIndex = targetIndex;
                        } else if (editingIndex === targetIndex) {
                            editingIndex = draggedIndex > targetIndex ? editingIndex + 1 : editingIndex - 1;
                        }
                        
                        // Save to localStorage after reordering
                        saveToLocalStorage();
                        displayItems();
                    }
                });
            });
        }
        // Save items to localStorage
        function saveToLocalStorage() {
            localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
        }

        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const item = {
                id: editingIndex >= 0 ? items[editingIndex].id : Date.now(),
                name: formData.get('name'),
                description: formData.get('description'),
                image: null
            };

            // Handle image
            const imageFile = formData.get('image');
            if (imageFile && imageFile.size > 0) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    item.image = e.target.result;
                    saveItem(item);
                };
                reader.readAsDataURL(imageFile);
            }
            //editing index tracks how row is being edited
             else if (editingIndex >= 0 && items[editingIndex].image) {
                item.image = items[editingIndex].image;
                saveItem(item);
            } else {
                saveItem(item);
            }
        });

        function saveItem(item) {
            if (editingIndex >= 0) {
                items[editingIndex] = item;
                editingIndex = -1;
                submitBtn.innerHTML = '✨ Add Item';
            } else {
                items.push(item);
            }
            
            // Save to localStorage
            saveToLocalStorage();
            
            form.reset();
            imagePreview.innerHTML = '';
            fileName.textContent = '';
            displayItems();
        }

        // Image preview
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                fileName.textContent = file.name;
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            } else {
                fileName.textContent = '';
                imagePreview.innerHTML = '';
            }
        });

        

        function editItem(index) {
            const item = items[index];
            editingIndex = index;
            
            document.getElementById('name').value = item.name;
            document.getElementById('description').value = item.description;
            
            if (item.image) {
                imagePreview.innerHTML = `<img src="${item.image}" alt="Preview">`;
                fileName.textContent = 'Current image';
            }
            
            submitBtn.innerHTML = '🔄 Update Item';
            
            // Scroll to form
            document.querySelector('.form-container').scrollIntoView({ 
                behavior: 'smooth' 
            });
        }

        function confirmDeleteItem(index) {
            deleteIndex = index;
            deleteModal.style.display = 'flex';
        }

        function closeModal() {
            deleteModal.style.display = 'none';
            deleteIndex = -1;
        }

        confirmDeleteBtn.addEventListener('click', function() {
            if (deleteIndex >= 0) {
                items.splice(deleteIndex, 1);
                // Save to localStorage after deletion
                saveToLocalStorage();
                displayItems();
                closeModal();
                
                // Reset form if editing deleted item
                if (editingIndex === deleteIndex) {
                    form.reset();
                    imagePreview.innerHTML = '';
                    fileName.textContent = '';
                    submitBtn.innerHTML = '✨ Add Item';
                    editingIndex = -1;
                } else if (editingIndex > deleteIndex) {
                    editingIndex--;
                }
            }
        });

        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === deleteModal) {
                closeModal();
            }
        });

        

    