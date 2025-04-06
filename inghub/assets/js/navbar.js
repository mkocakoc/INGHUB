import { LitElement, html, css } from 'lit';
import { langStore } from '../../assets/js/lang-store.js';
import './localization.js';

export class NavbarComponent extends LitElement {
    static properties = {
        lang: { type: String },
        employeeList: { type: Object },
        _isDropdownOpen: { type: Boolean, state: true }
    };

    constructor() {
        super();
        this.lang = langStore.getLang();
        this.employeeList = null;
        this._isDropdownOpen = false;

        langStore.onChange(() => {
            this.lang = langStore.getLang();
            this.requestUpdate();
        });
    }

 

    t(key) {
        return langStore.t(key);
    }

    changeLang(newLang) {
        langStore.setLang(newLang);
        this._isDropdownOpen = false; 
    }

    toggleDropdown() {
        this._isDropdownOpen = !this._isDropdownOpen;
    }

    openNewEmployeeModal = () => {
        if (this.employeeList && this.employeeList.openNewModal) {
            this.employeeList.openNewModal();
        } else {
            console.warn("EmployeeList component or its openNewModal method not found.");
        }
    };

    createRenderRoot() {
        return this;
    }

    render() {
        return html`
            <div class="navbar">
                <div class="left">
                    <div class="logo">
                        <img src=".././assets/images/logo/favicon.png" alt="ING Logo" />
                        <span class="logoText">ING</span>
                    </div>
                </div>
                <div class="right">
                    <span class="nav-link"><i class="fa-solid fa-user-tie"></i> ${this.t('employees')}</span>
                    <span class="nav-link" @click="${this.openNewEmployeeModal}"><i class="fa-solid fa-plus "></i> ${this.t('addNew')}</span>
                    <div class="custom-dropdown">
                        <button class="dropdown-toggle" @click="${this.toggleDropdown}">
                            ${this.lang === 'en'
                                ? html`<img src="../assets/images/logo/englishFlag.png" class="flag" alt="English Flag"> `
                                : html`<img src="../assets/images/logo/turkishFlag.png" class="flag" alt="Türkçe Bayrağı"> `}
                        </button>
                        <ul id="lang-switcher-list" class="dropdown-menu ${this._isDropdownOpen ? 'show' : ''}">
                            <li><a @click="${() => this.changeLang('en')}"><img src="../assets/images/logo/englishFlag.png" class="flag" alt="English"></a></li>
                            <li><a @click="${() => this.changeLang('tr')}"><img src="../assets/images/logo/turkishFlag.png" class="flag" alt="Turkish"></a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('navbar-component', NavbarComponent);