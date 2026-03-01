import { ArrowRight, ListCollapse, CircleX, SquareUser, PenLineIcon } from "lucide-angular";
import { TableColumn, TableActionConfig } from "../../layouts/components/standard-table/standard-table.model";
import { FilterOption } from "../../layouts/UI/filter-dropdown/filter-dropdown.component";

//User
export const USER_COLUMNS: TableColumn[] = [
    { key: 'fullName', label: 'Name', width: '130px', type: 'profile' },
    { key: 'email', label: 'Email', width: '220px', type: 'link' },
    { key: 'phone', label: 'Phone', width: '100px', type: 'text' },
    { key: 'roles', label: 'Roles', width: '100px', type: 'text' },
    { key: 'userType', label: 'User Type', width: '100px', type: 'badge' },
    { key: 'isActive', label: 'Active', width: '130px', type: 'toggle', align: 'center' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
];

export const USER_ACTIONS: TableActionConfig[] = [
    {
        key: 'view_profile',
        label: 'View Profile',
        icon: SquareUser,
        color: 'success',
        condition: (row) => true
    },
    {
        key: 'edit_profile',
        label: '',
        icon: PenLineIcon,
        color: 'neutral',
        condition: (row) => true
    },
    {
        key: 'view_user_details',
        label: '',
        icon: ListCollapse,
        color: 'primary',
        condition: (row) => true
    }
];

export const USER_FILTER_OPTIONS: FilterOption[] = [

    {
        id: 'userType',
        label: 'User Type',
        type: 'checkbox',
        searchable: true,
        options: [
            { label: 'Employee', value: 'EMPLOYEE' },
            { label: 'Customer', value: 'CUSTOMER' },
            { label: 'Vendor', value: 'VENDOR' },
            { label: 'Admin', value: 'ADMIN' }
        ]
    },
    {
        id: 'roles',
        label: 'Roles',
        type: 'checkbox',
        searchable: true,
        options: [
            { label: 'Admin', value: 'ADMIN' },
            { label: 'SALES', value: 'SALES' },
            { label: 'INVENTORY', value: 'INVENTORY' },
            { label: 'FINANCE', value: 'FINANCE' }
        ]
    }

];