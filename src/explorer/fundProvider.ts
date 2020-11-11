import { Event, EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { LeekFundConfig } from '../shared/leekConfig';
import globalState from '../globalState';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { SortType,defaultFundInfo,FundCategory } from '../shared/typed';
import FundService from './fundService';

export class FundProvider implements TreeDataProvider<LeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private service: FundService;
  private order: SortType;

  constructor(service: FundService) {
    this.service = service;
    this.order = LeekFundConfig.getConfig('leek-fund.fundSort') || SortType.NORMAL;
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(element?: LeekTreeItem | undefined): LeekTreeItem[] | Thenable<LeekTreeItem[]> {
    if (!element) {
      // Root view
      return this.getRootNodes();
    }
    const fundCodes = LeekFundConfig.getConfig('leek-fund.funds') || [];
    return this.service.getData(fundCodes, this.order);
  }

  getParent(element: LeekTreeItem): LeekTreeItem | undefined {
    return undefined;
  }

  getTreeItem(element: LeekTreeItem): TreeItem {
    if (!element.isCategory) {
      return element;
    } else {
      return {
        id: element.id,
        label: element.info.name,
        // tooltip: this.getSubCategoryTooltip(element),
        collapsibleState:
          element.id === FundCategory.STOCK
            ? TreeItemCollapsibleState.Expanded
            : TreeItemCollapsibleState.Collapsed,
        // iconPath: this.parseIconPathFromProblemState(element),
        command: undefined,
        contextValue: element.contextValue,
      };
    }
  }

  changeOrder(): void {
    let order = this.order as number;
    order += 1;
    if (order > 1) {
      this.order = SortType.DESC;
    } else if (order === 1) {
      this.order = SortType.ASC;
    } else if (order === 0) {
      this.order = SortType.NORMAL;
    }
    LeekFundConfig.setConfig('leek-fund.fundSort', this.order);
    this.refresh();
  }

  
  //基金分类
  getRootNodes(): LeekTreeItem[] {
    const nodes = [
      new LeekTreeItem(
        Object.assign({ contextValue: 'category' }, defaultFundInfo, {
          id: FundCategory.BOND,
          name: `${FundCategory.BOND}${
            globalState.aStockCount > 0 ? `(${globalState.aStockCount})` : ''
          }`,
        }),
        undefined,
        true
      ),
      new LeekTreeItem(
        Object.assign({ contextValue: 'category' }, defaultFundInfo, {
          id: FundCategory.STOCK,
          name: `${FundCategory.STOCK}${
            globalState.hkStockCount > 0 ? `(${globalState.hkStockCount})` : ''
          }`,
        }),
        undefined,
        true
      ),
    ];
      return nodes;
    }
     
}
