// Recipe database with ingredient ratios
const recipes = {
    cake: {
        name: 'Basic Cake',
        baseQuantity: 1, // 1 kg
        time: 45, // minutes
        difficulty: 'medium',
        ingredients: {
            flour: { amount: 500, unit: 'g', preferredUnits: ['g', 'kg', 'cups'] },
            sugar: { amount: 300, unit: 'g', preferredUnits: ['g', 'kg', 'cups'] },
            eggs: { amount: 4, unit: 'pieces', preferredUnits: ['pieces'] },
            butter: { amount: 250, unit: 'g', preferredUnits: ['g', 'kg', 'cups'] },
            milk: { amount: 250, unit: 'ml', preferredUnits: ['ml', 'l', 'cups'] },
            bakingPowder: { amount: 2, unit: 'tsp', preferredUnits: ['tsp', 'tbsp', 'g'] }
        }
    },
    bun: {
        name: 'Sweet Bun',
        baseQuantity: 12, // 12 pieces
        time: 30, // minutes
        difficulty: 'easy',
        ingredients: {
            flour: { amount: 500, unit: 'g', preferredUnits: ['g', 'kg', 'cups'] },
            sugar: { amount: 100, unit: 'g', preferredUnits: ['g', 'kg', 'cups'] },
            eggs: { amount: 2, unit: 'pieces', preferredUnits: ['pieces'] },
            butter: { amount: 100, unit: 'g', preferredUnits: ['g', 'kg', 'cups'] },
            milk: { amount: 250, unit: 'ml', preferredUnits: ['ml', 'l', 'cups'] },
            yeast: { amount: 7, unit: 'g', preferredUnits: ['g', 'tsp'] }
        }
    },
    cookie: {
        name: 'Chocolate Chip Cookie',
        baseQuantity: 24, // 24 pieces
        time: 25, // minutes
        difficulty: 'easy',
        ingredients: {
            flour: { amount: 300, unit: 'g', preferredUnits: ['g', 'kg', 'cups'] },
            sugar: { amount: 200, unit: 'g', preferredUnits: ['g', 'kg', 'cups'] },
            eggs: { amount: 2, unit: 'pieces', preferredUnits: ['pieces'] },
            butter: { amount: 200, unit: 'g', preferredUnits: ['g', 'kg', 'cups'] },
            chocolateChips: { amount: 200, unit: 'g', preferredUnits: ['g', 'kg', 'cups'] },
            vanilla: { amount: 1, unit: 'tsp', preferredUnits: ['tsp', 'ml'] }
        }
    },
    muffin: {
        name: 'Blueberry Muffin',
        baseQuantity: 12, // 12 pieces
        time: 35, // minutes
        difficulty: 'medium',
        ingredients: {
            flour: { amount: 300, unit: 'g', preferredUnits: ['g', 'kg', 'cups'] },
            sugar: { amount: 150, unit: 'g', preferredUnits: ['g', 'kg', 'cups'] },
            eggs: { amount: 2, unit: 'pieces', preferredUnits: ['pieces'] },
            butter: { amount: 100, unit: 'g', preferredUnits: ['g', 'kg', 'cups'] },
            milk: { amount: 200, unit: 'ml', preferredUnits: ['ml', 'l', 'cups'] },
            blueberries: { amount: 200, unit: 'g', preferredUnits: ['g', 'kg', 'cups'] }
        }
    }
};

// Unit conversion factors
const unitConversions = {
    g: 1,
    kg: 1000,
    ml: 1,
    l: 1000,
    tsp: 5,
    tbsp: 15,
    cups: 240,
    pieces: 1
};

// Unit labels for display
const unitLabels = {
    g: 'grams',
    kg: 'kilograms',
    ml: 'milliliters',
    l: 'liters',
    tsp: 'teaspoons',
    tbsp: 'tablespoons',
    cups: 'cups',
    pieces: 'pieces'
};

// DOM Elements
const itemTypeSelect = document.getElementById('item-type');
const quantityInput = document.getElementById('quantity');
const unitSelect = document.getElementById('unit');
const calculateBtn = document.getElementById('calculate-btn');
const ingredientsList = document.getElementById('ingredients-list');
const printBtn = document.getElementById('print-btn');
const shareBtn = document.getElementById('share-btn');
const recipesGrid = document.querySelector('.recipes-grid');
const navLinks = document.querySelectorAll('.nav-links li');
const sections = document.querySelectorAll('.section');

// --- Custom Recipes Logic ---
const CUSTOM_RECIPES_KEY = 'bakevilla_custom_recipes';
let customRecipes = loadCustomRecipes();
let editingRecipeId = null;

function loadCustomRecipes() {
    try {
        return JSON.parse(localStorage.getItem(CUSTOM_RECIPES_KEY)) || [];
    } catch {
        return [];
    }
}
function saveCustomRecipes() {
    localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(customRecipes));
}

// Favorites storage
const FAVORITES_KEY = 'bakevilla_favorites';
let favorites = loadFavorites();

function loadFavorites() {
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch {
        return [];
    }
}

function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function toggleFavorite(recipeKey) {
    const index = favorites.indexOf(recipeKey);
    if (index === -1) {
        favorites.push(recipeKey);
    } else {
        favorites.splice(index, 1);
    }
    saveFavorites();
    renderRecipesGrid();
}

// Search and filter functionality
let searchTimeout;
const searchInput = document.getElementById('recipe-search');
const categorySelect = document.getElementById('recipe-category');

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        renderRecipesGrid();
    }, 300);
});

categorySelect.addEventListener('change', () => {
    renderRecipesGrid();
});

function filterRecipes() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categorySelect.value;
    
    return Object.entries(recipes).filter(([key, recipe]) => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || key === category;
        return matchesSearch && matchesCategory;
    });
}

// Recipe details modal
const recipeDetailsModal = document.getElementById('recipe-details-modal');
const closeRecipeDetailsBtn = document.getElementById('close-recipe-details');
const recipeFavoriteBtn = document.getElementById('recipe-favorite-btn');
const useRecipeBtn = document.getElementById('use-recipe-btn');
const shareRecipeBtn = document.getElementById('share-recipe-btn');

let currentRecipeKey = null;

function openRecipeDetails(recipeKey) {
    currentRecipeKey = recipeKey;
    const recipe = recipes[recipeKey];
    
    document.getElementById('recipe-details-name').textContent = recipe.name;
    document.getElementById('recipe-base-qty').textContent = `${recipe.baseQuantity} ${recipe.baseQuantity === 1 ? 'piece' : 'pieces'}`;
    document.getElementById('recipe-time').textContent = `${recipe.time} minutes`;
    document.getElementById('recipe-difficulty').textContent = recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1);
    
    const ingredientsList = document.getElementById('recipe-ingredients-list');
    ingredientsList.innerHTML = '';
    
    for (const [ingredient, details] of Object.entries(recipe.ingredients)) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${formatIngredientName(ingredient)}</span>
            <span>${details.amount} ${unitLabels[details.unit]}</span>
        `;
        ingredientsList.appendChild(li);
    }
    
    recipeFavoriteBtn.className = `favorite-btn ${favorites.includes(recipeKey) ? 'active' : ''}`;
    recipeFavoriteBtn.innerHTML = `<i class="fa${favorites.includes(recipeKey) ? 's' : 'r'} fa-heart"></i>`;
    
    recipeDetailsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeRecipeDetails() {
    recipeDetailsModal.style.display = 'none';
    document.body.style.overflow = '';
    currentRecipeKey = null;
}

closeRecipeDetailsBtn.onclick = closeRecipeDetails;
window.onclick = function(event) {
    if (event.target === recipeDetailsModal) closeRecipeDetails();
};

recipeFavoriteBtn.onclick = function() {
    if (currentRecipeKey) {
        toggleFavorite(currentRecipeKey);
        this.className = `favorite-btn ${favorites.includes(currentRecipeKey) ? 'active' : ''}`;
        this.innerHTML = `<i class="fa${favorites.includes(currentRecipeKey) ? 's' : 'r'} fa-heart"></i>`;
    }
};

useRecipeBtn.onclick = function() {
    if (currentRecipeKey) {
        selectRecipe(currentRecipeKey);
        closeRecipeDetails();
    }
};

shareRecipeBtn.onclick = async function() {
    if (currentRecipeKey) {
        const recipe = recipes[currentRecipeKey];
        const ingredientsText = Object.entries(recipe.ingredients)
            .map(([ingredient, details]) => `${formatIngredientName(ingredient)}: ${details.amount} ${unitLabels[details.unit]}`)
            .join('\n');
        
        const shareText = `${recipe.name}\n\nIngredients:\n${ingredientsText}\n\nBase quantity: ${recipe.baseQuantity} ${recipe.baseQuantity === 1 ? 'piece' : 'pieces'}\nTime: ${recipe.time} minutes\nDifficulty: ${recipe.difficulty}`;
        
        try {
            if (navigator.share) {
                await navigator.share({
                    title: recipe.name,
                    text: shareText
                });
                showNotification('Recipe shared successfully!', 'success');
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = shareText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('Recipe copied to clipboard!', 'success');
            }
        } catch (error) {
            showNotification('Failed to share recipe.', 'error');
        }
    }
};

// Update renderRecipesGrid function
function renderRecipesGrid() {
    recipesGrid.innerHTML = '';
    recipesGrid.classList.add('loading');
    
    setTimeout(() => {
        recipesGrid.classList.remove('loading');
        
        // Render filtered recipes
        const filteredRecipes = filterRecipes();
        
        filteredRecipes.forEach(([key, recipe]) => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            recipeCard.innerHTML = `
                <div class="card-content">
                    <div class="recipe-icon">
                        <i class="fas fa-${getRecipeIcon(key)}"></i>
                    </div>
                    <h3>${recipe.name}</h3>
                    <div class="recipe-meta">
                        <span><i class="fas fa-balance-scale"></i> ${recipe.baseQuantity} ${recipe.baseQuantity === 1 ? 'piece' : 'pieces'}</span>
                        <span><i class="fas fa-clock"></i> ${recipe.time} min</span>
                        <span><i class="fas fa-fire"></i> ${recipe.difficulty}</span>
                    </div>
                    <div class="recipe-actions">
                        <button class="primary-button" onclick="openRecipeDetails('${key}')">
                            <i class="fas fa-info-circle"></i>
                            Details
                        </button>
                        <button class="secondary-button" onclick="selectRecipe('${key}')">
                            <i class="fas fa-calculator"></i>
                            Use
                        </button>
                    </div>
                </div>
            `;
            recipesGrid.appendChild(recipeCard);
        });
        
        // Render custom recipes
        customRecipes.forEach((recipe, idx) => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            recipeCard.innerHTML = `
                <div class="card-content">
                    <div class="recipe-icon">
                        <i class="fas fa-${recipe.icon || 'utensils'}"></i>
                    </div>
                    <h3>${recipe.name}</h3>
                    <div class="recipe-meta">
                        <span><i class="fas fa-balance-scale"></i> ${recipe.baseQuantity} ${recipe.baseQuantity === 1 ? 'piece' : 'pieces'}</span>
                        <span><i class="fas fa-clock"></i> ${recipe.time || 'N/A'} min</span>
                        <span><i class="fas fa-fire"></i> ${recipe.difficulty || 'N/A'}</span>
                    </div>
                    <div class="recipe-actions">
                        <button class="primary-button" onclick="openCustomRecipeDetails(${idx})">
                            <i class="fas fa-info-circle"></i>
                            Details
                        </button>
                        <button class="secondary-button" onclick="useCustomRecipe(${idx})">
                            <i class="fas fa-calculator"></i>
                            Use
                        </button>
                    </div>
                </div>
            `;
            recipesGrid.appendChild(recipeCard);
        });
        
        // Add 'Create Custom Recipe' card
        const addCard = document.createElement('div');
        addCard.className = 'recipe-card';
        addCard.style.border = '2px dashed var(--secondary-color)';
        addCard.style.cursor = 'pointer';
        addCard.innerHTML = `
            <div class="card-content">
                <div class="recipe-icon">
                    <i class="fas fa-plus"></i>
                </div>
                <h3>Create Custom Recipe</h3>
                <p>Add your own recipe to the collection</p>
                <button class="primary-button" id="open-custom-recipe-modal">
                    <i class="fas fa-plus"></i>
                    New Recipe
                </button>
            </div>
        `;
        recipesGrid.appendChild(addCard);
        document.getElementById('open-custom-recipe-modal').onclick = openCustomRecipeModal;
    }, 500);
}

// Modal logic
const customRecipeModal = document.getElementById('custom-recipe-modal');
const closeCustomRecipeModalBtn = document.getElementById('close-custom-recipe-modal');
const customRecipeForm = document.getElementById('custom-recipe-form');
const customIngredientsList = document.getElementById('custom-ingredients-list');
const addIngredientBtn = document.getElementById('add-ingredient-btn');

function openCustomRecipeModal(editIdx = null) {
    editingRecipeId = editIdx;
    customRecipeModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    resetCustomRecipeForm();
    if (editIdx !== null) {
        // Editing
        document.getElementById('custom-recipe-modal-title').textContent = 'Edit Custom Recipe';
        const recipe = customRecipes[editIdx];
        document.getElementById('custom-recipe-name').value = recipe.name;
        document.getElementById('custom-recipe-icon').value = recipe.icon;
        document.getElementById('custom-recipe-base-qty').value = recipe.baseQuantity;
        document.getElementById('custom-recipe-time').value = recipe.time;
        document.getElementById('custom-recipe-difficulty').value = recipe.difficulty;
        customIngredientsList.innerHTML = '';
        recipe.ingredients.forEach(ing => addIngredientRow(ing));
    } else {
        document.getElementById('custom-recipe-modal-title').textContent = 'Create Custom Recipe';
        addIngredientRow();
    }
}
function closeCustomRecipeModal() {
    customRecipeModal.style.display = 'none';
    document.body.style.overflow = '';
    editingRecipeId = null;
}
closeCustomRecipeModalBtn.onclick = closeCustomRecipeModal;
window.onclick = function(event) {
    if (event.target === customRecipeModal) closeCustomRecipeModal();
};

function resetCustomRecipeForm() {
    customRecipeForm.reset();
    customIngredientsList.innerHTML = '';
}

function addIngredientRow(ingredient = {}) {
    const row = document.createElement('div');
    row.className = 'custom-ingredient-row';
    row.innerHTML = `
        <input type="text" placeholder="Name" value="${ingredient.name || ''}" required maxlength="20">
        <input type="number" placeholder="Amount" value="${ingredient.amount || ''}" min="0.01" step="0.01" required>
        <select required>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="l">l</option>
            <option value="tsp">tsp</option>
            <option value="tbsp">tbsp</option>
            <option value="cups">cups</option>
            <option value="pieces">pieces</option>
        </select>
        <button type="button" class="remove-ingredient-btn" title="Remove"><i class="fas fa-times"></i></button>
    `;
    if (ingredient.unit) row.querySelector('select').value = ingredient.unit;
    row.querySelector('.remove-ingredient-btn').onclick = () => row.remove();
    customIngredientsList.appendChild(row);
}
addIngredientBtn.onclick = () => addIngredientRow();

customRecipeForm.onsubmit = function(e) {
    e.preventDefault();
    // Gather data
    const name = document.getElementById('custom-recipe-name').value.trim();
    const icon = document.getElementById('custom-recipe-icon').value.trim();
    const baseQuantity = parseInt(document.getElementById('custom-recipe-base-qty').value);
    const time = parseInt(document.getElementById('custom-recipe-time').value);
    const difficulty = document.getElementById('custom-recipe-difficulty').value;
    const ingredientRows = Array.from(customIngredientsList.querySelectorAll('.custom-ingredient-row'));
    const ingredients = ingredientRows.map(row => {
        const [nameInput, amountInput, unitSelect] = row.querySelectorAll('input, select');
        return {
            name: nameInput.value.trim(),
            amount: parseFloat(amountInput.value),
            unit: unitSelect.value,
            preferredUnits: [unitSelect.value]
        };
    }).filter(ing => ing.name && ing.amount > 0);
    
    if (!name || !icon || !baseQuantity || !time || !difficulty || ingredients.length === 0) {
        showNotification('Please fill all fields and add at least one ingredient.', 'error');
        return;
    }
    
    const recipeObj = {
        name,
        icon,
        baseQuantity,
        time,
        difficulty,
        ingredients
    };
    
    if (editingRecipeId !== null) {
        customRecipes[editingRecipeId] = recipeObj;
        showNotification('Custom recipe updated!', 'success');
    } else {
        customRecipes.push(recipeObj);
        showNotification('Custom recipe added!', 'success');
    }
    
    saveCustomRecipes();
    renderRecipesGrid();
    closeCustomRecipeModal();
};

function useCustomRecipe(idx) {
    // Add to calculator
    const recipe = customRecipes[idx];
    // Add to recipes as a temp key
    recipes['custom_temp'] = {
        name: recipe.name,
        baseQuantity: recipe.baseQuantity,
        ingredients: Object.fromEntries(recipe.ingredients.map(ing => [ing.name, {
            amount: ing.amount,
            unit: ing.unit,
            preferredUnits: ing.preferredUnits || [ing.unit]
        }]))
    };
    itemTypeSelect.value = 'custom_temp';
    validateForm();
    calculateIngredients();
    navigateToSection('calculator');
}
function editCustomRecipe(idx) {
    openCustomRecipeModal(idx);
}
function deleteCustomRecipe(idx) {
    if (confirm('Delete this custom recipe?')) {
        customRecipes.splice(idx, 1);
        saveCustomRecipes();
        renderRecipesGrid();
        showNotification('Custom recipe deleted.', 'success');
    }
}

// Override populateRecipesGrid to use new renderRecipesGrid
function populateRecipesGrid() {
    renderRecipesGrid();
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    // Hamburger menu for mobile
    const hamburger = document.getElementById('hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    const navMenu = document.getElementById('main-navigation');

    function openMenu() {
        sidebar.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        navMenu.style.display = 'flex';
        navMenu.focus();
        document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
        sidebar.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        navMenu.style.display = '';
        document.body.style.overflow = '';
    }
    function toggleMenu() {
        if (sidebar.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    if (hamburger && sidebar) {
        hamburger.addEventListener('click', toggleMenu);
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });
        // Trap focus inside menu when open
        navMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusableEls = Array.from(navMenu.querySelectorAll('li'));
                const firstEl = focusableEls[0];
                const lastEl = focusableEls[focusableEls.length - 1];
                if (e.shiftKey && document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                } else if (!e.shiftKey && document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            } else if (e.key === 'Escape') {
                closeMenu();
                hamburger.focus();
            }
        });
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('open') && !sidebar.contains(e.target)) {
                closeMenu();
            }
        });
        // Close menu when a nav link is clicked
        const navLinksEls = sidebar.querySelectorAll('.nav-links li');
        navLinksEls.forEach(link => {
            link.setAttribute('tabindex', '0');
            link.addEventListener('click', () => {
                closeMenu();
            });
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    closeMenu();
                }
            });
        });
    }
});

// Initialize app
function initializeApp() {
    populateRecipesGrid();
    setupNavigation();
    setupAnimations();
}

// Setup navigation
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const section = link.dataset.section;
            navigateToSection(section);
        });
    });
}

// Navigate to section
function navigateToSection(sectionId) {
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });

    sections.forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
}

// Setup animations
function setupAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.calculator-container, .recipe-card').forEach(el => {
        observer.observe(el);
    });
}

// Get recipe icon
function getRecipeIcon(recipeType) {
    const icons = {
        cake: 'birthday-cake',
        bun: 'bread-slice',
        cookie: 'cookie',
        muffin: 'muffin'
    };
    return icons[recipeType] || 'utensils';
}

// Setup event listeners
function setupEventListeners() {
    calculateBtn.addEventListener('click', calculateIngredients);
    printBtn.addEventListener('click', printIngredientsList);
    shareBtn.addEventListener('click', shareIngredientsList);

    // Add input validation
    quantityInput.addEventListener('input', validateQuantity);
    itemTypeSelect.addEventListener('change', validateForm);
    unitSelect.addEventListener('change', validateForm);
}

// Validate quantity input
function validateQuantity(e) {
    const value = e.target.value;
    if (value < 0) {
        e.target.value = 0;
    }
    validateForm();
}

// Validate form
function validateForm() {
    const isValid = itemTypeSelect.value && quantityInput.value > 0;
    calculateBtn.disabled = !isValid;
    calculateBtn.classList.toggle('disabled', !isValid);

    // Add/remove .invalid class for select and input
    if (!itemTypeSelect.value) {
        itemTypeSelect.classList.add('invalid');
    } else {
        itemTypeSelect.classList.remove('invalid');
    }
    if (!quantityInput.value || quantityInput.value <= 0) {
        quantityInput.classList.add('invalid');
    } else {
        quantityInput.classList.remove('invalid');
    }
}

// Select recipe from grid
function selectRecipe(recipeKey) {
    itemTypeSelect.value = recipeKey;
    validateForm();
    calculateIngredients();
    navigateToSection('calculator');
}

// Show loading state
function showLoading() {
    calculateBtn.innerHTML = '<span class="loading"></span> Calculating...';
    calculateBtn.disabled = true;
}

// Hide loading state
function hideLoading() {
    calculateBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculate Ingredients';
    calculateBtn.disabled = false;
}

// Calculate ingredients based on input
async function calculateIngredients() {
    const itemType = itemTypeSelect.value;
    const quantity = parseFloat(quantityInput.value);
    const unit = unitSelect.value;

    if (!itemType || !quantity || quantity <= 0) {
        showNotification('Please select an item type and enter a valid quantity.', 'error');
        return;
    }

    showLoading();

    // Simulate API call with timeout
    await new Promise(resolve => setTimeout(resolve, 500));

    const recipe = recipes[itemType];
    const baseQuantity = recipe.baseQuantity;
    const ratio = quantity / baseQuantity;

    // Clear previous list
    ingredientsList.innerHTML = '';
    const ul = document.createElement('ul');

    for (const [ingredient, details] of Object.entries(recipe.ingredients)) {
        const calculatedAmount = details.amount * ratio;
        const convertedAmount = convertUnit(calculatedAmount, details.unit, unit);

        // Create unit selector for each ingredient
        const unitSelector = createUnitSelector(ingredient, details.preferredUnits, unit);

        // Create list item
        const li = document.createElement('li');

        // Ingredient info
        const infoDiv = document.createElement('div');
        infoDiv.className = 'ingredient-info';
        infoDiv.innerHTML = `<i class="fas fa-${getIngredientIcon(ingredient)}"></i><strong>${formatIngredientName(ingredient)}</strong>`;

        // Amount and unit selector
        const amountDiv = document.createElement('div');
        amountDiv.className = 'ingredient-amount';
        const amountSpan = document.createElement('span');
        amountSpan.className = 'amount';
        amountSpan.textContent = formatAmount(convertedAmount);
        amountDiv.appendChild(amountSpan);
        amountDiv.appendChild(unitSelector);

        li.appendChild(infoDiv);
        li.appendChild(amountDiv);
        ul.appendChild(li);
    }
    ingredientsList.appendChild(ul);

    // Add event listeners to unit selectors
    document.querySelectorAll('.ingredient-unit-select').forEach(select => {
        select.addEventListener('change', handleUnitChange);
    });

    hideLoading();
    showNotification('Ingredients calculated successfully!', 'success');
}

// Create unit selector for an ingredient
function createUnitSelector(ingredient, preferredUnits, selectedUnit) {
    const select = document.createElement('select');
    select.className = 'ingredient-unit-select';
    select.dataset.ingredient = ingredient;
    
    preferredUnits.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unitLabels[unit];
        option.selected = unit === selectedUnit;
        select.appendChild(option);
    });
    
    return select;
}

// Handle unit change for an ingredient
function handleUnitChange(event) {
    const select = event.target;
    const ingredient = select.dataset.ingredient;
    const newUnit = select.value;
    const amountSpan = select.parentElement.querySelector('.amount');
    // Find the original amount and unit from the recipe and calculation
    const itemType = itemTypeSelect.value;
    const quantity = parseFloat(quantityInput.value);
    const recipe = recipes[itemType];
    const baseQuantity = recipe.baseQuantity;
    const ratio = quantity / baseQuantity;
    const details = recipe.ingredients[ingredient];
    const calculatedAmount = details.amount * ratio;
    // Convert from the ingredient's base unit to the new unit
    const convertedAmount = convertUnit(calculatedAmount, details.unit, newUnit);
    amountSpan.textContent = formatAmount(convertedAmount);
}

// Format amount with appropriate precision
function formatAmount(amount) {
    if (amount < 0.01) {
        return amount.toFixed(4);
    } else if (amount < 1) {
        return amount.toFixed(2);
    } else {
        return amount.toFixed(1);
    }
}

// Get ingredient icon
function getIngredientIcon(ingredient) {
    const icons = {
        flour: 'bread-slice', // closest to flour
        sugar: 'cubes',
        eggs: 'egg',
        butter: 'cheese',
        milk: 'mug-hot', // closest to milk
        bakingPowder: 'mortar-pestle',
        yeast: 'microscope',
        chocolateChips: 'cookie',
        vanilla: 'flask',
        blueberries: 'apple-whole',
        salt: 'cubes', // use cubes for salt
        oil: 'oil-can', // only in pro, fallback below
        water: 'tint',
        cream: 'ice-cream',
        honey: 'seedling', // fallback
        lemon: 'lemon',
        cinnamon: 'seedling',
        nuts: 'seedling', // fallback
        raisins: 'seedling', // fallback
        cocoa: 'mug-hot',
        bakingSoda: 'vial', // fallback
        cornstarch: 'vial', // fallback
        cheese: 'cheese',
        apple: 'apple-whole',
        carrot: 'carrot',
        orange: 'lemon', // fallback
        banana: 'lemon', // fallback
        strawberry: 'seedling', // fallback
        // Add more as needed
    };
    // Only use icons that are in Font Awesome Free 6
    const faFree = [
        'bread-slice','cubes','egg','cheese','mug-hot','mortar-pestle','microscope','cookie','flask','apple-whole','tint','ice-cream','lemon','seedling','vial','carrot','utensils'
    ];
    return faFree.includes(icons[ingredient]) ? icons[ingredient] : 'utensils';
}

// Convert units
function convertUnit(amount, fromUnit, toUnit) {
    const fromFactor = unitConversions[fromUnit] || 1;
    const toFactor = unitConversions[toUnit] || 1;
    return (amount * fromFactor) / toFactor;
}

// Format ingredient names
function formatIngredientName(name) {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/([a-z])([A-Z])/g, '$1 $2');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    document.getElementById('notification-container').appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Print ingredients list
function printIngredientsList() {
    // Gather data for print
    const ingredients = Array.from(ingredientsList.querySelectorAll('li')).map(li => {
        const name = li.querySelector('.ingredient-info strong').textContent;
        const amount = li.querySelector('.amount').textContent;
        const unit = li.querySelector('.ingredient-unit-select').value;
        return { name, amount, unit };
    });

    // Get current date/time
    const now = new Date();
    const dateString = now.toLocaleString();

    // Build print HTML
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Bake Villa - Ingredients List</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        font-family: 'Poppins', Arial, sans-serif;
                        background: #fff;
                        color: #2C3E50;
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .print-container {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 40px;
                    }
                    .print-header {
                        text-align: center;
                        padding: 2rem 0;
                        margin-bottom: 2rem;
                        border-bottom: 2px solid #FF6B6B;
                    }
                    .print-header .logo {
                        font-size: 2.5rem;
                        color: #FF6B6B;
                        font-weight: 700;
                        letter-spacing: 1px;
                        margin-bottom: 0.5rem;
                    }
                    .print-header .title {
                        font-size: 1.8rem;
                        color: #2C3E50;
                        margin: 1rem 0;
                    }
                    .print-header .date {
                        font-size: 0.9rem;
                        color: #6C7A89;
                    }
                    .ingredients-table {
                        width: 100%;
                        border-collapse: separate;
                        border-spacing: 0;
                        margin: 2rem 0;
                    }
                    .ingredients-table th {
                        background: #FF6B6B;
                        color: #fff;
                        padding: 1rem 1.5rem;
                        text-align: left;
                        font-weight: 600;
                        font-size: 1rem;
                    }
                    .ingredients-table td {
                        padding: 1rem 1.5rem;
                        border-bottom: 1px solid #eee;
                        font-size: 0.95rem;
                    }
                    .ingredients-table tr:last-child td {
                        border-bottom: none;
                    }
                    .ingredients-table th.amount {
                        text-align: right;
                    }
                    .ingredients-table td.amount {
                        text-align: right;
                        font-weight: 600;
                        color: #4ECDC4;
                    }
                    .ingredients-table td.unit {
                        color: #6C7A89;
                    }
                    .print-footer {
                        text-align: center;
                        margin-top: 3rem;
                        padding-top: 1rem;
                        border-top: 1px solid #eee;
                        color: #6C7A89;
                        font-size: 0.9rem;
                    }
                    @media print {
                        body {
                            background: #fff;
                        }
                        .print-container {
                            padding: 20px;
                        }
                        .ingredients-table th {
                            background: #FF6B6B !important;
                            color: #fff !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    <div class="print-header">
                        <div class="logo">Bake Villa</div>
                        <h1 class="title">Ingredients List</h1>
                        <div class="date">${dateString}</div>
                    </div>
                    <table class="ingredients-table">
                        <thead>
                            <tr>
                                <th>Ingredient</th>
                                <th class="amount">Amount</th>
                                <th class="unit">Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ingredients.map(ing => `
                                <tr>
                                    <td>${ing.name}</td>
                                    <td class="amount">${ing.amount}</td>
                                    <td class="unit">${unitLabels[ing.unit]}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="print-footer">
                        <div style="height: 40px;"></div>
                    </div>
                    <div style="width:100%;text-align:center;position:fixed;bottom:30px;left:0;font-size:1rem;color:#6C7A89;">
                        www.bakevilla.com
                    </div>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Share ingredients list
async function shareIngredientsList() {
    const ingredientsText = Array.from(ingredientsList.querySelectorAll('li'))
        .map(li => {
            const name = li.querySelector('.ingredient-info strong').textContent;
            const amount = li.querySelector('.amount').textContent;
            const unit = li.querySelector('.ingredient-unit-select').value;
            return `${name}: ${amount} ${unitLabels[unit]}`;
        })
        .join('\n');

    try {
        if (navigator.share) {
            await navigator.share({
                title: 'My Bakery Ingredients List',
                text: ingredientsText
            });
            showNotification('Ingredients list shared successfully!', 'success');
        } else {
            // Fallback for browsers that don't support Web Share API
            const textArea = document.createElement('textarea');
            textArea.value = ingredientsText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Ingredients list copied to clipboard!', 'success');
        }
    } catch (error) {
        showNotification('Failed to share ingredients list.', 'error');
    }
}

// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
