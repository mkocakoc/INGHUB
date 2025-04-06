import { langStore } from './lang-store.js';
import { LitElement, html, css } from 'lit';

const EMPLOYEE_STORAGE_KEY = 'employeeList';

export class EmployeeList extends LitElement {
    static properties = {
        employees: { type: Array },
        currentPage: { type: Number },
        itemsPerPage: { type: Number },
        editingEmployee: { type: Object },
        isModalOpen: { type: Boolean },
        isNewModalOpen: { type: Boolean },
        newEmployee: { type: Object },
        selectedEmployees: { type: Object },
        toasts: { type: Array }
    };

    constructor() {
        super();
        const storedEmployees = localStorage.getItem(EMPLOYEE_STORAGE_KEY);
        this.employees = storedEmployees ? JSON.parse(storedEmployees) : Array.from({ length: 55 }, (_, i) => ({
            id: i + 1,
            firstName: `Employee ${i + 1}`,
            lastName: "Sourtimes",
            employmentDate: "23/09/2022",
            birthDate: "23/09/1990",
            phone: "+(90) 532 123 45 67",
            email: `employee${i + 1}@company.com`,
            department: "Analytics",
            position: "Junior"
        }));

        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.editingEmployee = null;
        this.isModalOpen = false;
        this.isNewModalOpen = false;
        this.newEmployee = this._getEmptyEmployee();
        this.selectedEmployees = new Set();
        this.toasts = [];

        langStore.onChange(() => this.requestUpdate());
    }

    connectedCallback() {
        super.connectedCallback();
        // İlk render veya bileşen DOM'a bağlandıktan sonra dil anahtarını kullanabilirsiniz.
        console.log(this.t('some.key'));
    }

    _getEmptyEmployee() {
        return {
            id: Date.now(),
            firstName: "",
            lastName: "",
            employmentDate: "",
            birthDate: "",
            phone: "",
            email: "",
            department: "",
            position: ""
        };
    }

    t(key) {
        return langStore.t(key);
    }
    createRenderRoot() {
        return this;
    }

    getDisplayedEmployees() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return this.employees.slice(start, start + this.itemsPerPage);
    }

    totalPages() {
        return Math.ceil(this.employees.length / this.itemsPerPage);
    }

    goToPage(page) {
        if (page < 1 || page > this.totalPages()) return;
        this.currentPage = page;
        this.requestUpdate();
    }

    previousPage = () => this.goToPage(this.currentPage - 1);
    nextPage = () => this.goToPage(this.currentPage + 1);

    editEmployee(employee) {
        this.editingEmployee = { ...employee };
        this.isModalOpen = true;
    }

    deleteEmployee(employee) {
        this.employees = this.employees.filter(emp => emp.id !== employee.id);
        this.selectedEmployees.delete(employee.id);
        this.showToast(this.t('employeeDeleted'));
        this._saveEmployeesToStorage();
        this.requestUpdate();
    }

    saveEmployee() {
        if (this.editingEmployee) {
            this.employees = this.employees.map(emp =>
                emp.id === this.editingEmployee.id ? this.editingEmployee : emp
            );
            this.closeModal();
            this.showToast(this.t('employeeUpldated'));
            this._saveEmployeesToStorage();
            this.requestUpdate();
        }
    }

    saveNewEmployee() {
        this.employees = [{ ...this.newEmployee, id: Date.now() }, ...this.employees];
        this.closeNewModal();
        this.showToast(this.t('employeeAdded'));
        this.currentPage = 1;
        this._saveEmployeesToStorage();
        this.requestUpdate();
    }

    closeModal() {
        this.isModalOpen = false;
        this.editingEmployee = null;
    }

    openNewModal = () => {
        this.newEmployee = this._getEmptyEmployee();
        this.isNewModalOpen = true;
    };

    closeNewModal = () => {
        this.isNewModalOpen = false;
        this.newEmployee = this._getEmptyEmployee();
    };

    _formatPhone(value) {
        const cleaned = ('' + value).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}${match[3] ? '-' + match[3] : ''}`;
        }
        return value;
    }

    _formatDate(value) {
        const cleaned = ('' + value).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
        if (match) {
            let formatted = '';
            if (match[1]) formatted += match[1];
            if (match[2]) formatted += (formatted ? '/' : '') + match[2];
            if (match[3]) formatted += (formatted ? '/' : '') + match[3];
            return formatted;
        }
        return value;
    }

    _isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    _handleEditInputChange(prop, value) {
        let formattedValue = value;
        if (prop === 'phone') {
            formattedValue = this._formatPhone(value);
        } else if (prop === 'employmentDate' || prop === 'birthDate') {
            formattedValue = this._formatDate(value);
        } else if (prop === 'email') {
            formattedValue = value;
        }
        this.editingEmployee = { ...this.editingEmployee, [prop]: formattedValue };
    }

    _handleNewInputChange(prop, value) {
        let formattedValue = value;
        if (prop === 'phone') {
            formattedValue = this._formatPhone(value);
        } else if (prop === 'employmentDate' || prop === 'birthDate') {
            formattedValue = this._formatDate(value);
        } else if (prop === 'email') {
            formattedValue = value;
        }
        this.newEmployee = { ...this.newEmployee, [prop]: formattedValue };
    }

    toggleSelectAll(e) {
        const checked = e.target.checked;
        const displayed = this.getDisplayedEmployees();
        displayed.forEach(emp => {
            if (checked) {
                this.selectedEmployees.add(emp.id);
            } else {
                this.selectedEmployees.delete(emp.id);
            }
        });
        this.requestUpdate();
    }

    toggleSelectOne(empId, e) {
        if (e.target.checked) {
            this.selectedEmployees.add(empId);
        } else {
            this.selectedEmployees.delete(empId);
        }
        this.requestUpdate();
    }

    isAllSelected() {
        const displayed = this.getDisplayedEmployees();
        return displayed.every(emp => this.selectedEmployees.has(emp.id));
    }

    showToast(message) {
        const toast = { message, id: Date.now() };
        this.toasts = [...this.toasts, toast];
        this.requestUpdate();

        setTimeout(() => {
            this.toasts = this.toasts.filter(t => t.id !== toast.id);
            this.requestUpdate();
        }, 3000);
    }

    _saveEmployeesToStorage() {
        localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(this.employees));
    }

    renderPagination() {
        const total = this.totalPages();
        if (total <= 1) return html``;

        return html`
            <div class="pagination">
                <button @click="${this.previousPage}" ?disabled="${this.currentPage === 1}">&lt;</button>
                ${Array.from({ length: total }, (_, i) => html`
                    <button
                        class="${this.currentPage === i + 1 ? 'active' : ''}"
                        @click="${() => this.goToPage(i + 1)}">
                        ${i + 1}
                    </button>
                `)}
                <button @click="${this.nextPage}" ?disabled="${this.currentPage === total}">&gt;</button>
            </div>
        `;
    }

    renderEditModal() {
        if (!this.isModalOpen || !this.editingEmployee) return html``;

        const emp = this.editingEmployee;
        return html`
            <div class="modal">
                <div class="modal-content">
                    <h2>${this.t('editEmployee')}</h2>
                    <label>${this.t('firstName')}</label>
                    <input type="text" .value="${emp.firstName}" @input="${e => this._handleEditInputChange('firstName', e.target.value)}">
                    <label>${this.t('lastName')}</label>
                    <input type="text" .value="${emp.lastName}" @input="${e => this._handleEditInputChange('lastName', e.target.value)}">
                    <label>${this.t('employmentDate')}</label>
                    <input type="text" .value="${emp.employmentDate}" @input="${e => this._handleEditInputChange('employmentDate', e.target.value)}">
                    <label>${this.t('birthDate')}</label>
                    <input type="text" .value="${emp.birthDate}" @input="${e => this._handleEditInputChange('birthDate', e.target.value)}">
                    <label>${this.t('phone')}</label>
                    <input type="text" .value="${emp.phone}" @input="${e => this._handleEditInputChange('phone', e.target.value)}">
                    <label>${this.t('email')}</label>
                    <input type="text" .value="${emp.email}" @input="${e => this._handleEditInputChange('email', e.target.value)}">
                    <label>${this.t('department')}</label>
                    <input type="text" .value="${emp.department}" @input="${e => this._handleEditInputChange('department', e.target.value)}">
                    <label>${this.t('position')}</label>
                    <input type="text" .value="${emp.position}" @input="${e => this._handleEditInputChange('position', e.target.value)}">
                    <button @click="${this.saveEmployee}">${this.t('save')}</button>
                    <button @click="${this.closeModal}">${this.t('cancel')}</button>
                </div>
            </div>
        `;
    }

    renderNewModal() {
        if (!this.isNewModalOpen) return html``;

        return html`
            <div class="modal">
                <div class="modal-content">
                    <h2>${this.t('addNew')}</h2>
                    <label>${this.t('firstName')}</label>
                    <input type="text" .value="${this.newEmployee.firstName}" @input="${e => this._handleNewInputChange('firstName', e.target.value)}">
                    <label>${this.t('lastName')}</label>
                    <input type="text" .value="${this.newEmployee.lastName}" @input="${e => this._handleNewInputChange('lastName', e.target.value)}">
                    <label>${this.t('employmentDate')}</label>
                    <input type="text" .value="${this.newEmployee.employmentDate}" @input="${e => this._handleNewInputChange('employmentDate', e.target.value)}">
                    <label>${this.t('birthDate')}</label>
                    <input type="text" .value="${this.newEmployee.birthDate}" @input="${e => this._handleNewInputChange('birthDate', e.target.value)}">
                    <label>${this.t('phone')}</label>
                    <input type="text" .value="${this.newEmployee.phone}" @input="${e => this._handleNewInputChange('phone', e.target.value)}">
                    <label>${this.t('email')}</label>
                    <input type="text" .value="${this.newEmployee.email}" @input="${e => this._handleNewInputChange('email', e.target.value)}">
                    <label>${this.t('department')}</label>
                    <input type="text" .value="${this.newEmployee.department}" @input="${e => this._handleNewInputChange('department', e.target.value)}">
                    <label>${this.t('position')}</label>
                    <input type="text" .value="${this.newEmployee.position}" @input="${e => this._handleNewInputChange('position', e.target.value)}">
                    <button @click="${this.saveNewEmployee}">${this.t('save')}</button>
                    <button @click="${this.closeNewModal}">${this.t('cancel')}</button>
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <div class="toaster-container">
                ${this.toasts.map(toast => html`<div class="toast">${toast.message}</div>`)}
            </div>
            <h1>${this.t('title')}</h1>
            <table>
                <thead>
                    <tr>
                        <th><input type="checkbox" @change="${this.toggleSelectAll}" .checked="${this.isAllSelected()}"></th>
                        <th>${this.t('firstName')}</th>
                        <th>${this.t('lastName')}</th>
                        <th>${this.t('employmentDate')}</th>
                        <th>${this.t('birthDate')}</th>
                        <th>${this.t('phone')}</th>
                        <th>${this.t('email')}</th>
                        <th>${this.t('department')}</th>
                        <th>${this.t('position')}</th>
                        <th>${this.t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.getDisplayedEmployees().map(emp => html`
                        <tr>
                            <td><input type="checkbox"
                                        .checked="${this.selectedEmployees.has(emp.id)}"
                                        @change="${(e) => this.toggleSelectOne(emp.id, e)}"></td>
                            <td>${emp.firstName}</td>
                            <td>${emp.lastName}</td>
                            <td>${emp.employmentDate}</td>
                            <td>${emp.birthDate}</td>
                            <td>${emp.phone}</td>
                            <td>${emp.email}</td>
                            <td>${emp.department}</td>
                            <td>${emp.position}</td>
                            <td>
                                <button @click="${() => this.editEmployee(emp)}"><i class="fa-solid fa-pen-to-square"></i></button>
                                <button @click="${() => this.deleteEmployee(emp)}"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>
                    `)}
                </tbody>
            </table>
            ${this.renderPagination()}
            ${this.renderEditModal()}
            ${this.renderNewModal()}
        `;
    }
}

customElements.define('employee-list', EmployeeList);