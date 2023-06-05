/**
 * Filter item definition interface.
 * @demos
 *   - [Custom filter operator](/x/react-data-grid/filtering/customization/#create-a-custom-operator)
 */
export interface GridFilterItem {
    /**
     * Must be unique.
     * Only useful when the model contains several items.
     */
    id?: number | string;
    /**
     * The column from which we want to filter the rows.
     */
    field: string;
    /**
     * The filtering value.
     * The operator filtering function will decide for each row if the row values is correct compared to this value.
     */
    value?: any;
    /**
     * The name of the operator we want to apply.
     */
    operator: string;
}
declare enum GridLogicOperator {
    And = "and",
    Or = "or"
}
export { GridLogicOperator };


/**
 * Model describing the filters to apply to the grid.
 * @demos
 *   - [Pass filters to the grid](/x/react-data-grid/filtering/#pass-filters-to-the-data-grid)
 */
export interface GridFilterModel {
    /**
     * @default []
     */
    items: GridFilterItem[];
    /**
     * - `GridLogicOperator.And`: the row must pass all the filter items.
     * - `GridLogicOperator.Or`: the row must pass at least on filter item.
     * @default `GridLogicOperator.Or`
     */
    logicOperator?: GridLogicOperator;
    /**
     * values used to quick filter rows
     * @default `[]`
     */
    quickFilterValues?: any[];
    /**
     * - `GridLogicOperator.And`: the row must pass all the values.
     * - `GridLogicOperator.Or`: the row must pass at least one value.
     * @default `GridLogicOperator.And`
     */
    quickFilterLogicOperator?: GridLogicOperator;
}

export interface GridPaginationModel {
    /**
     * Set the number of rows in one page.
     * If some of the rows have children (for instance in the tree data), this number represents the amount of top level rows wanted on each page.
     * @default 100
     */
    pageSize: number;
    /**
     * The zero-based index of the current page.
     * @default 0
     */
    page: number;
}


export type GridSortDirection = 'asc' | 'desc' | null | undefined;
/**
 * Object that represents the column sorted data, part of the [[GridSortModel]].
 */
export interface GridSortItem {
    /**
     * The column field identifier.
     */
    field: string;
    /**
     * The direction of the column that the grid should sort.
     */
    sort: GridSortDirection;
}
/**
 * The model used for sorting the grid.
 */
export type GridSortModel = GridSortItem[];
