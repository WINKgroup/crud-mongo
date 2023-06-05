import {
    GridFilterModel,
    GridPaginationModel,
    GridSortModel,
} from '@mui/x-data-grid';
import { SortOrder } from 'mongoose';

export interface DataGridQuery {
    filter?: GridFilterModel;
    sort?: GridSortModel;
    pagination: GridPaginationModel;
    rowCount?: number;
}

export interface DataGridRow extends Object {
    id: string;
}

export interface IDataGrid {
    query: DataGridQuery;
    rows: DataGridRow[];
    rowCount: number;
}

export const emptyDataGrid: IDataGrid = {
    query: {
        pagination: {
            page: 0,
            pageSize: 30,
        },
    },
    rows: [],
    rowCount: 0,
};

export function dataGridSortToMongoSort(dataGridSort: GridSortModel) {
    const sortObj: { [fieldname: string]: SortOrder } = {};
    for (const el of dataGridSort) {
        sortObj[el.field] = el.sort === 'asc' ? 1 : -1;
    }
    return sortObj;
}

export function defaultQuickFilterToMongoFind(
    dataGridFilter: GridFilterModel,
    fieldNames: string[]
) {
    if (!dataGridFilter.quickFilterValues || fieldNames.length === 0) return {};
    const searchElements: object[] = [];
    const quickFilterLogicOperator =
        dataGridFilter.quickFilterLogicOperator === 'and' ? '$and' : '$or';

    for (const searchStr of dataGridFilter.quickFilterValues) {
        const fieldElements: object[] = [];
        for (const fieldName of fieldNames) {
            const regExp = new RegExp(searchStr, 'i');
            const el = {} as { [key: string]: any };
            el[fieldName] = regExp;
            fieldElements.push(el);
        }
        searchElements.push(
            fieldElements.length > 1 ? { $or: fieldElements } : fieldElements[0]
        );
    }

    return searchElements.length > 1
        ? { quickFilterLogicOperator: searchElements }
        : searchElements[0];
}

export function itemsFilterToMongoFind(dataGridFilter: GridFilterModel) {
    const searchElements: object[] = [];
    const logicOperator =
        dataGridFilter.logicOperator === 'and' ? '$and' : '$or';

    for (const item of dataGridFilter.items) {
        let el: { [key: string]: any } = {};

        switch (item.operator) {
            case 'contains':
                el[item.field] = new RegExp(item.value, 'i');
                searchElements.push(el);
                break;
            default:
                throw new Error(`operator "${item.operator}" not implemented`);
        }
    }

    return searchElements.length > 1
        ? { logicOperator: searchElements }
        : searchElements[0];
}
