import { Injectable } from '@angular/core';
import { driver, Driver, Config } from 'driver.js';
import 'driver.js/dist/driver.css';

@Injectable({
    providedIn: 'root'
})
export class TutorialService {
    private driverObj: Driver;

    constructor() {
        // Initialize the driver with the configuration below
        this.driverObj = driver(tourConfig);
    }

    startTour() {
        this.driverObj.drive();
    }
}

const tourConfig: Config = {
    showProgress: true,
    animate: true,
    popoverClass: 'driverjs-theme',
    steps: [
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
    ]
};