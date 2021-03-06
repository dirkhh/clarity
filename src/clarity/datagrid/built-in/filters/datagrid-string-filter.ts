import {
    Component, Input, ViewChild, ElementRef, Renderer, ChangeDetectorRef, AfterViewInit
} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {Filter} from "../../interfaces/filter";
import {StringFilter} from "../../interfaces/string-filter";
import {CustomFilter} from "../../providers/custom-filter";
import {DatagridFilter} from "../../datagrid-filter";

@Component({
    selector: "clr-dg-string-filter",
    providers: [{provide: CustomFilter, useExisting: DatagridStringFilter}],
    template: `
        <clr-dg-filter [(clrDgFilterOpen)]="open">
            <!-- 
                Even though this *ngIf looks useless because the filter container already has one,
                it prevents NgControlStatus and other directives automatically added by Angular 
                on inputs with NgModel from freaking out because of their host binding changing
                mid-change detection when the input is destroyed.
            -->
            <form (submit)="closeContainer()" *ngIf="open">
                <input #input type="text" name="search" [(ngModel)]="value" />
                <div>
                    <button type="submit" class="btn btn-primary btn-sm datagrid-filter-apply">
                        Filter
                    </button>
                </div>
            </form>
        </clr-dg-filter>
    `
})
export class DatagridStringFilter implements CustomFilter, Filter<any>, AfterViewInit {

    constructor(private renderer: Renderer, private _cdr: ChangeDetectorRef) {}

    /**
     * Customizable filter logic based on a search text
     */
    @Input("clrDgStringFilter") public filter: StringFilter<any>;

    /**
     * Indicates if the filter dropdown is open
     */
    public open: boolean = false;

    /**
     * We need the actual input element to automatically focus on it
     */
    @ViewChild("input") private input: ElementRef;

    /**
     * We grab the DatagridFilter we wrap to register this StringFilter to it.
     */
    @ViewChild(DatagridFilter) private filterContainer: DatagridFilter;
    ngAfterViewInit() {
        this.filterContainer.filter = this;

        this.filterContainer.openChanged.subscribe((open: boolean) => {
            if (open) {
                // We need the timeout because at the time this executes, the input isn't
                // displayed yet.
                setTimeout(() => {
                    this.renderer.invokeElementMethod(this.input.nativeElement, "focus");
                });
            }
        });
    }

    /**
     * The Observable required as part of the Filter interface
     */
    private _changes = new Subject<string>();
    // We do not want to expose the Subject itself, but the Observable which is read-only
    public get changes(): Observable<string> {
        return this._changes.asObservable();
    };

    /**
     * Raw input value
     */
    private _rawValue: string = "";
    public get value(): string {
        return this._rawValue;
    }
    /**
     * Input value converted to lowercase
     */
    private _lowerCaseValue: string = "";
    public get lowerCaseValue() {
        return this._lowerCaseValue;
    }
    /**
     * Common setter for the input value
     */
    public set value(value: string) {
        this._rawValue = value;
        this._lowerCaseValue = value.toLowerCase().trim();
    }

    /**
     * Indicates if the filter is currently active, meaning the input is not empty
     */
    public isActive(): boolean {
        return !!this.value;
    }

    /**
     * Tests if an item matches a search text
     */
    public accepts(item: any): boolean {
        // We always test with the lowercase value of the input, to stay case insensitive
        return this.filter.accepts(item, this.lowerCaseValue);
    };

    /**
     * Closes the container and applies the filter
     */
    public closeContainer() {
        this.open = false;
        this._changes.next(this.value);
    }
}