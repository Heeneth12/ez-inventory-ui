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
            element: '#menu-item-1',
            popover: {
                title: 'Item Catalog',
                description: 'This is where you manage your products and services.',
                side: 'right'
            }
        },
        {
            element: '#add-item-btn',
            popover: {
                title: 'Add New Product',
                description: 'Click here to define a new SKU or service in your inventory.',
                side: 'left'
            }
        },
        {
            element: '#inventory-table',
            popover: {
                title: 'Stock Overview',
                description: 'Monitor real-time stock levels and warehouse locations.',
                side: 'top'
            }
        }
    ],
};