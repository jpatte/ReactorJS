declare module ko
{
    declare interface Disposable
    {
        dispose(): void;
    }

    declare interface Observable
    {
        (newValue: any): void;
        (): any;
        subscribe(callback: (newValue: any) => void , context?: any): Disposable;
    }

    declare interface ObservableArray
    {
        (newValue: any[]): void;
        (): any[];
        indexOf(arg: any): number;
        slice(start: number, end: number): any[];
        remove(value: any) : void;
        removeAll() : void;
        removeAll(items: any[]) : void;
        push(value: any) : void;
        pop(): any;
        splice(index, howMany, ...replacingItems: any[]): void;
    }

    declare interface BindingContext
    {
        $parent: any;
        $parents: any[];
        $root: any;
        $data: any;
        $index: Observable;
        $parentContext: BindingContext;
    }

    declare interface Computed extends Disposable
    {
        (): any;
        getDependenciesCount(): number;
        getSubscriptionsCount(): number;
        isActive(): bool;
        peek(): any;
        subscribe(callback: (newValue: any) => void, context?: any, event?: any);
    }

    declare function observable(): Observable;
    declare function observable(value: any): Observable;
    declare function observableArray(values: any[]): ObservableArray;
    declare function computed(func: () => any, context?: any): Computed;
    declare function isObservable(obj): bool;

    declare function applyBindings(vm: { });
    declare function applyBindings(vm: { }, element: Element);
    declare function dataFor(element: Element): any;
    declare function contextFor(element: Element): BindingContext;
    declare function cleanNode(element: Element);
    
    declare function setTemplateEngine(engine: templateEngine);
    declare function renderTemplate(template: string, dataOrBindingContext?: any, options?: {}, targetNodeOrNodeArray?: any, renderMode?: string);
    declare function renderTemplate(template: Function, dataOrBindingContext?: any, options?: {}, targetNodeOrNodeArray?: any, renderMode?: string);

    declare function toJS(rootObject: any);
    declare function toJSON(rootObject: any, replacer?: any, space?: any);

    declare interface templateEngine
    {
        renderTemplateSource(templateSource, bindingContext, options);
        createJavaScriptEvaluatorBlock(script);
    }

    declare class underscoreTemplateEngine implements templateEngine
    {
         renderTemplateSource(templateSource, bindingContext, options);
         createJavaScriptEvaluatorBlock(script);
    }

    declare interface Utils
    {
        arrayForEach(array: any[], action: (item: any) => void ): void;
        arrayIndexOf(array: any[], item: any): number;
        arrayFirst(array: any[], predicate: (owner: any, item: any) => bool, predicateOwner: any): any;
        arrayRemoveItem(array: any[], itemToRemove: any): void;
        arrayGetDistinctValues(array: any[]): any[];
        arrayMap(array: any[], mapping: (item: any) => any): any[];
        arrayFilter(array: any[], predicate: (item: any) => bool): any[];
        arrayPushAll(array: any[], valuesToPush: any): any[];
        extend(target: any, source: any): any;
        emptyDomNode(domNode: Node): void;
        moveCleanedNodesToContainerElement(nodes: any): Element;
        cloneNodes(nodesArray: Node[], shouldCleanNodes: bool): Node[];
        setDomNodeChildren(domNode: Node, childNodes: Node[]): void;
        replaceDomNodes(nodeToReplace: Node, newNodesArray: Node[]): void;
        replaceDomNodes(nodeArrayToReplace: Node[], newNodesArray: Node[]): void;
        setOptionNodeSelectionState(optionNode: Node, isSelected: bool): void;
        stringTrim(string: string): string;
        stringTokenize(string: string, delimiter: string): string;
        stringStartsWith(string: string, startsWith: string): bool;
        domNodeIsContainedBy(node: Node, containedByNode: Node): bool;
        domNodeIsAttachedToDocument(node: Node): bool;
        tagNameLower(element: Element): string;
        registerEventHandler(element: Element, eventType: string, handler: Function): void;
        triggerEvent(element: Element, eventType: string): void;
        unwrapObservable(value: any): any;
        peekObservable(value: any): any;
        toggleDomNodeCssClass(node: Node, classNames: string[], shouldHaveClass: bool): void;
        setTextContent(element: Element, textContent: any): void;
        setElementName(element: Element, name: string): void;
        forceRefresh(node: Node);
        ensureSelectElementIsRenderedCorrectly(selectElement: Element): void;
        range(min: any, max: any): number[];
        makeArray(arrayLikeObject: Array): any[];
        isIe6: bool;
        isIe7: bool;
        ieVersion: number;
        getFormFields(form: Element, fieldName: string): any[];
        parseJson(jsonString: string): any;
        stringifyJson(data: any, replacer?: any, space?: any): string;
        postJson(url: string, data: any, options?: { params?: any[]; submitter?: Function; }): void;
        postJson(form: Element, data: any, options?: { params?: any[]; submitter?: Function; }): void;

        domNodeDisposal: {
            addDisposeCallback(element: Element, callback: () => void );
        };
    }

    declare var utils: Utils;
    declare var bindingHandlers: { };
}
