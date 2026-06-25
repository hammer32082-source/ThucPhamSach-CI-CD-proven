const adminStatus = document.getElementById("admin-status");

const categoryFormCard = document.getElementById("category-form-card");
const categoryFormTitle = document.getElementById("category-form-title");
const categoryFormHint = document.getElementById("category-form-hint");
const categoryList = document.getElementById("category-list");
const categoryId = document.getElementById("category-id");
const categoryParentName = document.getElementById("category-parent-name");
const categoryChildName = document.getElementById("category-child-name");
const categorySubmit = document.getElementById("category-submit");
const productCategory = document.getElementById("product-category");
const categoryStats = document.getElementById("category-stats");
const addChildNameBtn = document.getElementById("add-child-name-btn");
const childNamesContainer = document.getElementById("child-names-container");

const productForm = document.getElementById("product-form");
const productList = document.getElementById("product-list");
const productId = document.getElementById("product-id");
const productModalTitle = document.getElementById("product-modal-title");
const saveProductButton = document.getElementById("save-product");
const productModal = document.getElementById("product-modal");
const closeProductModal = document.getElementById("close-product-modal");
const startAddProduct = document.getElementById("start-add-product");
const productImageChange = document.getElementById("product-image-change");
const productImageDelete = document.getElementById("product-image-delete");

const customerSearch = document.getElementById("customer-search");
const customerList = document.getElementById("customer-list");
const customerKeyword = document.getElementById("customer-keyword");

const orderList = document.getElementById("order-list");

let categories = [];
let products = [];
let orders = [];
let productImageBase64 = null;

function showAdminStatus(message, type = "normal") {
    TPS.setStatus(adminStatus, message, type);
}

// Modal functions
function openProductModal(mode = "add", productId = "") {
    productModal.style.display = "flex";
    
    if (mode === "add") {
        productModalTitle.textContent = "Thêm sản phẩm";
        saveProductButton.textContent = "Đăng sản phẩm";
        productId.value = "";
        productForm.reset();
        productImageBase64 = null;
        document.getElementById("product-image-preview-wrap").style.display = "none";
        document.getElementById("product-image-button").style.display = "inline-block";
        document.getElementById("product-image-change").style.display = "none";
        document.getElementById("product-image-delete").style.display = "none";
    } else if (mode === "edit" && productId) {
        productModalTitle.textContent = "Sửa sản phẩm";
        saveProductButton.textContent = "Cập nhật thông tin";
        const product = products.find((x) => TPS.getField(x, "maSp", "MaSp") === productId);
        if (product) {
            document.getElementById("product-id").value = productId;
            document.getElementById("product-category").value = TPS.getField(product, "maDanhMuc", "MaDanhMuc") || "";
            document.getElementById("product-name").value = TPS.getField(product, "tenSp", "TenSp") || "";
            document.getElementById("product-price").value = TPS.getField(product, "gia", "Gia") || "";
            document.getElementById("product-stock").value = TPS.getField(product, "soLuongTon", "SoLuongTon") || "";
            document.getElementById("product-unit").value = TPS.getField(product, "donViTinh", "DonViTinh") || "";
            document.getElementById("product-origin").value = TPS.getField(product, "nguonGoc", "NguonGoc") || "";
            document.getElementById("product-description").value = TPS.getField(product, "moTa", "MoTa") || "";
            document.getElementById("product-expiry").value = TPS.getField(product, "hanSuDung", "HanSuDung") || "";
            
            // Handle image
            const hinhAnh = TPS.getField(product, "hinhAnh", "HinhAnh");
            if (hinhAnh) {
                document.getElementById("product-image-preview").src = hinhAnh;
                document.getElementById("product-image-preview-wrap").style.display = "block";
                productImageBase64 = hinhAnh;
                document.getElementById("product-image-button").style.display = "none";
                document.getElementById("product-image-change").style.display = "inline-block";
                document.getElementById("product-image-delete").style.display = "inline-block";
            } else {
                document.getElementById("product-image-preview-wrap").style.display = "none";
                productImageBase64 = null;
                document.getElementById("product-image-button").style.display = "inline-block";
                document.getElementById("product-image-change").style.display = "none";
                document.getElementById("product-image-delete").style.display = "none";
            }
        }
    }
}

function closeProductModalFn() {
    productModal.style.display = "none";
    productForm.reset();
    productId.value = "";
    productImageBase64 = null;
    document.getElementById("product-image-preview-wrap").style.display = "none";
    document.getElementById("product-image-button").style.display = "inline-block";
    document.getElementById("product-image-change").style.display = "none";
    document.getElementById("product-image-delete").style.display = "none";
}

// Event listeners for modal
startAddProduct?.addEventListener("click", () => {
    openProductModal("add");
});

closeProductModal?.addEventListener("click", () => {
    closeProductModalFn();
});

productModal?.addEventListener("click", (event) => {
    if (event.target === productModal) {
        closeProductModalFn();
    }
});

document.getElementById("reset-product")?.addEventListener("click", () => {
    closeProductModalFn();
});

// Event listeners for image buttons
productImageChange?.addEventListener("click", () => {
    document.getElementById("product-image").click();
});

productImageDelete?.addEventListener("click", () => {
    productImageBase64 = null;
    document.getElementById("product-image-preview-wrap").style.display = "none";
    document.getElementById("product-image-button").style.display = "inline-block";
    document.getElementById("product-image-change").style.display = "none";
    document.getElementById("product-image-delete").style.display = "none";
});

function activateTab(tab) {
    document.querySelectorAll("[data-tab]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.tab === tab);
    });
    document.querySelectorAll("[data-panel]").forEach((panel) => {
        panel.classList.toggle("is-hidden", panel.dataset.panel !== tab);
    });
    
    // Show/hide add product button based on active tab
    const addProductButton = document.getElementById("start-add-product");
    if (addProductButton) {
        addProductButton.style.display = tab === "products" ? "inline-block" : "none";
    }
    
    sessionStorage.setItem("adminActiveTab", tab);
}

async function loadCategories() {
    const payload = await TPS.request("/api/DanhMuc");
    categories = TPS.unwrap(payload) || [];
    renderCategories();
    renderCategoryOptions();
}

function renderCategoryOptions() {
    const tree = TPS.buildCategoryTree(categories);
    const leafOptions = tree.flatMap(({ root, children }) =>
        children.map((item) => ({
            id: TPS.getField(item, "maDanhMuc", "MaDanhMuc"),
            name: `${TPS.viText(TPS.getField(root, "tenDanhMuc", "TenDanhMuc"))} › ${TPS.viText(TPS.getField(item, "tenDanhMuc", "TenDanhMuc"))}`
        }))
    );

    const optionHtml = (items) => items.map((cat) =>
        `<option value="${TPS.escapeHtml(cat.id)}">${TPS.escapeHtml(cat.name)}</option>`
    ).join("");

    productCategory.innerHTML = leafOptions.length
        ? optionHtml(leafOptions)
        : `<option value="">Chưa có danh mục con</option>`;
}

function setCategoryFormMode(mode = "create", editingId = "", editingItem = null) {
    document.querySelectorAll(".tree-node, .tree-child").forEach((node) => {
        node.classList.remove("is-editing");
    });

    if (editingId) {
        document.querySelector(`[data-edit-category="${editingId}"]`)?.closest(".tree-node, .tree-child")
            ?.classList.add("is-editing");
    }

    if (mode === "edit") {
        categoryFormTitle.textContent = "Sửa danh mục";
        categoryFormHint.textContent = "Cập nhật tên danh mục.";
        categorySubmit.textContent = "Cập nhật danh mục";
        return;
    }

    categoryFormTitle.textContent = "Thêm danh mục mới";
    categoryFormHint.textContent = "Điền tên danh mục cha và/hoặc danh mục con. Bạn có thể chỉ điền một trong hai.";
    categorySubmit.textContent = "Lưu danh mục";
}

function getProductCategoryLabel(product) {
    const info = TPS.formatProductCategory(product, categories);
    if (info.parentName && info.childName) {
        return `${info.parentName} › ${info.childName}`;
    }

    return info.childName;
}

function openCategoryFormForRoot() {
    resetCategoryForm(false);
    setCategoryFormMode("create");
    categoryParentName.focus();
}

function openCategoryFormForEdit(item) {
    const editId = TPS.getField(item, "maDanhMuc", "MaDanhMuc");
    const parentId = TPS.getField(item, "maDanhMucCha", "MaDanhMucCha") || "";
    const name = TPS.getField(item, "tenDanhMuc", "TenDanhMuc");

    categoryId.value = editId;
    categoryParentName.value = "";
    categoryChildName.value = name;
    
    if (parentId) {
        categoryChildName.focus();
    } else {
        categoryParentName.value = name;
        categoryParentName.focus();
    }
    
    setCategoryFormMode("edit", editId, item);
}

function renderCategories() {
    const tree = TPS.buildCategoryTree(categories);
    const childCount = tree.reduce((sum, item) => sum + item.children.length, 0);

    categoryStats.textContent = `${tree.length} danh mục cha · ${childCount} danh mục con`;

    if (!tree.length) {
        categoryList.innerHTML = `<p class="tree-empty">Chưa có danh mục. Hãy thêm danh mục cha trước.</p>`;
        return;
    }

    categoryList.innerHTML = tree.map(({ root, children }) => {
        const rootId = TPS.getField(root, "maDanhMuc", "MaDanhMuc");
        const rootName = TPS.escapeHtml(TPS.viText(TPS.getField(root, "tenDanhMuc", "TenDanhMuc")));

        const subHtml = children.length
            ? children.map((sub) => {
                const subId = TPS.getField(sub, "maDanhMuc", "MaDanhMuc");
                const subName = TPS.escapeHtml(TPS.viText(TPS.getField(sub, "tenDanhMuc", "TenDanhMuc")));
                return `
                    <div class="tree-child" data-category-id="${TPS.escapeHtml(subId)}">
                        <span class="tree-label" data-category-id="${TPS.escapeHtml(subId)}">${subName}</span>
                        <span class="tree-actions">
                            <button class="btn-edit" type="button" data-edit-category="${TPS.escapeHtml(subId)}">Sửa</button>
                            <button class="btn-danger" type="button" data-delete-category="${TPS.escapeHtml(subId)}">Xóa</button>
                        </span>
                    </div>
                `;
            }).join("")
            : `<p class="tree-empty">Chưa có danh mục con</p>`;

        return `
            <div class="tree-node open" data-category-id="${TPS.escapeHtml(rootId)}">
                <div class="tree-row">
                    <span class="tree-label" onclick="this.closest('.tree-node').classList.toggle('open')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
                        <span data-category-id="${TPS.escapeHtml(rootId)}">${rootName}</span>
                    </span>
                    <span class="tree-actions">
                        <button type="button" class="btn-add-child" data-add-child-category="${TPS.escapeHtml(rootId)}">+ Con</button>
                        <button class="btn-edit" type="button" data-edit-category="${TPS.escapeHtml(rootId)}">Sửa</button>
                        <button class="btn-danger" type="button" data-delete-category="${TPS.escapeHtml(rootId)}">Xóa</button>
                    </span>
                </div>
                <div class="tree-children">${subHtml}</div>
            </div>
        `;
    }).join("");
}

function resetCategoryForm(resetMode = true) {
    categoryId.value = "";
    categoryParentName.value = "";
    categoryChildName.value = "";
    // Reset child names container to only have the original input
    childNamesContainer.innerHTML = `<input id="category-child-name" placeholder="VD: Sữa chua, Sữa tươi..." class="child-name-input">`;
    // Re-reference the categoryChildName since we recreated it
    const newCategoryChildName = document.getElementById("category-child-name");
    if (newCategoryChildName) {
        window.categoryChildName = newCategoryChildName;
    }
    if (resetMode) {
        setCategoryFormMode("create");
    }
}

// Add event listener for the "add child name" button
addChildNameBtn?.addEventListener("click", () => {
    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.placeholder = "VD: Sữa chua, Sữa tươi...";
    newInput.className = "child-name-input";
    newInput.style.marginTop = "8px";
    childNamesContainer.appendChild(newInput);
});

// Function to close inline edit
function closeInlineEdit() {
    const editingLabel = document.querySelector(".tree-label[data-is-editing='true']");
    if (editingLabel) {
        editingLabel.innerHTML = editingLabel.dataset.originalHtml;
        delete editingLabel.dataset.isEditing;
        delete editingLabel.dataset.originalHtml;
    }
}

// Function to save inline edit
async function saveInlineEdit(labelElement, input, categoryId) {
    const newName = input.value.trim();
    const originalName = input.dataset.originalName;
    
    // Validation
    if (!newName) {
        showAdminStatus("Tên danh mục không được để trống.", "error");
        return false;
    }
    
    if (newName === originalName) {
        // No change, just close
        closeInlineEdit();
        return true;
    }
    
    try {
        const body = {
            tenDanhMuc: newName,
            moTa: null,
            maDanhMucCha: null
        };
        
        await TPS.request(`/api/DanhMuc/${encodeURIComponent(categoryId)}`, {
            method: "PUT",
            body: JSON.stringify(body)
        });
        
        await loadCategories();
        localStorage.setItem("categoryUpdate", Date.now().toString());
        await window.TPSCategoryMenu?.refresh?.();
        showAdminStatus("Đã cập nhật tên danh mục.", "success");
        return true;
    } catch (error) {
        showAdminStatus(error.message, "error");
        return false;
    }
}

document.getElementById("category-list-wrap")?.addEventListener("click", async (event) => {
    const editBtn = event.target.closest("[data-edit-category]");
    const addChildBtn = event.target.closest("[data-add-child-category]");
    const deleteBtn = event.target.closest("[data-delete-category]");
    const saveInlineBtn = event.target.closest(".btn-save-inline");
    const cancelInlineBtn = event.target.closest(".btn-cancel-inline");

    if (editBtn) {
        const editId = editBtn.dataset.editCategory;
        const item = categories.find((x) => TPS.getField(x, "maDanhMuc", "MaDanhMuc") === editId);
        if (item) {
            // Close any existing edit
            closeInlineEdit();
            
            // Auto-open tree-node if it's a parent category
            const treeNode = event.target.closest(".tree-node");
            if (treeNode) {
                treeNode.classList.add("open");
            }
            
            const currentName = TPS.viText(TPS.getField(item, "tenDanhMuc", "TenDanhMuc"));
            const labelElement = event.target.closest(".tree-node, .tree-child").querySelector(".tree-label");
            
            // Replace label with input field
            const originalHtml = labelElement.innerHTML;
            labelElement.innerHTML = `
                <input type="text" class="inline-edit-input" value="${TPS.escapeHtml(currentName)}" 
                       data-category-id="${TPS.escapeHtml(editId)}" data-original-name="${TPS.escapeHtml(currentName)}">
                <div class="inline-edit-actions">
                    <button type="button" class="btn-save-inline">Lưu</button>
                    <button type="button" class="btn-cancel-inline">Hủy</button>
                </div>
            `;
            
            // Focus and select the input
            const input = labelElement.querySelector(".inline-edit-input");
            input.focus();
            input.select();
            
            // Store reference for cleanup
            labelElement.dataset.isEditing = "true";
            labelElement.dataset.originalHtml = originalHtml;
        }
        return;
    }

    if (saveInlineBtn) {
        const labelElement = saveInlineBtn.closest(".tree-label");
        const input = labelElement.querySelector(".inline-edit-input");
        const categoryId = input.dataset.categoryId;
        
        const saved = await saveInlineEdit(labelElement, input, categoryId);
        if (saved) {
            closeInlineEdit();
        }
        return;
    }

    if (cancelInlineBtn) {
        closeInlineEdit();
        return;
    }

    if (deleteBtn) {
        const deleteId = deleteBtn.dataset.deleteCategory;
        const item = categories.find((x) => TPS.getField(x, "maDanhMuc", "MaDanhMuc") === deleteId);
        if (item) {
            const itemName = TPS.viText(TPS.getField(item, "tenDanhMuc", "TenDanhMuc"));
            const confirmed = confirm(`Bạn có chắc chắn muốn xóa danh mục "${itemName}" không?`);
            
            if (confirmed) {
                try {
                    await TPS.request(`/api/DanhMuc/${encodeURIComponent(deleteId)}`, {
                        method: "DELETE"
                    });
                    await loadCategories();
                    localStorage.setItem("categoryUpdate", Date.now().toString());
                    await window.TPSCategoryMenu?.refresh?.();
                    showAdminStatus("Đã xóa danh mục.", "success");
                } catch (error) {
                    showAdminStatus(error.message, "error");
                }
            }
        }
        return;
    }

    if (addChildBtn) {
        const parentId = addChildBtn.dataset.addChildCategory;
        const parentItem = categories.find((x) => TPS.getField(x, "maDanhMuc", "MaDanhMuc") === parentId);
        const parentName = TPS.viText(TPS.getField(parentItem, "tenDanhMuc", "TenDanhMuc"));
        
        // Close any existing edit
        closeInlineEdit();
        
        // Auto-open tree-node
        const treeNode = event.target.closest(".tree-node");
        if (treeNode) {
            treeNode.classList.add("open");
        }
        
        const treeChildren = event.target.closest(".tree-node").querySelector(".tree-children");
        
        // Add inline input for adding child
        const existingAddChild = treeChildren.querySelector(".add-child-inline");
        if (existingAddChild) {
            existingAddChild.remove();
            return;
        }
        
        const addChildDiv = document.createElement("div");
        addChildDiv.className = "add-child-inline";
        addChildDiv.innerHTML = `
            <input type="text" class="inline-add-input" placeholder="Tên danh mục con..." data-parent-id="${TPS.escapeHtml(parentId)}">
            <div class="inline-add-actions">
                <button type="button" class="btn-save-add">Lưu</button>
                <button type="button" class="btn-cancel-add">Hủy</button>
            </div>
        `;
        
        treeChildren.appendChild(addChildDiv);
        
        const input = addChildDiv.querySelector(".inline-add-input");
        input.focus();
        
        return;
    }

    const saveAddBtn = event.target.closest(".btn-save-add");
    const cancelAddBtn = event.target.closest(".btn-cancel-add");

    if (saveAddBtn) {
        const addDiv = saveAddBtn.closest(".add-child-inline");
        const input = addDiv.querySelector(".inline-add-input");
        const parentId = input.dataset.parentId;
        const childName = input.value.trim();
        
        if (!childName) {
            showAdminStatus("Tên danh mục con không được để trống.", "error");
            return;
        }
        
        try {
            const body = {
                tenDanhMuc: childName,
                moTa: null,
                maDanhMucCha: parentId
            };
            await TPS.request("/api/DanhMuc", {
                method: "POST",
                body: JSON.stringify(body)
            });
            await loadCategories();
            localStorage.setItem("categoryUpdate", Date.now().toString());
            await window.TPSCategoryMenu?.refresh?.();
            showAdminStatus("Đã thêm danh mục con.", "success");
        } catch (error) {
            showAdminStatus(error.message, "error");
        }
        return;
    }

    if (cancelAddBtn) {
        const addDiv = cancelAddBtn.closest(".add-child-inline");
        addDiv.remove();
        return;
    }

    if (deleteBtn) {
        const deleteId = deleteBtn.dataset.deleteCategory;
        const item = categories.find((x) => TPS.getField(x, "maDanhMuc", "MaDanhMuc") === deleteId);
        const itemName = TPS.viText(TPS.getField(item, "tenDanhMuc", "TenDanhMuc"));
        const hasChildren = categories.some((x) => TPS.getField(x, "maDanhMucCha", "MaDanhMucCha") === deleteId);
        const productCount = products.filter((x) => TPS.getField(x, "maDanhMuc", "MaDanhMuc") === deleteId).length;

        if (hasChildren) {
            showAdminStatus("Không thể xóa danh mục cha đang có danh mục con. Hãy xóa danh mục con trước.", "error");
            return;
        }

        if (productCount > 0) {
            showAdminStatus(`Không thể xóa danh mục đang có ${productCount} sản phẩm.`, "error");
            return;
        }

        if (!confirm(`Xóa danh mục "${itemName}"?`)) {
            return;
        }

        try {
            deleteBtn.disabled = true;
            deleteBtn.textContent = "Đang xóa...";
            
            await TPS.request(`/api/DanhMuc/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
            await loadCategories();
            localStorage.setItem("categoryUpdate", Date.now().toString());
            await window.TPSCategoryMenu?.refresh?.();
            showAdminStatus("Đã xóa danh mục.", "success");
        } catch (error) {
            showAdminStatus(error.message, "error");
        } finally {
            deleteBtn.disabled = false;
            deleteBtn.textContent = "Xóa";
        }
    }
});

// Add keyboard event listener for inline edit
document.getElementById("category-list-wrap")?.addEventListener("keydown", async (event) => {
    if (event.target.classList.contains("inline-edit-input")) {
        if (event.key === "Enter") {
            event.preventDefault();
            const labelElement = event.target.closest(".tree-label");
            const input = labelElement.querySelector(".inline-edit-input");
            const categoryId = input.dataset.categoryId;
            
            const saved = await saveInlineEdit(labelElement, input, categoryId);
            if (saved) {
                closeInlineEdit();
            }
        } else if (event.key === "Escape") {
            event.preventDefault();
            closeInlineEdit();
        }
    }
    
    if (event.target.classList.contains("inline-add-input")) {
        if (event.key === "Enter") {
            event.preventDefault();
            const addDiv = event.target.closest(".add-child-inline");
            const input = addDiv.querySelector(".inline-add-input");
            const parentId = input.dataset.parentId;
            const childName = input.value.trim();
            
            if (!childName) {
                showAdminStatus("Tên danh mục con không được để trống.", "error");
                return;
            }
            
            try {
                const body = {
                    tenDanhMuc: childName,
                    moTa: null,
                    maDanhMucCha: parentId
                };
                await TPS.request("/api/DanhMuc", {
                    method: "POST",
                    body: JSON.stringify(body)
                });
                await loadCategories();
                localStorage.setItem("categoryUpdate", Date.now().toString());
                await window.TPSCategoryMenu?.refresh?.();
                showAdminStatus("Đã thêm danh mục con.", "success");
            } catch (error) {
                showAdminStatus(error.message, "error");
            }
        } else if (event.key === "Escape") {
            event.preventDefault();
            const addDiv = event.target.closest(".add-child-inline");
            addDiv.remove();
        }
    }
});

// Add click-outside detection to close inline edit
document.addEventListener("click", (event) => {
    // Close inline edit if clicking outside
    const editingLabel = document.querySelector(".tree-label[data-is-editing='true']");
    if (editingLabel) {
        const isClickInsideEdit = editingLabel.contains(event.target);
        const isClickOnEditBtn = event.target.closest("[data-edit-category]");
        const isClickOnSaveInline = event.target.closest(".btn-save-inline");
        const isClickOnCancelInline = event.target.closest(".btn-cancel-inline");
        if (!isClickInsideEdit && !isClickOnEditBtn && !isClickOnSaveInline && !isClickOnCancelInline) {
            closeInlineEdit();
        }
    }
    
    // Close add child inline if clicking outside
    const addChildInline = document.querySelector(".add-child-inline");
    if (addChildInline) {
        const isClickInsideAdd = addChildInline.contains(event.target);
        const isClickOnAddChildBtn = event.target.closest("[data-add-child-category]");
        const isClickOnSaveAdd = event.target.closest(".btn-save-add");
        const isClickOnCancelAdd = event.target.closest(".btn-cancel-add");
        if (!isClickInsideAdd && !isClickOnAddChildBtn && !isClickOnSaveAdd && !isClickOnCancelAdd) {
            addChildInline.remove();
        }
    }
});

document.querySelector("[data-panel='categories'] .category-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = categoryId.value.trim();
    const parentName = categoryParentName.value.trim();
    
    // Collect all child names from the inputs
    const childNameInputs = childNamesContainer.querySelectorAll(".child-name-input");
    const childNames = Array.from(childNameInputs)
        .map(input => input.value.trim())
        .filter(name => name.length > 0);

    console.log("Form submission - parentName:", parentName, "childNames:", childNames);

    if (!parentName && childNames.length === 0) {
        showAdminStatus("Vui lòng điền tên danh mục cha hoặc danh mục con (hoặc cả hai).", "error");
        return;
    }

    try {
        categorySubmit.disabled = true;
        categorySubmit.textContent = "Đang lưu...";

        if (id) {
            // Edit mode - update the category (only single category edit)
            const body = {
                tenDanhMuc: childNames[0] || parentName,
                moTa: null,
                maDanhMucCha: null
            };

            await TPS.request(`/api/DanhMuc/${encodeURIComponent(id)}`, {
                method: "PUT",
                body: JSON.stringify(body)
            });
            showAdminStatus("Đã cập nhật danh mục.", "success");
        } else {
            // Create mode
            let createdParentId = null;
            
            // Create parent if provided
            if (parentName) {
                const parentBody = {
                    tenDanhMuc: parentName,
                    moTa: null,
                    maDanhMucCha: null
                };
                
                try {
                    const parentPayload = await TPS.request("/api/DanhMuc", {
                        method: "POST",
                        body: JSON.stringify(parentBody)
                    });
                    const parent = TPS.unwrap(parentPayload);
                    createdParentId = TPS.getField(parent, "maDanhMuc", "MaDanhMuc");
                    console.log("Parent created with ID:", createdParentId);
                } catch (error) {
                    showAdminStatus(`Lỗi khi tạo danh mục cha: ${error.message}`, "error");
                    return;
                }
            }

            // Create all children if provided
            if (childNames.length > 0) {
                const parentId = createdParentId;
                
                if (!parentId) {
                    showAdminStatus("Vui lòng điền tên danh mục cha để thêm danh mục con.", "error");
                    return;
                }

                let successCount = 0;
                let errorCount = 0;

                for (const childName of childNames) {
                    const childBody = {
                        tenDanhMuc: childName,
                        moTa: null,
                        maDanhMucCha: parentId
                    };
                    
                    try {
                        await TPS.request("/api/DanhMuc", {
                            method: "POST",
                            body: JSON.stringify(childBody)
                        });
                        successCount++;
                        console.log(`Child "${childName}" created successfully`);
                    } catch (error) {
                        errorCount++;
                        console.error(`Lỗi khi tạo danh mục con "${childName}":`, error);
                    }
                }

                if (errorCount > 0) {
                    showAdminStatus(`Đã thêm ${successCount}/${childNames.length} danh mục con. ${errorCount} danh mục con bị lỗi.`, errorCount === childNames.length ? "error" : "warning");
                } else {
                    showAdminStatus(`Đã thêm ${successCount} danh mục con thành công.`, "success");
                }
            } else {
                showAdminStatus("Đã thêm danh mục mới.", "success");
            }
        }

        console.log("About to call resetCategoryForm and loadCategories");
        resetCategoryForm();
        await loadCategories();
        console.log("loadCategories completed");
        localStorage.setItem("categoryUpdate", Date.now().toString());
        await window.TPSCategoryMenu?.refresh?.();
    } catch (error) {
        console.error("Form submission error:", error);
        showAdminStatus(error.message, "error");
    } finally {
        categorySubmit.disabled = false;
        categorySubmit.textContent = id ? "Cập nhật danh mục" : "Lưu danh mục";
    }
});

async function loadProducts() {
    const payload = await TPS.request("/api/SanPham");
    products = TPS.unwrap(payload) || [];
    renderProducts();
}

function getProductFormBody() {
    const tenSp = document.getElementById("product-name").value.trim();
    const maDanhMuc = productCategory.value.trim();
    const gia = Number(document.getElementById("product-price").value || 0);
    const soLuongTon = Number(document.getElementById("product-stock").value || 0);
    
    // Kiểm tra trường bắt buộc
    if (!tenSp || !maDanhMuc) {
        throw new Error("Tên sản phẩm và danh mục không được để trống!");
    }
    
    return {
        maDanhMuc: maDanhMuc,
        tenSp: tenSp,
        gia: gia,
        soLuongTon: soLuongTon,
        donViTinh: document.getElementById("product-unit").value.trim() || null,
        nguonGoc: document.getElementById("product-origin").value.trim() || null,
        hinhAnh: productImageBase64 && productImageBase64.trim() ? productImageBase64 : null,
        moTa: document.getElementById("product-description").value.trim() || null,
        hanSuDung: document.getElementById("product-expiry").value || null
    };
}

function resetProductForm() {
    productForm.reset();
    productId.value = "";
    productImageBase64 = null;
    document.getElementById("product-image-preview-wrap").style.display = "none";
    setProductFormMode(false);
}

function setProductFormMode(isEditing) {
    productModalTitle.textContent = isEditing ? "Sửa sản phẩm" : "Thêm sản phẩm";
    saveProductButton.textContent = isEditing ? "Cập nhật" : "Đăng sản phẩm";
    productForm.classList.toggle("is-editing", isEditing);
}

function startAddingProduct() {
    openProductModal("add");
}

let currentProductPage = 1;
const PRODUCT_PAGE_SIZE = 10;

function renderProducts() {
    const totalPages = Math.max(1, Math.ceil(products.length / PRODUCT_PAGE_SIZE));
    if (currentProductPage > totalPages) currentProductPage = totalPages;
    if (currentProductPage < 1) currentProductPage = 1;
    
    const startIndex = (currentProductPage - 1) * PRODUCT_PAGE_SIZE;
    const paginated = products.slice(startIndex, startIndex + PRODUCT_PAGE_SIZE);

    const prevBtn = document.getElementById("product-prev-btn");
    const nextBtn = document.getElementById("product-next-btn");
    const pageInfo = document.getElementById("product-pagination-info");
    
    if (prevBtn) prevBtn.disabled = currentProductPage <= 1;
    if (nextBtn) nextBtn.disabled = currentProductPage >= totalPages;
    if (pageInfo) pageInfo.textContent = `Trang ${currentProductPage} / ${totalPages} · ${products.length} kết quả`;

    productList.innerHTML = paginated.map((item) => {
        const id = TPS.getField(item, "maSp", "MaSp");
        const hinhAnh = TPS.getField(item, "hinhAnh", "HinhAnh");
        const productImage = TPS.getProductImage(id, hinhAnh);
        return `
            <article class="admin-card">
                <div class="admin-card-head">
                    <div class="admin-card-image">
                        <img src="${TPS.escapeHtml(productImage)}" alt="${TPS.escapeHtml(TPS.viText(TPS.getField(item, "tenSp", "TenSp")))}">
                    </div>
                    <div class="admin-card-content">
                        <h3>${TPS.escapeHtml(TPS.viText(TPS.getField(item, "tenSp", "TenSp")))}</h3>
                        <p class="price-text">${TPS.formatCurrency(TPS.getField(item, "gia", "Gia"))}</p>
                        <p class="meta-line">
                            ${TPS.escapeHtml(getProductCategoryLabel(item))} ·
                            Tồn ${TPS.escapeHtml(TPS.getField(item, "soLuongTon", "SoLuongTon"))} ·
                            ${TPS.escapeHtml(TPS.viText(TPS.getField(item, "nguonGoc", "NguonGoc")) || "Chưa có nguồn gốc")}
                        </p>
                    </div>
                    <div class="card-actions">
                        <button class="ghost-button" type="button" data-edit-product="${TPS.escapeHtml(id)}">Sửa</button>
                        <button class="danger-button" type="button" data-delete-product="${TPS.escapeHtml(id)}">Xóa</button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

document.getElementById("product-prev-btn")?.addEventListener("click", () => {
    if (currentProductPage > 1) {
        currentProductPage--;
        renderProducts();
    }
});

document.getElementById("product-next-btn")?.addEventListener("click", () => {
    currentProductPage++;
    renderProducts();
});

productForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = productId.value;
    const formData = getProductFormBody();
    
    try {
        saveProductButton.disabled = true;
        saveProductButton.textContent = "Đang lưu...";

        if (id) {
            // Edit mode
            await TPS.request(`/api/SanPham/${encodeURIComponent(id)}`, {
                method: "PUT",
                body: JSON.stringify(formData)
            });
            showAdminStatus("Đã cập nhật thành công.", "success");
        } else {
            // Add mode
            await TPS.request("/api/SanPham", {
                method: "POST",
                body: JSON.stringify(formData)
            });
            showAdminStatus("Đã thêm sản phẩm mới.", "success");
        }

        closeProductModalFn();
        await loadProducts();
    } catch (error) {
        showAdminStatus(error.message, "error");
    } finally {
        saveProductButton.disabled = false;
        saveProductButton.textContent = id ? "Cập nhật" : "Đăng sản phẩm";
    }
});

// Event listener for edit product button
productList?.addEventListener("click", async (event) => {
    const editProductBtn = event.target.closest("[data-edit-product]");
    const deleteProductBtn = event.target.closest("[data-delete-product]");

    if (editProductBtn) {
        const productId = editProductBtn.dataset.editProduct;
        openProductModal("edit", productId);
        return;
    }

    if (deleteProductBtn) {
        const productId = deleteProductBtn.dataset.deleteProduct;
        const product = products.find((x) => TPS.getField(x, "maSp", "MaSp") === productId);
        if (product) {
            const productName = TPS.viText(TPS.getField(product, "tenSp", "TenSp"));
            const confirmed = confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}" không?`);
            
            if (confirmed) {
                try {
                    deleteProductBtn.disabled = true;
                    deleteProductBtn.textContent = "Đang xóa...";
                    
                    await TPS.request(`/api/SanPham/${encodeURIComponent(productId)}`, {
                        method: "DELETE"
                    });
                    await loadProducts();
                    showAdminStatus("Đã xóa sản phẩm.", "success");
                } catch (error) {
                    showAdminStatus(error.message, "error");
                } finally {
                    deleteProductBtn.disabled = false;
                    deleteProductBtn.textContent = "Xóa";
                }
            }
        }
        return;
    }
});

let currentCustomerPage = 1;
const CUSTOMER_PAGE_SIZE = 10;
let customersData = [];
let editingCustomerId = null;
let deletingCustomerId = null;

async function loadCustomers(keyword = "") {
    const query = keyword ? `?tuKhoa=${encodeURIComponent(keyword)}` : "";
    try {
        const payload = await TPS.request(`/api/KhachHang${query}`);
        customersData = TPS.unwrap(payload) || [];
        currentCustomerPage = 1;
        editingCustomerId = null;
        deletingCustomerId = null;
        renderCustomers();
    } catch (e) {
        showAdminStatus("Lỗi tải khách hàng: " + e.message, "error");
    }
}

function renderCustomers() {
    const totalPages = Math.max(1, Math.ceil(customersData.length / CUSTOMER_PAGE_SIZE));
    if (currentCustomerPage > totalPages) currentCustomerPage = totalPages;
    if (currentCustomerPage < 1) currentCustomerPage = 1;
    
    const startIndex = (currentCustomerPage - 1) * CUSTOMER_PAGE_SIZE;
    const paginated = customersData.slice(startIndex, startIndex + CUSTOMER_PAGE_SIZE);

    const prevBtn = document.getElementById("customer-prev-btn");
    const nextBtn = document.getElementById("customer-next-btn");
    const pageInfo = document.getElementById("customer-pagination-info");
    const badge = document.getElementById("customer-total-badge");
    
    if (prevBtn) prevBtn.disabled = currentCustomerPage <= 1;
    if (nextBtn) nextBtn.disabled = currentCustomerPage >= totalPages;
    if (pageInfo) pageInfo.textContent = `Trang ${currentCustomerPage} / ${totalPages} · ${customersData.length} kết quả`;
    if (badge) badge.textContent = `${customersData.length} khách hàng`;

    if (paginated.length === 0) {
        customerList.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--muted);">Không tìm thấy khách hàng phù hợp</td></tr>`;
        return;
    }

    customerList.innerHTML = paginated.map((item) => {
        const id = TPS.getField(item, "maKh", "MaKh") || TPS.getField(item, "id", "Id");
        const isEditing = id === editingCustomerId;
        const isDeleting = id === deletingCustomerId;
        const name = TPS.escapeHtml(TPS.getField(item, "hoTen", "HoTen") || "");
        const username = TPS.escapeHtml(TPS.getField(item, "tenDangNhap", "TenDangNhap") || "");
        const email = TPS.escapeHtml(TPS.getField(item, "email", "Email") || "");
        const phone = TPS.escapeHtml(TPS.getField(item, "sdt", "Sdt") || TPS.getField(item, "soDienThoai", "SoDienThoai") || "");

        if (isDeleting) {
            return `
            <tr class="customer-row-deleting">
                <td colspan="5">
                    <div class="customer-delete-prompt">
                        <span>Xóa khách hàng "${name}"?</span>
                        <div style="white-space: nowrap;">
                            <button class="customer-action-btn btn-cancel-delete" data-id="${id}">Hủy</button>
                            <button class="customer-action-btn btn-delete btn-confirm-delete" data-id="${id}">Xóa</button>
                        </div>
                    </div>
                </td>
            </tr>`;
        }

        if (isEditing) {
            return `
            <tr class="customer-row-editing">
                <td><input class="customer-inline-input edit-name" value="${name}" placeholder="Họ tên"></td>
                <td><input class="customer-inline-input edit-username" value="${username}" placeholder="Tài khoản"></td>
                <td><input class="customer-inline-input edit-email" type="email" value="${email}" placeholder="Email"></td>
                <td><input class="customer-inline-input edit-phone" type="tel" value="${phone}" placeholder="SĐT"></td>
                <td style="text-align: center; white-space: nowrap;">
                    <button class="customer-action-btn btn-save btn-save-edit" data-id="${id}" title="Lưu">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                    <button class="customer-action-btn btn-cancel-edit" data-id="${id}" title="Hủy">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </td>
            </tr>`;
        }

        return `
        <tr>
            <td style="font-weight: 600;">${name}</td>
            <td>${username}</td>
            <td>${email}</td>
            <td>${phone}</td>
            <td style="text-align: center; white-space: nowrap;">
                <button class="customer-action-btn btn-start-edit" data-id="${id}" title="Sửa">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="customer-action-btn btn-delete btn-start-delete" data-id="${id}" title="Xóa">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </td>
        </tr>`;
    }).join("");
}

// Pagination
document.getElementById("customer-prev-btn")?.addEventListener("click", () => {
    if (currentCustomerPage > 1) {
        currentCustomerPage--;
        editingCustomerId = null;
        deletingCustomerId = null;
        renderCustomers();
    }
});

document.getElementById("customer-next-btn")?.addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(customersData.length / CUSTOMER_PAGE_SIZE));
    if (currentCustomerPage < totalPages) {
        currentCustomerPage++;
        editingCustomerId = null;
        deletingCustomerId = null;
        renderCustomers();
    }
});

// Search
customerSearch?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await loadCustomers(customerKeyword.value.trim());
});
customerSearch?.addEventListener("input", () => {
    editingCustomerId = null;
    deletingCustomerId = null;
});

// Table Actions Delegation
customerList?.addEventListener("click", async (e) => {
    const btn = e.target.closest(".customer-action-btn");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;

    if (btn.classList.contains("btn-start-edit")) {
        editingCustomerId = id;
        deletingCustomerId = null;
        renderCustomers();
    } else if (btn.classList.contains("btn-cancel-edit")) {
        editingCustomerId = null;
        renderCustomers();
    } else if (btn.classList.contains("btn-start-delete")) {
        deletingCustomerId = id;
        editingCustomerId = null;
        renderCustomers();
    } else if (btn.classList.contains("btn-cancel-delete")) {
        deletingCustomerId = null;
        renderCustomers();
    } else if (btn.classList.contains("btn-save-edit")) {
        const row = btn.closest("tr");
        const name = row.querySelector(".edit-name").value.trim();
        const username = row.querySelector(".edit-username").value.trim();
        const email = row.querySelector(".edit-email").value.trim();
        const phone = row.querySelector(".edit-phone").value.trim();

        if (!name || !username) {
            showAdminStatus("Họ tên và Tài khoản là bắt buộc.", "error");
            return;
        }

        const payload = {
            hoTen: name,
            tenDangNhap: username,
            email: email,
            sdt: phone
        };

        try {
            // Need to pass the original data to preserve missing fields like MaKh, VaiTro
            const originalCustomer = customersData.find(c => (TPS.getField(c, "maKh", "MaKh") || TPS.getField(c, "id", "Id")) == id);
            const updatePayload = { ...originalCustomer, ...payload };
            
            await TPS.request(`/api/KhachHang/${id}`, {
                method: "PUT",
                body: JSON.stringify(updatePayload)
            });
            showAdminStatus("Cập nhật thành công", "success");
            
            // Cập nhật session hiện tại nếu người bị sửa chính là người đang đăng nhập
            const currentUser = TPS.getUser();
            const originalUsername = TPS.getField(originalCustomer, "tenDangNhap", "TenDangNhap");
            const originalName = TPS.getField(originalCustomer, "hoTen", "HoTen");
            
            // Cập nhật nếu tên đăng nhập, họ tên, hoặc ID trùng khớp
            if (currentUser && (
                originalUsername === currentUser.tenDangNhap || 
                originalName === currentUser.hoTen ||
                (currentUser.maKh && currentUser.maKh == id) ||
                (currentUser.maNguoiDung && currentUser.maNguoiDung == TPS.getField(originalCustomer, "maNguoiDung", "MaNguoiDung"))
            )) {
                try {
                    const authStr = sessionStorage.getItem("tps_auth");
                    if (authStr) {
                        const auth = JSON.parse(authStr);
                        if (auth.user) {
                            auth.user.hoTen = payload.hoTen;
                            auth.user.tenDangNhap = payload.tenDangNhap;
                        } else if (auth.User) {
                            auth.User.HoTen = payload.hoTen;
                            auth.User.TenDangNhap = payload.tenDangNhap;
                        }
                        TPS.saveAuth(auth);
                        
                        // Cập nhật ngay trên giao diện của trang admin
                        document.querySelectorAll("[data-user-name]").forEach((node) => {
                            node.textContent = "Xin chào, " + (payload.hoTen || payload.tenDangNhap);
                        });
                    }
                } catch (e) {
                    console.error("Lỗi cập nhật session:", e);
                }
            }

            await loadCustomers(customerKeyword.value.trim());
        } catch (err) {
            showAdminStatus(err.message, "error");
        }
    } else if (btn.classList.contains("btn-confirm-delete")) {
        try {
            await TPS.request(`/api/KhachHang/${id}`, { method: "DELETE" });
            showAdminStatus("Đã xóa khách hàng", "success");
            await loadCustomers(customerKeyword.value.trim());
        } catch (err) {
            showAdminStatus(err.message, "error");
        }
    }
});

// Add Form Toggle
const customerAddFormContainer = document.getElementById("customer-add-form-container");
const customerAddToggleBtn = document.getElementById("customer-add-toggle-btn");
const customerAddForm = document.getElementById("customer-add-form");
const customerAddCancelBtn = document.getElementById("customer-add-cancel-btn");

function toggleCustomerForm(show) {
    if (show) {
        customerAddFormContainer.style.display = "block";
        customerAddToggleBtn.textContent = "- Hủy thêm";
        customerAddFormContainer.classList.remove("is-hidden");
    } else {
        customerAddFormContainer.style.display = "none";
        customerAddToggleBtn.textContent = "+ Thêm khách hàng";
        customerAddFormContainer.classList.add("is-hidden");
        customerAddForm.reset();
    }
}

customerAddToggleBtn?.addEventListener("click", () => {
    const isHidden = customerAddFormContainer.style.display === "none";
    toggleCustomerForm(isHidden);
});

customerAddCancelBtn?.addEventListener("click", () => {
    toggleCustomerForm(false);
});

customerAddForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("new-customer-name").value.trim();
    const username = document.getElementById("new-customer-username").value.trim();
    const email = document.getElementById("new-customer-email").value.trim();
    const phone = document.getElementById("new-customer-phone").value.trim();

    if (!name || !username) {
        showAdminStatus("Họ tên và Tài khoản là bắt buộc", "error");
        return;
    }

    try {
        await TPS.request("/api/KhachHang", {
            method: "POST",
            body: JSON.stringify({
                hoTen: name,
                tenDangNhap: username,
                email: email,
                sdt: phone,
                matKhau: "123456" // Default password
            })
        });
        showAdminStatus("Đã thêm khách hàng", "success");
        customerKeyword.value = "";
        toggleCustomerForm(false);
        await loadCustomers();
    } catch (err) {
        showAdminStatus(err.message, "error");
    }
});

/**
 * Normalize status from API to 4 UI statuses
 */
function normalizeOrderStatus(status) {
    const s = (status || "").toLowerCase();
    if (s.includes("huy") || s.includes("hủy")) return "da_huy";
    if (s.includes("giao") || s.includes("đã giao")) return "da_giao";
    if (s.includes("cho xac nhan") || s.includes("chờ xác nhận") || s.includes("dang xu ly") || s.includes("đang xử lý")) return "cho_xac_nhan";
    return "da_xac_nhan"; // Default active/confirmed
}

function getStatusLabel(normalizedStatus) {
    switch (normalizedStatus) {
        case "cho_xac_nhan": return "Chờ xác nhận";
        case "da_xac_nhan": return "Đã xác nhận";
        case "da_giao": return "Đã giao";
        case "da_huy": return "Đã hủy";
        default: return "Không xác định";
    }
}

function getStatusClass(normalizedStatus) {
    switch (normalizedStatus) {
        case "cho_xac_nhan": return "status-pending"; // warning orange
        case "da_xac_nhan": return "status-confirmed"; // info blue
        case "da_giao": return "status-delivered"; // success green
        case "da_huy": return "status-cancelled"; // danger red
        default: return "";
    }
}

function getApiStatusFromNormalized(normalizedStatus) {
    switch (normalizedStatus) {
        case "cho_xac_nhan": return "Cho xac nhan";
        case "da_xac_nhan": return "Da xac nhan";
        case "da_giao": return "Da giao";
        case "da_huy": return "Da huy";
        default: return "Cho xac nhan";
    }
}

let currentOrderPage = 1;
const ORDER_PAGE_SIZE = 10;
let currentOrderFilter = "all";
let currentOrderKeyword = "";

async function loadOrders() {
    try {
        const payload = await TPS.request("/api/DonHang");
        orders = TPS.unwrap(payload) || [];
        renderOrders();
    } catch (e) {
        showAdminStatus("Lỗi tải đơn hàng: " + e.message, "error");
    }
}

function renderOrders() {
    const totalOrders = orders.length;
    let pendingCount = 0;
    const counts = { all: totalOrders, cho_xac_nhan: 0, da_xac_nhan: 0, da_giao: 0, da_huy: 0 };

    // Normalize and count
    const processedOrders = orders.map(order => {
        const rawStatus = TPS.getField(order, "trangThaiDonHang", "TrangThaiDonHang");
        const normStatus = normalizeOrderStatus(rawStatus);
        if (counts[normStatus] !== undefined) counts[normStatus]++;
        
        const id = TPS.getField(order, "maDonHang", "MaDonHang") || "";
        const customerName = TPS.getField(order, "hoTenKhachHang", "HoTenKhachHang") || "";
        const phone = TPS.getField(order, "sdtGiao", "SdtGiao") || TPS.getField(order, "sdtKhachHang", "SdtKhachHang") || TPS.getField(order, "soDienThoai", "SoDienThoai") || "Chưa có SĐT";
        
        // Cố gắng lấy thời gian tạo (tùy thuộc API, nếu ko có thì lấy null)
        const rawDate = TPS.getField(order, "ngayDat", "NgayDat") || TPS.getField(order, "ngayDatHang", "NgayDatHang") || TPS.getField(order, "ngayTao", "NgayTao");
        let dateStr = "";
        if (rawDate) {
            try {
                const d = new Date(rawDate);
                const pad = (n) => n.toString().padStart(2, "0");
                dateStr = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
            } catch(e) { dateStr = rawDate; }
        }

        return {
            original: order,
            normStatus,
            id,
            customerName,
            phone,
            dateStr,
            rawStatus
        };
    });

    pendingCount = counts.cho_xac_nhan;

    // Update metrics
    const badge = document.getElementById("order-total-badge");
    if (badge) badge.textContent = `${totalOrders} đơn hàng`;
    
    const metricTotal = document.getElementById("metric-total-orders");
    if (metricTotal) metricTotal.textContent = totalOrders;
    
    const metricPending = document.getElementById("metric-pending-orders");
    if (metricPending) metricPending.textContent = pendingCount;

    // Update pills text
    document.querySelectorAll(".filter-pill").forEach(pill => {
        const f = pill.dataset.filter;
        pill.classList.toggle("is-active", f === currentOrderFilter);
        const name = f === "all" ? "Tất cả" : getStatusLabel(f);
        pill.textContent = `${name} (${counts[f]})`;
    });

    // Filter
    let filtered = processedOrders;
    if (currentOrderFilter !== "all") {
        filtered = filtered.filter(o => o.normStatus === currentOrderFilter);
    }
    
    if (currentOrderKeyword) {
        const kw = currentOrderKeyword.toLowerCase();
        filtered = filtered.filter(o => 
            o.id.toLowerCase().includes(kw) || 
            o.customerName.toLowerCase().includes(kw) || 
            o.phone.toLowerCase().includes(kw)
        );
    }

    // Paginate
    const totalPages = Math.max(1, Math.ceil(filtered.length / ORDER_PAGE_SIZE));
    if (currentOrderPage > totalPages) currentOrderPage = totalPages;
    if (currentOrderPage < 1) currentOrderPage = 1;
    
    const startIndex = (currentOrderPage - 1) * ORDER_PAGE_SIZE;
    const paginated = filtered.slice(startIndex, startIndex + ORDER_PAGE_SIZE);

    // Update Pagination UI
    const prevBtn = document.getElementById("order-prev-btn");
    const nextBtn = document.getElementById("order-next-btn");
    const pageInfo = document.getElementById("order-pagination-info");
    
    if (prevBtn) prevBtn.disabled = currentOrderPage <= 1;
    if (nextBtn) nextBtn.disabled = currentOrderPage >= totalPages;
    if (pageInfo) pageInfo.textContent = `Trang ${currentOrderPage} / ${totalPages} · ${filtered.length} kết quả`;

    // Render list
    const orderListEl = document.getElementById("order-list");
    if (!orderListEl) return;

    if (filtered.length === 0) {
        orderListEl.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--muted); font-weight: 500; font-size: 1.1rem; background: #fff; border-radius: var(--radius); border: 1px solid var(--line);">Không tìm thấy đơn hàng phù hợp</div>`;
        return;
    }

    orderListEl.innerHTML = paginated.map(pOrder => {
        const order = pOrder.original;
        const address = TPS.getField(order, "diaChiGiao", "DiaChiGiao") || "Chưa có địa chỉ";
        const items = TPS.getField(order, "items", "Items") || TPS.getField(order, "chiTietDonHangs", "ChiTietDonHangs") || [];
        const totalMoney = TPS.getField(order, "tongTien", "TongTien") || 0;
        
        let itemsHtml = "";
        if (items.length === 0) {
            itemsHtml = `<div class="empty-items-warning">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Không có sản phẩm trong đơn, nên kiểm tra lại dữ liệu
            </div>`;
        } else {
            itemsHtml = items.map(it => {
                const pName = TPS.getField(it, "tenSp", "TenSp") || TPS.getField(it, "sanPham", "SanPham")?.tenSp || "Sản phẩm";
                const q = TPS.getField(it, "soLuong", "SoLuong") || 1;
                const p = TPS.getField(it, "donGia", "DonGia") || 0;
                return `
                    <div class="order-item-row">
                        <span class="order-item-name">${TPS.escapeHtml(pName)} x${q}</span>
                        <span class="order-item-price">${TPS.formatCurrency(q * p)}</span>
                    </div>
                `;
            }).join("");
        }

        const isStatusSelectDisabled = pOrder.normStatus === "da_huy" ? false : false; // Allow changes always

        return `
            <article class="order-card" data-order-id="${TPS.escapeHtml(pOrder.id)}">
                <div class="order-card-header">
                    <h3 class="order-card-title">${TPS.escapeHtml(pOrder.id)} · ${TPS.escapeHtml(pOrder.customerName)}</h3>
                    <span class="order-card-date">${pOrder.dateStr}</span>
                </div>
                <p class="order-card-price">${TPS.formatCurrency(totalMoney)} đ</p>
                
                <div class="order-card-status-row">
                    <span class="status-pill ${getStatusClass(pOrder.normStatus)}">${getStatusLabel(pOrder.normStatus)}</span>
                </div>
                
                <div class="order-card-contact">
                    <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        ${TPS.escapeHtml(address)}
                    </span>
                    <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        ${TPS.escapeHtml(pOrder.phone)}
                    </span>
                </div>
                
                <button type="button" class="order-items-toggle" data-toggle-items="${TPS.escapeHtml(pOrder.id)}">
                    ${items.length} sản phẩm
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div class="order-items-list" id="items-${TPS.escapeHtml(pOrder.id)}">
                    ${itemsHtml}
                </div>
                
                <div class="order-card-footer">
                    <select class="order-status-select" data-order-select="${TPS.escapeHtml(pOrder.id)}" data-current-status="${pOrder.normStatus}">
                        <option value="cho_xac_nhan" ${pOrder.normStatus === 'cho_xac_nhan' ? 'selected' : ''}>Chờ xác nhận</option>
                        <option value="da_xac_nhan" ${pOrder.normStatus === 'da_xac_nhan' ? 'selected' : ''}>Đã xác nhận</option>
                        <option value="da_giao" ${pOrder.normStatus === 'da_giao' ? 'selected' : ''}>Đã giao</option>
                        <option value="da_huy" ${pOrder.normStatus === 'da_huy' ? 'selected' : ''}>Đã hủy</option>
                    </select>
                    <button class="order-update-btn" type="button" data-update-order="${TPS.escapeHtml(pOrder.id)}" disabled>Cập nhật</button>
                </div>
            </article>
        `;
    }).join("");
}

window.loadOrders = loadOrders;
window.applyOrderRealtimeUpdate = (updatedOrder) => {
    const updatedId = TPS.getField(updatedOrder, "maDonHang", "MaDonHang");
    const existingIndex = orders.findIndex((order) =>
        TPS.getField(order, "maDonHang", "MaDonHang") === updatedId);

    if (existingIndex >= 0) {
        orders[existingIndex] = updatedOrder;
    } else {
        orders.unshift(updatedOrder);
    }
    renderOrders();
};

// --- Event Listeners for Orders ---

document.getElementById("order-filter-pills")?.addEventListener("click", (e) => {
    const pill = e.target.closest(".filter-pill");
    if (pill) {
        currentOrderFilter = pill.dataset.filter;
        currentOrderPage = 1;
        renderOrders();
    }
});

document.getElementById("order-search-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
});

document.getElementById("order-keyword")?.addEventListener("input", (e) => {
    currentOrderKeyword = e.target.value.trim();
    currentOrderPage = 1;
    renderOrders();
});

document.getElementById("order-prev-btn")?.addEventListener("click", () => {
    if (currentOrderPage > 1) {
        currentOrderPage--;
        renderOrders();
    }
});

document.getElementById("order-next-btn")?.addEventListener("click", () => {
    currentOrderPage++;
    renderOrders();
});

document.getElementById("order-list")?.addEventListener("click", async (e) => {
    // Toggle items
    const toggleBtn = e.target.closest("[data-toggle-items]");
    if (toggleBtn) {
        const id = toggleBtn.dataset.toggleItems;
        const list = document.getElementById(`items-${id}`);
        if (list) {
            const isOpen = list.classList.contains("is-open");
            if (isOpen) {
                list.classList.remove("is-open");
                toggleBtn.classList.remove("is-open");
            } else {
                list.classList.add("is-open");
                toggleBtn.classList.add("is-open");
            }
        }
        return;
    }

    // Update btn
    const updateBtn = e.target.closest("[data-update-order]");
    if (updateBtn && !updateBtn.disabled) {
        const id = updateBtn.dataset.updateOrder;
        const select = document.querySelector(`select[data-order-select="${id}"]`);
        if (select) {
            const newNormStatus = select.value;
            const apiStatus = getApiStatusFromNormalized(newNormStatus);
            try {
                updateBtn.disabled = true;
                updateBtn.textContent = "Đang lưu...";
                
                await TPS.request(`/api/DonHang/${encodeURIComponent(id)}/status`, {
                    method: "PUT",
                    body: JSON.stringify({ trangThaiMoi: apiStatus })
                });
                
                // Cập nhật lại orders array
                const orderIndex = orders.findIndex(o => (TPS.getField(o, "maDonHang", "MaDonHang")||"") === id);
                if (orderIndex >= 0) {
                    orders[orderIndex].trangThaiDonHang = apiStatus; 
                    orders[orderIndex].TrangThaiDonHang = apiStatus; 
                }
                
                renderOrders();
                showAdminStatus("Đã cập nhật trạng thái đơn hàng.", "success");
            } catch (error) {
                showAdminStatus(error.message, "error");
                updateBtn.disabled = false;
                updateBtn.textContent = "Cập nhật";
            }
        }
    }
});

document.getElementById("order-list")?.addEventListener("change", (e) => {
    const select = e.target.closest(".order-status-select");
    if (select) {
        const id = select.dataset.orderSelect;
        const currentNorm = select.dataset.currentStatus;
        const btn = document.querySelector(`button[data-update-order="${id}"]`);
        if (btn) {
            btn.disabled = select.value === currentNorm;
        }
    }
});

document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
});

// Xử lý file upload cho hình ảnh sản phẩm
document.getElementById("product-image-button")?.addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("product-image").click();
});

document.getElementById("product-image")?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Compress ảnh trước khi convert thành Base64
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // Resize ảnh nếu quá lớn (max 500px)
                const maxDim = 500;
                if (width > maxDim || height > maxDim) {
                    const ratio = Math.min(maxDim / width, maxDim / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Compress thành JPEG với quality 0.5 (thấp để giảm dung lượng)
                // Thử từng quality level cho đến khi vừa vặn
                let quality = 0.5;
                productImageBase64 = canvas.toDataURL("image/jpeg", quality);
                
                // Nếu vẫn quá lớn, giảm quality thêm
                while (productImageBase64.length > 25000 && quality > 0.1) {
                    quality -= 0.1;
                    productImageBase64 = canvas.toDataURL("image/jpeg", quality);
                }
                
                // Kiểm tra kích thước cuối cùng
                if (productImageBase64.length > 30000) {
                    showAdminStatus("⚠️ Hình ảnh quá lớn. Chọn ảnh nhỏ hơn hoặc chất lượng thấp hơn.", "error");
                    productImageBase64 = null;
                    document.getElementById("product-image-preview-wrap").style.display = "none";
                    return;
                }
                
                console.log("Ảnh được compress:", productImageBase64.length, "ký tự, quality:", quality);
                
                // Hiển thị preview ảnh
                const previewImg = document.getElementById("product-image-preview");
                previewImg.src = productImageBase64;
                document.getElementById("product-image-preview-wrap").style.display = "block";
                
                // Show change/delete buttons, hide choose button
                document.getElementById("product-image-button").style.display = "none";
                document.getElementById("product-image-change").style.display = "inline-block";
                document.getElementById("product-image-delete").style.display = "inline-block";
            };
            img.onerror = () => {
                showAdminStatus("Lỗi khi xử lý hình ảnh.", "error");
                document.getElementById("product-image-preview-wrap").style.display = "none";
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            showAdminStatus("Lỗi khi đọc file hình ảnh.", "error");
            document.getElementById("product-image-preview-wrap").style.display = "none";
        };
        reader.readAsDataURL(file);
    }
    // If user cancels, do nothing - keep existing image
});

document.getElementById("reset-category")?.addEventListener("click", resetCategoryForm);
document.getElementById("reset-product")?.addEventListener("click", resetProductForm);
document.getElementById("start-add-product")?.addEventListener("click", startAddingProduct);
document.addEventListener("DOMContentLoaded", async () => {
    if (!TPS.requireRole("Admin")) {
        return;
    }

    // Phục hồi tab đang xem
    const savedTab = sessionStorage.getItem("adminActiveTab");
    if (savedTab) {
        activateTab(savedTab);
    }

    try {
        showAdminStatus("Đang tải dữ liệu quản trị...");
        await loadCategories();
        await loadProducts();
        await loadCustomers();
        await loadOrders();
        TPS.hideStatus(adminStatus);
    } catch (error) {
        showAdminStatus(error.message, "error");
    }
});
