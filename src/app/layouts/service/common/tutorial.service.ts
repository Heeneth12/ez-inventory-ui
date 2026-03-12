import { Injectable } from '@angular/core';
import { driver, Driver, Config, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
type ModuleKey = 'items' | 'general';

@Injectable({
    providedIn: 'root'
})
export class TutorialService {
    private driverObj?: Driver;

    constructor() { }

    startTour(moduleKey: ModuleKey = 'general') {

        if (this.driverObj) {
            this.driverObj.destroy();
        }

        this.driverObj = driver({
            showProgress: true,
            animate: true,
            popoverClass: 'driverjs-theme',
            steps: MODULE_STEPS[moduleKey] || MODULE_STEPS['general']
        });

        this.driverObj.drive();
    }

    closeTour() {
        this.driverObj?.destroy();
    }
}

const MODULE_STEPS: Record<string, DriveStep[]> = {
    'general': [
        {
            element: '#app-sidebar',
            popover: {
                title: 'Navigation Menu',
                description: 'Access your Dashboard, Inventory, and Settings here. Collapse the menu to maximize your workspace.',
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#smart-search',
            popover: {
                title: 'Smart Search',
                description: 'Press <b>Ctrl+K</b> to quickly find items, invoices, or contacts without leaving your current page.',
                side: 'bottom'
            }
        },
        {
            element: '#quick-create-btn',
            popover: {
                title: 'Quick Actions',
                description: 'Need to create an invoice fast? Click this bolt icon for instant access to common tasks.',
                side: 'left'
            }
        },
        {
            element: '#help-center-btn',
            popover: {
                title: 'Help Center',
                description: 'Need to create an invoice fast? Click this bolt icon for instant access to common tasks.',
                side: 'left'
            }
        },
        {
            element: '#menu-item-0',
            popover: {
                title: 'Dashboard',
                description: 'View your real-time analytics and alerts here.',
                side: 'right'
            }
        },
        {
            element: '#menu-item-1',
            popover: {
                title: 'Item Catalog',
                description: 'Manage your products, services, and price lists.',
                side: 'right'
            }
        },
        {
            element: '#menu-item-4',
            popover: {
                title: 'Sales Module',
                description: 'Manage Quotes, Orders, Invoices, and Payments.',
                side: 'right'
            }
        },
    ],

    'items': [
        {
            element: '#data-table',
            popover: {
                title: 'Item Catalog',
                description: 'This is where you can view and manage all your products and services in a centralized table.',
                side: 'top'
            }
        },
        {
            element: '#table-action-create_item',
            popover: {
                title: 'Create Items',
                description: 'Click here to manually define a new product, service, or abstract item.',
                side: 'bottom'
            }
        },
        {
            element: '#table-action-bulk_process',
            popover: {
                title: 'Bulk Process',
                description: 'Use this option to perform bulk data management, such as importing multiple items from a spreadsheet.',
                side: 'bottom'
            }
        },
        {
            element: '#table-filter',
            popover: {
                title: 'Filters',
                description: 'Quickly find specific items using advanced dropdown filters.',
                side: 'bottom'
            }
        },
        {
            element: '#table-reload',
            popover: {
                title: 'Reload Data',
                description: 'Click here to instantly reset all active filters, search criteria, and reload your table data.',
                side: 'bottom'
            }
        }
    ],
};